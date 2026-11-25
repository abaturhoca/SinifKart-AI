import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

const root = new URL('./dist/', import.meta.url).pathname
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const out = []
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...await files(path))
    else if (entry.name !== 'sw.js') out.push(path)
  }
  return out
}
const paths = (await files(root)).map(path => '/' + relative(root, path).split(sep).join('/')).sort()
for (const required of ['/index.html', '/curriculum.json', '/sourced-questions.json']) {
  if (!paths.includes(required)) throw Error(`Çevrimdışı kaynak eksik: ${required}`)
}
const digest = createHash('sha256')
for (const path of paths) { digest.update(path); digest.update(await readFile(join(root, path.slice(1)))) }
const cacheName = `sinifkart-static-${digest.digest('hex').slice(0, 16)}`
const script = `const CACHE = ${JSON.stringify(cacheName)};
const FILES = ${JSON.stringify(paths)};
const PATHS = new Set(FILES);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('sinifkart-static-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(caches.open(CACHE).then(cache => cache.match('/index.html')).then(hit => hit || fetch(request)));
  } else if (PATHS.has(url.pathname)) {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(url.pathname)).then(hit => hit || fetch(request)));
  }
});
`
await writeFile(join(root, 'sw.js'), script)
console.log(`Çevrimdışı önbellek: ${paths.length} statik dosya, ${cacheName}`)

import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'

const root = new URL('./dist/', import.meta.url)
const script = await readFile(new URL('sw.js', root), 'utf8')
const handlers = new Map(), stored = new Map()
const oldCache = 'sinifkart-static-old'
stored.set(oldCache, new Map())
const caches = {
  async open(name) {
    if (!stored.has(name)) stored.set(name, new Map())
    const rows = stored.get(name)
    return {
      async addAll(paths) { for (const path of paths) rows.set(path, { path }) },
      async match(path) { return rows.get(path) }
    }
  },
  async keys() { return [...stored.keys()] },
  async delete(name) { return stored.delete(name) }
}
const self = {
  location: { origin: 'https://sinifkart.test' },
  clients: { async claim() {} },
  async skipWaiting() {},
  addEventListener(name, handler) { handlers.set(name, handler) }
}
const network = []
const state = { self, caches, URL, Set, Promise, fetch: async request => {
  network.push(request.url)
  return { path: new URL(request.url).pathname, network: true }
} }
runInNewContext(script + '\nglobalThis.manifest = FILES; globalThis.cacheName = CACHE;', state)
const manifest = state.manifest
for (const required of ['/index.html', '/curriculum.json', '/sourced-questions.json']) assert.ok(manifest.includes(required))
assert.ok(manifest.some(path => path.includes('/assets/opencv-')))
for (const path of manifest) assert.ok((await stat(new URL('.' + path, root))).size > 0)
assert.ok(!manifest.some(path => /student|answer|backup|roster|\.db/i.test(path)))
let pending
handlers.get('install')({ waitUntil(promise) { pending = promise } })
await pending
assert.equal(stored.get(state.cacheName).size, manifest.length)
handlers.get('activate')({ waitUntil(promise) { pending = promise } })
await pending
assert.ok(!stored.has(oldCache))
const fetch = async (url, mode = 'cors', method = 'GET') => {
  let response
  handlers.get('fetch')({ request: { url, mode, method }, respondWith(promise) { response = promise } })
  return response && await response
}
assert.equal((await fetch('https://sinifkart.test/', 'navigate')).path, '/index.html')
assert.equal((await fetch('https://sinifkart.test/sourced-questions.json')).path, '/sourced-questions.json')
assert.equal(network.length, 0, 'Tam önbellekte ağ çağrısı yapılmamalı')
stored.get(state.cacheName).delete('/curriculum.json')
assert.equal((await fetch('https://sinifkart.test/curriculum.json')).network, true)
stored.get(state.cacheName).delete('/index.html')
assert.equal((await fetch('https://sinifkart.test/oturum', 'navigate')).network, true)
assert.deepEqual(network, ['https://sinifkart.test/curriculum.json', 'https://sinifkart.test/oturum'])
assert.equal(await fetch('https://sinifkart.test/private', 'cors', 'POST'), undefined)
assert.equal(await fetch('https://external.test/index.html'), undefined)
console.log(`Çevrimdışı önbellek: ${manifest.length} statik dosya, gezinti ve soru bankası geri dönüşü geçti`)

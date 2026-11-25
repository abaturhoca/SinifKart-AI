import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { extname, join, normalize } from 'node:path'
import { tmpdir } from 'node:os'

const browser = process.argv[2]
if (!browser) throw Error('Chrome/Chromium çalıştırıcı yolu gerekli')
const root = new URL('./dist/', import.meta.url).pathname
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.wasm': 'application/wasm' }
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1)
    const candidate = normalize(join(root, relative))
    let file = candidate.startsWith(root) ? candidate : join(root, 'index.html')
    try { if (!(await stat(file)).isFile()) file = join(root, 'index.html') } catch { file = join(root, 'index.html') }
    response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' })
    response.end(await readFile(file))
  } catch (error) { response.writeHead(500); response.end(String(error)) }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const base = `http://127.0.0.1:${server.address().port}`
const temporary = await mkdtemp(join(tmpdir(), 'sinifkart-a11y-privacy-'))

class Cdp {
  constructor(url) { this.socket = new WebSocket(url); this.id = 0; this.pending = new Map(); this.listeners = new Map() }
  async open() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true })
      this.socket.addEventListener('error', reject, { once: true })
    })
    this.socket.addEventListener('message', event => {
      const message = JSON.parse(event.data)
      if (message.id) {
        const pending = this.pending.get(message.id); this.pending.delete(message.id)
        if (message.error) pending.reject(Error(`${pending.method}: ${message.error.message}`))
        else pending.resolve(message.result)
      } else for (const listener of this.listeners.get(message.method) ?? []) listener(message.params)
    })
  }
  call(method, params = {}) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method })
      this.socket.send(JSON.stringify({ id, method, params }))
    })
  }
  on(method, listener) { this.listeners.set(method, [...(this.listeners.get(method) ?? []), listener]) }
  event(method) { return new Promise(resolve => this.on(method, resolve)) }
  close() { this.socket.close() }
}

let chrome, cdp
try {
  chrome = spawn(browser, ['--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run', '--disable-extensions',
    '--disable-background-networking', '--no-default-browser-check', '--remote-debugging-port=0',
    `--user-data-dir=${join(temporary, 'profile')}`, 'about:blank'], { stdio: 'ignore' })
  const active = join(temporary, 'profile', 'DevToolsActivePort')
  let port
  for (let i = 0; i < 100; i++) {
    try { port = Number((await readFile(active, 'utf8')).split('\n')[0]); break } catch { await new Promise(r => setTimeout(r, 100)) }
  }
  if (!port) throw Error('Chromium hata ayıklama bağlantısı açılmadı')
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' })).json()
  cdp = new Cdp(target.webSocketDebuggerUrl); await cdp.open()
  await Promise.all([cdp.call('Page.enable'), cdp.call('Runtime.enable'), cdp.call('Network.enable')])
  const requests = []
  cdp.on('Network.requestWillBeSent', event => requests.push(event.request.url))
  const loaded = cdp.event('Page.loadEventFired')
  await cdp.call('Page.navigate', { url: base + '/' }); await loaded
  const evaluate = async expression => {
    const reply = await cdp.call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (reply.exceptionDetails) throw Error(reply.exceptionDetails.exception?.description ?? reply.exceptionDetails.text)
    return reply.result.value
  }
  for (let i = 0; i < 120; i++) {
    if (await evaluate(`document.body.innerText.includes('Öğretmen paneli') && document.querySelectorAll('button').length > 5`)) break
    await new Promise(r => setTimeout(r, 100))
  }
  const audit = await evaluate(`(() => {
    const text = element => (element.getAttribute('aria-label') || element.getAttribute('title') ||
      (element.labels ? [...element.labels].map(label => label.textContent).join(' ') : '') || element.textContent || '').trim()
    const controls = [...document.querySelectorAll('button,input,select,a[href]')]
    const unnamed = controls.filter(element => !text(element)).map(element => element.outerHTML.slice(0, 120))
    const positiveTabIndex = [...document.querySelectorAll('[tabindex]')].filter(element => Number(element.getAttribute('tabindex')) > 0).length
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(element => Number(element.tagName.slice(1)))
    const skippedHeadings = headings.some((level, index) => index > 0 && level > headings[index - 1] + 1)
    const focusFailures = controls.filter(element => !element.disabled).flatMap(element => {
      element.focus(); const style = getComputedStyle(element)
      return document.activeElement !== element || (style.outlineStyle === 'none' && style.boxShadow === 'none') ? [element.tagName] : []
    })
    return { lang: document.documentElement.lang, mainCount: document.querySelectorAll('main').length,
      h1Count: document.querySelectorAll('h1').length, unnamed, positiveTabIndex, skippedHeadings,
      statusCount: document.querySelectorAll('[role=status],[aria-live]').length, focusFailures,
      cookie: document.cookie, storageKeys: Object.keys(localStorage),
      skipLink: Boolean(document.querySelector('a[href="#teacher-panel"]')) }
  })()`)
  assert.equal(audit.lang, 'tr', 'Sayfa dili Türkçe olmalı')
  assert.equal(audit.mainCount, 1, 'Tek bir ana içerik alanı olmalı')
  assert.equal(audit.h1Count, 1, 'Tek bir birinci düzey başlık olmalı')
  assert.deepEqual(audit.unnamed, [], 'Bütün etkileşimli öğelerin erişilebilir adı olmalı')
  assert.equal(audit.positiveTabIndex, 0, 'Pozitif tabindex kullanılmamalı')
  assert.equal(audit.skippedHeadings, false, 'Başlık düzeyleri atlanmamalı')
  assert.ok(audit.statusCount >= 3, 'Dinamik durumlar ekran okuyucuya duyurulmalı')
  assert.deepEqual(audit.focusFailures, [], 'Klavye odağı görünür olmalı')
  assert.equal(audit.skipLink, true, 'Ana içeriğe geç bağlantısı bulunmalı')
  assert.equal(audit.cookie, '', 'Panel çerez oluşturmamalı')
  assert.ok(audit.storageKeys.every(key => key.startsWith('sinifkart:')), 'Yerel depolama yalnız SınıfKart ad alanını kullanmalı')
  const foreign = requests.filter(url => {
    const parsed = new URL(url); return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.origin !== base : false
  })
  assert.deepEqual(foreign, [], `Panel açılışında dış ağa istek yapılmamalı: ${foreign.join(', ')}`)
  console.log(`Erişilebilirlik/gizlilik: ${audit.statusCount} canlı durum, ${requests.length} yalnız yerel istek, çerez yok, klavye odağı geçti`)
} finally {
  cdp?.close()
  if (chrome) {
    const exited = new Promise(resolve => chrome.once('exit', resolve)); chrome.kill('SIGTERM')
    await Promise.race([exited, new Promise(resolve => setTimeout(resolve, 3000))])
  }
  await new Promise(resolve => server.close(resolve))
  await rm(temporary, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
}

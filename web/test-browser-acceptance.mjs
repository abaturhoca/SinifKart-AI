import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
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
    const body = await readFile(file)
    response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store' })
    response.end(body)
  } catch (error) { response.writeHead(500); response.end(String(error)) }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const base = `http://127.0.0.1:${server.address().port}`
const temporary = await mkdtemp(join(tmpdir(), 'sinifkart-browser-'))
const profile = join(temporary, 'profile'), downloads = join(temporary, 'downloads')

class Cdp {
  constructor(url) { this.socket = new WebSocket(url); this.id = 0; this.pending = new Map(); this.events = new Map() }
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
      } else for (const resolve of this.events.get(message.method) ?? []) resolve(message.params)
      if (!message.id) this.events.delete(message.method)
    })
  }
  call(method, params = {}) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method })
      this.socket.send(JSON.stringify({ id, method, params }))
    })
  }
  event(method) { return new Promise(resolve => this.events.set(method, [...(this.events.get(method) ?? []), resolve])) }
  close() { this.socket.close() }
}

let chrome, cdp
try {
  chrome = spawn(browser, ['--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run', '--disable-extensions',
    '--disable-background-networking', '--no-default-browser-check', '--remote-debugging-port=0',
    `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' })
  const active = join(profile, 'DevToolsActivePort')
  let port
  for (let i = 0; i < 100; i++) {
    try { port = Number((await readFile(active, 'utf8')).split('\n')[0]); break } catch { await new Promise(r => setTimeout(r, 100)) }
  }
  if (!port) throw Error('Chromium hata ayıklama bağlantısı açılmadı')
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' })).json()
  cdp = new Cdp(target.webSocketDebuggerUrl); await cdp.open()
  await Promise.all([cdp.call('Page.enable'), cdp.call('Runtime.enable'), cdp.call('Network.enable')])
  await cdp.call('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads })

  const navigate = async url => {
    const loaded = cdp.event('Page.loadEventFired')
    await cdp.call('Page.navigate', { url }); await loaded
  }
  const evaluate = async expression => {
    const reply = await cdp.call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (reply.exceptionDetails) throw Error(reply.exceptionDetails.exception?.description ?? reply.exceptionDetails.text)
    return reply.result.value
  }
  const waitFor = async (expression, label) => {
    for (let i = 0; i < 160; i++) {
      if (await evaluate(expression)) return
      await new Promise(r => setTimeout(r, 100))
    }
    throw Error(`Tarayıcı zaman aşımı: ${label}`)
  }
  const click = text => evaluate(`(() => { const button = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === ${JSON.stringify(text)}); if (!button || button.disabled) return false; button.click(); return true })()`)
  const download = async text => {
    let before = new Set()
    try { before = new Set(await readdir(downloads)) } catch {}
    assert.equal(await click(text), true, `${text} düğmesi etkin olmalı`)
    for (let i = 0; i < 160; i++) {
      let names = []; try { names = await readdir(downloads) } catch {}
      const name = names.find(item => !before.has(item) && !item.endsWith('.crdownload'))
      if (name) return join(downloads, name)
      await new Promise(r => setTimeout(r, 100))
    }
    throw Error(`İndirme tamamlanmadı: ${text}`)
  }

  await navigate(base + '/')
  await waitFor(`document.body.innerText.includes('Çevrimdışı kullanım için uygulama dosyaları hazır.')`, 'servis çalışanı')
  assert.match(await evaluate(`navigator.serviceWorker.ready.then(r => r.scope)`), new RegExp('^' + base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/'))
  const reloaded = cdp.event('Page.loadEventFired'); await cdp.call('Page.reload'); await reloaded
  await waitFor(`navigator.serviceWorker.controller !== null`, 'servis çalışanı denetimi')

  const sessionId = '2026-11-25T09:00:00.000Z'
  await evaluate(`(async () => {
    const students = [{number:'501',name:'Kurgusal Öğrenci A',cardId:1},{number:'502',name:'Kurgusal Öğrenci B',cardId:2}];
    const db = await new Promise((resolve,reject) => { const request=indexedDB.open('sinifkart-hibrit',4); request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error) });
    await new Promise((resolve,reject) => { const tx=db.transaction(['draft','class','answers','questionSnapshots'],'readwrite');
      tx.objectStore('draft').put(${JSON.stringify(sessionId)},'startedAt'); tx.objectStore('draft').put([${JSON.stringify(sessionId)}],'sessions');
      tx.objectStore('class').put(students,'students');
      const questionId='FB.5.1.1:1'; const question={outcome:'FB.5.1.1',title:'Kurgusal kabul sorusu',correct:'A',optionCount:4};
      tx.objectStore('questionSnapshots').put({sessionId:${JSON.stringify(sessionId)},questionId,students,question},${JSON.stringify(sessionId)}+'|'+questionId);
      for (const row of [{cardId:1,number:'501',answer:'A'},{cardId:2,number:'502',answer:'B'}]) { const key=${JSON.stringify(sessionId)}+'|'+questionId+'|'+row.cardId; tx.objectStore('answers').put({key,sessionId:${JSON.stringify(sessionId)},questionId,...row},key) }
      tx.oncomplete=resolve; tx.onabort=()=>reject(tx.error) }); db.close(); return true
  })()`)
  const dataReloaded = cdp.event('Page.loadEventFired'); await cdp.call('Page.reload'); await dataReloaded
  await waitFor(`document.body.innerText.includes('2 öğrenci cihazda kayıtlı.')`, 'IndexedDB sınıfı')
  assert.equal(await click('Oturum raporunu göster'), true)
  await waitFor(`document.body.innerText.includes('1 soru · 2 öğrenci · 0 eşleşmeyen kayıt')`, 'oturum raporu')

  const studentCsv = await download('Öğrenci raporunu CSV indir')
  const questionCsv = await download('Soru raporunu CSV indir')
  const printable = await download('Yazdırılabilir raporu indir (PDF için yazdır)')
  assert.match(studentCsv, /sinifkart-20261125T090000Z-ogrenci\.csv$/)
  assert.match(questionCsv, /sinifkart-20261125T090000Z-soru\.csv$/)
  assert.match(printable, /sinifkart-20261125T090000Z-yazdir\.html$/)
  assert.match(await readFile(studentCsv, 'utf8'), /Kurgusal Öğrenci A/)
  assert.match(await readFile(questionCsv, 'utf8'), /Kurgusal kabul sorusu/)
  const printHtml = await readFile(printable, 'utf8'); assert.match(printHtml, /Yazdır \/ PDF kaydet/)
  const frame = (await cdp.call('Page.getFrameTree')).frameTree.frame.id
  await cdp.call('Page.setDocumentContent', { frameId: frame, html: printHtml })
  const pdf = Buffer.from((await cdp.call('Page.printToPDF', { landscape: true, printBackground: true })).data, 'base64')
  assert.equal(pdf.subarray(0, 4).toString(), '%PDF'); assert.ok(pdf.length > 1000)
  await writeFile(join(temporary, 'sinifkart-rapor.pdf'), pdf)

  await cdp.call('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 })
  await navigate(base + '/cevrimdisi-yeniden-ac')
  await waitFor(`document.body.innerText.includes('Öğretmen paneli') && document.body.innerText.includes('2 öğrenci cihazda kayıtlı.')`, 'çevrimdışı yeniden açma')
  assert.equal(await click('Oturum raporunu göster'), true)
  await waitFor(`document.body.innerText.includes('1 soru · 2 öğrenci · 0 eşleşmeyen kayıt')`, 'çevrimdışı rapor')
  console.log('Gerçek Chromium: 3 rapor indirildi, PDF üretildi, IndexedDB ve servis çalışanıyla çevrimdışı yeniden açma geçti')
} finally {
  cdp?.close()
  if (chrome) {
    const exited = new Promise(resolve => chrome.once('exit', resolve))
    chrome.kill('SIGTERM')
    await Promise.race([exited, new Promise(resolve => setTimeout(resolve, 3000))])
  }
  await new Promise(resolve => server.close(resolve))
  for (let attempt = 0; attempt < 5; attempt++) {
    try { await rm(temporary, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); break }
    catch (error) { if (attempt === 4) throw error; await new Promise(resolve => setTimeout(resolve, 200)) }
  }
}

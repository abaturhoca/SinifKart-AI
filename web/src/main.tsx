import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

import { openDraft, listDrafts, startDraft, activateDraft, saveRosterForSession, loadRoster, confirmAnswers, loadAnswers, rememberQuestion, loadQuestionSnapshots, exportLocalBackup, restoreLocalBackup } from './session.js'
import { parseRoster } from './roster.js'
import { reconcileScan } from './reconcile.js'
import { makeAndroidSessionForContext, importAndroidAnswersForContext } from './android-bridge.js'
import { createRequestGate } from './request-gate.js'
import { Quiz } from './quiz'
import { buildReport, reportCsv, reportQuestionCsv, reportPrintHtml, reportFileName } from './report.js'
import type { Bank } from './question-bank'

function Panel() {
  const [status, setStatus] = useState('Yerel kayıt açılıyor…')
  const [scan, setScan] = useState('Bir kart fotoğrafı seçin. Görüntü bu cihazda işlenir.')
  const [roster, setRoster] = useState('CSV başlıkları: number,name,cardId. Aynı isimli öğrenciler ayrı kayıt olabilir.')
  const [students, setStudents] = useState<ReturnType<typeof parseRoster>>([])
  const [preview, setPreview] = useState<ReturnType<typeof reconcileScan> | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<string[]>([])
  const [questionId, setQuestionId] = useState<string | null>(null)
  const [optionCount, setOptionCount] = useState<number | null>(null)
  const [bank, setBank] = useState<Bank>({})
  const [report, setReport] = useState<ReturnType<typeof buildReport> | null>(null)
  const [recordStatus, setRecordStatus] = useState('Etkin soru seçilip tarama onaylanınca yanıtlar kaydedilir.')
  const [offlineStatus, setOfflineStatus] = useState('')
  const scanVersion = useRef(0)
  const reportGate = useRef(createRequestGate())
  function clearReport() { reportGate.current.invalidate(); setReport(null) }
  useEffect(() => {
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      // The teacher server mounts this panel at /web/. Keep its root panel
      // outside the offline worker's navigation scope.
      const scope = location.pathname.startsWith('/web/') ? '/web/' : '/'
      navigator.serviceWorker.register('/sw.js', { scope }).then(() => navigator.serviceWorker.ready)
        .then(() => setOfflineStatus('Çevrimdışı kullanım için uygulama dosyaları hazır.'))
        .catch(() => setOfflineStatus('Çevrimdışı uygulama dosyaları hazırlanamadı.'))
    }
    openDraft().then(async value => { setSessionId(value); setSessions(await listDrafts()); setStatus('Çalışma oturumu · ' + new Date(value).toLocaleString('tr-TR')) })
      .catch(() => setStatus('Yerel kayıt açılamadı. Tarayıcı depolama izinlerini kontrol edin.'))
    loadRoster().then(students => {
      setStudents(students)
      clearReport()
      if (students.length) setRoster(`${students.length} öğrenci cihazda kayıtlı.`)
    }).catch(() => setRoster('Sınıf kaydı okunamadı. Tarayıcı depolama izinlerini kontrol edin.'))
  }, [])
  async function handlePhoto(file?: File) {
    if (!file) return
    if (!sessionId || !questionId || !optionCount || !students.length) {
      setScan('Önce sınıf ve etkin soruyu seçin.'); return
    }
    const version = ++scanVersion.current
    setPreview(null)
    setScan('Fotoğraf okunuyor…')
    try {
      const { readPhoto } = await import('./scan.js')
      const result = await readPhoto(file)
      if (version !== scanVersion.current) return
      setPreview(reconcileScan(students, result.cards, 'ABCD'.slice(0, optionCount)))
      setScan(result.cards.length ? result.cards.map(card =>
        `${String(card.cardId).padStart(3, '0')}: ${card.answer ?? card.status}`).join(' · ') +
        ` (${result.elapsedMs} ms)` : 'Kart bulunamadı. Işığı ve kadrajı kontrol edin.')
    } catch (error) { if (version === scanVersion.current) setScan('Fotoğraf okunamadı: ' + (error instanceof Error ? error.message : String(error))) }
  }
  async function handleRoster(file?: File) {
    if (!file) return
    try {
      const students = parseRoster(await file.text())
      await saveRosterForSession(sessionId, students)
      ++scanVersion.current
      setStudents(students)
      setPreview(null)
      clearReport()
      setQuestionId(null)
      setOptionCount(null)
      setScan('Yeni sınıf kaydedildi. Eşleştirme için kart fotoğrafını yeniden seçin.')
      setRoster(`${students.length} öğrenci doğrulandı ve cihazda kaydedildi.`)
    } catch (error) { setRoster('Sınıf kaydedilmedi: ' + (error instanceof Error ? error.message : String(error))) }
  }
  async function approvePreview() {
    if (!preview || !sessionId || !questionId) return
    try {
      const result = await confirmAnswers(sessionId, questionId, preview.responses)
      clearReport()
      setRecordStatus(`${questionId}: ${result.saved} yeni yanıt kaydedildi; ${result.unchanged} aynı kayıt korundu.`)
      setPreview(null)
    } catch (error) { setRecordStatus('Yanıt yazılmadı: ' + (error instanceof Error ? error.message : String(error))) }
  }
  function downloadJson(name: string, data: unknown) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a'); link.href = url; link.download = name; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  async function exportAndroidSession() {
    if (!sessionId || !questionId || !optionCount) return
    const version = scanVersion.current
    try {
      const packet = await makeAndroidSessionForContext({ sessionId, questionId, optionCount, students },
        () => version === scanVersion.current)
      downloadJson('sinifkart-android-oturum.json', packet)
      setRecordStatus('Android oturum dosyası oluşturuldu. Öğrenci adı ve numarası dosyada yok.')
    } catch (error) { if (version === scanVersion.current) setRecordStatus('Oturum dosyası oluşturulamadı: ' + String(error)) }
  }
  async function importAndroidAnswers(file?: File) {
    if (!file || !sessionId || !questionId || !optionCount) return
    const version = scanVersion.current
    try {
      const result = await importAndroidAnswersForContext(file, { sessionId, questionId, optionCount, students },
        () => version === scanVersion.current, confirmAnswers)
      if (version !== scanVersion.current) return
      clearReport()
      setRecordStatus(`Android: ${result.saved} yeni yanıt kaydedildi; ${result.unchanged} aynı kayıt korundu.`)
    } catch (error) { if (version === scanVersion.current) setRecordStatus('Android yanıtları yazılmadı: ' + String(error)) }
  }
  function questionInfo() {
    return Object.fromEntries(Object.entries(bank).flatMap(([outcome, questions]) =>
      questions.map((q, i) => [`${outcome}:${i + 1}`, { outcome, title: q.stem, correct: 'ABCD'[q.correctIndex], optionCount: q.options.length }])))
  }
  async function refreshReport() {
    if (!sessionId || !students.length) return
    const request = reportGate.current.begin()
    try {
      const [answers, snapshots] = await Promise.all([loadAnswers(sessionId), loadQuestionSnapshots(sessionId)])
      if (reportGate.current.isCurrent(request)) setReport(buildReport(students, answers, questionInfo(), snapshots))
    }
    catch (error) { if (reportGate.current.isCurrent(request)) setRecordStatus('Rapor okunamadı: ' + String(error)) }
  }
  async function selectQuestion(id: string | null, count: number | null) {
    const version = ++scanVersion.current
    setPreview(null)
    clearReport()
    setQuestionId(null)
    setOptionCount(null)
    if (!id || !sessionId) return
    try {
      await rememberQuestion(sessionId, id, students, questionInfo()[id])
      if (version !== scanVersion.current) return
      setQuestionId(id)
      setOptionCount(count)
      setRecordStatus('Soru seçildi. Yeni fotoğraf seçip eşleşmeleri inceleyin.')
    } catch (error) { setRecordStatus('Soru açılmadı: ' + String(error)) }
  }
  async function switchSession(value: string, create = false) {
    try {
      const id = create ? await startDraft() : await activateDraft(value)
      ++scanVersion.current
      setSessionId(id)
      setSessions(await listDrafts())
      setStudents(await loadRoster())
      setQuestionId(null)
      setOptionCount(null)
      setPreview(null)
      clearReport()
      setRecordStatus('Oturum seçildi. Soruyu yeniden açın veya bu oturumun raporunu görüntüleyin.')
      setStatus('Çalışma oturumu · ' + new Date(id).toLocaleString('tr-TR'))
    } catch (error) { setRecordStatus('Oturum değiştirilemedi: ' + String(error)) }
  }
  async function downloadBackup() {
    try {
      downloadJson('sinifkart-tam-yerel-yedek.json', await exportLocalBackup())
      setRecordStatus('Tam yerel yedek indirildi. Dosya öğrenci bilgilerini içerir; güvenli saklayın.')
    } catch (error) { setRecordStatus('Yedek oluşturulamadı: ' + String(error)) }
  }
  async function uploadBackup(file?: File) {
    if (!file) return
    try {
      const id = await restoreLocalBackup(await file.text())
      ++scanVersion.current
      setSessionId(id); setSessions(await listDrafts()); setStudents(await loadRoster())
      setQuestionId(null); setOptionCount(null); setPreview(null); clearReport()
      setStatus('Çalışma oturumu · ' + new Date(id).toLocaleString('tr-TR'))
      setRecordStatus('Yerel yedek geri yüklendi. Yanıtlar ve soru kayıtları bu cihazda.')
    } catch (error) { setRecordStatus('Yedek geri yüklenmedi: ' + String(error)) }
  }
  function downloadReport(kind: 'students' | 'questions') {
    if (!report || !sessionId) return
    const url = URL.createObjectURL(new Blob([kind === 'students' ? reportCsv(report) : reportQuestionCsv(report)], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url; link.download = reportFileName(sessionId, kind === 'students' ? 'ogrenci' : 'soru'); link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  function downloadPrintableReport() {
    if (!report || !sessionId) return
    const url = URL.createObjectURL(new Blob([reportPrintHtml(report, sessionId)], { type: 'text/html;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url; link.download = reportFileName(sessionId, 'yazdir'); link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return <><header>SınıfKart AI</header><section><h1>Öğretmen paneli</h1><p role="status">{status}</p>{offlineStatus && <p aria-live="polite">{offlineStatus}</p>}
    <label>Oturum seç <select value={sessionId ?? ''} onChange={e => void switchSession(e.target.value)}>{sessions.map(id => <option key={id} value={id}>{new Date(id).toLocaleString('tr-TR')}</option>)}</select></label>
    <button disabled={!sessionId} onClick={() => void switchSession('', true)}>Yeni oturum başlat</button>
    <div><button disabled={!sessionId} onClick={() => void downloadBackup()}>Tam yerel yedeği indir</button>
      <label>Tam yerel yedeği geri yükle <input type="file" accept=".json,application/json" onChange={e => { void uploadBackup(e.target.files?.[0]); e.target.value = '' }}/></label>
      <p>Yedek öğrenci bilgilerini içerir ve yalnız bu cihazda indirilir. Geri yükleme yalnız boş sınıf kaydında yapılır.</p></div>
    <label>Sınıf listesini içe aktar <input type="file" accept=".csv,text/csv" onChange={e => void handleRoster(e.target.files?.[0])}/></label>
    <p aria-live="polite">{roster}</p>
    <label>Fotoğraftan kartları oku <input type="file" accept="image/*" disabled={!sessionId || !questionId || !optionCount || !students.length} onChange={e => { void handlePhoto(e.target.files?.[0]); e.target.value = '' }}/></label>
    <p aria-live="polite">{scan}</p>
    {!students.length && <p>Kartları öğrencilerle eşleştirmek için önce sınıf listesini yükleyin.</p>}
    <div><button disabled={!sessionId || !questionId || !optionCount || !students.length} onClick={() => void exportAndroidSession()}>Android oturum dosyasını indir</button>
      <label>Android yanıt dosyasını içe aktar <input type="file" accept=".json,application/json" disabled={!sessionId || !questionId || !optionCount || !students.length} onChange={e => { void importAndroidAnswers(e.target.files?.[0]); e.target.value = '' }}/></label></div>
    {preview && <div className="scan-preview"><h2>Kart eşleştirme önizlemesi</h2>
      <p>{preview.responses.length} güvenilir eşleşme · {preview.issues.length} uyarı · {preview.missing.length} yanıtı okunmayan öğrenci. Onay verilene dek yanıt kaydı oluşmaz.</p>
      <table><caption>Okunan öğrenci yanıtları</caption><thead><tr><th>Numara</th><th>Öğrenci</th><th>Kart</th><th>Yanıt</th></tr></thead><tbody>
        {preview.responses.map(row => <tr key={row.cardId}><td>{row.number}</td><td>{row.name}</td><td>{row.cardId}</td><td>{row.answer}</td></tr>)}
      </tbody></table>
      {preview.issues.length > 0 && <ul>{preview.issues.map((issue, index) => <li key={`${issue.cardId}-${index}`}>Kart {issue.cardId}: {issue.reason}</li>)}</ul>}
      <button disabled={!questionId || !sessionId || !preview.responses.length} onClick={() => void approvePreview()}>Etkin soruya yanıtları kaydet</button>
    </div>}<p aria-live="polite">Etkin soru: {questionId ?? 'seçilmedi'} · {recordStatus}</p>
    <button disabled={!sessionId || !students.length} onClick={() => void refreshReport()}>Oturum raporunu göster</button>
    {report && <div><p>{report.ids.length} soru · {report.byStudent.length} öğrenci · {report.ignored} eşleşmeyen kayıt</p>
      <button onClick={() => downloadReport('students')}>Öğrenci raporunu CSV indir</button>
      <button onClick={() => downloadReport('questions')}>Soru raporunu CSV indir</button>
      <button onClick={downloadPrintableReport}>Yazdırılabilir raporu indir (PDF için yazdır)</button>
      <table><caption>Öğrenci sonuçları</caption><thead><tr><th>Öğrenci no</th><th>Öğrenci</th><th>Kart</th>{report.ids.map(id => <th key={id}>{id}</th>)}<th>Doğru</th><th>Yanlış</th><th>Boş</th></tr></thead>
        <tbody>{report.byStudent.map(row => <tr key={row.number}><td>{row.number}</td><td>{row.name}</td><td>{row.cardId}</td>{row.responses.map((answer, i) => <td key={report.ids[i]}>{answer || '—'}</td>)}<td>{row.right}</td><td>{row.wrong}</td><td>{row.blank}</td></tr>)}</tbody></table>
      <table><caption>Soru sonuçları</caption><thead><tr><th>Soru</th><th>Kazanım</th><th>Yanıt</th><th>Doğru</th><th>A</th><th>B</th><th>C</th><th>D</th></tr></thead>
        <tbody>{report.byQuestion.map(q => <tr key={q.id}><td>{q.id}</td><td>{q.outcome}</td><td>{q.received}</td><td>{q.correctCount}</td>{q.counts.map((count, i) => <td key={i}>{count}</td>)}</tr>)}</tbody></table>
    </div>}</section><Quiz onBankReady={setBank} onActiveQuestion={(id, count) => { void selectQuestion(id, count) }} /></>
}

createRoot(document.getElementById('root')!).render(<Panel />)

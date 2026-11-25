import { useEffect, useState } from 'react'
import { validateBank, type Bank, type Unit } from './question-bank'

const books: Record<number, string[]> = {
  5: ['https://tymm.meb.gov.tr/kitap/19/fen-bilimleri-5.sinif-ders-kitabi-1.kitap', 'https://tymm.meb.gov.tr/kitap/20/fen-bilimleri-5.sinif-ders-kitabi-2.kitap'],
  6: ['https://tymm.meb.gov.tr/kitap/48/fen-bilimleri-6.sinif-ders-kitabi-1.kitap', 'https://tymm.meb.gov.tr/kitap/49/fen-bilimleri-6.sinif-ders-kitabi-2.kitap']
}
const key = 'sinifkart:source-questions:v1'
export function Quiz({ onActiveQuestion, onBankReady }: {
  onActiveQuestion: (id: string | null, optionCount: number | null) => void,
  onBankReady: (bank: Bank) => void
}) {
  const [units, setUnits] = useState<Unit[]>([])
  const [bank, setBank] = useState<Bank>({})
  const [grade, setGrade] = useState(5)
  const [code, setCode] = useState('FB.5.1.1')
  const [index, setIndex] = useState(-1)
  const [reveal, setReveal] = useState(false)
  const [message, setMessage] = useState('Kaynaklı soru dosyası bekleniyor.')
  useEffect(() => {
    fetch('/curriculum.json').then(r => r.json()).then(setUnits).catch(() => setMessage('Müfredat yüklenemedi.'))
    fetch('/sourced-questions.json').then(r => r.json()).then(bundled => {
      try {
        const saved = localStorage.getItem(key)
        const merged = { ...bundled, ...(saved ? JSON.parse(saved) : {}) }
        setBank(merged); onBankReady(merged)
      } catch { setBank(bundled); onBankReady(bundled) }
    }).catch(() => setMessage('Paket soru dosyası okunamadı.'))
  }, [])
  const unit = units.find(u => u.outcomes.some(o => o.code === code))
  const outcome = unit?.outcomes.find(o => o.code === code)
  const questions = bank[code] || []
  function chooseQuestion(next: number, nextCode = code) {
    setIndex(next); setReveal(false)
    onActiveQuestion(next >= 0 ? `${nextCode}:${next + 1}` : null, next >= 0 ? (bank[nextCode]?.[next]?.options.length ?? null) : null)
  }
  async function upload(file?: File) {
    if (!file) return
    try {
      const incoming = validateBank(JSON.parse(await file.text()), units)
      const merged = { ...bank, ...incoming }
      localStorage.setItem(key, JSON.stringify(merged)); setBank(merged); onBankReady(merged)
      setMessage(`${Object.keys(incoming).length} kazanım testi eklendi.`)
    } catch (error) { setMessage('Dosya eklenmedi: ' + String(error)) }
  }
  return <section className="quiz"><h2>Kazanım testleri</h2><p>5 ve 6. sınıf · Her öğrenme çıktısına 10 soru</p>
    <label>Kaynaklı soru dosyası (JSON) <input type="file" accept=".json" onChange={e => void upload(e.target.files?.[0])}/></label><p role="status">{message}</p>
    <nav>{[5,6].map(g => <button key={g} aria-pressed={grade === g} onClick={() => { setGrade(g); setCode(`FB.${g}.1.1`); chooseQuestion(-1) }}>{g}. sınıf</button>)}</nav>
    <div className="quiz-units">{units.filter(u => u.grade === grade).map(u => <section key={u.unit}><h3>{u.unit}. {u.name} </h3>{u.outcomes.map(o => <button className="quiz-outcome" key={o.code} aria-pressed={code === o.code} onClick={() => { setCode(o.code); chooseQuestion(-1) }}><b>{o.code}</b> {o.title} <small>{bank[o.code]?.length || 0}/10</small></button>)}</section>)}</div>
    {outcome && <div className="quiz-selection"><h3>{outcome.code}: {outcome.title}</h3><p>Bu kazanım: {questions.length}/10 soru. {questions.length !== 10 && 'Doğrulanmış tam test henüz eklenmedi.'}</p><button disabled={questions.length !== 10} onClick={() => chooseQuestion(0)}>Kazanım testini tahtada başlat</button><p>Kaynaklar: <a target="_blank" rel="noreferrer" href={unit?.curriculumUrl}>MEB kazanımı</a> · {books[grade].map((url,i) => <a key={url} target="_blank" rel="noreferrer" href={url}>MEB kitap {i+1} · </a>)} <a target="_blank" rel="noreferrer" href="https://www.fenusbilim.com/">Fenusbilim</a></p>{outcome.candidateSource && <p><a target="_blank" rel="noreferrer" href={outcome.candidateSource.url}>MEB kazanım ölçme aracı</a> — {outcome.candidateSource.status}</p>}</div>}
    {index >= 0 && questions[index] && <div className="quiz-board" role="dialog" aria-label="Akıllı tahta"><div className="quiz-top">{code} · {index+1}/10 <button onClick={() => chooseQuestion(-1)}>Kapat ×</button></div><div className="quiz-center"><h2>{questions[index].stem}</h2><div className="quiz-options">{questions[index].options.map((option,i) => <div className={reveal && i === questions[index].correctIndex ? 'right' : ''} key={i}><b>{'ABCD'[i]}</b> {option}</div>)}</div></div><footer><button disabled={index === 0} onClick={() => chooseQuestion(index-1)}>Önceki</button><button onClick={() => setReveal(!reveal)}>{reveal ? 'Cevabı gizle' : 'Cevabı göster'}</button><button disabled={index === 9} onClick={() => chooseQuestion(index+1)}>Sonraki</button><a href={questions[index].source.url} target="_blank" rel="noreferrer">Kaynak</a></footer></div>}
  </section>
}

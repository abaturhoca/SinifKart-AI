export type Unit = { grade: number; unit: number; name: string; curriculumUrl: string; outcomes: { code: string; title: string; targetQuestions: number; candidateSource?: { name: string; url: string; status: string } }[] }
export type Question = { stem: string; options: [string, string, string, string]; correctIndex: number; source: { kind: 'MEB'|'Fenusbilim'|'YouTube'; url: string; location: string; permission: string; answerEvidence?: string } }
export type Bank = Record<string, Question[]>
export function validateBank(raw: unknown, units: Unit[]): Bank {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw Error('Soru dosyası nesne olmalı.')
  const result: Bank = {}
  for (const [code, questions] of Object.entries(raw)) {
    if (!units.some(u => u.outcomes.some(o => o.code === code))) throw Error(`${code}: güncel kazanım bulunamadı.`)
    if (!Array.isArray(questions) || questions.length !== 10) throw Error(`${code}: 10 soru gerekli.`)
    result[code] = questions.map((q: Question, i: number) => {
      if (!q || typeof q.stem !== 'string' || !q.stem.trim() || q.stem.length > 140) throw Error(`${code} / ${i+1}: soru en fazla 140 karakter olmalı.`)
      if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.some(v => typeof v !== 'string' || !v.trim() || v.trim().split(/\s+/).length > 5)) throw Error(`${code} / ${i+1}: dört şık, her biri en fazla beş kelime.`)
      if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) throw Error(`${code} / ${i+1}: doğru şık 0-3 olmalı.`)
      if (!q.source || !['MEB','Fenusbilim','YouTube'].includes(q.source.kind) || !q.source.location?.trim() || !q.source.permission?.trim()) throw Error(`${code} / ${i+1}: kaynak, konum ve kullanım izni gerekli.`)
      if (q.source.answerEvidence !== undefined && !q.source.answerEvidence.trim()) throw Error(`${code} / ${i+1}: cevap kanıtı boş olamaz.`)
      try { if (!/^https?:$/.test(new URL(q.source.url).protocol)) throw Error() } catch { throw Error(`${code} / ${i+1}: kaynak adresi geçersiz.`) }
      return q
    })
  }
  return result
}

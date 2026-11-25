// Keep historical answers attached to the student number and assigned card.
export function buildReport(students, answers, questions, snapshots = []) {
  const stored = new Map(snapshots.map(snapshot => [snapshot.questionId, snapshot]))
  const metadata = { ...questions }
  const persons = new Map()
  for (const snapshot of snapshots) {
    metadata[snapshot.questionId] = snapshot.question
    for (const student of snapshot.students) persons.set(student.number, student)
  }
  if (!snapshots.length) {
    for (const student of students) persons.set(student.number, student)
  }
  const valid = answers.filter(row => {
    const roster = stored.get(row.questionId)?.students ?? students
    const student = roster.find(person => person.number === row.number)
    const question = metadata[row.questionId]
    const allowed = 'ABCD'.slice(0, question?.optionCount ?? 4)
    return student?.cardId === row.cardId && question?.correct &&
      typeof row.answer === 'string' && row.answer.length === 1 && allowed.includes(row.answer)
  })
  const ids = [...new Set([...snapshots.map(snapshot => snapshot.questionId), ...valid.map(row => row.questionId)])]
  const byQuestion = ids.map(id => {
    const rows = valid.filter(row => row.questionId === id)
    const question = metadata[id]
    return {
      id, outcome: question.outcome, title: question.title, correct: question.correct,
      received: rows.length, correctCount: rows.filter(row => row.answer === question.correct).length,
      counts: 'ABCD'.split('').map(answer => rows.filter(row => row.answer === answer).length)
    }
  })
  const byStudent = [...persons.values()].map(student => {
    const responses = ids.map(id => valid.find(row => row.questionId === id && row.number === student.number)?.answer ?? '')
    const right = responses.filter((answer, index) => answer === metadata[ids[index]].correct).length
    const answered = responses.filter(Boolean).length
    return {
      number: student.number, name: student.name, cardId: student.cardId,
      responses, right: answered ? right : null, wrong: answered ? answered - right : null,
      blank: ids.length - answered
    }
  })
  return { ids, byStudent, byQuestion, ignored: answers.length - valid.length }
}

function safeCell(value) {
  const text = String(value ?? '')
  const protectedText = /^[=+\-@\t\r]/.test(text.trimStart()) ? "'" + text : text
  return '"' + protectedText.replaceAll('"', '""') + '"'
}

export function reportCsv(report) {
  const lines = [
    ['Öğrenci No', 'Öğrenci', 'Kart', ...report.ids, 'Doğru', 'Yanlış', 'Boş'],
    ...report.byStudent.map(row => [row.number, row.name, row.cardId, ...row.responses, row.right, row.wrong, row.blank])
  ]
  return '\ufeff' + lines.map(row => row.map(safeCell).join(';')).join('\r\n') + '\r\n'
}

export function reportQuestionCsv(report) {
  const lines = [
    ['Soru', 'Kazanım', 'Soru metni', 'Doğru yanıt', 'Katılım', 'Doğru', 'Yanlış', 'Boş', 'A', 'B', 'C', 'D'],
    ...report.byQuestion.map(row => [row.id, row.outcome, row.title, row.correct, row.received,
      row.correctCount, row.received - row.correctCount, report.byStudent.length - row.received, ...row.counts])
  ]
  return '\ufeff' + lines.map(row => row.map(safeCell).join(';')).join('\r\n') + '\r\n'
}

function htmlCell(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
}

export function reportFileName(sessionId, kind) {
  if (!['ogrenci', 'soru', 'yazdir'].includes(kind) || !Number.isFinite(Date.parse(sessionId))) throw Error('Rapor oturumu veya türü geçersiz')
  const stamp = new Date(sessionId).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
  return `sinifkart-${stamp}-${kind}.${kind === 'yazdir' ? 'html' : 'csv'}`
}

export function reportPrintHtml(report, sessionId = '') {
  const students = [
    ['Öğrenci No', 'Öğrenci', 'Kart', ...report.ids, 'Doğru', 'Yanlış', 'Boş'],
    ...report.byStudent.map(row => [row.number, row.name, row.cardId, ...row.responses,
      row.right, row.wrong, row.blank])
  ]
  const questions = [
    ['Soru', 'Kazanım', 'Soru metni', 'Doğru yanıt', 'Katılım', 'Doğru', 'Yanlış', 'Boş', 'A', 'B', 'C', 'D'],
    ...report.byQuestion.map(row => [row.id, row.outcome, row.title, row.correct,
      row.received, row.correctCount, row.received - row.correctCount,
      report.byStudent.length - row.received, ...row.counts])
  ]
  const table = (title, rows) => `<h2>${htmlCell(title)}</h2><table><thead><tr>${rows[0].map(cell => `<th>${htmlCell(cell)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(row => `<tr>${row.map(cell => `<td>${htmlCell(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
  return '<!doctype html><html lang="tr"><meta charset="utf-8"><title>SınıfKart oturum raporu</title>' +
    '<style>body{font:12px system-ui;margin:1rem}table{border-collapse:collapse;margin:1rem 0;width:100%}td,th{border:1px solid #888;padding:.25rem;overflow-wrap:anywhere}thead{display:table-header-group}tr{break-inside:avoid}@page{size:A4 landscape;margin:10mm}@media print{button{display:none}}</style>' +
    '<h1>SınıfKart oturum raporu</h1>' + (sessionId ? `<p>Oturum: ${htmlCell(sessionId)}</p>` : '') +
    '<button onclick="window.print()">Yazdır / PDF kaydet</button>' +
    table('Öğrenci sonuçları', students) + table('Soru sonuçları', questions) + '</html>'
}

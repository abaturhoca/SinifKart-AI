import assert from 'node:assert/strict'
import { planAnswerWrites } from './src/session.js'
import { buildReport, reportCsv, reportQuestionCsv, reportPrintHtml, reportFileName } from './src/report.js'

const sessionId = '2026-11-24T10:00:00Z'
const students = Array.from({ length: 40 }, (_, i) => ({
  number: String(i + 1), name: i === 0 ? '=DENE' : `Öğrenci ${i + 1}`, cardId: i + 1
}))
const questions = Object.fromEntries(Array.from({ length: 5 }, (_, i) =>
  [`FB.6.1.1:${i + 1}`, { outcome: 'FB.6.1.1', title: `Soru ${i + 1}`, correct: 'ABCD'[i % 4] }]))
const stored = new Map()
for (const questionId of Object.keys(questions)) {
  const q = Number(questionId.split(':')[1]) - 1
  const incoming = students.map((student, i) => ({
    cardId: student.cardId, number: student.number, answer: 'ABCD'[(i + q) % 4]
  }))
  const first = planAnswerWrites(stored, incoming, sessionId, questionId)
  assert.equal(first.writes.length, 40)
  for (const row of first.writes) stored.set(row.key, row)
  assert.deepEqual(planAnswerWrites(stored, incoming, sessionId, questionId), { writes: [], unchanged: 40 })
}
const report = buildReport(students, [...stored.values()], questions)
assert.equal(reportFileName(sessionId, 'ogrenci'), 'sinifkart-20261124T100000Z-ogrenci.csv')
assert.equal(reportFileName(sessionId, 'yazdir'), 'sinifkart-20261124T100000Z-yazdir.html')
assert.throws(() => reportFileName('../bad', 'ogrenci'), /geçersiz/)
assert.equal(report.ids.length, 5)
assert.equal(report.byStudent.length, 40)
assert.equal(report.byStudent.reduce((sum, row) => sum + row.right + row.wrong + row.blank, 0), 200)
assert.equal(report.byQuestion.reduce((sum, row) => sum + row.received, 0), 200)
assert.equal(report.byQuestion.reduce((sum, row) => sum + row.correctCount, 0), 50)
assert.equal(report.ignored, 0)
assert.ok(reportCsv(report).includes("'=DENE"))
const unassigned = { ...[...stored.values()][0], number: 'other' }
assert.equal(buildReport(students, [...stored.values(), unassigned], questions).ignored, 1)
const missing = buildReport(students, [...stored.values()].slice(1), questions)
assert.equal(missing.byStudent.reduce((sum, row) => sum + row.blank, 0), 1)
const snapshots = Object.entries(questions).map(([questionId, question]) =>
  ({ questionId, students: students.map(student => ({ ...student })), question }))
snapshots.push({
  questionId: 'FB.6.1.1:6', students: students.map(student => ({ ...student })),
  question: { outcome: 'FB.6.1.1', title: 'Boş soru', correct: 'B' }
})
const changedRoster = [{ number: '999', name: 'Yeni', cardId: 1 }]
const historical = buildReport(changedRoster, [...stored.values()], {}, snapshots)
assert.equal(historical.byStudent.length, 40)
assert.equal(historical.ignored, 0)
assert.equal(historical.ids.length, 6)
assert.equal(historical.byQuestion[5].received, 0)
assert.equal(historical.byStudent[0].blank, 1)
assert.equal(historical.byStudent.reduce((sum, row) => sum + row.blank, 0), 40)
const noAnswers = buildReport(students, [], {}, snapshots)
assert.equal(noAnswers.byStudent[0].right, null)
assert.equal(noAnswers.byStudent[0].wrong, null)
assert.equal(noAnswers.byStudent[0].blank, 6)
assert.ok(reportCsv(noAnswers).includes('"";"";"6"'))
const limitedQuestion = { outcome: 'FB.6.1.1', title: 'İki seçenekli soru', correct: 'A', optionCount: 2 }
const limited = buildReport(students, [
  { number: '1', cardId: 1, questionId: 'FB.6.1.1:7', answer: 'D' },
  { number: '2', cardId: 2, questionId: 'FB.6.1.1:7', answer: 'B' }
], {}, [{ questionId: 'FB.6.1.1:7', students, question: limitedQuestion }])
assert.equal(limited.ignored, 1)
assert.equal(limited.byQuestion[0].received, 1)
assert.equal(limited.byQuestion[0].counts[3], 0)
assert.equal(limited.byStudent[0].blank, 1)
assert.equal(limited.byStudent[1].responses[0], 'B')
assert.ok(reportQuestionCsv(limited).includes('"39"'))
const summaryRows = reportQuestionCsv(historical).trim().split('\r\n')
assert.equal(summaryRows.length, 7)
const last = summaryRows[6].match(/"(?:[^"]|"")*"/g).map(cell => cell.slice(1, -1))
assert.deepEqual(last.slice(4, 8), ['0', '0', '0', '40'])
assert.deepEqual(last.slice(8), ['0', '0', '0', '0'])
const injected = buildReport(students, [...stored.values()], { ...questions, 'FB.6.1.1:1': { ...questions['FB.6.1.1:1'], title: '=FORMUL' } })
assert.ok(reportQuestionCsv(injected).includes("'=FORMUL"))
const printable = reportPrintHtml(injected)
assert.ok(reportPrintHtml(injected, sessionId).includes(`Oturum: ${sessionId}`))
assert.ok(reportPrintHtml(injected, '<script>bad</script>').includes('&lt;script&gt;bad&lt;/script&gt;'))
assert.equal((printable.match(/<tbody>/g) ?? []).length, 2)
assert.equal((printable.match(/<tr>/g) ?? []).length, 40 + 5 + 2)
assert.ok(reportPrintHtml(buildReport(students, [], { 'X:1': { outcome: '<Fen>', title: '<script>bad</script>', correct: 'A' } },
  [{ questionId: 'X:1', students, question: { outcome: '<Fen>', title: '<script>bad</script>', correct: 'A' } }])).includes('&lt;script&gt;bad&lt;/script&gt;'))
assert.ok(!printable.includes('<script>'))
console.log('40 öğrenci × 5 soru: 200 kayıt, 50 doğru, tekrar koruması, boş ve eşleşmeyen kayıt kontrolü geçti')

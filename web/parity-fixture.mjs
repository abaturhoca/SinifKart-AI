import { buildReport, reportCsv, reportQuestionCsv, reportPrintHtml } from './src/report.js'

const students = Array.from({ length: 40 }, (_, i) => ({
  number: String(i + 1), name: `Öğrenci ${i + 1}`, cardId: i + 1
}))
const questions = Object.fromEntries(Array.from({ length: 6 }, (_, q) => [
  `FB.6.1.1:${q + 1}`,
  { outcome: 'FB.6.1.1', title: `Soru ${q + 1}`, correct: 'ABCD'[q % 4] }
]))
const answers = Array.from({ length: 5 }, (_, q) => students.map((student, i) => ({
  questionId: `FB.6.1.1:${q + 1}`, number: student.number,
  cardId: student.cardId, answer: 'ABCD'[(i + q) % 4]
}))).flat()
const snapshots = Object.entries(questions).map(([questionId, question]) => ({ questionId, question, students }))
const report = buildReport(students, answers, questions, snapshots)
process.stdout.write(JSON.stringify({ report, studentCsv: reportCsv(report),
  questionCsv: reportQuestionCsv(report), html: reportPrintHtml(report) }))

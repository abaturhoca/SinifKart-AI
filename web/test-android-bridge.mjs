import assert from 'node:assert/strict'
import { androidToken, makeAndroidSession, makeAndroidSessionForContext, parseAndroidAnswers, importAndroidAnswersForContext } from './src/android-bridge.js'

const students = [{ cardId: 7, number: '12', name: 'Öğrenci A' }, { cardId: 9, number: '13', name: 'Öğrenci B' }]
const packet = await makeAndroidSession('2026-11-24T00:00:00Z', 'FB.5.1.1:1', 3, students)
assert.match(packet.sessionId, /^[0-9a-f]{32}$/)
assert.equal(packet.sessionId, packet.questionId)
assert.deepEqual(packet.cards, [7, 9])
assert.equal(packet.options, 'ABC')
assert.ok(!JSON.stringify(packet).includes('Öğrenci'))
const exported = JSON.stringify({ version: 1, sessionId: packet.sessionId, questionId: packet.questionId, responses: [{ cardId: 7, answer: 'B' }] })
assert.deepEqual(await parseAndroidAnswers(exported, '2026-11-24T00:00:00Z', 'FB.5.1.1:1', 3, students), [{ cardId: 7, number: '12', name: 'Öğrenci A', answer: 'B' }])
await assert.rejects(() => parseAndroidAnswers(exported, '2026-11-24T00:00:00Z', 'FB.5.1.1:2', 3, students), /etkin soruya/)
await assert.rejects(() => parseAndroidAnswers(exported.replace('"B"', '"D"'), '2026-11-24T00:00:00Z', 'FB.5.1.1:1', 3, students), /geçersiz/)
await assert.rejects(() => parseAndroidAnswers(exported.replace('"cardId":7', '"cardId":10'), '2026-11-24T00:00:00Z', 'FB.5.1.1:1', 3, students), /geçersiz/)
assert.notEqual(await androidToken('s', 'q1'), await androidToken('s', 'q2'))
const context = { sessionId: '2026-11-24T00:00:00Z', questionId: 'FB.5.1.1:1', optionCount: 3, students }
let releaseExport
const pendingExport = makeAndroidSessionForContext(context, () => false,
  () => new Promise(resolve => { releaseExport = resolve }))
releaseExport(packet)
await assert.rejects(pendingExport, /Android oturum dosyası oluşturulmadı/)
assert.deepEqual(await makeAndroidSessionForContext(context, () => true), packet)
let releaseRead
let writes = 0
const file = { text: () => new Promise(resolve => { releaseRead = resolve }) }
const pending = importAndroidAnswersForContext(file, context, () => false, () => { writes++; return { saved: 1 } })
releaseRead(exported)
await assert.rejects(pending, /Etkin çalışma değişti/)
assert.equal(writes, 0, 'Eski bağlamda IndexedDB yazma çağrılmamalı')
const saved = await importAndroidAnswersForContext({ text: async () => exported }, context, () => true,
  (sessionId, questionId, rows) => { writes++; assert.equal(sessionId, context.sessionId); assert.equal(questionId, context.questionId); assert.equal(rows[0].cardId, 7); return { saved: 1 } })
assert.deepEqual(saved, { saved: 1 })
assert.equal(writes, 1)
console.log('Android köprüsü: oturum, eşleme ve ret testleri geçti')

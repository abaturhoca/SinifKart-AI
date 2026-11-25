import assert from 'node:assert/strict'
import { planAnswerWrites } from './src/session.js'
const session = '2026-11-24T08:00:00.000Z'
const question = 'FB.5.1.1:1'
const rows = [{ cardId: 7, number: '101', answer: 'A' }, { cardId: 8, number: '102', answer: 'C' }]
const first = planAnswerWrites(new Map(), rows, session, question)
assert.equal(first.writes.length, 2)
const saved = new Map(first.writes.map(row => [row.key, row]))
assert.deepEqual(planAnswerWrites(saved, rows, session, question), { writes: [], unchanged: 2 })
assert.equal(planAnswerWrites(saved, [{ cardId: 7, number: '101', answer: 'B' }], session, 'FB.5.1.1:2').writes.length, 1)
assert.throws(() => planAnswerWrites(saved, [{ cardId: 7, number: '101', answer: 'B' }], session, question), /çakışması/)
assert.throws(() => planAnswerWrites(saved, [{ cardId: 7, number: '999', answer: 'A' }], session, question), /çakışması/)
assert.throws(() => planAnswerWrites(saved, [rows[0], rows[0]], session, question), /yinelenen/)
assert.throws(() => planAnswerWrites(saved, rows, session, ''), /gerekli/)
console.log('Oturum/soru/kart anahtarı, tekrar ve çakışma kontrolleri geçti')

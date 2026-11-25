import assert from 'node:assert/strict'
import { reconcileScan } from './src/reconcile.js'

const roster = [{ number: '10', name: 'Ada', cardId: 1 }, { number: '11', name: 'Ada', cardId: 2 }, { number: '12', name: 'Can', cardId: 3 }]
const result = reconcileScan(roster, [
  { cardId: 1, answer: 'A', status: 'ok' },
  { cardId: 2, answer: 'C', status: 'ok' },
  { cardId: 2, answer: 'D', status: 'ok' },
  { cardId: 3, answer: 'B', status: 'ambiguous' },
  { cardId: 99, answer: 'B', status: 'ok' }
])
assert.deepEqual(result.responses, [{ number: '10', name: 'Ada', cardId: 1, answer: 'A' }])
assert.equal(result.issues.length, 4)
assert.deepEqual(result.missing.map(s => s.number), ['11', '12'])
assert.deepEqual(reconcileScan(roster, []).missing, roster)
const twoChoice = reconcileScan(roster, [
  { cardId: 1, answer: 'B', status: 'ok' },
  { cardId: 2, answer: 'C', status: 'ok' }
], 'AB')
assert.deepEqual(twoChoice.responses.map(row => row.cardId), [1])
assert.match(twoChoice.issues[0].reason, /seçenekleri dışında/)
assert.deepEqual(twoChoice.missing.map(row => row.cardId), [2, 3])
assert.throws(() => reconcileScan(roster, [], 'AC'), /seçenekleri geçersiz/)
console.log('Kart eşleştirme: adaş, yinelenen, belirsiz, listede olmayan ve eksik kartlar doğrulandı')

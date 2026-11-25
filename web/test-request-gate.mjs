import assert from 'node:assert/strict'
import { createRequestGate } from './src/request-gate.js'

const gate = createRequestGate()
const old = gate.begin()
const pending = Promise.resolve('eski oturum')
gate.invalidate() // The teacher selects another session while IndexedDB is still reading.
assert.equal(gate.isCurrent(old), false)
assert.equal(await pending, 'eski oturum')
const current = gate.begin()
assert.equal(gate.isCurrent(current), true)
const newer = gate.begin()
assert.equal(gate.isCurrent(current), false)
assert.equal(gate.isCurrent(newer), true)
console.log('Gecikmiş rapor okuması eski veya yeni oturumun ekranını değiştiremez')

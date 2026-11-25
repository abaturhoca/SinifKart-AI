import 'fake-indexeddb/auto'
import assert from 'node:assert/strict'
import { parseBackup } from './src/backup.js'
import { openDraft, listDrafts, startDraft, activateDraft, saveRosterForSession, loadRoster, rememberQuestion, confirmAnswers, loadAnswers, loadQuestionSnapshots, exportLocalBackup, restoreLocalBackup } from './src/session.js'

const roster = [{ number: '12', name: 'Kurgusal A', cardId: 7 }, { number: '13', name: 'Kurgusal B', cardId: 9 }]
const sessionId = await openDraft()
assert.equal(await openDraft(), sessionId)
await saveRosterForSession(sessionId, roster)
await rememberQuestion(sessionId, 'FB.5.1.1:1', roster, { correct: 'A', title: 'Kurgusal soru' })
await rememberQuestion(sessionId, 'FB.5.1.1:1', roster, { correct: 'A', title: 'Kurgusal soru' })
await rememberQuestion(sessionId, 'FB.5.1.1:1', roster, { correct: 'A', title: 'Kurgusal soru', optionCount: 4 })
assert.deepEqual(await confirmAnswers(sessionId, 'FB.5.1.1:1', [
  { number: '12', cardId: 7, answer: 'A' }, { number: '13', cardId: 9, answer: 'B' }
]), { saved: 2, unchanged: 0 })
assert.deepEqual(await confirmAnswers(sessionId, 'FB.5.1.1:1', [
  { number: '12', cardId: 7, answer: 'A' }, { number: '13', cardId: 9, answer: 'B' }
]), { saved: 0, unchanged: 2 })
await assert.rejects(confirmAnswers(sessionId, 'FB.5.1.1:1', [
  { number: '12', cardId: 7, answer: 'C' }, { number: '13', cardId: 9, answer: 'B' }
]), /çakışması/)
await assert.rejects(confirmAnswers(sessionId, 'FB.5.1.1:1', [
  { number: '13', cardId: 7, answer: 'A' }
]), /eşleşmesi/)
await assert.rejects(confirmAnswers(sessionId, 'FB.5.1.1:2', [
  { number: '12', cardId: 7, answer: 'A' }
]), /soru kaydı bulunamadı/)
assert.equal((await loadAnswers(sessionId)).length, 2)
const otherRoster = [{ number: '99', name: 'Yeni sınıf', cardId: 99 }]
await assert.rejects(saveRosterForSession(sessionId, otherRoster), /yeni oturum/)
assert.equal((await loadRoster())[0].cardId, 7)
assert.equal((await loadQuestionSnapshots(sessionId))[0].students.length, 2)
assert.equal((await loadAnswers(sessionId)).length, 2)
await assert.rejects(rememberQuestion(sessionId, 'FB.5.1.1:1', otherRoster, { correct: 'A' }), /Etkin sınıf listesi değişti/)
await assert.rejects(rememberQuestion(sessionId, 'FB.5.1.1:1', roster, { correct: 'B', title: 'Kurgusal soru' }), /cevap anahtarı değişmiş/)
assert.equal((await loadQuestionSnapshots(sessionId))[0].question.correct, 'A')
const next = await startDraft()
assert.notEqual(next, sessionId)
await assert.rejects(rememberQuestion(sessionId, 'FB.5.1.1:2', roster,
  { correct: 'A', title: 'Gecikmiş soru' }), /Etkin oturum değişti/)
assert.equal((await loadQuestionSnapshots(sessionId)).length, 1)
await assert.rejects(confirmAnswers(sessionId, 'FB.5.1.1:1', [
  { number: '12', cardId: 7, answer: 'A' }
]), /Etkin oturum değişti/)
assert.equal((await loadAnswers(sessionId)).length, 2)
assert.equal(await openDraft(), next)
assert.deepEqual(await listDrafts(), [sessionId, next])
await assert.rejects(saveRosterForSession(sessionId, otherRoster), /Etkin oturum değişti/)
assert.equal((await loadRoster())[0].cardId, 7)
await saveRosterForSession(next, otherRoster)
assert.equal((await loadRoster())[0].cardId, 99)
await assert.rejects(rememberQuestion(next, 'FB.5.1.1:2', roster,
  { correct: 'A', title: 'Eski sınıf sorusu' }), /Etkin sınıf listesi değişti/)
assert.equal((await loadQuestionSnapshots(next)).length, 0)
await rememberQuestion(next, 'FB.5.1.1:1', await loadRoster(), { correct: 'B', title: 'Yeni oturum sorusu' })
await confirmAnswers(next, 'FB.5.1.1:1', [{ number: '99', cardId: 99, answer: 'B' }])
assert.equal((await loadAnswers(next)).length, 1)
await activateDraft(sessionId)
assert.equal(await openDraft(), sessionId)
assert.equal((await loadRoster())[0].cardId, 7)
assert.equal((await loadAnswers(sessionId)).length, 2)
assert.equal((await loadQuestionSnapshots(sessionId))[0].students.length, 2)
await assert.rejects(rememberQuestion(sessionId, 'FB.5.1.1:2', otherRoster, { correct: 'A', title: 'Başka sınıf' }), /Etkin sınıf listesi değişti/)
assert.equal((await loadQuestionSnapshots(sessionId)).length, 1)
await saveRosterForSession(sessionId, roster)
await assert.rejects(activateDraft('2020-01-01T00:00:00.000Z'), /bulunamadı/)
const backup = await exportLocalBackup()
assert.equal(backup.answers.length, 3)
assert.equal(backup.questionSnapshots.length, 2)
await assert.rejects(restoreLocalBackup(JSON.stringify(backup)), /mevcut veriyi değiştirmedi/)
const invalid = structuredClone(backup); invalid.answers[0].number = 'yanlış öğrenci'
await assert.rejects(restoreLocalBackup(JSON.stringify(invalid)), /eşleşmesi bozuk/)
const mixedRoster = structuredClone(backup)
mixedRoster.questionSnapshots.push({ ...mixedRoster.questionSnapshots[0], questionId: 'FB.5.1.1:2', students: otherRoster })
await assert.rejects(restoreLocalBackup(JSON.stringify(mixedRoster)), /farklı sınıf listeleri/)
const wrongActiveRoster = structuredClone(backup); wrongActiveRoster.students = otherRoster
await assert.rejects(restoreLocalBackup(JSON.stringify(wrongActiveRoster)), /etkin oturum sınıf listesi/)
const legacy = structuredClone(backup)
legacy.answers[0].questionId = 'FB.5.1.1:eski'
legacy.answers[0].key = `${legacy.answers[0].sessionId}|${legacy.answers[0].questionId}|${legacy.answers[0].cardId}`
assert.equal(parseBackup(JSON.stringify(legacy)).answers[0].questionId, 'FB.5.1.1:eski')
legacy.answers[0].cardId = 99
legacy.answers[0].key = `${legacy.answers[0].sessionId}|${legacy.answers[0].questionId}|99`
await assert.rejects(restoreLocalBackup(JSON.stringify(legacy)), /eşleşmesi bozuk/)
await new Promise((resolve, reject) => {
  const request = indexedDB.deleteDatabase('sinifkart-hibrit')
  request.onsuccess = resolve; request.onerror = () => reject(request.error)
})
await openDraft() // Empty first launch is allowed to be replaced by the full backup.
assert.equal(await restoreLocalBackup(JSON.stringify(backup)), sessionId)
assert.equal(await openDraft(), sessionId)
assert.deepEqual(await listDrafts(), [sessionId, next])
assert.equal((await loadAnswers(sessionId)).length, 2)
assert.equal((await loadAnswers(next)).length, 1)
assert.equal((await loadQuestionSnapshots(sessionId))[0].students.length, 2)
assert.equal((await loadRoster())[0].cardId, 7)
await rememberQuestion(sessionId, 'FB.5.1.1:2', roster, { correct: 'A', title: 'İki seçenekli soru', optionCount: 2 })
await assert.rejects(confirmAnswers(sessionId, 'FB.5.1.1:2', [{ number: '12', cardId: 7, answer: 'D' }]), /seçenekleri dışında/)
assert.deepEqual(await confirmAnswers(sessionId, 'FB.5.1.1:2', [{ number: '12', cardId: 7, answer: 'B' }]), { saved: 1, unchanged: 0 })
const limitedBackup = await exportLocalBackup()
limitedBackup.answers.find(row => row.questionId === 'FB.5.1.1:2').answer = 'D'
assert.throws(() => parseBackup(JSON.stringify(limitedBackup)), /seçenekleri dışında/)
console.log('IndexedDB: oturum geçmişi, tam yerel yedek/geri yükleme, çakışma reddi ve sınıf snapshot koruması geçti')

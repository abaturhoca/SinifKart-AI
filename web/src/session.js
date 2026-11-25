import { parseBackup } from './backup.js'

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('sinifkart-hibrit', 4)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('draft')) request.result.createObjectStore('draft')
      if (!request.result.objectStoreNames.contains('class')) request.result.createObjectStore('class')
      if (!request.result.objectStoreNames.contains('answers')) request.result.createObjectStore('answers')
      if (!request.result.objectStoreNames.contains('questionSnapshots')) request.result.createObjectStore('questionSnapshots')
    }
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export function planAnswerWrites(existing, incoming, sessionId, questionId) {
  if (!sessionId || !questionId) throw new Error('Etkin oturum ve soru gerekli')
  const seen = new Set()
  const writes = []
  let unchanged = 0
  for (const row of incoming) {
    if (!Number.isInteger(row.cardId) || !/^[A-D]$/.test(row.answer) || !row.number || seen.has(row.cardId)) throw new Error('Geçersiz veya yinelenen kart')
    seen.add(row.cardId)
    const key = `${sessionId}|${questionId}|${row.cardId}`
    const old = existing.get(key)
    if (old) {
      if (old.number !== row.number || old.answer !== row.answer) throw new Error(`Kart ${row.cardId} için kayıt çakışması; otomatik üzerine yazılmadı`)
      unchanged++
    } else writes.push({ key, sessionId, questionId, cardId: row.cardId, number: row.number, answer: row.answer })
  }
  return { writes, unchanged }
}

export async function confirmAnswers(sessionId, questionId, responses) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    // Keep the active session, question snapshot and writes in one transaction.
    // A session switch cannot slip between validation and the answer commit.
    const tx = db.transaction(['draft', 'questionSnapshots', 'answers'], 'readwrite')
    const active = tx.objectStore('draft').get('startedAt')
    const snapshot = tx.objectStore('questionSnapshots').get(`${sessionId}|${questionId}`)
    const store = tx.objectStore('answers')
    const existing = new Map()
    const read = store.openCursor()
    let outcome
    read.onsuccess = () => {
      const cursor = read.result
      if (cursor) { existing.set(cursor.key, cursor.value); cursor.continue(); return }
      try {
        if (active.result !== sessionId) throw Error('Etkin oturum değişti; yanıtlar kaydedilmedi')
        const roster = snapshot.result?.students
        if (!Array.isArray(roster)) throw Error('Etkin soru kaydı bulunamadı; yanıtlar kaydedilmedi')
        if (responses.some(row => !roster.some(student => student.cardId === row.cardId && student.number === row.number)))
          throw Error('Yanıt öğrenci-kart eşleşmesi etkin soruyla uyuşmuyor')
        const optionCount = snapshot.result.question?.optionCount
        if (optionCount && responses.some(row => !'ABCD'.slice(0, optionCount).includes(row.answer)))
          throw Error('Yanıt etkin sorunun seçenekleri dışında')
        outcome = planAnswerWrites(existing, responses, sessionId, questionId)
        for (const row of outcome.writes) store.put(row, row.key)
      } catch (error) { outcome = error; tx.abort() }
    }
    tx.oncomplete = () => { db.close(); resolve({ saved: outcome.writes.length, unchanged: outcome.unchanged }) }
    tx.onabort = () => { db.close(); reject(outcome instanceof Error ? outcome : tx.error) }
    tx.onerror = () => { /* onabort reports the transaction error */ }
  })
}

/** @returns {Promise<string>} */
export async function openDraft() {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
      const transaction = db.transaction('draft', 'readwrite')
      const store = transaction.objectStore('draft')
      const read = store.get('startedAt')
      let startedAt
      read.onsuccess = () => {
        startedAt = read.result ?? new Date().toISOString()
        if (read.result === undefined) store.put(startedAt, 'startedAt')
        const history = store.get('sessions')
        history.onsuccess = () => {
          const sessions = history.result ?? []
          if (!sessions.includes(startedAt)) store.put([...sessions, startedAt], 'sessions')
        }
      }
      transaction.oncomplete = () => { db.close(); resolve(startedAt) }
      transaction.onabort = () => { db.close(); reject(transaction.error) }
  })
}

export async function listDrafts() {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('draft', 'readonly')
    const request = tx.objectStore('draft').get('sessions')
    let sessions = []
    request.onsuccess = () => { sessions = request.result ?? [] }
    tx.oncomplete = () => { db.close(); resolve(sessions) }
    tx.onabort = () => { db.close(); reject(tx.error) }
  })
}

export async function startDraft() {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('draft', 'readwrite')
    const store = tx.objectStore('draft')
    const read = store.get('sessions')
    let startedAt
    read.onsuccess = () => {
      const sessions = read.result ?? []
      let time = Date.now()
      while (sessions.includes(new Date(time).toISOString())) time++
      startedAt = new Date(time).toISOString()
      store.put([...sessions, startedAt], 'sessions')
      store.put(startedAt, 'startedAt')
    }
    tx.oncomplete = () => { db.close(); resolve(startedAt) }
    tx.onabort = () => { db.close(); reject(tx.error) }
  })
}

export async function activateDraft(sessionId) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['draft', 'class', 'questionSnapshots'], 'readwrite')
    const store = tx.objectStore('draft')
    const read = store.get('sessions')
    const snapshots = tx.objectStore('questionSnapshots').getAll()
    let problem
    let pending = 2
    const check = () => {
      if (--pending) return
      if (!(read.result ?? []).includes(sessionId)) { problem = Error('Oturum bulunamadı'); tx.abort(); return }
      const related = snapshots.result.filter(row => row.sessionId === sessionId)
      if (related.some(row => JSON.stringify(row.students) !== JSON.stringify(related[0].students))) {
        problem = Error('Bu oturumda farklı sınıf kayıtları var; otomatik sınıf seçilemedi')
        tx.abort(); return
      }
      if (related.length) tx.objectStore('class').put(related[0].students, 'students')
      store.put(sessionId, 'startedAt')
    }
    read.onsuccess = check; snapshots.onsuccess = check
    tx.oncomplete = () => { db.close(); resolve(sessionId) }
    tx.onabort = () => { db.close(); reject(problem ?? tx.error) }
  })
}

export async function saveRoster(students) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
      const transaction = db.transaction('class', 'readwrite')
      transaction.objectStore('class').put(students, 'students')
      transaction.oncomplete = () => { db.close(); resolve(students.length) }
      transaction.onabort = () => { db.close(); reject(transaction.error) }
  })
}

export async function saveRosterForSession(sessionId, students) {
  if (!sessionId) throw Error('Etkin oturum gerekli')
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    // The active session must be checked in the same transaction as the
    // shared roster write, including when CSV parsing finishes late.
    const tx = db.transaction(['draft', 'class', 'answers', 'questionSnapshots'], 'readwrite')
    const active = tx.objectStore('draft').get('startedAt')
    const classStore = tx.objectStore('class')
    const current = classStore.get('students')
    const answers = tx.objectStore('answers').getAll()
    const snapshots = tx.objectStore('questionSnapshots').getAll()
    let pending = 4, problem
    const check = () => {
      if (--pending) return
      if (active.result !== sessionId) {
        problem = Error('Etkin oturum değişti; sınıf kaydedilmedi')
        tx.abort(); return
      }
      const changed = JSON.stringify(current.result ?? []) !== JSON.stringify(students)
      const related = snapshots.result.filter(row => row.sessionId === sessionId)
      const legacyAnswers = answers.result.some(row => row.sessionId === sessionId) && !related.length
      if (related.some(row => JSON.stringify(row.students) !== JSON.stringify(students)) || (changed && legacyAnswers)) {
        problem = Error('Bu oturumda yanıt veya soru kaydı var. Farklı sınıf için yeni oturum başlatın.')
        tx.abort(); return
      }
      classStore.put(students, 'students')
    }
    active.onsuccess = check; current.onsuccess = check; answers.onsuccess = check; snapshots.onsuccess = check
    tx.oncomplete = () => { db.close(); resolve(students.length) }
    tx.onabort = () => { db.close(); reject(problem ?? tx.error) }
  })
}

export async function loadRoster() {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('class', 'readonly')
    const request = transaction.objectStore('class').get('students')
    request.onsuccess = () => { db.close(); resolve(request.result ?? []) }
    request.onerror = () => { db.close(); reject(request.error) }
  })
}

export async function loadAnswers(sessionId) {
  if (!sessionId) throw new Error('Etkin oturum gerekli')
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const rows = []
    const tx = db.transaction('answers', 'readonly')
    const cursor = tx.objectStore('answers').openCursor()
    cursor.onsuccess = () => {
      if (!cursor.result) return
      if (cursor.result.value.sessionId === sessionId) rows.push(cursor.result.value)
      cursor.result.continue()
    }
    tx.oncomplete = () => { db.close(); resolve(rows) }
    tx.onabort = () => { db.close(); reject(tx.error) }
  })
}

export async function rememberQuestion(sessionId, questionId, students, question) {
  if (!sessionId || !questionId || !students.length || !question?.correct) throw Error('Soru ve sınıf seçimi gerekli')
  if (question.optionCount !== undefined &&
    (!Number.isInteger(question.optionCount) || question.optionCount < 2 || question.optionCount > 4 ||
      !'ABCD'.slice(0, question.optionCount).includes(question.correct))) throw Error('Soru seçenek sayısı geçersiz')
  const db = await openDatabase()
  const key = `${sessionId}|${questionId}`
  return new Promise((resolve, reject) => {
    // Serialize question selection with session and roster changes. Otherwise a
    // delayed selection can create an unanswered question in the old session.
    const tx = db.transaction(['draft', 'class', 'questionSnapshots'], 'readwrite')
    const active = tx.objectStore('draft').get('startedAt')
    const roster = tx.objectStore('class').get('students')
    const store = tx.objectStore('questionSnapshots')
    const all = store.getAll()
    let problem
    all.onsuccess = () => {
      if (active.result !== sessionId) {
        problem = Error('Etkin oturum değişti; soru açılmadı')
        tx.abort(); return
      }
      if (JSON.stringify(roster.result ?? []) !== JSON.stringify(students)) {
        problem = Error('Etkin sınıf listesi değişti; soru açılmadı')
        tx.abort(); return
      }
      if (all.result.some(row => row.sessionId === sessionId && JSON.stringify(row.students) !== JSON.stringify(students))) {
        problem = Error('Bu oturumda başka sınıf listesi kullanılmış. Yeni oturum başlatın.')
        tx.abort(); return
      }
      const read = store.get(key)
      read.onsuccess = () => {
      const snapshot = { sessionId, questionId, students: students.map(s => ({ ...s })), question }
      if (read.result) {
        if (JSON.stringify(read.result.students) !== JSON.stringify(snapshot.students)) {
          problem = Error('Bu soru başka sınıf listesiyle açılmış. Önceki yanıtları korumak için yeni oturum kullanın.')
          tx.abort()
        } else if (JSON.stringify(read.result.question) !== JSON.stringify(snapshot.question) &&
          !(read.result.question.optionCount === undefined &&
            JSON.stringify(read.result.question) === JSON.stringify(Object.fromEntries(Object.entries(snapshot.question).filter(([key]) => key !== 'optionCount'))))) {
          problem = Error('Bu sorunun metni veya cevap anahtarı değişmiş. Önceki yanıtları korumak için yeni oturum kullanın.')
          tx.abort()
        }
      } else store.put(snapshot, key)
      }
    }
    tx.oncomplete = () => { db.close(); resolve(undefined) }
    tx.onabort = () => { db.close(); reject(problem || tx.error) }
  })
}

export async function loadQuestionSnapshots(sessionId) {
  if (!sessionId) throw Error('Etkin oturum gerekli')
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const rows = []
    const tx = db.transaction('questionSnapshots', 'readonly')
    const cursor = tx.objectStore('questionSnapshots').openCursor()
    cursor.onsuccess = () => {
      if (!cursor.result) return
      if (cursor.result.value.sessionId === sessionId) rows.push(cursor.result.value)
      cursor.result.continue()
    }
    tx.oncomplete = () => { db.close(); resolve(rows) }
    tx.onabort = () => { db.close(); reject(tx.error) }
  })
}

export async function exportLocalBackup() {
  await openDraft()
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['draft', 'class', 'answers', 'questionSnapshots'], 'readonly')
    const active = tx.objectStore('draft').get('startedAt')
    const sessions = tx.objectStore('draft').get('sessions')
    const students = tx.objectStore('class').get('students')
    const answers = tx.objectStore('answers').getAll()
    const questionSnapshots = tx.objectStore('questionSnapshots').getAll()
    tx.oncomplete = () => {
      db.close()
      resolve({ format: 'sinifkart-local-backup', version: 1, activeSessionId: active.result,
        sessions: sessions.result ?? [], students: students.result ?? [], answers: answers.result,
        questionSnapshots: questionSnapshots.result })
    }
    tx.onabort = () => { db.close(); reject(tx.error) }
  })
}

export async function restoreLocalBackup(text) {
  const data = parseBackup(text)
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['draft', 'class', 'answers', 'questionSnapshots'], 'readwrite')
    const classStore = tx.objectStore('class')
    const answerStore = tx.objectStore('answers')
    const snapshotStore = tx.objectStore('questionSnapshots')
    const roster = classStore.get('students')
    const answers = answerStore.getAll()
    const snapshots = snapshotStore.getAll()
    let pending = 3, problem
    const check = () => {
      if (--pending) return
      if ((roster.result ?? []).length || answers.result.length || snapshots.result.length) {
        problem = Error('Bu cihazda sınıf veya yanıt var. Geri yükleme mevcut veriyi değiştirmedi.')
        tx.abort(); return
      }
      const draft = tx.objectStore('draft')
      draft.clear(); classStore.clear(); answerStore.clear(); snapshotStore.clear()
      draft.put(data.activeSessionId, 'startedAt')
      draft.put(data.sessions, 'sessions')
      classStore.put(data.students, 'students')
      for (const row of data.answers) answerStore.put(row, row.key)
      for (const row of data.questionSnapshots) snapshotStore.put(row, `${row.sessionId}|${row.questionId}`)
    }
    roster.onsuccess = check; answers.onsuccess = check; snapshots.onsuccess = check
    tx.oncomplete = () => { db.close(); resolve(data.activeSessionId) }
    tx.onabort = () => { db.close(); reject(problem ?? tx.error) }
  })
}

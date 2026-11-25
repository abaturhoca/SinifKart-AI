// Android receives an opaque per-question token. Student names never leave this device.
export async function androidToken(sessionId, questionId) {
  if (!sessionId || !questionId) throw Error('Etkin oturum ve soru gerekli')
  const bytes = new TextEncoder().encode(`${sessionId}\u0000${questionId}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest)).slice(0, 16).map(x => x.toString(16).padStart(2, '0')).join('')
}

export async function makeAndroidSession(sessionId, questionId, optionCount, students) {
  if (!Number.isInteger(optionCount) || optionCount < 2 || optionCount > 4) throw Error('Soru seçenek sayısı geçersiz')
  if (!Array.isArray(students) || students.length < 1 || students.length > 100) throw Error('Sınıf listesi gerekli')
  const cards = students.map(s => s.cardId)
  if (new Set(cards).size !== cards.length || cards.some(id => !Number.isInteger(id) || id < 1 || id > 100)) throw Error('Sınıf kartları geçersiz')
  const token = await androidToken(sessionId, questionId)
  return { sessionId: token, questionId: token, classSize: cards.length, options: 'ABCD'.slice(0, optionCount), cards }
}

export async function makeAndroidSessionForContext(context, isCurrent, make = makeAndroidSession) {
  const packet = await make(context.sessionId, context.questionId, context.optionCount, context.students)
  if (!isCurrent()) throw Error('Etkin çalışma değişti; Android oturum dosyası oluşturulmadı')
  return packet
}

export async function parseAndroidAnswers(text, sessionId, questionId, optionCount, students) {
  const packet = JSON.parse(text)
  const token = await androidToken(sessionId, questionId)
  if (packet.version !== 1 || packet.sessionId !== token || packet.questionId !== token || !Array.isArray(packet.responses)) throw Error('Yanıt dosyası etkin soruya ait değil')
  const byCard = new Map(students.map(s => [s.cardId, s]))
  const seen = new Set()
  return packet.responses.map(row => {
    const student = byCard.get(row.cardId)
    if (!student || seen.has(row.cardId) || typeof row.answer !== 'string' || !'ABCD'.slice(0, optionCount).includes(row.answer) || row.answer.length !== 1) throw Error('Dosyada tanımsız, yinelenen veya geçersiz kart yanıtı var')
    seen.add(row.cardId)
    return { cardId: row.cardId, number: student.number, name: student.name, answer: row.answer }
  })
}

// File reading and hashing are asynchronous. Confirm the panel still shows the same
// question and roster before any answers are committed to IndexedDB.
export async function importAndroidAnswersForContext(file, context, isCurrent, save) {
  const text = await file.text()
  const rows = await parseAndroidAnswers(text, context.sessionId, context.questionId, context.optionCount, context.students)
  if (!isCurrent()) throw Error('Etkin çalışma değişti; Android yanıtları kaydedilmedi')
  return save(context.sessionId, context.questionId, rows)
}

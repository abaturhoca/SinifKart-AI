function validRoster(rows) {
  if (!Array.isArray(rows) || rows.length > 100) return false
  const numbers = new Set(), cards = new Set()
  for (const row of rows) {
    if (typeof row?.number !== 'string' || !row.number || typeof row.name !== 'string' || !row.name ||
      !Number.isInteger(row.cardId) || row.cardId < 1 || row.cardId > 100 ||
      numbers.has(row.number) || cards.has(row.cardId)) return false
    numbers.add(row.number); cards.add(row.cardId)
  }
  return true
}

export function parseBackup(text) {
  const data = JSON.parse(text)
  if (data?.format !== 'sinifkart-local-backup' || data.version !== 1 ||
    !Array.isArray(data.sessions) || !data.sessions.length ||
    data.sessions.some(id => typeof id !== 'string' || !Number.isFinite(Date.parse(id))) ||
    new Set(data.sessions).size !== data.sessions.length || !data.sessions.includes(data.activeSessionId) ||
    !validRoster(data.students) || !Array.isArray(data.answers) || !Array.isArray(data.questionSnapshots)) throw Error('Yedek biçimi geçersiz')
  const sessions = new Set(data.sessions), snapshots = new Map(), sessionRosters = new Map(), sessionStudentRows = new Map(), keys = new Set()
  for (const snapshot of data.questionSnapshots) {
    if (!sessions.has(snapshot?.sessionId) || typeof snapshot.questionId !== 'string' || !snapshot.questionId ||
      !validRoster(snapshot.students) || !/^[A-D]$/.test(snapshot.question?.correct ?? '') ||
      (snapshot.question.optionCount !== undefined &&
        (!Number.isInteger(snapshot.question.optionCount) || snapshot.question.optionCount < 2 || snapshot.question.optionCount > 4 ||
          !'ABCD'.slice(0, snapshot.question.optionCount).includes(snapshot.question.correct)))) throw Error('Yedekte geçersiz soru kaydı var')
    const key = `${snapshot.sessionId}|${snapshot.questionId}`
    if (snapshots.has(key)) throw Error('Yedekte yinelenen soru var')
    const roster = JSON.stringify(snapshot.students)
    const previous = sessionRosters.get(snapshot.sessionId)
    if (previous && previous !== roster) throw Error('Yedekte aynı oturum için farklı sınıf listeleri var')
    sessionRosters.set(snapshot.sessionId, roster)
    sessionStudentRows.set(snapshot.sessionId, snapshot.students)
    snapshots.set(key, snapshot)
  }
  const activeRoster = sessionRosters.get(data.activeSessionId)
  if (activeRoster && activeRoster !== JSON.stringify(data.students)) throw Error('Yedekte etkin oturum sınıf listesi uyuşmuyor')
  for (const row of data.answers) {
    if (!sessions.has(row?.sessionId) || typeof row.questionId !== 'string' || !row.questionId ||
      !Number.isInteger(row.cardId) || row.cardId < 1 || row.cardId > 100 ||
      typeof row.number !== 'string' || !row.number || !/^[A-D]$/.test(row.answer ?? '')) throw Error('Yedekte geçersiz yanıt var')
    const key = `${row.sessionId}|${row.questionId}|${row.cardId}`
    if (row.key !== key || keys.has(key)) throw Error('Yedekte yinelenen veya bozuk yanıt anahtarı var')
    keys.add(key)
    // Older answers may predate per-question snapshots. Use another snapshot
    // from the same session to validate their student-card identity.
    const roster = snapshots.get(`${row.sessionId}|${row.questionId}`)?.students ?? sessionStudentRows.get(row.sessionId)
    if (roster && !roster.some(s => s.cardId === row.cardId && s.number === row.number)) throw Error('Yanıt öğrenci-kart eşleşmesi bozuk')
    const optionCount = snapshots.get(`${row.sessionId}|${row.questionId}`)?.question.optionCount
    if (optionCount && !'ABCD'.slice(0, optionCount).includes(row.answer)) throw Error('Yedekte yanıt soru seçenekleri dışında')
  }
  return data
}

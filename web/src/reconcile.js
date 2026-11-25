// Produce a teacher-only preview. A rejected scan never becomes a student answer.
export function reconcileScan(students, cards, allowedOptions = 'ABCD') {
  if (!['AB', 'ABC', 'ABCD'].includes(allowedOptions)) throw Error('Etkin soru seçenekleri geçersiz')
  const byId = new Map(students.map(student => [student.cardId, student]))
  const seen = new Map()
  for (const card of cards) seen.set(card.cardId, (seen.get(card.cardId) ?? 0) + 1)
  const responses = []
  const issues = []
  for (const card of cards) {
    const student = byId.get(card.cardId)
    if (!student) {
      issues.push({ cardId: card.cardId, reason: 'Bu kart sınıf listesinde yok' })
    } else if (seen.get(card.cardId) !== 1 || card.status !== 'ok' || !allowedOptions.includes(card.answer ?? '') || card.answer?.length !== 1) {
      issues.push({ cardId: card.cardId, reason: seen.get(card.cardId) !== 1 ? 'Kart birden fazla okundu'
        : card.status !== 'ok' ? 'Kart yönü güvenilir değil' : 'Yanıt bu sorunun seçenekleri dışında' })
    } else {
      responses.push({ number: student.number, name: student.name, cardId: student.cardId, answer: card.answer })
    }
  }
  const accepted = new Set(responses.map(response => response.cardId))
  return { responses, issues, missing: students.filter(student => !accepted.has(student.cardId)) }
}

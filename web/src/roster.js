// Import is validated in memory before the one IndexedDB write. No partial class is saved.
export function parseRoster(text) {
  const delimiter = text.split(/\r?\n/, 1)[0].includes(';') ? ';' : ','
  const lines = []
  let blankLine = false
  let row = [], cell = '', quoted = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++ } else quoted = !quoted
    } else if (!quoted && char === delimiter) {
      row.push(cell.trim()); cell = ''
    } else if (!quoted && (char === '\n' || char === '\r')) {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(cell.trim()); cell = ''
      if (row.some(Boolean)) {
        if (blankLine) throw Error('Sınıf listesinde boş satır var')
        lines.push(row)
      } else if (lines.length) blankLine = true
      row = []
    } else cell += char
  }
  if (quoted) throw Error('Kapanmamış CSV tırnağı')
  if (cell || row.length) {
    row.push(cell.trim())
    if (row.some(Boolean)) {
      if (blankLine) throw Error('Sınıf listesinde boş satır var')
      lines.push(row)
    }
  }
  if (lines.length < 2) throw Error('Başlık ve en az bir öğrenci satırı gerekli')
  const header = lines[0].map(x => x.toLowerCase().replace(/\s+/g, ''))
  const indexes = ['number', 'name', 'cardid'].map(key => header.indexOf(key))
  if (indexes.some(i => i < 0)) throw Error('Başlıklar number,name,cardId olmalı')
  const numbers = new Set(), cards = new Set(), students = []
  for (const [index, values] of lines.slice(1).entries()) {
    if (students.length === 100) throw Error('Bir sınıfta en fazla 100 kart kullanılabilir')
    if (values.length !== header.length) throw Error(`${index + 2}. satırın sütun sayısı hatalı`)
    const [number, name, cardText] = indexes.map(i => values[i])
    if (!number || !name || !/^(?:[1-9]\d?|100)$/.test(cardText)) throw Error(`${index + 2}. satırda zorunlu alan veya kart numarası hatalı`)
    const cardId = Number(cardText)
    if (numbers.has(number) || cards.has(cardId)) throw Error(`${index + 2}. satırda tekrarlanan öğrenci numarası veya kart var`)
    numbers.add(number); cards.add(cardId)
    students.push({ number, name, cardId })
  }
  return students
}

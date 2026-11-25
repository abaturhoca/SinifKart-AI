import assert from 'node:assert/strict'
import { parseRoster } from './src/roster.js'

const valid = parseRoster('number,name,cardId\n1,Ayşe,1\n2,Ayşe,2\n3,"Ali, Can",3\n')
assert.equal(valid.length, 3)
assert.equal(valid[2].name, 'Ali, Can')
assert.equal(parseRoster('cardId;name;number\n1;Deneme;23')[0].number, '23')

const invalid = [
  'number,name,cardId\n1,A,1\n1,B,2',
  'number,name,cardId\n1,A,1\n2,B,1',
  'number,name,cardId\n1,A,101',
  'number,name,cardId\n, A,1',
  'number,name,cardId\n1,A,1\n\n2,B,2',
  'number,name,cardId\n' + Array.from({ length: 101 }, (_, i) => `${i + 1},A,${i + 1}`).join('\n')
]
for (const csv of invalid) assert.throws(() => parseRoster(csv))
console.log('CSV class import: 2 valid formats, 6 invalid cases rejected')

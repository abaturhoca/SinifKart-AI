const cards = cardDictionary.patterns.map((bits,i)=>({id:i+1,bits}))
const variants = new Map()
for (const card of cards) {
  let bits = card.bits
  for (const answer of cardDictionary.answers) {
    if (variants.has(bits)) throw Error("Kart sözlüğünde çakışma")
    variants.set(bits,{id:card.id,answer})
    bits = Array.from({length:16},(_,i)=>bits[(3-i%4)*4+Math.floor(i/4)]).join("")
  }
}
function svg(id) {
  const cells = Array.from(cards[id-1].bits,(bit,i)=>bit==="1"
    ? '<rect x="'+(2+i%4)+'" y="'+(2+Math.floor(i/4))+'" width="1" height="1"/>' : '').join('')
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><rect width="8" height="8" fill="white"/><rect x="1" y="1" width="6" height="6"/><g fill="white">'+cells+'</g></svg>'
}

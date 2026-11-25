export function createRequestGate() {
  let generation = 0
  return {
    begin() { return ++generation },
    invalidate() { generation++ },
    isCurrent(token) { return token === generation }
  }
}

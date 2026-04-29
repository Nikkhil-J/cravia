let currentQuery = ''
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((cb) => cb())
}

export function setExploreQuery(q: string) {
  if (currentQuery !== q) {
    currentQuery = q
    emit()
  }
}

export function getExploreQuery() {
  return currentQuery
}

export function subscribeExploreQuery(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

const RECENTLY_VIEWED_KEY = 'dishcheck_recently_viewed'
const MAX_RECENT = 6

export interface RecentDishEntry {
  id: string
  name: string
  restaurantName: string
  restaurantId: string
  coverImage: string | null
  avgOverall: number
  cuisines: string[]
}

export function getRecentlyViewed(): RecentDishEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY)
    return raw ? (JSON.parse(raw) as RecentDishEntry[]) : []
  } catch {
    return []
  }
}

export function trackRecentlyViewed(entry: RecentDishEntry): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getRecentlyViewed().filter((d) => d.id !== entry.id)
    const updated = [entry, ...existing].slice(0, MAX_RECENT)
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated))
  } catch {
    // localStorage quota exceeded — silently ignore
  }
}

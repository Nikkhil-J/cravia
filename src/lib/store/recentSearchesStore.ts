import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const MAX_RECENT_SEARCHES = 8

interface RecentSearchesState {
  searches: string[]
  addSearch: (query: string) => void
  removeSearch: (query: string) => void
  clearAll: () => void
}

export const useRecentSearchesStore = create<RecentSearchesState>()(
  persist(
    (set, get) => ({
      searches: [],
      addSearch: (query: string) => {
        const trimmed = query.trim()
        if (!trimmed || trimmed.length < 2) return
        const deduped = get().searches.filter(
          (s) => s.toLowerCase() !== trimmed.toLowerCase()
        )
        set({ searches: [trimmed, ...deduped].slice(0, MAX_RECENT_SEARCHES) })
      },
      removeSearch: (query: string) => {
        set({ searches: get().searches.filter((s) => s !== query) })
      },
      clearAll: () => set({ searches: [] }),
    }),
    {
      name: 'cravia-recent-searches',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

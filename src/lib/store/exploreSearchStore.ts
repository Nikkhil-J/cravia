import { create } from 'zustand'

interface ExploreSearchState {
  query: string
  setQuery: (query: string) => void
  clearQuery: () => void
}

export const useExploreSearchStore = create<ExploreSearchState>((set) => ({
  query: '',
  setQuery: (query) => set({ query }),
  clearQuery: () => set({ query: '' }),
}))

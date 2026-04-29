'use client'

import { createContext, useContext, useTransition, type ReactNode } from 'react'

interface SearchPendingContextType {
  isPending: boolean
  startSearchTransition: (fn: () => void) => void
}

const SearchPendingContext = createContext<SearchPendingContextType>({
  isPending: false,
  startSearchTransition: (fn) => fn(),
})

export function SearchPendingProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition()

  return (
    <SearchPendingContext.Provider value={{ isPending, startSearchTransition: startTransition }}>
      {children}
    </SearchPendingContext.Provider>
  )
}

export function useSearchPending() {
  return useContext(SearchPendingContext)
}

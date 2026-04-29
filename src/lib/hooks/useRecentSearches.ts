'use client'

import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'cravia-recent-searches'
const MAX_ITEMS = 8

function readSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((s): s is string => typeof s === 'string').slice(0, MAX_ITEMS)
  } catch {
    return []
  }
}

function writeSearches(searches: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches.slice(0, MAX_ITEMS)))
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>([])

  useEffect(() => {
    setSearches(readSearches())
  }, [])

  const addSearch = useCallback((query: string) => {
    const trimmed = query.trim()
    if (!trimmed || trimmed.length < 2) return
    setSearches((prev) => {
      const deduped = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())
      const next = [trimmed, ...deduped].slice(0, MAX_ITEMS)
      writeSearches(next)
      return next
    })
  }, [])

  const removeSearch = useCallback((query: string) => {
    setSearches((prev) => {
      const next = prev.filter((s) => s !== query)
      writeSearches(next)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setSearches([])
    writeSearches([])
  }, [])

  return { searches, addSearch, removeSearch, clearAll }
}

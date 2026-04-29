'use client'

import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { LoadMoreDishes } from '@/components/features/LoadMoreDishes'
import { LoadMoreRestaurants } from '@/components/features/LoadMoreRestaurants'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { subscribeExploreQuery, getExploreQuery, setExploreQuery } from '@/lib/stores/explore-search'
import { useAuth } from '@/lib/hooks/useAuth'
import { API_ENDPOINTS } from '@/lib/constants/api'
import { GURUGRAM } from '@/lib/constants'
import type { Dish, Restaurant, SortOrder } from '@/lib/types'

interface DishesApiResult {
  items: Dish[]
  hasMore: boolean
  nextCursorId: string | null
}

interface RestaurantsApiResult {
  items: Restaurant[]
  hasMore: boolean
  nextCursorId: string | null
}

export function ExploreSearchResults() {
  const query = useSyncExternalStore(subscribeExploreQuery, getExploreQuery, () => '')
  const searchParams = useSearchParams()
  const { authUser } = useAuth()

  useEffect(() => {
    const urlQ = new URLSearchParams(window.location.search).get('q')?.trim()
    if (urlQ && urlQ.length >= 2) {
      setExploreQuery(urlQ)
      const url = new URL(window.location.href)
      url.searchParams.delete('q')
      window.history.replaceState(null, '', url.pathname + (url.search || ''))
    }
  }, [])

  const tab = searchParams.get('tab') === 'restaurants' ? 'restaurants' : 'dishes'
  const cuisine = searchParams.get('cuisine') ?? null
  const area = searchParams.get('area') ?? null
  const dietary = searchParams.get('dietary') ?? null
  const priceRange = searchParams.get('priceRange') ?? null
  const sortBy = searchParams.get('sortBy') ?? null

  const [dishes, setDishes] = useState<Dish[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [cursorId, setCursorId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    if (!query || query.length < 2) {
      setHasSearched(false)
      setDishes([])
      setRestaurants([])
      return
    }

    let cancelled = false
    setIsLoading(true)

    async function fetchResults() {
      const params = new URLSearchParams()
      params.set('q', query)
      params.set('city', GURUGRAM)
      if (cuisine) params.set('cuisine', cuisine)
      if (area) params.set('area', area)
      if (dietary) params.set('dietary', dietary)
      if (priceRange) params.set('priceRange', priceRange)
      if (sortBy) params.set('sortBy', sortBy)

      const token = authUser ? await authUser.getIdToken() : null
      const endpoint = tab === 'dishes' ? API_ENDPOINTS.DISHES : API_ENDPOINTS.RESTAURANTS
      const headers: Record<string, string> = {}
      if (token) headers.authorization = `Bearer ${token}`

      try {
        const res = await fetch(`${endpoint}?${params.toString()}`, {
          cache: 'no-store',
          headers,
        })
        if (!res.ok || cancelled) return

        if (tab === 'dishes') {
          const result = (await res.json()) as DishesApiResult
          if (cancelled) return
          setDishes(result.items)
          setRestaurants([])
          setHasMore(result.hasMore)
          setCursorId(result.nextCursorId)
        } else {
          const result = (await res.json()) as RestaurantsApiResult
          if (cancelled) return
          setRestaurants(result.items)
          setDishes([])
          setHasMore(result.hasMore)
          setCursorId(result.nextCursorId)
        }
        setHasSearched(true)
      } catch {
        // silently fail — keep previous results
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchResults()
    return () => { cancelled = true }
  }, [query, tab, cuisine, area, dietary, priceRange, sortBy, authUser])

  if (!query || query.length < 2) return null

  if (isLoading && !hasSearched) {
    return (
      <div className="mt-6 flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  const filterPayload = {
    city: GURUGRAM as string | null,
    cuisine,
    area,
    dietary: dietary as 'veg' | 'non-veg' | 'egg' | null,
    priceRange: priceRange as 'under-100' | '100-200' | '200-400' | '400-600' | 'above-600' | null,
    sortBy: sortBy as SortOrder | undefined,
  }

  if (tab === 'dishes') {
    const count = dishes.length
    return (
      <div className="relative mt-6">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-sm">
            <LoadingSpinner />
          </div>
        )}
        <p className="mb-4 text-sm text-text-muted">
          {count}{hasMore ? '+' : ''} result{count !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
        </p>
        {count === 0 ? (
          <EmptyState
            icon="🍽️"
            title={`No dishes found for "${query}"`}
            description="Try a different search term or adjust your filters."
          />
        ) : (
          <LoadMoreDishes
            initialDishes={dishes}
            initialHasMore={hasMore}
            initialCursorId={cursorId}
            filters={filterPayload}
            query={query}
          />
        )}
      </div>
    )
  }

  const count = restaurants.length
  return (
    <div className="relative mt-6">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-sm">
          <LoadingSpinner />
        </div>
      )}
      <p className="mb-4 text-sm text-text-muted">
        {count}{hasMore ? '+' : ''} result{count !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
      </p>
      {count === 0 ? (
        <EmptyState
          icon="🏪"
          title={`No restaurants found for "${query}"`}
          description="Try a different search term or adjust your filters."
        />
      ) : (
        <LoadMoreRestaurants
          initialRestaurants={restaurants}
          initialHasMore={hasMore}
          initialCursorId={cursorId}
          filters={{ city: GURUGRAM, cuisine, area, sortBy }}
          query={query}
        />
      )}
    </div>
  )
}

export function ExploreDefaultContent({ children }: { children: ReactNode }) {
  const query = useSyncExternalStore(subscribeExploreQuery, getExploreQuery, () => '')
  const isSearchActive = query.length >= 2

  if (isSearchActive) return null
  return <>{children}</>
}

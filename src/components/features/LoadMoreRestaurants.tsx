'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { RestaurantCard } from '@/components/features/RestaurantCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Restaurant } from '@/lib/types'
import { useAuth } from '@/lib/hooks/useAuth'
import { API_ENDPOINTS } from '@/lib/constants/api'

interface LoadMoreRestaurantsProps {
  initialRestaurants: Restaurant[]
  initialHasMore: boolean
  initialCursorId?: string | null
  filters: {
    city?: string | null
    cuisine?: string | null
    area?: string | null
  }
  query: string
}

interface RestaurantsApiResult {
  items: Restaurant[]
  hasMore: boolean
  nextCursorId: string | null
}

export function LoadMoreRestaurants({
  initialRestaurants,
  initialHasMore,
  initialCursorId = null,
  filters,
  query,
}: LoadMoreRestaurantsProps) {
  const { authUser } = useAuth()
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [nextCursorId, setNextCursorId] = useState<string | null>(initialCursorId)
  const [isPending, startTransition] = useTransition()

  const sentinelRef = useRef<HTMLDivElement>(null)
  // Always holds the latest loadMore so the observer never captures a stale closure
  const loadMoreRef = useRef<() => void>(() => undefined)
  const isPendingRef = useRef(isPending)
  useEffect(() => {
    isPendingRef.current = isPending
  }, [isPending])

  function loadMore() {
    if (isPendingRef.current) return
    startTransition(async () => {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (filters.city) params.set('city', filters.city)
      if (filters.cuisine) params.set('cuisine', filters.cuisine)
      if (filters.area) params.set('area', filters.area)
      if (nextCursorId) params.set('cursor', nextCursorId)

      const token = authUser ? await authUser.getIdToken() : null
      const res = await fetch(`${API_ENDPOINTS.RESTAURANTS}?${params.toString()}`, {
        cache: 'no-store',
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
      })
      if (!res.ok) return

      const result = (await res.json()) as RestaurantsApiResult
      setRestaurants((prev) => [
        ...prev,
        ...result.items.filter((r) => !prev.some((existing) => existing.id === r.id)),
      ])
      setNextCursorId(result.nextCursorId)
      setHasMore(result.hasMore)
    })
  }

  useEffect(() => {
    loadMoreRef.current = loadMore
  })

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMoreRef.current()
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore])

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {restaurants.map((restaurant, i) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} index={i} />
        ))}
      </div>

      {/* Sentinel — observed by IntersectionObserver to trigger next page */}
      <div ref={sentinelRef} className="h-px" aria-hidden />

      {isPending && (
        <div className="mt-8 flex justify-center text-text-muted">
          <LoadingSpinner size="md" />
        </div>
      )}
    </>
  )
}

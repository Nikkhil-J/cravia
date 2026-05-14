'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { DishCard } from '@/components/features/DishCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Dish, SearchFilters } from '@/lib/types'
import { useAuth } from '@/lib/hooks/useAuth'
import { API_ENDPOINTS } from '@/lib/constants/api'

interface LoadMoreDishesProps {
  initialDishes: Dish[]
  initialHasMore: boolean
  initialCursorId?: string | null
  filters: Partial<SearchFilters> & { city?: string | null }
  query: string
}

interface DishesApiResult {
  items: Dish[]
  hasMore: boolean
  nextCursorId: string | null
}

export function LoadMoreDishes({
  initialDishes,
  initialHasMore,
  initialCursorId = null,
  filters,
  query,
}: LoadMoreDishesProps) {
  const { authUser } = useAuth()
  const [dishes, setDishes] = useState<Dish[]>(initialDishes)
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
      if (filters.dietary) params.set('dietary', filters.dietary)
      if (filters.priceRange) params.set('priceRange', filters.priceRange)
      if (filters.sortBy) params.set('sortBy', filters.sortBy)
      if (nextCursorId) params.set('cursor', nextCursorId)

      const token = authUser ? await authUser.getIdToken() : null
      const res = await fetch(`${API_ENDPOINTS.DISHES}?${params.toString()}`, {
        cache: 'no-store',
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
      })
      if (!res.ok) return

      const result = (await res.json()) as DishesApiResult
      const newItems = result.items.filter((d) => !dishes.some((existing) => existing.id === d.id))
      setDishes((prev) => [...prev, ...newItems])
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dishes.map((dish, i) => (
          <DishCard key={dish.id} dish={dish} index={i} />
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

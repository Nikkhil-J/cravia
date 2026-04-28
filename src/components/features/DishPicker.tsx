'use client'

import { useState, useTransition, useCallback, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { useAuth } from '@/lib/hooks/useAuth'
import { API_ENDPOINTS } from '@/lib/constants/api'
import { ROUTES } from '@/lib/constants/routes'
import { formatRating } from '@/lib/utils/index'
import { getCuisineEmoji } from '@/lib/utils/dish-display'
import type { Dish } from '@/lib/types'
import { getRecentlyViewed, type RecentDishEntry } from '@/lib/utils/recently-viewed'

interface DishPickerProps {
  onSelect: (dish: Dish) => void
}

interface RestaurantContext {
  restaurantId: string
  restaurantName: string
}

function getRestaurantContext(): RestaurantContext | null {
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search)
  const paramId = params.get('restaurantId')
  const paramName = params.get('restaurantName')
  if (paramId && paramName) {
    return { restaurantId: paramId, restaurantName: paramName }
  }

  try {
    const raw = sessionStorage.getItem('reviewSuccess')
    if (raw) {
      const data = JSON.parse(raw) as { restaurantId?: string; restaurantName?: string }
      if (data.restaurantId && data.restaurantName) {
        return { restaurantId: data.restaurantId, restaurantName: data.restaurantName }
      }
    }
  } catch { /* ignore parse errors */ }

  try {
    const ref = document.referrer
    if (ref) {
      const refUrl = new URL(ref)
      const match = refUrl.pathname.match(/^\/dish\/([^/]+)/)
      if (match) {
        return null
      }
    }
  } catch { /* ignore URL parse errors */ }

  return null
}

export function DishPicker({ onSelect }: DishPickerProps) {
  const { user } = useAuth()
  const city = user?.city ?? null

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Dish[]>([])
  const [popularDishes, setPopularDishes] = useState<Dish[]>([])
  const [needsReviewDishes, setNeedsReviewDishes] = useState<Dish[]>([])
  const [recentDishes, setRecentDishes] = useState<RecentDishEntry[]>([])
  const [restaurantDishes, setRestaurantDishes] = useState<Dish[]>([])
  const [isPending, startTransition] = useTransition()
  const debouncedQuery = useDebounce(query, 350)

  const restaurantContext = useMemo(() => getRestaurantContext(), [])

  useEffect(() => {
    setRecentDishes(getRecentlyViewed())

    startTransition(async () => {
      const res = await fetch(`${API_ENDPOINTS.DISHES}?sortBy=highest-rated`)
      if (!res.ok) return
      const data = await res.json()
      const items: Dish[] = data.items ?? []
      setPopularDishes(items.slice(0, 6))
      setNeedsReviewDishes(items.filter((d) => d.reviewCount <= 2).slice(0, 4))
    })
  }, [])

  useEffect(() => {
    if (!restaurantContext) return
    startTransition(async () => {
      const res = await fetch(API_ENDPOINTS.restaurantDishes(encodeURIComponent(restaurantContext.restaurantId)))
      if (!res.ok) return
      const data = await res.json()
      setRestaurantDishes(data.items ?? data ?? [])
    })
  }, [restaurantContext])

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([])
      return
    }
    startTransition(async () => {
      const res = await fetch(`${API_ENDPOINTS.DISHES}?q=${encodeURIComponent(debouncedQuery)}`)
      if (!res.ok) return
      const data = await res.json()
      setResults(data.items ?? [])
    })
  }, [debouncedQuery])

  const handleSelect = useCallback((dish: Dish) => {
    onSelect(dish)
  }, [onSelect])

  const displayList = query.length >= 2 ? results : popularDishes
  const showLabel = query.length < 2

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <span className="text-5xl">🍽️</span>
        <h1 className="mt-4 font-display text-xl font-bold text-heading sm:text-2xl">
          Which dish are you reviewing?
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {restaurantContext
            ? `Search for a dish at ${restaurantContext.restaurantName}`
            : 'Search for the dish you want to review'}
        </p>
      </div>

      {restaurantContext && restaurantDishes.length > 0 && (
        <>
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-text-muted">
            More dishes from {restaurantContext.restaurantName}
          </p>
          <div className="mt-3 space-y-2">
            {restaurantDishes.map((dish) => (
              <DishRow key={dish.id} dish={dish} onSelect={handleSelect} />
            ))}
          </div>
        </>
      )}

      <div className="mt-6 relative">
        <Search className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-muted" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search dishes... e.g. Butter Chicken, Margherita Pizza"
          autoFocus
          className="h-auto w-full rounded-pill border border-border bg-card/50 py-3 pl-10 pr-4 text-sm font-body placeholder:text-text-muted focus-visible:border-primary focus-visible:ring-0"
        />
        {isPending && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {query.length >= 2 && results.length === 0 && !isPending && (
        <p className="mt-6 text-center text-sm text-text-muted">
          No dishes found for &ldquo;{query}&rdquo;. Try a different search.
        </p>
      )}

      {showLabel && recentDishes.length > 0 && (
        <>
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-text-muted">
            Recently viewed
          </p>
          <div className="mt-3 space-y-2">
            {recentDishes.map((dish) => (
              <button
                key={dish.id}
                type="button"
                onClick={() => handleSelect(dish as unknown as Dish)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/30 hover:shadow-sm"
              >
                {dish.coverImage ? (
                  <Image
                    src={dish.coverImage}
                    alt={dish.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-2xl">
                    {getCuisineEmoji(dish.cuisines?.[0])}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-semibold text-heading line-clamp-1">{dish.name}</p>
                  <p className="text-xs text-text-muted line-clamp-1">{dish.restaurantName}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-brand-gold">
                  ★ {formatRating(dish.avgOverall)}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {showLabel && displayList.length > 0 && (
        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-text-muted">
          Popular dishes{city ? ` in ${city}` : ''}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {displayList.map((dish) => (
          <DishRow key={dish.id} dish={dish} onSelect={handleSelect} />
        ))}
      </div>

      {showLabel && needsReviewDishes.length > 0 && (
        <>
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-text-muted">
            Needs your review
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Few reviews — your feedback helps others decide
          </p>
          <div className="mt-3 space-y-2">
            {needsReviewDishes.map((dish) => (
              <DishRow key={dish.id} dish={dish} onSelect={handleSelect} />
            ))}
          </div>
        </>
      )}

      <Link
        href={`${ROUTES.EXPLORE}?tab=dishes`}
        className="mt-6 block text-center text-sm text-text-muted underline-offset-2 hover:underline"
      >
        Or browse all dishes
      </Link>
    </div>
  )
}

function DishRow({ dish, onSelect }: { dish: Dish; onSelect: (dish: Dish) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(dish)}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/30 hover:shadow-sm"
    >
      {dish.coverImage ? (
        <Image
          src={dish.coverImage}
          alt={dish.name}
          width={48}
          height={48}
          className="h-12 w-12 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-2xl">
          {getCuisineEmoji(dish.cuisines?.[0])}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-semibold text-heading line-clamp-1">{dish.name}</p>
        <p className="text-xs text-text-muted line-clamp-1">{dish.restaurantName}</p>
      </div>
      <div className="flex items-center gap-1 text-xs font-semibold text-brand-gold">
        ★ {formatRating(dish.avgOverall)}
      </div>
    </button>
  )
}

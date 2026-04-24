'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRestaurantAnalytics, ForbiddenError } from '@/lib/hooks/useRestaurantAnalytics'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatRating } from '@/lib/utils/index'
import { ROUTES } from '@/lib/constants/routes'
import { CLIENT_ERRORS } from '@/lib/constants/errors'

export default function RestaurantDashboardPage() {
  const params = useParams<{ restaurantId: string }>()
  const router = useRouter()

  const { data: analytics, isLoading, error } = useRestaurantAnalytics(params.restaurantId)

  useEffect(() => {
    if (error instanceof ForbiddenError) {
      router.replace(ROUTES.claimRestaurant(params.restaurantId))
    }
  }, [error, router, params.restaurantId])

  if (isLoading) {
    return <div className="flex justify-center py-20"><LoadingSpinner /></div>
  }

  if (error || !analytics) {
    if (error instanceof ForbiddenError) return null
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center">
        <p className="text-lg font-semibold text-heading">{CLIENT_ERRORS.FAILED_TO_LOAD_ANALYTICS}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-heading sm:text-2xl">{analytics.restaurantName}</h1>
          <p className="mt-0.5 text-sm text-text-muted">Restaurant analytics dashboard</p>
        </div>
        <Link
          href={ROUTES.restaurantDashboardDishes(params.restaurantId)}
          className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark sm:w-auto"
        >
          Per-dish breakdown
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Reviews (30d)" value={String(analytics.totalReviews30d)} />
        <StatCard label="Avg rating" value={formatRating(analytics.avgOverallRating)} />
        <StatCard label="Total dishes" value={String(analytics.dishes.length)} />
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-display text-lg font-bold text-heading">Top performing</h2>
          <p className="text-xs text-text-muted">Highest rated dishes</p>
          <div className="mt-4 space-y-3">
            {analytics.topDishes.length === 0 ? (
              <p className="text-sm text-text-muted">No reviewed dishes yet</p>
            ) : (
              analytics.topDishes.map((dish, i) => (
                <DishRankRow key={dish.dishId} rank={i + 1} dish={dish} />
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg font-bold text-heading">Needs attention</h2>
          <p className="text-xs text-text-muted">Lowest rated dishes</p>
          <div className="mt-4 space-y-3">
            {analytics.bottomDishes.length === 0 ? (
              <p className="text-sm text-text-muted">Not enough data</p>
            ) : (
              analytics.bottomDishes.map((dish, i) => (
                <DishRankRow key={dish.dishId} rank={analytics.dishes.length - i} dish={dish} variant="warn" />
              ))
            )}
          </div>
        </div>
      </div>

      <p className="mt-10 text-xs text-text-muted">
        Last updated: {new Date(analytics.computedAt).toLocaleString()}
      </p>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-heading">{value}</p>
    </div>
  )
}

interface DishRankRowProps {
  rank: number
  dish: { dishId: string; dishName: string; avgOverall: number; reviewCount: number }
  variant?: 'default' | 'warn'
}

function DishRankRow({ rank, dish, variant = 'default' }: DishRankRowProps) {
  const ratingColor = variant === 'warn' ? 'text-brand-gold' : 'text-primary-dark'

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg-cream text-xs font-bold text-text-secondary">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-heading">{dish.dishName}</p>
        <p className="text-xs text-text-muted">{dish.reviewCount} reviews</p>
      </div>
      <span className={`text-sm font-bold ${ratingColor}`}>
        {formatRating(dish.avgOverall)}
      </span>
    </div>
  )
}

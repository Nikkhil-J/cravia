'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRestaurantAnalytics, ForbiddenError } from '@/lib/hooks/useRestaurantAnalytics'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { DishSentimentCard } from '@/components/features/DishSentimentCard'
import { ROUTES } from '@/lib/constants/routes'
import { CLIENT_ERRORS } from '@/lib/constants/errors'

export default function RestaurantDishesPage() {
  const params = useParams<{ restaurantId: string }>()
  const router = useRouter()

  const { data: analytics, isLoading, error } = useRestaurantAnalytics(params.restaurantId)
  const [sortBy, setSortBy] = useState<'rating' | 'reviews'>('rating')

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

  const sorted = [...analytics.dishes].sort((a, b) => {
    if (sortBy === 'reviews') return b.reviewCount - a.reviewCount
    return b.avgOverall - a.avgOverall
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={ROUTES.restaurantDashboard(params.restaurantId)}
            className="text-xs font-medium text-primary hover:underline"
          >
            &larr; Back to overview
          </Link>
          <h1 className="mt-1 font-display text-xl font-bold text-heading sm:text-2xl">
            Per-dish sentiment
          </h1>
          <p className="mt-0.5 text-sm text-text-muted">{analytics.restaurantName}</p>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'rating' | 'reviews')}
          className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-text-secondary sm:w-auto"
        >
          <option value="rating">Sort by rating</option>
          <option value="reviews">Sort by review count</option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon="📊" title="No dishes yet" description="Once your restaurant has dishes with reviews, sentiment data will appear here." />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {sorted.map((dish) => (
            <DishSentimentCard
              key={dish.dishId}
              dish={dish}
              restaurantId={params.restaurantId}
            />
          ))}
        </div>
      )}

      <p className="mt-10 text-xs text-text-muted">
        Last updated: {new Date(analytics.computedAt).toLocaleString()}
      </p>
    </div>
  )
}

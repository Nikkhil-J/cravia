'use client'

import { useState, useTransition } from 'react'
import { ReviewCardV2 } from '@/components/features/ReviewCardV2'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/useAuth'
import type { Review } from '@/lib/types'
import { API_ENDPOINTS } from '@/lib/constants/api'

interface LoadMoreReviewsProps {
  initialReviews: Review[]
  initialHasMore: boolean
  initialCursorId?: string | null
  dishId: string
  currentUserId?: string
  pinnedReview?: Review | null
}

interface DishReviewsApiResult {
  items: Review[]
  hasMore: boolean
  nextCursorId: string | null
}

function hybridScore(review: Review): number {
  const recencyDays = (Date.now() - new Date(review.createdAt).getTime()) / 86_400_000
  const recencyBoost = Math.max(0, 1 - recencyDays / 30)
  return Math.log(1 + review.helpfulVotes) * 3 + recencyBoost
}

export function LoadMoreReviews({
  initialReviews,
  initialHasMore,
  initialCursorId = null,
  dishId,
  currentUserId: externalUserId,
  pinnedReview,
}: LoadMoreReviewsProps) {
  const { user } = useAuth()
  const currentUserId = externalUserId ?? user?.id
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [nextCursorId, setNextCursorId] = useState<string | null>(initialCursorId)
  const [isPending, startTransition] = useTransition()

  async function loadMore() {
    startTransition(async () => {
      const params = new URLSearchParams()
      if (nextCursorId) params.set('cursor', nextCursorId)
      const qs = params.toString()
      const res = await fetch(`${API_ENDPOINTS.dishReviews(encodeURIComponent(dishId))}${qs ? `?${qs}` : ''}`, { cache: 'no-store' })
      if (!res.ok) return

      const result = (await res.json()) as DishReviewsApiResult
      const newItems = result.items.filter((r) => !reviews.some((existing) => existing.id === r.id))
      setReviews((prev) => [...prev, ...newItems].sort((a, b) => hybridScore(b) - hybridScore(a)))
      setNextCursorId(result.nextCursorId)
      setHasMore(result.hasMore)
    })
  }

  return (
    <>
      {pinnedReview && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold text-brand-gold">Most helpful review</p>
          <ReviewCardV2
            review={pinnedReview}
            variant="dish"
            currentUserId={currentUserId}
          />
        </div>
      )}
      <div className="mt-5 flex flex-col gap-4">
        {reviews.map((review) => (
          <ReviewCardV2 key={review.id} review={review} variant="dish" currentUserId={currentUserId} />
        ))}
      </div>
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isPending}
            className="h-auto gap-2 rounded-pill border-2 border-border px-6 py-3 text-sm font-semibold text-text-primary transition-all hover:border-primary hover:bg-transparent hover:text-primary"
          >
            {isPending ? <LoadingSpinner size="sm" /> : 'Load more reviews'}
          </Button>
        </div>
      )}
    </>
  )
}

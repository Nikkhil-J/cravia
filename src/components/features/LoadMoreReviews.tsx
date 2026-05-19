'use client'

import { useState, useTransition } from 'react'
import { ReviewCardV2 } from '@/components/features/ReviewCardV2'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/useAuth'
import type { Review } from '@/lib/types'
import { API_ENDPOINTS } from '@/lib/constants/api'
import { cn } from '@/lib/utils'

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
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [isPending, startTransition] = useTransition()
  const verifiedReviewCount = reviews.filter((review) => review.isVerified).length + (pinnedReview?.isVerified ? 1 : 0)
  const visiblePinnedReview = !verifiedOnly || pinnedReview?.isVerified ? pinnedReview : null
  const visibleReviews = verifiedOnly ? reviews.filter((review) => review.isVerified) : reviews
  const visibleReviewCount = visibleReviews.length + (visiblePinnedReview ? 1 : 0)

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
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          aria-pressed={verifiedOnly}
          onClick={() => setVerifiedOnly((current) => !current)}
          className={cn(
            'h-9 min-h-9 gap-1.5 rounded-pill px-3 text-xs font-semibold',
            verifiedOnly
              ? 'border-success bg-success/10 text-success hover:text-success'
              : 'border-border bg-card text-text-secondary hover:border-success/40 hover:bg-success/5 hover:text-success',
          )}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Verified visits
          {verifiedReviewCount > 0 && <span>({verifiedReviewCount})</span>}
        </Button>
        {verifiedOnly && (
          <span className="text-xs text-text-muted">
            Showing reviews backed by a bill upload
          </span>
        )}
      </div>

      {visiblePinnedReview && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold text-brand-gold">Most helpful review</p>
          <ReviewCardV2
            review={visiblePinnedReview}
            variant="dish"
            currentUserId={currentUserId}
          />
        </div>
      )}
      {visibleReviewCount === 0 ? (
        <div className="mt-5 rounded-xl border border-border bg-card px-4 py-8 text-center">
          <p className="font-display font-semibold text-heading">No verified visits yet</p>
          <p className="mt-1 text-sm text-text-muted">
            Reviews with uploaded bills will appear here.
          </p>
        </div>
      ) : visibleReviews.length > 0 ? (
        <div className="mt-5 flex flex-col gap-4">
          {visibleReviews.map((review, i) => (
            <ReviewCardV2 key={review.id} review={review} variant="dish" currentUserId={currentUserId} index={i} />
          ))}
        </div>
      ) : null}
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

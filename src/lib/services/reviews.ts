import { cache } from 'react'
import { reviewRepository } from '@/lib/repositories'
import type { Review } from '@/lib/types'

export const getReview = cache(async (reviewId: string) => {
  return reviewRepository.getById(reviewId)
})

export function getReviewCount() {
  return reviewRepository.getCount()
}

export function getRecentReviews(limit: number = 4) {
  return reviewRepository.getRecent(limit)
}

/**
 * Returns recent reviews that have a photo and text (approved).
 * Used on the landing page "Recent reviews" section.
 */
export async function getRecentFeaturedReviews(limit: number = 4): Promise<Review[]> {
  const reviews = await reviewRepository.getRecent(limit * 3)
  return reviews
    .filter((r) => r.isApproved && r.photoUrl && r.text)
    .slice(0, limit)
}

export function getReviewsByUser(userId: string, cursor?: string) {
  return reviewRepository.getMany({ userId, cursor }).then((result) => ({
    items: result.data,
    lastDoc: result.nextCursor ?? null,
    hasMore: result.hasMore,
  }))
}


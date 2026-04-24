import { cache } from 'react'
import { reviewRepository } from '@/lib/repositories'

export const getReview = cache(async (reviewId: string) => {
  return reviewRepository.getById(reviewId)
})

export function getReviewCount() {
  return reviewRepository.getCount()
}

export function getReviewsByUser(userId: string, cursor?: string) {
  return reviewRepository.getMany({ userId, cursor }).then((result) => ({
    items: result.data,
    lastDoc: result.nextCursor ?? null,
    hasMore: result.hasMore,
  }))
}


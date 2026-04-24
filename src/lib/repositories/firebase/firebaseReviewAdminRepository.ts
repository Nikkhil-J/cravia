import 'server-only'

import { FirebaseReviewRepository } from './firebaseReviewRepository'
import {
  createReview as createReviewAdmin,
  updateReview as updateReviewAdmin,
  deleteReview as deleteReviewAdmin,
  voteHelpful as voteHelpfulAdmin,
  flagReview as flagReviewAdmin,
} from '@/lib/firebase/reviews-admin'
import { mapReview } from './mappers'
import type { Review, ReviewFormData, User } from '@/lib/types'

/**
 * Review repository that uses the Admin SDK for all write operations
 * (bypassing Firestore security rules). Read operations are inherited
 * from FirebaseReviewRepository and use the client SDK since
 * reads are allowed by rules.
 */
export class FirebaseReviewAdminRepository extends FirebaseReviewRepository {
  override async create(data: ReviewFormData, user: User, photoUrl: string): Promise<Review | null> {
    const review = await createReviewAdmin(data, user, photoUrl)
    return review ? mapReview(review) : null
  }

  override async update(
    reviewId: string,
    callerId: string,
    updates: Partial<Pick<Review, 'tasteRating' | 'portionRating' | 'valueRating' | 'tags' | 'text'>>
  ): Promise<Review | null> {
    const review = await updateReviewAdmin(reviewId, callerId, updates)
    return review ? mapReview(review) : null
  }

  override delete(reviewId: string, dishId: string, callerId: string, isAdmin?: boolean): Promise<boolean> {
    return deleteReviewAdmin(reviewId, dishId, callerId, isAdmin)
  }

  override voteHelpful(reviewId: string, voterId: string): Promise<boolean> {
    return voteHelpfulAdmin(reviewId, voterId)
  }

  override flag(reviewId: string, userId: string): Promise<'ok' | 'already_flagged' | null> {
    return flagReviewAdmin(reviewId, userId)
  }
}

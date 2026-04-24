import 'server-only'

import type { CouponRepository } from './couponRepository'
import type { PointsRepository } from './pointsRepository'
import type { ReviewRepository } from './reviewRepository'
import { FirebaseCouponRepository } from './firebase/firebaseCouponRepository'
import { FirebasePointsRepository } from './firebase/firebasePointsRepository'
import { FirebaseReviewAdminRepository } from './firebase/firebaseReviewAdminRepository'

export const pointsRepository: PointsRepository = new FirebasePointsRepository()
export const couponRepository: CouponRepository = new FirebaseCouponRepository()
export const reviewRepository: ReviewRepository = new FirebaseReviewAdminRepository()

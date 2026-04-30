// ── DishPoints transaction types ─────────────────────────

export type PointTransactionType =
  | 'REVIEW_BASIC'
  | 'REVIEW_WITH_PHOTO'
  | 'REVIEW_WITH_BILL'
  | 'REVIEW_FULL'
  | 'STREAK_BONUS'
  | 'REDEMPTION'
  | 'ADMIN_ADJUSTMENT'

export interface DishPointTransaction {
  id: string
  userId: string
  type: PointTransactionType
  /** Positive for earning, negative for redemption */
  points: number
  /** reviewId for earning, couponClaimId for redemption */
  refId: string | null
  description: string
  createdAt: string
}

export interface PointsBalance {
  balance: number
  totalEarned: number
  totalRedeemed: number
}

export interface StreakState {
  currentStreak: number
  lastReviewDate: string | null
  streakBonusEligible: boolean
}

// ── Coupon types (for P2-T3) ────────────────────────────

export interface Coupon {
  id: string
  title: string
  restaurantId: string
  restaurantName: string
  discountValue: number
  discountType: 'flat' | 'percent'
  pointsCost: number
  totalStock: number
  claimedCount: number
  isActive: boolean
  expiresAt: string | null
  createdAt: string
}

export interface CouponClaim {
  id: string
  userId: string
  couponId: string
  couponTitle: string
  code: string
  isRedeemed: boolean
  claimedAt: string
  expiresAt: string | null
}

// ── Points constants ────────────────────────────────────

/** Tiered review points — not additive; each tier supersedes the previous. */
export const POINTS_BASIC_REVIEW = 10    // no photo, no bill
export const POINTS_WITH_PHOTO   = 20    // dish photo uploaded
export const POINTS_WITH_BILL    = 25    // bill uploaded (maximum tier)
export const POINTS_MAX_PER_REVIEW = 25

/** Keep legacy aliases so older transaction type names resolve correctly. */
export const POINTS_REVIEW_BASIC = POINTS_BASIC_REVIEW
export const POINTS_REVIEW_FULL  = POINTS_WITH_BILL

export const POINTS_STREAK_MULTIPLIER = 2
export const STREAK_DAYS_REQUIRED = 7
export const REVIEW_FULL_MIN_TEXT_LENGTH = 30
export const DEFAULT_COUPON_POINTS_COST = 500

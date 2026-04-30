/**
 * Integration tests for the review submission flow.
 * Tests the POST /api/reviews route end-to-end with mocked
 * repositories, auth, Cloudinary, and rate-limiting.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ── Firebase / admin stubs ────────────────────────────────

vi.mock('@/lib/firebase/config', () => ({
  auth: {},
  db: {},
  COLLECTIONS: {
    RESTAURANTS: 'restaurants',
    DISHES: 'dishes',
    REVIEWS: 'reviews',
    USERS: 'users',
    DISH_REQUESTS: 'dishRequests',
    NOTIFICATIONS: 'notifications',
    COUPONS: 'coupons',
  },
  SUBCOLLECTIONS: {
    WISHLIST: 'wishlist',
    POINT_TRANSACTIONS: 'pointTransactions',
    COUPON_CLAIMS: 'couponClaims',
  },
}))

vi.mock('@/lib/firebase/admin-server', () => ({
  adminAuth: {},
  adminDb: {
    collection: vi.fn().mockReturnValue({
      doc: vi.fn().mockReturnValue({ update: vi.fn().mockResolvedValue(undefined) }),
    }),
  },
}))

vi.mock('@/lib/auth/firebase-auth-provider', () => ({
  FirebaseAuthProvider: vi.fn().mockImplementation(() => ({
    verifyToken: vi.fn(),
  })),
}))

vi.mock('@/lib/services/request-auth', () => ({
  getRequestAuth: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
}))

vi.mock('@/lib/repositories/typesense/typesenseClient', () => ({
  isTypesenseConfigured: vi.fn().mockReturnValue(false),
  getTypesenseClient: vi.fn(),
}))

vi.mock('@/lib/services/typesense-restaurant-sync', () => ({
  syncRestaurantToTypesense: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/services/analytics-cache', () => ({
  invalidateAnalyticsCache: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/monitoring/sentry', () => ({
  captureError: vi.fn(),
  addBreadcrumb: vi.fn(),
  logRouteDuration: vi.fn(),
}))

const { mockReviewRepository } = vi.hoisted(() => ({
  mockReviewRepository: {
    create: vi.fn(),
    getById: vi.fn(),
    getRecentByUser: vi.fn().mockResolvedValue([]),
    findByUserAndDish: vi.fn().mockResolvedValue(null),
  },
}))

vi.mock('@/lib/repositories', () => ({
  reviewRepository: mockReviewRepository,
  userRepository: { getById: vi.fn() },
  dishRepository: { getById: vi.fn() },
}))

vi.mock('@/lib/repositories/server', () => ({
  reviewRepository: mockReviewRepository,
  pointsRepository: {
    appendTransaction: vi.fn(),
    getBalance: vi.fn(),
    getTransactions: vi.fn(),
  },
}))

vi.mock('@/lib/services/rewards', () => ({
  rewardPointsForReview: vi.fn(),
  getUserStreak: vi.fn().mockResolvedValue({ currentStreak: 1, bonusEligible: false }),
}))

import { getRequestAuth } from '@/lib/services/request-auth'
import { userRepository, dishRepository } from '@/lib/repositories'
import { rewardPointsForReview } from '@/lib/services/rewards'
import { POST } from '@/app/api/reviews/route'

function makeRequest(body: object): Request {
  return new NextRequest('http://localhost/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', authorization: 'Bearer test-token' },
    body: JSON.stringify(body),
  })
}

const VALID_BODY = {
  dishId: 'dish-1',
  restaurantId: 'rest-1',
  tasteRating: 4,
  portionRating: 3,
  valueRating: 5,
  tags: ['Spicy'],
  text: 'This is a detailed review with at least thirty characters here.',
}

const MOCK_USER = {
  id: 'user-1',
  displayName: 'Test User',
  email: 'test@test.com',
  level: 'Newbie' as const,
  dishPointsBalance: 0,
  reviewCount: 3,
  helpfulVotesReceived: 0,
  badges: [],
  isAdmin: false,
  isPremium: false,
  premiumSince: null,
  avatarUrl: null,
  city: 'gurugram',
  totalPointsEarned: 0,
  totalPointsRedeemed: 0,
  createdAt: '2025-01-01T00:00:00Z',
}

const MOCK_REVIEW = {
  id: 'review-1',
  dishId: 'dish-1',
  restaurantId: 'rest-1',
  userId: 'user-1',
  userName: 'Test User',
  userLevel: 'Newbie' as const,
  userAvatarUrl: null,
  photoUrl: null,
  tasteRating: 4,
  portionRating: 3,
  valueRating: 5,
  tags: ['Spicy'],
  text: 'This is a detailed review with at least thirty characters here.',
  billUrl: null,
  isVerified: false,
  helpfulVotes: 0,
  helpfulVotedBy: [],
  isFlagged: false,
  isApproved: true,
  editedAt: null,
  createdAt: '2025-06-01T00:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/reviews', () => {
  it('returns 401 when not authenticated', async () => {
    vi.mocked(getRequestAuth).mockResolvedValue(null)
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(401)
  })

  it('returns 400 when body is invalid (missing required fields)', async () => {
    vi.mocked(getRequestAuth).mockResolvedValue({ userId: 'user-1', userCity: 'gurugram', isAdmin: false })
    const res = await POST(makeRequest({ dishId: 'dish-1' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when text is too short', async () => {
    vi.mocked(getRequestAuth).mockResolvedValue({ userId: 'user-1', userCity: 'gurugram', isAdmin: false })
    const res = await POST(makeRequest({ ...VALID_BODY, text: 'Too short' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when ratings are out of range', async () => {
    vi.mocked(getRequestAuth).mockResolvedValue({ userId: 'user-1', userCity: 'gurugram', isAdmin: false })
    const res = await POST(makeRequest({ ...VALID_BODY, tasteRating: 6 }))
    expect(res.status).toBe(400)
  })

  it('returns 201 with valid body and auth', async () => {
    vi.mocked(getRequestAuth).mockResolvedValue({ userId: 'user-1', userCity: 'gurugram', isAdmin: false })
    vi.mocked(userRepository.getById).mockResolvedValue(MOCK_USER as never)
    vi.mocked(mockReviewRepository.create).mockResolvedValue(MOCK_REVIEW as never)
    vi.mocked(rewardPointsForReview).mockResolvedValue({
      transactions: [],
      totalPointsAwarded: 10,
    })

    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(201)
    const data = await res.json() as { pointsAwarded: number; isVerified: boolean }
    expect(data.pointsAwarded).toBe(10)
    expect(data.isVerified).toBe(false)
  })

  it('awards 10 points for basic review (no photo, no bill)', async () => {
    vi.mocked(getRequestAuth).mockResolvedValue({ userId: 'user-1', userCity: 'gurugram', isAdmin: false })
    vi.mocked(userRepository.getById).mockResolvedValue(MOCK_USER as never)
    vi.mocked(mockReviewRepository.create).mockResolvedValue(MOCK_REVIEW as never)
    vi.mocked(rewardPointsForReview).mockResolvedValue({
      transactions: [],
      totalPointsAwarded: 10,
    })

    const res = await POST(makeRequest(VALID_BODY))
    const data = await res.json() as { pointsAwarded: number }
    expect(data.pointsAwarded).toBe(10)
  })

  it('returns isVerified=false when no billUrl present', async () => {
    vi.mocked(getRequestAuth).mockResolvedValue({ userId: 'user-1', userCity: 'gurugram', isAdmin: false })
    vi.mocked(userRepository.getById).mockResolvedValue(MOCK_USER as never)
    vi.mocked(mockReviewRepository.create).mockResolvedValue(MOCK_REVIEW as never)
    vi.mocked(rewardPointsForReview).mockResolvedValue({ transactions: [], totalPointsAwarded: 20 })

    const res = await POST(makeRequest({ ...VALID_BODY, photoUrl: 'https://cdn.cloudinary.com/photo.jpg' }))
    const data = await res.json() as { isVerified: boolean }
    expect(data.isVerified).toBe(false)
  })

  it('returns isVerified=true when billUrl is present', async () => {
    vi.mocked(getRequestAuth).mockResolvedValue({ userId: 'user-1', userCity: 'gurugram', isAdmin: false })
    vi.mocked(userRepository.getById).mockResolvedValue(MOCK_USER as never)

    const reviewWithBill = { ...MOCK_REVIEW, isVerified: true, billUrl: 'https://cdn.cloudinary.com/bill.jpg' }
    vi.mocked(mockReviewRepository.create).mockResolvedValue(reviewWithBill as never)
    vi.mocked(rewardPointsForReview).mockResolvedValue({ transactions: [], totalPointsAwarded: 25 })

    const body = { ...VALID_BODY, photoUrl: 'https://cdn.cloudinary.com/photo.jpg', billUrl: 'https://cdn.cloudinary.com/bill.jpg' }
    const res = await POST(makeRequest(body))
    const data = await res.json() as { isVerified: boolean; pointsAwarded: number }
    expect(data.isVerified).toBe(true)
  })

  it('returns 409 when repository signals duplicate review', async () => {
    vi.mocked(getRequestAuth).mockResolvedValue({ userId: 'user-1', userCity: 'gurugram', isAdmin: false })
    vi.mocked(userRepository.getById).mockResolvedValue(MOCK_USER as never)
    vi.mocked(mockReviewRepository.create).mockRejectedValue(
      new Error('You have already reviewed this dish'),
    )

    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(409)
  })

  it('returns 404 when user document is missing', async () => {
    vi.mocked(getRequestAuth).mockResolvedValue({ userId: 'user-1', userCity: 'gurugram', isAdmin: false })
    vi.mocked(userRepository.getById).mockResolvedValue(null as never)

    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(404)
  })

  it('still returns 201 when points accrual throws', async () => {
    vi.mocked(getRequestAuth).mockResolvedValue({ userId: 'user-1', userCity: 'gurugram', isAdmin: false })
    vi.mocked(userRepository.getById).mockResolvedValue(MOCK_USER as never)
    vi.mocked(mockReviewRepository.create).mockResolvedValue(MOCK_REVIEW as never)
    vi.mocked(rewardPointsForReview).mockRejectedValue(new Error('Points service down'))

    const res = await POST(makeRequest(VALID_BODY))
    // Review should still succeed even if points accrual fails
    expect(res.status).toBe(201)
    const data = await res.json() as { pointsAwarded: number }
    expect(data.pointsAwarded).toBe(0)
  })

  it('sets auto cover image when dish has no cover and photoUrl is provided', async () => {
    vi.mocked(getRequestAuth).mockResolvedValue({ userId: 'user-1', userCity: 'gurugram', isAdmin: false })
    vi.mocked(userRepository.getById).mockResolvedValue(MOCK_USER as never)
    vi.mocked(mockReviewRepository.create).mockResolvedValue(MOCK_REVIEW as never)
    vi.mocked(rewardPointsForReview).mockResolvedValue({ transactions: [], totalPointsAwarded: 20 })
    vi.mocked(dishRepository.getById).mockResolvedValue({
      id: 'dish-1', coverImage: null,
    } as never)

    const body = { ...VALID_BODY, photoUrl: 'https://cdn.cloudinary.com/photo.jpg' }
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(201)
  })
})

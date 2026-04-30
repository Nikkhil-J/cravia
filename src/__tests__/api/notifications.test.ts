import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockDocRef, mockDoc, mockCollection } = vi.hoisted(() => {
  const mockDocRef = { get: vi.fn(), update: vi.fn() }
  const mockDoc = vi.fn(() => mockDocRef)
  const mockCollection = vi.fn(() => ({ doc: mockDoc }))
  return { mockDocRef, mockDoc, mockCollection }
})

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
  adminDb: { collection: mockCollection },
}))

vi.mock('@/lib/auth/firebase-auth-provider', () => ({
  FirebaseAuthProvider: vi.fn().mockImplementation(() => ({
    verifyToken: vi.fn(),
  })),
}))

vi.mock('@/lib/services/request-auth', () => ({
  getRequestAuth: vi.fn(),
}))

vi.mock('@/lib/repositories/typesense/typesenseClient', () => ({
  isTypesenseConfigured: vi.fn().mockReturnValue(false),
  getTypesenseClient: vi.fn(),
}))

vi.mock('@/lib/monitoring/sentry', () => ({
  captureError: vi.fn(),
  addBreadcrumb: vi.fn(),
  logRouteDuration: vi.fn(),
}))

import { getRequestAuth } from '@/lib/services/request-auth'
import { POST as markNotificationRead } from '@/app/api/notifications/[id]/read/route'

function makeRequest(method: string): Request {
  const headers = new Headers({
    'content-type': 'application/json',
    authorization: 'Bearer test-token',
  })
  return new Request('http://localhost/api/notifications/notif-1/read', { method, headers })
}

function makeContext<T>(params: T) {
  return { params: Promise.resolve(params) }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockDoc.mockReturnValue(mockDocRef)
  mockCollection.mockReturnValue({ doc: mockDoc })
})

describe('POST /api/notifications/[id]/read', () => {
  it('returns 401 when not authenticated', async () => {
    vi.mocked(getRequestAuth).mockResolvedValue(null)

    const req = makeRequest('POST')
    const res = await markNotificationRead(req, makeContext({ id: 'notif-1' }))
    expect(res.status).toBe(401)
  })

  it('returns 404 when notification does not exist', async () => {
    vi.mocked(getRequestAuth).mockResolvedValue({
      userId: 'user-1',
      isAdmin: false,
      userCity: 'gurugram',
    })
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null })

    const req = makeRequest('POST')
    const res = await markNotificationRead(req, makeContext({ id: 'notif-missing' }))
    expect(res.status).toBe(404)
  })

  it('returns 403 when notification belongs to a different user', async () => {
    vi.mocked(getRequestAuth).mockResolvedValue({
      userId: 'user-1',
      isAdmin: false,
      userCity: 'gurugram',
    })
    mockDocRef.get.mockResolvedValue({
      exists: true,
      data: () => ({ userId: 'user-other', isRead: false }),
    })

    const req = makeRequest('POST')
    const res = await markNotificationRead(req, makeContext({ id: 'notif-1' }))
    expect(res.status).toBe(403)
    expect(mockDocRef.update).not.toHaveBeenCalled()
  })

  it('returns 200 when caller owns the notification', async () => {
    vi.mocked(getRequestAuth).mockResolvedValue({
      userId: 'user-1',
      isAdmin: false,
      userCity: 'gurugram',
    })
    mockDocRef.get.mockResolvedValue({
      exists: true,
      data: () => ({ userId: 'user-1', isRead: false }),
    })
    mockDocRef.update.mockResolvedValue(undefined)

    const req = makeRequest('POST')
    const res = await markNotificationRead(req, makeContext({ id: 'notif-1' }))
    expect(res.status).toBe(200)
    expect(mockDocRef.update).toHaveBeenCalledWith({ isRead: true })
  })
})

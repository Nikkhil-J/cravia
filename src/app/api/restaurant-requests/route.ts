import { NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin-server'
import { getRequestAuth } from '@/lib/services/request-auth'
import { COLLECTIONS } from '@/lib/firebase/config'
import { parseBody } from '@/lib/validation'
import { createRestaurantRequestSchema } from '@/lib/validation/restaurant-request.schema'
import { checkRateLimit } from '@/lib/rate-limit'
import { captureError } from '@/lib/monitoring/sentry'
import { API_ERRORS } from '@/lib/constants/errors'

export async function POST(req: Request) {
  try {
    const auth = await getRequestAuth(req)
    if (!auth) {
      return NextResponse.json({ message: API_ERRORS.UNAUTHORIZED }, { status: 401 })
    }

    const rateLimited = await checkRateLimit(auth.userId, 'GENERAL')
    if (rateLimited) return rateLimited

    const parsed = parseBody(createRestaurantRequestSchema, await req.json())
    if (!parsed.success) return parsed.response

    const { restaurantName, location, note } = parsed.data
    const restaurantNameLower = restaurantName.toLowerCase()

    const existing = await adminDb
      .collection(COLLECTIONS.RESTAURANT_REQUESTS)
      .where('requestedBy', '==', auth.userId)
      .get()

    const hasPendingDuplicate = existing.docs.some((doc) => {
      const data = doc.data()
      return data.status === 'pending' && data.restaurantNameLower === restaurantNameLower
    })

    if (hasPendingDuplicate) {
      return NextResponse.json(
        { message: 'You already have a pending request for this restaurant.' },
        { status: 409 }
      )
    }

    const userSnap = await adminDb.collection(COLLECTIONS.USERS).doc(auth.userId).get()
    const user = userSnap.data()
    const ref = adminDb.collection(COLLECTIONS.RESTAURANT_REQUESTS).doc()

    await ref.set({
      restaurantName,
      restaurantNameLower,
      location,
      note,
      requestedBy: auth.userId,
      requestedByName: (user?.displayName as string | undefined) ?? 'Unknown',
      requestedByCity: auth.userCity ?? null,
      status: 'pending',
      adminId: null,
      adminNote: null,
      createdAt: Timestamp.now(),
      completedAt: null,
    })

    return NextResponse.json({ success: true, requestId: ref.id }, { status: 201 })
  } catch (error) {
    captureError(error, { route: '/api/restaurant-requests' })
    return NextResponse.json(
      { message: API_ERRORS.FAILED_TO_CREATE_RESTAURANT_REQUEST },
      { status: 500 }
    )
  }
}

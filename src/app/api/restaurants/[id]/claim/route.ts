import { NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin-server'
import { getRequestAuth } from '@/lib/services/request-auth'
import { COLLECTIONS } from '@/lib/firebase/config'
import { parseBody } from '@/lib/validation'
import { submitClaimSchema } from '@/lib/validation/restaurant-claim.schema'
import { checkRateLimit } from '@/lib/rate-limit'
import { API_ERRORS } from '@/lib/constants/errors'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(req: Request, context: RouteContext) {
  const { id: restaurantId } = await context.params
  const auth = await getRequestAuth(req)
  if (!auth) {
    return NextResponse.json({ message: API_ERRORS.UNAUTHORIZED }, { status: 401 })
  }

  const rateLimited = await checkRateLimit(auth.userId, 'GENERAL')
  if (rateLimited) return rateLimited

  const parsed = parseBody(submitClaimSchema, await req.json())
  if (!parsed.success) return parsed.response

  const restaurantRef = adminDb.collection(COLLECTIONS.RESTAURANTS).doc(restaurantId)
  const restaurantSnap = await restaurantRef.get()
  if (!restaurantSnap.exists) {
    return NextResponse.json({ message: API_ERRORS.RESTAURANT_NOT_FOUND }, { status: 404 })
  }

  const restaurant = restaurantSnap.data()
  const existingOwnerId = restaurant?.ownerId as string | null | undefined
  if (existingOwnerId) {
    return NextResponse.json(
      { message: API_ERRORS.RESTAURANT_OWNER_EXISTS },
      { status: 409 }
    )
  }

  const existingClaims = await adminDb
    .collection(COLLECTIONS.RESTAURANT_CLAIMS)
    .where('restaurantId', '==', restaurantId)
    .where('status', '==', 'pending')
    .limit(1)
    .get()

  if (!existingClaims.empty) {
    return NextResponse.json(
      { message: API_ERRORS.PENDING_CLAIM_EXISTS },
      { status: 409 }
    )
  }

  const userDoc = await adminDb.collection(COLLECTIONS.USERS).doc(auth.userId).get()
  const userName = (userDoc.data()?.displayName as string | undefined) ?? 'Unknown'
  const userEmail = (userDoc.data()?.email as string | undefined) ?? ''

  const claimRef = adminDb.collection(COLLECTIONS.RESTAURANT_CLAIMS).doc()
  await claimRef.set({
    restaurantId,
    restaurantName: (restaurant?.name as string | undefined) ?? '',
    userId: auth.userId,
    userName,
    userEmail,
    phone: parsed.data.phone,
    role: parsed.data.role,
    proofDocumentUrl: parsed.data.proofDocumentUrl,
    status: 'pending',
    adminId: null,
    adminNote: null,
    createdAt: Timestamp.now(),
  })

  return NextResponse.json({ success: true, claimId: claimRef.id }, { status: 201 })
}

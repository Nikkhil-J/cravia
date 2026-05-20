import { NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin-server'
import { AdminAuthError, assertAdmin } from '@/lib/auth/assert-admin'
import { COLLECTIONS } from '@/lib/firebase/config'
import { parseBody } from '@/lib/validation'
import { restaurantRequestActionSchema } from '@/lib/validation/admin.schema'
import { createServerNotification } from '@/lib/services/notifications-server'
import { captureError } from '@/lib/monitoring/sentry'
import { API_ERRORS } from '@/lib/constants/errors'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { userId: adminUserId } = await assertAdmin(req)
    const { id } = await context.params

    const parsed = parseBody(restaurantRequestActionSchema, await req.json())
    if (!parsed.success) return parsed.response

    const requestRef = adminDb.collection(COLLECTIONS.RESTAURANT_REQUESTS).doc(id)
    const requestSnap = await requestRef.get()

    if (!requestSnap.exists) {
      return NextResponse.json({ message: 'Restaurant request not found' }, { status: 404 })
    }

    const request = requestSnap.data()
    if (request?.status !== 'pending') {
      return NextResponse.json({ message: 'Restaurant request already completed' }, { status: 409 })
    }

    await requestRef.update({
      status: parsed.data.action,
      adminId: adminUserId,
      adminNote: parsed.data.note ?? null,
      completedAt: Timestamp.now(),
    })

    const requestedBy = request?.requestedBy as string | undefined
    const restaurantName = request?.restaurantName as string | undefined

    if (requestedBy && restaurantName) {
      createServerNotification(
        requestedBy,
        'system',
        'Restaurant request completed',
        `"${restaurantName}" has been reviewed by our team. Thanks for helping Cravia grow!`,
        null
      ).catch((error) => {
        captureError(error, {
          route: '/api/admin/restaurant-requests/[id]',
          extra: { context: 'notification' },
        })
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    captureError(error, { route: '/api/admin/restaurant-requests/[id]' })
    return NextResponse.json({ message: API_ERRORS.FAILED_TO_UPDATE_REQUEST }, { status: 500 })
  }
}

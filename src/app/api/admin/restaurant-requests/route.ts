import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin-server'
import { AdminAuthError, assertAdmin } from '@/lib/auth/assert-admin'
import { COLLECTIONS } from '@/lib/firebase/config'
import { captureError } from '@/lib/monitoring/sentry'
import { API_ERRORS } from '@/lib/constants/errors'

export async function GET(req: Request) {
  try {
    await assertAdmin(req)

    const snap = await adminDb
      .collection(COLLECTIONS.RESTAURANT_REQUESTS)
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get()

    const requests = snap.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? new Date(0).toISOString(),
        completedAt: data.completedAt?.toDate?.()?.toISOString?.() ?? null,
      }
    })

    return NextResponse.json({ requests })
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    captureError(error, { route: '/api/admin/restaurant-requests' })
    return NextResponse.json(
      { message: API_ERRORS.FAILED_TO_FETCH_RESTAURANT_REQUESTS },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin-server'
import { getRequestAuth } from '@/lib/services/request-auth'
import { COLLECTIONS, SUBCOLLECTIONS } from '@/lib/firebase/config'
import { captureError } from '@/lib/monitoring/sentry'
import { API_ERRORS } from '@/lib/constants/errors'
import type { Timestamp } from 'firebase-admin/firestore'

interface RouteContext {
  params: Promise<{ userId: string }>
}

export async function GET(req: Request, context: RouteContext) {
  const { userId } = await context.params
  const auth = await getRequestAuth(req)
  if (!auth || auth.userId !== userId) {
    return NextResponse.json({ message: API_ERRORS.FORBIDDEN }, { status: 403 })
  }

  try {
    const snap = await adminDb
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .collection(SUBCOLLECTIONS.WISHLIST)
      .orderBy('savedAt', 'desc')
      .get()

    const items = snap.docs.map((d) => {
      const data = d.data()
      return {
        ...data,
        savedAt: (data.savedAt as Timestamp)?.toDate?.()?.toISOString?.() ?? '',
      }
    })

    return NextResponse.json({ items })
  } catch (error) {
    captureError(error, { route: 'GET /api/users/[userId]/wishlist', userId })
    return NextResponse.json({ message: 'Failed to fetch wishlist' }, { status: 500 })
  }
}


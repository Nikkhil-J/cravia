import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin-server'
import { getRequestAuth } from '@/lib/services/request-auth'
import { COLLECTIONS } from '@/lib/firebase/config'
import { captureError } from '@/lib/monitoring/sentry'
import { API_ERRORS } from '@/lib/constants/errors'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(req: Request, context: RouteContext) {
  const { id } = await context.params
  const auth = await getRequestAuth(req)
  if (!auth) {
    return NextResponse.json({ message: API_ERRORS.UNAUTHORIZED }, { status: 401 })
  }

  try {
    const ref = adminDb.collection(COLLECTIONS.NOTIFICATIONS).doc(id)
    const snap = await ref.get()

    if (!snap.exists) {
      return NextResponse.json({ message: API_ERRORS.NOTIFICATION_NOT_FOUND }, { status: 404 })
    }

    const data = snap.data()
    if (data?.userId !== auth.userId) {
      return NextResponse.json({ message: API_ERRORS.FORBIDDEN }, { status: 403 })
    }

    await ref.update({ isRead: true })
    return NextResponse.json({ success: true })
  } catch (error) {
    captureError(error, { route: 'POST /api/notifications/[id]/read', userId: auth.userId })
    return NextResponse.json({ message: API_ERRORS.FAILED_TO_MARK_READ }, { status: 500 })
  }
}

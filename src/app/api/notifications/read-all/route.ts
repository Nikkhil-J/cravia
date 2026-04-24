import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin-server'
import { getRequestAuth } from '@/lib/services/request-auth'
import { COLLECTIONS } from '@/lib/firebase/config'
import { captureError } from '@/lib/monitoring/sentry'
import { API_ERRORS } from '@/lib/constants/errors'

const BATCH_LIMIT = 500

export async function POST(req: Request) {
  const auth = await getRequestAuth(req)
  if (!auth) {
    return NextResponse.json({ message: API_ERRORS.UNAUTHORIZED }, { status: 401 })
  }

  try {
    const snap = await adminDb
      .collection(COLLECTIONS.NOTIFICATIONS)
      .where('userId', '==', auth.userId)
      .where('isRead', '==', false)
      .get()

    if (snap.empty) return NextResponse.json({ success: true })

    const docs = snap.docs
    for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
      const chunk = docs.slice(i, i + BATCH_LIMIT)
      const batch = adminDb.batch()
      for (const d of chunk) {
        batch.update(d.ref, { isRead: true })
      }
      await batch.commit()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    captureError(error, { route: 'POST /api/notifications/read-all', userId: auth.userId })
    return NextResponse.json({ message: API_ERRORS.FAILED_TO_MARK_ALL_READ }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin-server'
import { AdminAuthError, assertAdmin } from '@/lib/auth/assert-admin'
import { COLLECTIONS } from '@/lib/firebase/config'
import { captureError } from '@/lib/monitoring/sentry'
import { API_ERRORS } from '@/lib/constants/errors'

export async function POST(req: Request) {
  try {
    await assertAdmin(req)
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status })
    }
    return NextResponse.json({ message: API_ERRORS.UNAUTHORIZED }, { status: 401 })
  }

  try {
    const body = (await req.json()) as Record<string, unknown>
    const uid = typeof body?.uid === 'string' ? body.uid.trim() : ''

    if (!uid) {
      return NextResponse.json({ message: 'uid is required' }, { status: 400 })
    }

    // Verify the user actually exists in Firebase Auth before touching anything.
    let userEmail: string | undefined
    try {
      const userRecord = await adminAuth.getUser(uid)
      userEmail = userRecord.email
    } catch {
      return NextResponse.json(
        { message: `No Firebase Auth user found with uid: ${uid}` },
        { status: 404 },
      )
    }

    // 1. Set custom claim — required by assertAdmin() hasAdminClaim check.
    await adminAuth.setCustomUserClaims(uid, { isAdmin: true })

    // 2. Update Firestore document — required by assertAdmin() hasAdminDoc check.
    await adminDb.collection(COLLECTIONS.USERS).doc(uid).update({ isAdmin: true })

    const displayName = userEmail ?? uid
    return NextResponse.json({
      success: true,
      message: `Admin role granted to ${displayName}. They must sign out and back in for the change to take effect.`,
    })
  } catch (error) {
    captureError(error, { route: '/api/admin/tools/set-admin' })
    return NextResponse.json({ message: API_ERRORS.FAILED_TO_SET_ADMIN }, { status: 500 })
  }
}

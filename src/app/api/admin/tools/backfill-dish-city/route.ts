import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin-server'
import { AdminAuthError, assertAdmin } from '@/lib/auth/assert-admin'
import { COLLECTIONS } from '@/lib/firebase/config'
import { captureError } from '@/lib/monitoring/sentry'
import { API_ERRORS } from '@/lib/constants/errors'

const TARGET_CITY = 'gurugram'
const BATCH_LIMIT = 400

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
    const snap = await adminDb.collection(COLLECTIONS.DISHES).get()

    let updated = 0
    let skipped = 0
    let batch = adminDb.batch()
    let batchOps = 0

    const flush = async () => {
      if (batchOps === 0) return
      await batch.commit()
      batch = adminDb.batch()
      batchOps = 0
    }

    for (const doc of snap.docs) {
      const cityVal = doc.data().city

      if (cityVal === TARGET_CITY) {
        skipped++
        continue
      }

      batch.update(doc.ref, { city: TARGET_CITY })
      batchOps++
      updated++

      if (batchOps >= BATCH_LIMIT) await flush()
    }

    await flush()

    return NextResponse.json({
      success: true,
      updated,
      skipped,
      message: `Updated ${updated} dish${updated !== 1 ? 'es' : ''}, skipped ${skipped} already correct.`,
    })
  } catch (error) {
    captureError(error, { route: '/api/admin/tools/backfill-dish-city' })
    return NextResponse.json({ message: API_ERRORS.FAILED_TO_BACKFILL_DISH_CITY }, { status: 500 })
  }
}

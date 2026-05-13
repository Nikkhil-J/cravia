import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin-server'
import { AdminAuthError, assertAdmin } from '@/lib/auth/assert-admin'
import { COLLECTIONS } from '@/lib/firebase/config'
import { captureError } from '@/lib/monitoring/sentry'
import { API_ERRORS } from '@/lib/constants/errors'

const BATCH_LIMIT = 400

function extractCuisines(data: FirebaseFirestore.DocumentData): string[] {
  if (Array.isArray(data.cuisines) && (data.cuisines as unknown[]).length > 0) {
    return data.cuisines as string[]
  }
  if (typeof data.cuisine === 'string' && data.cuisine.length > 0) {
    return [data.cuisine as string]
  }
  return []
}

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
    // Build a map of restaurantId → { cuisines, area }
    const restSnap = await adminDb.collection(COLLECTIONS.RESTAURANTS).get()
    const restMap = new Map<string, { cuisines: string[]; area: string }>()
    for (const doc of restSnap.docs) {
      const data = doc.data()
      restMap.set(doc.id, {
        cuisines: extractCuisines(data),
        area: typeof data.area === 'string' ? (data.area as string) : '',
      })
    }

    const dishSnap = await adminDb.collection(COLLECTIONS.DISHES).get()

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

    for (const doc of dishSnap.docs) {
      const restaurantId = doc.data().restaurantId as string | undefined
      if (!restaurantId) {
        skipped++
        continue
      }

      const rest = restMap.get(restaurantId)
      if (!rest) {
        skipped++
        continue
      }

      batch.update(doc.ref, { cuisines: rest.cuisines, area: rest.area })
      batchOps++
      updated++

      if (batchOps >= BATCH_LIMIT) await flush()
    }

    await flush()

    return NextResponse.json({
      success: true,
      updated,
      skipped,
      message: `Updated ${updated} dish${updated !== 1 ? 'es' : ''} with cuisines and area, skipped ${skipped}.`,
    })
  } catch (error) {
    captureError(error, { route: '/api/admin/tools/backfill-dish-denorm' })
    return NextResponse.json(
      { message: API_ERRORS.FAILED_TO_BACKFILL_DISH_DENORM },
      { status: 500 },
    )
  }
}

import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin-server'
import { AdminAuthError, assertAdmin } from '@/lib/auth/assert-admin'
import { COLLECTIONS } from '@/lib/firebase/config'
import { captureError } from '@/lib/monitoring/sentry'
import { API_ERRORS } from '@/lib/constants/errors'

const BATCH_LIMIT = 400

function deriveTopTags(tagCounts: Record<string, number>): string[] {
  return Object.entries(tagCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag)
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
    // 1. Load all approved reviews and group tag counts by dishId.
    const reviewsSnap = await adminDb
      .collection(COLLECTIONS.REVIEWS)
      .where('isApproved', '==', true)
      .get()

    const dishTagCounts = new Map<string, Record<string, number>>()

    for (const reviewDoc of reviewsSnap.docs) {
      const data = reviewDoc.data()
      const dishId = typeof data.dishId === 'string' ? (data.dishId as string) : undefined
      const tags = Array.isArray(data.tags) ? (data.tags as string[]) : []

      if (!dishId) continue

      const counts = dishTagCounts.get(dishId) ?? {}
      for (const tag of tags) {
        counts[tag] = (counts[tag] ?? 0) + 1
      }
      dishTagCounts.set(dishId, counts)
    }

    // 2. Write tagCounts + topTags to each affected dish in batches.
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

    for (const [dishId, counts] of dishTagCounts) {
      const topTags = deriveTopTags(counts)

      if (topTags.length === 0) {
        skipped++
        continue
      }

      batch.update(adminDb.collection(COLLECTIONS.DISHES).doc(dishId), {
        tagCounts: counts,
        topTags,
      })
      batchOps++
      updated++

      if (batchOps >= BATCH_LIMIT) await flush()
    }

    await flush()

    return NextResponse.json({
      success: true,
      updated,
      skipped,
      reviewsScanned: reviewsSnap.size,
      message: `Scanned ${reviewsSnap.size} reviews. Updated ${updated} dish${updated !== 1 ? 'es' : ''}, skipped ${skipped}.`,
    })
  } catch (error) {
    captureError(error, { route: '/api/admin/tools/backfill-tag-counts' })
    return NextResponse.json(
      { message: API_ERRORS.FAILED_TO_BACKFILL_TAG_COUNTS },
      { status: 500 },
    )
  }
}

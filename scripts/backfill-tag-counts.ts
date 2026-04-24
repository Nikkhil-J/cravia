/**
 * One-time backfill: reads all approved reviews and writes tagCounts + topTags
 * onto every dish document that has been reviewed.
 *
 * Before this script existed, topTags was recomputed by reading all reviews for
 * a dish on every write. The new path uses atomic increments against tagCounts,
 * but existing dish documents have no tagCounts field. This script seeds it.
 *
 * Requires FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * (loads from .env.local).
 *
 * Usage:
 *   npx tsx scripts/backfill-tag-counts.ts              # normal run
 *   npx tsx scripts/backfill-tag-counts.ts --dry-run    # logs without writing
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const DRY_RUN = process.argv.includes('--dry-run')

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

function initAdminDb() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId:   required('FIREBASE_PROJECT_ID'),
        clientEmail: required('FIREBASE_CLIENT_EMAIL'),
        privateKey:  required('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
      }),
    })
  }
  return getFirestore()
}

const db = initAdminDb()

const COLLECTIONS = {
  REVIEWS: 'reviews',
  DISHES:  'dishes',
} as const

const BATCH_LIMIT = 500

function deriveTopTags(tagCounts: Record<string, number>): string[] {
  return Object.entries(tagCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag)
}

async function backfill(): Promise<void> {
  console.log(`\nCravia — tagCounts backfill${DRY_RUN ? ' (DRY RUN)' : ''}`)
  console.log('─'.repeat(50))

  // 1. Load all approved reviews
  console.log('Fetching approved reviews...')
  const reviewsSnap = await db
    .collection(COLLECTIONS.REVIEWS)
    .where('isApproved', '==', true)
    .get()
  console.log(`  Found ${reviewsSnap.size} approved reviews`)

  // 2. Group by dishId and accumulate tag counts
  const dishTagCounts = new Map<string, Record<string, number>>()

  for (const reviewDoc of reviewsSnap.docs) {
    const data   = reviewDoc.data()
    const dishId = data.dishId as string | undefined
    const tags   = (data.tags as string[] | undefined) ?? []

    if (!dishId) continue

    const counts = dishTagCounts.get(dishId) ?? {}
    for (const tag of tags) {
      counts[tag] = (counts[tag] ?? 0) + 1
    }
    dishTagCounts.set(dishId, counts)
  }

  console.log(`  Reviews span ${dishTagCounts.size} distinct dishes`)

  // 3. Write tagCounts + topTags to each dish in batched writes
  let updated  = 0
  let skipped  = 0
  let errored  = 0
  let batch    = db.batch()
  let batchOps = 0

  const flush = async () => {
    if (batchOps === 0) return
    await batch.commit()
    console.log(`  Committed batch of ${batchOps} dish updates`)
    batch    = db.batch()
    batchOps = 0
  }

  for (const [dishId, counts] of dishTagCounts) {
    const topTags = deriveTopTags(counts)

    if (topTags.length === 0) {
      console.log(`  SKIP  ${dishId} — reviews exist but all tags are empty`)
      skipped++
      continue
    }

    if (DRY_RUN) {
      console.log(`  [DRY RUN] ${dishId} → ${Object.keys(counts).length} tags, topTags: ${topTags.join(', ')}`)
      updated++
      continue
    }

    try {
      batch.update(db.collection(COLLECTIONS.DISHES).doc(dishId), { tagCounts: counts, topTags })
      batchOps++
      updated++

      if (batchOps >= BATCH_LIMIT) {
        await flush()
      }
    } catch (err) {
      console.error(`  ERROR ${dishId}:`, err)
      errored++
    }
  }

  if (!DRY_RUN) {
    await flush()
  }

  console.log('\n' + '─'.repeat(50))
  if (DRY_RUN) {
    console.log(`[DRY RUN] Would update: ${updated} dishes, Would skip: ${skipped}`)
  } else {
    console.log(`Done.`)
    console.log(`  Updated : ${updated} dishes`)
    console.log(`  Skipped : ${skipped} (had reviews but all tags empty)`)
    if (errored > 0) console.log(`  Errored : ${errored} (check logs above)`)
  }
}

backfill().catch((err) => {
  console.error('\nBackfill failed:', err)
  process.exit(1)
})

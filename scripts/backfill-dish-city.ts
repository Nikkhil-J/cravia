/**
 * One-time backfill: ensures every dish document has `city: "gurugram"` (lowercase).
 *
 * Why: dishes were seeded inconsistently — most have no `city` field at all,
 * a minority have `city: "Gurugram"` (capital G). Every query in the app uses
 * the lowercase constant `GURUGRAM = "gurugram"` and Firestore equality is
 * case-sensitive, so `where('city', '==', 'gurugram')` matches zero docs.
 *
 * The app currently supports a single city (`SUPPORTED_CITIES = ['gurugram']`)
 * and every restaurant in Firestore has `city: "gurugram"`, so we can safely
 * normalise every dish to that value.
 *
 * Idempotent: re-running this script after success does nothing because the
 * scan only writes to docs whose city is missing or non-lowercase.
 *
 * Requires FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * (loads from .env.local).
 *
 * Usage:
 *   npx tsx scripts/backfill-dish-city.ts             # normal run
 *   npx tsx scripts/backfill-dish-city.ts --dry-run   # logs without writing
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const DRY_RUN = process.argv.includes('--dry-run')

const COLLECTIONS = {
  DISHES: 'dishes',
} as const

const BATCH_LIMIT = 500
const TARGET_CITY = 'gurugram'

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

async function backfill(): Promise<void> {
  console.log(`\nCravia — dish city backfill${DRY_RUN ? ' (DRY RUN)' : ''}`)
  console.log('─'.repeat(50))

  const totalSnap = await db.collection(COLLECTIONS.DISHES).count().get()
  const total = totalSnap.data().count
  console.log(`Total dishes in collection: ${total}`)

  console.log('Scanning all dishes...')
  const snap = await db.collection(COLLECTIONS.DISHES).get()
  console.log(`  Loaded ${snap.size} docs`)

  const counters = {
    alreadyOk:    0, // city === 'gurugram'
    fixCase:      0, // city is a string but not 'gurugram'
    fixMissing:   0, // city field missing, null, or empty
    other:        0, // unexpected (non-string)
  }

  let batch    = db.batch()
  let batchOps = 0
  let updated  = 0
  let errored  = 0

  const flush = async () => {
    if (batchOps === 0) return
    await batch.commit()
    console.log(`  Committed batch of ${batchOps} updates (cumulative: ${updated})`)
    batch    = db.batch()
    batchOps = 0
  }

  for (const doc of snap.docs) {
    const data = doc.data()
    const cityVal = data.city

    if (cityVal === TARGET_CITY) {
      counters.alreadyOk++
      continue
    }

    if (cityVal === undefined || cityVal === null || cityVal === '') {
      counters.fixMissing++
    } else if (typeof cityVal === 'string') {
      counters.fixCase++
    } else {
      console.warn(`  ! ${doc.id} has non-string city: ${typeof cityVal} ${JSON.stringify(cityVal)} — coercing to "${TARGET_CITY}"`)
      counters.other++
    }

    if (DRY_RUN) {
      updated++
      continue
    }

    try {
      batch.update(doc.ref, { city: TARGET_CITY })
      batchOps++
      updated++
      if (batchOps >= BATCH_LIMIT) {
        await flush()
      }
    } catch (err) {
      console.error(`  ERROR ${doc.id}:`, err)
      errored++
    }
  }

  if (!DRY_RUN) await flush()

  console.log('\nBreakdown:')
  console.log(`  Already correct (city === "${TARGET_CITY}"): ${counters.alreadyOk}`)
  console.log(`  Will fix case (string but wrong value)     : ${counters.fixCase}`)
  console.log(`  Will fix missing/null/empty                : ${counters.fixMissing}`)
  console.log(`  Other (non-string)                         : ${counters.other}`)

  console.log('\n' + '─'.repeat(50))
  if (DRY_RUN) {
    console.log(`[DRY RUN] Would update: ${updated} dishes`)
  } else {
    console.log(`Done.`)
    console.log(`  Updated  : ${updated} dishes`)
    if (errored > 0) console.log(`  Errored  : ${errored}`)
    const finalSnap = await db
      .collection(COLLECTIONS.DISHES)
      .where('city', '==', TARGET_CITY)
      .count()
      .get()
    console.log(`  Final count where city == "${TARGET_CITY}": ${finalSnap.data().count}`)
  }
}

backfill().catch((err) => {
  console.error('\nBackfill failed:', err)
  process.exit(1)
})

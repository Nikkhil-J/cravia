/**
 * Step 3 — Dry run: compare enriched-data.json against live Firestore.
 * Shows exactly what will change without touching the database.
 *
 * Usage: pnpm agent:step3
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

import { log, logError, DATA_DIR } from './utils'

// ── Firestore collection names (mirroring src/lib/firebase/config.ts) ──

const COLLECTIONS = {
  RESTAURANTS: 'restaurants',
  DISHES: 'dishes',
  REVIEWS: 'reviews',
} as const

// ── Firebase Admin init ──────────────────────────────────────

function initAdmin() {
  if (getApps().length > 0) return getApps()[0]

  const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  const credential =
    projectId && clientEmail && privateKey
      ? cert({ projectId, clientEmail, privateKey })
      : applicationDefault()

  return initializeApp({ credential })
}

// ── Types ────────────────────────────────────────────────────

interface EnrichedRestaurant {
  id: string
  name: string
  area: string
  googlePlaceId: string
  zomatoStatus: string
  dishes: Array<{ id: string; nameLower: string; name: string }>
  [key: string]: unknown
}

interface DryRunReport {
  generatedAt: string
  skipped: {
    notFound: number
    insufficientMenu: number
    restaurants: string[]
  }
  summary: {
    restaurantsToInsert: number
    restaurantsToMerge: number
    dishesToInsert: number
    dishesToSkip: number
    reviewsToDelete: number
  }
  operations: {
    inserts: Array<{ restaurantName: string; area: string; dishCount: number }>
    merges: Array<{
      restaurantName: string
      existingId: string
      newDishesToAdd: number
      dishesToSkip: number
    }>
    reviews: Array<{ id: string; textSnippet: string }>
  }
}

// ── Main ─────────────────────────────────────────────────────

async function main(): Promise<void> {
  log('Step 3 — Dry run: comparing enriched data against Firestore')

  const enrichedPath = path.join(DATA_DIR, 'enriched-data.json')
  if (!fs.existsSync(enrichedPath)) {
    console.error('enriched-data.json not found. Run pnpm agent:step2 first.')
    process.exit(1)
  }

  const enrichedData = JSON.parse(fs.readFileSync(enrichedPath, 'utf-8'))
  const allRestaurants: EnrichedRestaurant[] = enrichedData.restaurants

  const eligible = allRestaurants.filter((r) => r.dishes && r.dishes.length > 0)
  const skipped = allRestaurants.filter((r) => !r.dishes || r.dishes.length === 0)
  const skippedNames = skipped.map((r) => `${r.name} (no dishes)`)

  log(`Total restaurants: ${allRestaurants.length}`)
  log(`Eligible (have dishes): ${eligible.length}`)
  log(`Skipped (no dishes): ${skipped.length}`)

  // Connect to Firestore
  const app = initAdmin()
  const db = getFirestore(app)

  const inserts: DryRunReport['operations']['inserts'] = []
  const merges: DryRunReport['operations']['merges'] = []
  let totalDishInserts = 0
  let totalDishSkips = 0

  for (const restaurant of eligible) {
    try {
      let snap: FirebaseFirestore.QuerySnapshot
      if (restaurant.googlePlaceId) {
        snap = await db
          .collection(COLLECTIONS.RESTAURANTS)
          .where('googlePlaceId', '==', restaurant.googlePlaceId)
          .limit(1)
          .get()
      } else {
        snap = await db
          .collection(COLLECTIONS.RESTAURANTS)
          .where('name', '==', restaurant.name)
          .where('city', '==', 'gurugram')
          .limit(1)
          .get()
      }

      if (snap.empty) {
        inserts.push({
          restaurantName: restaurant.name,
          area: restaurant.area,
          dishCount: restaurant.dishes.length,
        })
        totalDishInserts += restaurant.dishes.length
      } else {
        const existingDoc = snap.docs[0]
        const existingId = existingDoc.id

        let newDishes = 0
        let skippedDishes = 0

        for (const dish of restaurant.dishes) {
          const dishSnap = await db
            .collection(COLLECTIONS.DISHES)
            .where('restaurantId', '==', existingId)
            .where('nameLower', '==', dish.nameLower)
            .limit(1)
            .get()

          if (dishSnap.empty) {
            newDishes++
          } else {
            skippedDishes++
          }
        }

        merges.push({
          restaurantName: restaurant.name,
          existingId,
          newDishesToAdd: newDishes,
          dishesToSkip: skippedDishes,
        })
        totalDishInserts += newDishes
        totalDishSkips += skippedDishes
      }
    } catch (err) {
      logError(`Error checking restaurant: ${restaurant.name}`, err)
    }
  }

  // Query all reviews for deletion
  log('Querying all reviews...')
  const reviewEntries: DryRunReport['operations']['reviews'] = []

  try {
    const reviewsSnap = await db.collection(COLLECTIONS.REVIEWS).get()
    for (const doc of reviewsSnap.docs) {
      const data = doc.data()
      const text = typeof data.text === 'string' ? data.text : ''
      reviewEntries.push({
        id: doc.id,
        textSnippet: text.slice(0, 50) || '(no text)',
      })
    }
  } catch (err) {
    logError('Failed to query reviews', err)
  }

  // Build report
  const report: DryRunReport = {
    generatedAt: new Date().toISOString(),
    skipped: {
      notFound: skipped.length,
      insufficientMenu: 0,
      restaurants: skippedNames,
    },
    summary: {
      restaurantsToInsert: inserts.length,
      restaurantsToMerge: merges.length,
      dishesToInsert: totalDishInserts,
      dishesToSkip: totalDishSkips,
      reviewsToDelete: reviewEntries.length,
    },
    operations: {
      inserts,
      merges,
      reviews: reviewEntries,
    },
  }

  const reportPath = path.join(DATA_DIR, 'dry-run-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  log(`Report saved to ${reportPath}`)

  // Print human-readable report
  const s = report.summary
  const sk = report.skipped

  console.log(`
╔══════════════════════════════════════════════════════╗
║         DRY RUN REPORT — GURGAON DATA PUSH          ║
╠══════════════════════════════════════════════════════╣
║  SKIPPED (not processing these)                      ║
║  Not found on Zomato:        ${String(sk.notFound).padStart(3)} restaurants         ║
║  Insufficient menu data:     ${String(sk.insufficientMenu).padStart(3)} restaurants         ║
╠══════════════════════════════════════════════════════╣
║  RESTAURANTS                                         ║
║  ✅ New to insert:           ${String(s.restaurantsToInsert).padStart(3)}                     ║
║  🔀 Existing to merge:       ${String(s.restaurantsToMerge).padStart(3)}                     ║
╠══════════════════════════════════════════════════════╣
║  DISHES                                              ║
║  ✅ New dishes to add:       ${String(s.dishesToInsert).padStart(3)}                     ║
║  ⏭️  Already exist (skip):   ${String(s.dishesToSkip).padStart(3)}                     ║
╠══════════════════════════════════════════════════════╣
║  REVIEWS — ALL WILL BE DELETED                       ║
║  🗑️  Reviews to delete:      ${String(s.reviewsToDelete).padStart(3)}                     ║
╚══════════════════════════════════════════════════════╝`)

  if (inserts.length > 0) {
    console.log('\nSAMPLE — First 10 restaurants being added:')
    for (const [idx, r] of inserts.slice(0, 10).entries()) {
      console.log(`  ${idx + 1}. ${r.restaurantName} (${r.area}) — ${r.dishCount} dishes`)
    }
  }

  if (reviewEntries.length > 0) {
    console.log('\nSAMPLE — Reviews being deleted (confirm these are test data):')
    for (const [idx, r] of reviewEntries.slice(0, 10).entries()) {
      console.log(`  ${idx + 1}. "${r.textSnippet}" — ${r.id}`)
    }
  }

  console.log(`
══════════════════════════════════════════════════════
Run \`pnpm agent:step4\` to execute.
Edit enriched-data.json first if anything looks wrong.
══════════════════════════════════════════════════════
`)
}

main().catch((err) => {
  logError('Step 3 failed', err)
  process.exit(1)
})

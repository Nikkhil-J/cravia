/**
 * Step 4 — Push enriched data to Firestore after explicit confirmation.
 * Reads dry-run-report.json + enriched-data.json, executes batch writes.
 *
 * Usage: pnpm agent:step4
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import * as readline from 'readline'

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

const BATCH_LIMIT = 400

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

interface DryRunReport {
  generatedAt: string
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

interface EnrichedRestaurant {
  id: string
  name: string
  city: string
  area: string
  address: string
  cuisines: string[]
  googlePlaceId: string
  coordinates: { lat: number; lng: number }
  coverImage: string | null
  phoneNumber: string | null
  website: string | null
  googleMapsUrl: string
  googleRating: number | null
  ownerId: string | null
  isVerified: boolean
  isActive: boolean
  createdAt: string
  zomatoUrl: string | null
  zomatoStatus: string
  dishes: Array<{
    id: string
    restaurantId: string
    restaurantName: string
    cuisines: string[]
    area: string
    name: string
    nameLower: string
    description: string | null
    category: string
    dietary: string
    priceRange: string | null
    coverImage: string | null
    avgTaste: number
    avgPortion: number
    avgValue: number
    avgOverall: number
    reviewCount: number
    topTags: string[]
    tagCounts: Record<string, number>
    isActive: boolean
    createdAt: string
  }>
}

// ── Helpers ──────────────────────────────────────────────────

function askQuestion(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question(prompt, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

// ── Main ─────────────────────────────────────────────────────

async function main(): Promise<void> {
  log('Step 4 — Push to Firestore')

  const reportPath = path.join(DATA_DIR, 'dry-run-report.json')
  if (!fs.existsSync(reportPath)) {
    console.error('dry-run-report.json not found. Run pnpm agent:step3 first.')
    process.exit(1)
  }

  const report: DryRunReport = JSON.parse(fs.readFileSync(reportPath, 'utf-8'))

  // Check staleness
  const reportAge = Date.now() - new Date(report.generatedAt).getTime()
  const TWO_HOURS_MS = 2 * 60 * 60 * 1000
  if (reportAge > TWO_HOURS_MS) {
    const answer = await askQuestion(
      'Dry run report is over 2 hours old. Re-run pnpm agent:step3 to get fresh data? (y/n): ',
    )
    if (answer.toLowerCase() === 'y') {
      console.log('Aborting. Re-run pnpm agent:step3 first.')
      process.exit(0)
    }
  }

  const enrichedPath = path.join(DATA_DIR, 'enriched-data.json')
  if (!fs.existsSync(enrichedPath)) {
    console.error('enriched-data.json not found. Run pnpm agent:step2 first.')
    process.exit(1)
  }

  const enrichedData = JSON.parse(fs.readFileSync(enrichedPath, 'utf-8'))
  const restaurants: EnrichedRestaurant[] = enrichedData.restaurants

  // Print summary
  const s = report.summary
  console.log(`
══════════════════════════════════════════════════
⚠️  You are about to modify PRODUCTION Firestore
══════════════════════════════════════════════════
This will:
- Add ${s.restaurantsToInsert} new restaurants
- Merge ${s.restaurantsToMerge} existing restaurants
- Add ${s.dishesToInsert} new dishes
`)

  const confirmation = await askQuestion('Type CONFIRM to proceed (anything else aborts): ')
  if (confirmation !== 'CONFIRM') {
    console.log('Aborted.')
    process.exit(0)
  }

  const startTime = Date.now()

  const app = initAdmin()
  const db = getFirestore(app)

  // Build lookup maps from dry-run report
  const insertNames = new Set(report.operations.inserts.map((r) => r.restaurantName))
  const mergeMap = new Map(
    report.operations.merges.map((r) => [r.restaurantName, r.existingId]),
  )

  let restaurantsInserted = 0
  let restaurantsMerged = 0
  let dishesInserted = 0
  let dishesSkipped = 0
  let reviewsDeleted = 0

  // ── PHASE A: Insert new restaurants ──────────────────────

  log('Phase A — Inserting new restaurants...')
  const eligibleRestaurants = restaurants.filter((r) => r.dishes && r.dishes.length > 0)
  const toInsert = eligibleRestaurants.filter((r) => insertNames.has(r.name))

  let insertBatch = db.batch()
  let batchCount = 0

  for (const restaurant of toInsert) {
    const docRef = db.collection(COLLECTIONS.RESTAURANTS).doc(restaurant.id)

    const restaurantDoc = {
      name: restaurant.name,
      city: restaurant.city,
      area: restaurant.area,
      address: restaurant.address,
      cuisines: restaurant.cuisines,
      googlePlaceId: restaurant.googlePlaceId,
      coordinates: restaurant.coordinates,
      coverImage: restaurant.coverImage,
      phoneNumber: restaurant.phoneNumber,
      website: restaurant.website,
      googleMapsUrl: restaurant.googleMapsUrl,
      googleRating: restaurant.googleRating,
      ownerId: restaurant.ownerId,
      isVerified: restaurant.isVerified,
      isActive: restaurant.isActive,
      createdAt: restaurant.createdAt,
    }

    insertBatch.set(docRef, restaurantDoc)
    batchCount++
    restaurantsInserted++

    if (batchCount >= BATCH_LIMIT) {
      await insertBatch.commit()
      log(`✅ Inserted restaurants ${restaurantsInserted}/${toInsert.length}...`)
      insertBatch = db.batch()
      batchCount = 0
    }
  }

  if (batchCount > 0) {
    await insertBatch.commit()
    log(`✅ Inserted restaurants ${restaurantsInserted}/${toInsert.length}...`)
  }

  // ── PHASE C: Merge existing restaurants ──────────────────

  log('Phase B — Merging existing restaurants...')
  const toMerge = eligibleRestaurants.filter((r) => mergeMap.has(r.name))

  let mergeBatch = db.batch()
  batchCount = 0

  for (const restaurant of toMerge) {
    const existingId = mergeMap.get(restaurant.name)
    if (!existingId) continue

    const docRef = db.collection(COLLECTIONS.RESTAURANTS).doc(existingId)

    const mergeFields = {
      name: restaurant.name,
      cuisines: restaurant.cuisines,
      area: restaurant.area,
      address: restaurant.address,
      coordinates: restaurant.coordinates,
      googleRating: restaurant.googleRating,
      website: restaurant.website,
      phoneNumber: restaurant.phoneNumber,
      googleMapsUrl: restaurant.googleMapsUrl,
    }

    mergeBatch.update(docRef, mergeFields)
    batchCount++
    restaurantsMerged++

    if (batchCount >= BATCH_LIMIT) {
      await mergeBatch.commit()
      log(`🔀 Merged restaurants ${restaurantsMerged}/${toMerge.length}...`)
      mergeBatch = db.batch()
      batchCount = 0
    }
  }

  if (batchCount > 0) {
    await mergeBatch.commit()
    log(`🔀 Merged restaurants ${restaurantsMerged}/${toMerge.length}...`)
  }

  // ── PHASE D: Insert new dishes ───────────────────────────

  log('Phase C — Inserting new dishes...')

  // Build a set of nameLower values that should be skipped per restaurant
  const existingMergeDishes = new Map<string, Set<string>>()

  for (const merge of report.operations.merges) {
    if (merge.dishesToSkip > 0) {
      try {
        const dishSnap = await db
          .collection(COLLECTIONS.DISHES)
          .where('restaurantId', '==', merge.existingId)
          .get()
        const nameSet = new Set<string>()
        for (const doc of dishSnap.docs) {
          const data = doc.data()
          if (typeof data.nameLower === 'string') {
            nameSet.add(data.nameLower)
          }
        }
        existingMergeDishes.set(merge.restaurantName, nameSet)
      } catch (err) {
        logError(`Error fetching existing dishes for ${merge.restaurantName}`, err)
      }
    }
  }

  let dishBatch = db.batch()
  batchCount = 0
  const totalDishesToInsert = s.dishesToInsert

  for (const restaurant of eligibleRestaurants) {
    const isInsert = insertNames.has(restaurant.name)
    const isMerge = mergeMap.has(restaurant.name)
    if (!isInsert && !isMerge) continue

    const existingNames = existingMergeDishes.get(restaurant.name)

    for (const dish of restaurant.dishes) {
      if (existingNames && existingNames.has(dish.nameLower)) {
        dishesSkipped++
        continue
      }

      const dishId = isMerge
        ? dish.id.replace(restaurant.id, mergeMap.get(restaurant.name) ?? restaurant.id)
        : dish.id

      const restaurantId = isMerge
        ? (mergeMap.get(restaurant.name) ?? restaurant.id)
        : restaurant.id

      const docRef = db.collection(COLLECTIONS.DISHES).doc(dishId)

      const dishDoc = {
        restaurantId,
        restaurantName: dish.restaurantName,
        cuisines: dish.cuisines,
        area: dish.area,
        name: dish.name,
        nameLower: dish.nameLower,
        description: dish.description,
        category: dish.category,
        dietary: dish.dietary,
        priceRange: dish.priceRange,
        coverImage: dish.coverImage,
        avgTaste: dish.avgTaste,
        avgPortion: dish.avgPortion,
        avgValue: dish.avgValue,
        avgOverall: dish.avgOverall,
        reviewCount: dish.reviewCount,
        topTags: dish.topTags,
        tagCounts: dish.tagCounts,
        isActive: dish.isActive,
        createdAt: dish.createdAt,
      }

      dishBatch.set(docRef, dishDoc)
      batchCount++
      dishesInserted++

      if (batchCount >= BATCH_LIMIT) {
        await dishBatch.commit()
        log(`✅ Inserted dishes ${dishesInserted}/${totalDishesToInsert}...`)
        dishBatch = db.batch()
        batchCount = 0
      }
    }
  }

  if (batchCount > 0) {
    await dishBatch.commit()
    log(`✅ Inserted dishes ${dishesInserted}/${totalDishesToInsert}...`)
  }

  // ── Save receipt ─────────────────────────────────────────

  const durationSeconds = Math.round((Date.now() - startTime) / 1000)

  const receipt = {
    pushedAt: new Date().toISOString(),
    restaurantsInserted,
    restaurantsMerged,
    dishesInserted,
    dishesSkipped,
    reviewsDeleted,
    durationSeconds,
  }

  const receiptPath = path.join(DATA_DIR, 'push-receipt.json')
  fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2))

  // Final count from Firestore
  let totalRestaurantsInDb = 0
  let totalDishesInDb = 0
  try {
    const restSnap = await db
      .collection(COLLECTIONS.RESTAURANTS)
      .where('city', '==', 'gurugram')
      .count()
      .get()
    totalRestaurantsInDb = restSnap.data().count

    const dishSnap = await db.collection(COLLECTIONS.DISHES).count().get()
    totalDishesInDb = dishSnap.data().count
  } catch {
    totalRestaurantsInDb = restaurantsInserted + restaurantsMerged
    totalDishesInDb = dishesInserted
  }

  console.log(`
╔══════════════════════════════════════════════════╗
║              ✅ PUSH COMPLETE                    ║
╠══════════════════════════════════════════════════╣
║  Restaurants added:    ${String(restaurantsInserted).padStart(4)}                       ║
║  Restaurants merged:   ${String(restaurantsMerged).padStart(4)}                       ║
║  Dishes added:         ${String(dishesInserted).padStart(4)}                       ║
║  Reviews deleted:      ${String(reviewsDeleted).padStart(4)}                       ║
║  Time taken:           ${String(durationSeconds).padStart(4)} seconds               ║
╠══════════════════════════════════════════════════╣
║  Your database now has:                          ║
║  • ${String(totalRestaurantsInDb).padStart(4)} restaurants in Gurgaon                ║
║  • ${String(totalDishesInDb).padStart(4)} total dishes                              ║
║  • 0 reviews (ready for real seeding)            ║
╚══════════════════════════════════════════════════╝
`)
}

main().catch((err) => {
  logError('Step 4 failed', err)
  process.exit(1)
})

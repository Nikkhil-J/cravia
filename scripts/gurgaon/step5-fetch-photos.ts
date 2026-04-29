/**
 * Step 5 — Fetch cover photos for all restaurants from Google Places,
 * upload to Cloudinary, and update Firestore.
 *
 * Reads restaurants-raw.json for googlePlaceId values.
 * For each restaurant:
 *   1. Calls Google Place Details API (fields=photos) to get photo_reference
 *   2. Uploads the Google Photo URL to Cloudinary (cravia/restaurants/{id}/cover)
 *   3. Updates the Firestore restaurant doc with the Cloudinary secure_url
 *
 * Usage: pnpm agent:step5
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { v2 as cloudinary } from 'cloudinary'

import { sleep, log, logError, DATA_DIR } from './utils'

// ── Config ────────────────────────────────────────────────────

const API_KEY = process.env.GOOGLE_PLACES_API_KEY
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_SECRET = process.env.CLOUDINARY_API_SECRET

const COLLECTIONS = { RESTAURANTS: 'restaurants' } as const
const CALL_DELAY_MS = 200
const PHOTO_MAX_WIDTH = 800
const BATCH_LIMIT = 400

// ── Validation ────────────────────────────────────────────────

function validateEnv() {
  const missing: string[] = []
  if (!API_KEY) missing.push('GOOGLE_PLACES_API_KEY')
  if (!CLOUD_NAME) missing.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME')
  if (!CLOUDINARY_KEY) missing.push('CLOUDINARY_API_KEY')
  if (!CLOUDINARY_SECRET) missing.push('CLOUDINARY_API_SECRET')
  if (missing.length > 0) {
    console.error(`Missing env vars: ${missing.join(', ')}`)
    process.exit(1)
  }
}

// ── Firebase Admin init ───────────────────────────────────────

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

// ── Cloudinary init ───────────────────────────────────────────

function initCloudinary() {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUDINARY_KEY,
    api_secret: CLOUDINARY_SECRET,
    secure: true,
  })
}

// ── Types ─────────────────────────────────────────────────────

interface RawRestaurant {
  id: string
  name: string
  googlePlaceId: string
  coverImage: string | null
}

interface PhotoResult {
  restaurantId: string
  restaurantName: string
  cloudinaryUrl: string | null
  error?: string
}

// ── Google Places API ─────────────────────────────────────────

async function fetchPhotoReference(placeId: string): Promise<string | null> {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'photos',
    key: API_KEY!,
  })

  const url = `https://maps.googleapis.com/maps/api/place/details/json?${params}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Details API failed: ${res.status}`)

  const data = await res.json()
  if (data.status !== 'OK') return null

  const photos = data.result?.photos
  if (!Array.isArray(photos) || photos.length === 0) return null

  return photos[0].photo_reference ?? null
}

function buildGooglePhotoUrl(photoRef: string): string {
  const params = new URLSearchParams({
    maxwidth: String(PHOTO_MAX_WIDTH),
    photo_reference: photoRef,
    key: API_KEY!,
  })
  return `https://maps.googleapis.com/maps/api/place/photo?${params}`
}

// ── Cloudinary upload ─────────────────────────────────────────

async function uploadToCloudinary(
  imageUrl: string,
  restaurantId: string,
): Promise<string> {
  const result = await cloudinary.uploader.upload(imageUrl, {
    folder: `cravia/restaurants/${restaurantId}`,
    public_id: 'cover',
    overwrite: true,
    resource_type: 'image',
    transformation: [
      { width: PHOTO_MAX_WIDTH, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
    ],
  })
  return result.secure_url
}

// ── Main ──────────────────────────────────────────────────────

async function main(): Promise<void> {
  log('Step 5 — Fetch restaurant cover photos')

  validateEnv()
  initCloudinary()

  // Read raw data
  const rawPath = path.join(DATA_DIR, 'restaurants-raw.json')
  if (!fs.existsSync(rawPath)) {
    console.error('restaurants-raw.json not found. Run pnpm agent:step1 first.')
    process.exit(1)
  }

  const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf-8'))
  const restaurants: RawRestaurant[] = rawData.restaurants

  log(`Found ${restaurants.length} restaurants to process`)

  // Process each restaurant
  const results: PhotoResult[] = []
  let successCount = 0
  let skipCount = 0
  let failCount = 0

  for (let i = 0; i < restaurants.length; i++) {
    const restaurant = restaurants[i]
    const progress = `[${i + 1}/${restaurants.length}]`

    if (restaurant.coverImage) {
      log(`${progress} ${restaurant.name} — already has cover image, skipping`)
      skipCount++
      results.push({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        cloudinaryUrl: restaurant.coverImage,
      })
      continue
    }

    try {
      log(`${progress} ${restaurant.name} — fetching photo reference...`)
      const photoRef = await fetchPhotoReference(restaurant.googlePlaceId)

      if (!photoRef) {
        log(`${progress} ${restaurant.name} — no photos available on Google`)
        failCount++
        results.push({
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          cloudinaryUrl: null,
          error: 'No photos on Google Places',
        })
        await sleep(CALL_DELAY_MS)
        continue
      }

      const googlePhotoUrl = buildGooglePhotoUrl(photoRef)

      log(`${progress} ${restaurant.name} — uploading to Cloudinary...`)
      const cloudinaryUrl = await uploadToCloudinary(googlePhotoUrl, restaurant.id)

      log(`${progress} ${restaurant.name} — ✅ done`)
      successCount++
      results.push({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        cloudinaryUrl,
      })
    } catch (err) {
      logError(`${progress} ${restaurant.name} — failed`, err)
      failCount++
      results.push({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        cloudinaryUrl: null,
        error: err instanceof Error ? err.message : String(err),
      })
    }

    await sleep(CALL_DELAY_MS)
  }

  // ── Update Firestore ────────────────────────────────────────

  const successResults = results.filter((r) => r.cloudinaryUrl)

  if (successResults.length === 0) {
    log('No photos to update in Firestore.')
  } else {
    log(`Updating ${successResults.length} restaurant docs in Firestore...`)

    const app = initAdmin()
    const db = getFirestore(app)

    let updatedCount = 0
    let skippedCount = 0

    for (const result of successResults) {
      const docRef = db.collection(COLLECTIONS.RESTAURANTS).doc(result.restaurantId)
      try {
        const snap = await docRef.get()
        if (!snap.exists) {
          log(`  ⏩ ${result.restaurantName} — doc not in Firestore, skipping`)
          skippedCount++
          continue
        }
        await docRef.update({ coverImage: result.cloudinaryUrl })
        updatedCount++
      } catch (err) {
        logError(`  Failed to update ${result.restaurantName}`, err)
        skippedCount++
      }
    }

    log(`✅ Firestore updated: ${updatedCount} docs, ${skippedCount} skipped`)
  }

  // ── Update restaurants-raw.json ─────────────────────────────

  const urlMap = new Map(
    results
      .filter((r) => r.cloudinaryUrl)
      .map((r) => [r.restaurantId, r.cloudinaryUrl]),
  )

  for (const restaurant of rawData.restaurants) {
    if (urlMap.has(restaurant.id)) {
      restaurant.coverImage = urlMap.get(restaurant.id)
    }
  }

  fs.writeFileSync(rawPath, JSON.stringify(rawData, null, 2))
  log('Updated restaurants-raw.json with cover image URLs')

  // ── Save receipt ────────────────────────────────────────────

  const receipt = {
    completedAt: new Date().toISOString(),
    totalRestaurants: restaurants.length,
    photosUploaded: successCount,
    alreadyHadPhoto: skipCount,
    noPhotoAvailable: failCount,
    results: results.map((r) => ({
      id: r.restaurantId,
      name: r.restaurantName,
      coverImage: r.cloudinaryUrl,
      ...(r.error ? { error: r.error } : {}),
    })),
  }

  const receiptPath = path.join(DATA_DIR, 'photo-receipt.json')
  fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2))

  console.log(`
╔══════════════════════════════════════════════════╗
║          📸 PHOTO FETCH COMPLETE                 ║
╠══════════════════════════════════════════════════╣
║  Total restaurants:    ${String(restaurants.length).padStart(4)}                       ║
║  Photos uploaded:      ${String(successCount).padStart(4)}                       ║
║  Already had photo:    ${String(skipCount).padStart(4)}                       ║
║  No photo available:   ${String(failCount).padStart(4)}                       ║
╠══════════════════════════════════════════════════╣
║  Receipt saved to: data/photo-receipt.json       ║
║  Firestore updated: ${successResults.length > 0 ? 'YES' : 'NO '}                            ║
╚══════════════════════════════════════════════════╝
`)
}

main().catch((err) => {
  logError('Step 5 failed', err)
  process.exit(1)
})

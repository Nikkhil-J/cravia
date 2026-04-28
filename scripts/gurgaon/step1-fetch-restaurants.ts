/**
 * Step 1 — Fetch restaurants from Google Places API.
 * Saves restaurants-raw.json to scripts/gurgaon/data/.
 * Does NOT touch Firestore.
 *
 * Usage: pnpm agent:step1
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { sleep, slugify, log, logError, DATA_DIR } from './utils'

// ── Types ────────────────────────────────────────────────────

interface PlaceCandidate {
  place_id: string
  name: string
  rating?: number
  user_ratings_total?: number
  types?: string[]
  geometry?: { location: { lat: number; lng: number } }
  formatted_address?: string
  sourceArea: string
}

interface PlaceDetails {
  place_id: string
  name: string
  formatted_address: string
  rating?: number
  user_ratings_total?: number
  price_level?: number
  types: string[]
  geometry: { location: { lat: number; lng: number } }
  website?: string
  formatted_phone_number?: string
  editorial_summary?: { overview?: string }
}

interface RawRestaurant {
  id: string
  name: string
  city: string
  area: string
  address: string
  cuisines: string[]
  googlePlaceId: string
  coordinates: { lat: number; lng: number }
  coverImage: null
  phoneNumber: string | null
  website: string | null
  googleMapsUrl: string
  googleRating: number | null
  ownerId: null
  isVerified: false
  isActive: true
  createdAt: string
}

// ── Config ───────────────────────────────────────────────────

const API_KEY = process.env.GOOGLE_PLACES_API_KEY
if (!API_KEY) {
  console.error('Missing GOOGLE_PLACES_API_KEY in .env.local')
  process.exit(1)
}

const GURUGRAM_AREAS = [
  'Sector 29', 'Cyber City', 'Golf Course Road', 'DLF Phase 1',
  'Sohna Road', 'MG Road', 'Udyog Vihar', 'Sector 14',
  'South City', 'Palam Vihar',
] as const

const SEARCHES = [
  { query: 'best restaurants Cyber Hub Gurgaon', area: 'Cyber City' },
  { query: 'popular restaurants DLF Phase 1 Gurgaon', area: 'DLF Phase 1' },
  { query: 'restaurants Sector 29 Gurgaon', area: 'Sector 29' },
  { query: 'top restaurants Golf Course Road Gurgaon', area: 'Golf Course Road' },
  { query: 'restaurants MG Road Gurgaon', area: 'MG Road' },
  { query: 'restaurants Sohna Road Gurgaon', area: 'Sohna Road' },
  { query: 'restaurants Sector 14 Gurgaon', area: 'Sector 14' },
  { query: 'restaurants South City Gurgaon', area: 'South City' },
  { query: 'restaurants Udyog Vihar Gurgaon', area: 'Udyog Vihar' },
  { query: 'restaurants Palam Vihar Gurgaon', area: 'Palam Vihar' },
  { query: 'best biryani restaurant Gurgaon', area: 'Sector 29' },
  { query: 'best North Indian restaurant Gurgaon', area: 'Cyber City' },
  { query: 'best South Indian restaurant Gurgaon', area: 'Sector 29' },
  { query: 'best Chinese restaurant Gurgaon', area: 'DLF Phase 1' },
  { query: 'cafe Gurgaon popular', area: 'Golf Course Road' },
  { query: 'street food Sector 29 Gurgaon', area: 'Sector 29' },
  { query: 'fine dining Gurgaon', area: 'Cyber City' },
  { query: 'pizza restaurant Gurgaon', area: 'MG Road' },
  { query: 'burger restaurant Gurgaon', area: 'Cyber City' },
  { query: 'restaurant Galleria Market Gurgaon', area: 'DLF Phase 1' },
] as const

const MAX_CANDIDATES = 200
const TARGET_RESTAURANTS = 150
const CALL_DELAY_MS = 200
const PAGE_WAIT_MS = 2000
const MAX_EXTRA_PAGES = 2

const BLOCKED_TYPES = new Set([
  'grocery_or_supermarket', 'convenience_store', 'gas_station',
  'lodging', 'hospital',
])

const HOTEL_NAME_PATTERN = /\b(hotel|inn|suites|residency)\b/i

// ── API helpers ──────────────────────────────────────────────

async function textSearch(
  query: string,
  pageToken?: string,
): Promise<{ results: PlaceCandidate[]; nextPageToken?: string }> {
  const params = new URLSearchParams({
    query,
    type: 'restaurant',
    key: API_KEY!,
  })
  if (pageToken) params.set('pagetoken', pageToken)

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Text search failed: ${res.status} ${res.statusText}`)

  const data = await res.json()
  return {
    results: data.results ?? [],
    nextPageToken: data.next_page_token,
  }
}

async function placeDetails(placeId: string): Promise<PlaceDetails | null> {
  const fields = [
    'place_id', 'name', 'formatted_address', 'rating',
    'user_ratings_total', 'price_level', 'types', 'geometry',
    'website', 'formatted_phone_number', 'editorial_summary',
  ].join(',')

  const params = new URLSearchParams({
    place_id: placeId,
    fields,
    key: API_KEY!,
  })

  const url = `https://maps.googleapis.com/maps/api/place/details/json?${params}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Details failed for ${placeId}: ${res.status}`)

  const data = await res.json()
  if (data.status !== 'OK') return null
  return data.result ?? null
}

// ── Cuisine mapping ──────────────────────────────────────────

function deriveCuisines(
  types: string[],
  name: string,
  summary: string | undefined,
): string[] {
  const cuisines: string[] = []
  const text = `${name} ${summary ?? ''}`.toLowerCase()

  const typeMap: Record<string, string> = {
    indian_restaurant: 'North Indian',
    chinese_restaurant: 'Chinese',
    italian_restaurant: 'Italian',
    american_restaurant: 'American',
    japanese_restaurant: 'Japanese',
    thai_restaurant: 'Thai',
    cafe: 'Café',
    bakery: 'Café',
    bar: 'Multi-cuisine',
  }

  for (const [typeKey, cuisine] of Object.entries(typeMap)) {
    if (types.includes(typeKey) && !cuisines.includes(cuisine)) {
      cuisines.push(cuisine)
    }
  }

  const textHints: [RegExp, string][] = [
    [/biryani/i, 'North Indian'],
    [/pizza|pasta/i, 'Italian'],
    [/burger/i, 'American'],
    [/sushi/i, 'Japanese'],
    [/dosa|idli|udupi/i, 'South Indian'],
    [/chinese|wok/i, 'Chinese'],
  ]

  for (const [pattern, cuisine] of textHints) {
    if (pattern.test(text) && !cuisines.includes(cuisine)) {
      cuisines.push(cuisine)
    }
  }

  return cuisines.length > 0 ? cuisines : ['Multi-cuisine']
}

// ── Area matching ────────────────────────────────────────────

function matchArea(searchArea: string): string {
  if ((GURUGRAM_AREAS as readonly string[]).includes(searchArea)) {
    return searchArea
  }

  const lower = searchArea.toLowerCase()
  for (const area of GURUGRAM_AREAS) {
    if (area.toLowerCase().includes(lower) || lower.includes(area.toLowerCase())) {
      return area
    }
  }
  return 'Cyber City'
}

// ── Main ─────────────────────────────────────────────────────

async function main(): Promise<void> {
  log('Step 1 — Fetching restaurants from Google Places API')

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  const candidates = new Map<string, PlaceCandidate>()

  for (const search of SEARCHES) {
    if (candidates.size >= MAX_CANDIDATES) {
      log(`Reached ${MAX_CANDIDATES} candidates — stopping searches`)
      break
    }

    log(`Searching: "${search.query}"`)

    try {
      let pageToken: string | undefined
      let pageNum = 0

      while (pageNum < 1 + MAX_EXTRA_PAGES) {
        if (candidates.size >= MAX_CANDIDATES) break

        const { results, nextPageToken } = await textSearch(
          search.query,
          pageToken,
        )

        for (const r of results) {
          if (candidates.size >= MAX_CANDIDATES) break
          if ((r.user_ratings_total ?? 0) >= 100 && !candidates.has(r.place_id)) {
            candidates.set(r.place_id, { ...r, sourceArea: search.area })
          }
        }

        log(`  Page ${pageNum + 1}: ${results.length} results (total candidates: ${candidates.size})`)

        if (!nextPageToken) break
        pageToken = nextPageToken
        pageNum++

        await sleep(PAGE_WAIT_MS)
      }
    } catch (err) {
      logError(`Search failed: "${search.query}"`, err)
    }

    await sleep(CALL_DELAY_MS)
  }

  log(`Found ${candidates.size} unique candidates after deduplication`)

  // Fetch details for each candidate
  const detailedResults: Array<{ details: PlaceDetails; sourceArea: string }> = []

  let detailIdx = 0
  for (const [placeId, candidate] of candidates) {
    detailIdx++
    if (detailIdx % 20 === 0) {
      log(`Fetching details: ${detailIdx}/${candidates.size}`)
    }

    try {
      const details = await placeDetails(placeId)
      if (details) {
        detailedResults.push({ details, sourceArea: candidate.sourceArea })
      }
    } catch (err) {
      logError(`Details failed for ${placeId}`, err)
    }

    await sleep(CALL_DELAY_MS)
  }

  log(`Got details for ${detailedResults.length} restaurants`)

  // Filter
  const filtered = detailedResults.filter(({ details }) => {
    const types = details.types ?? []

    const hasValidType = types.includes('restaurant') || types.includes('food')
    if (!hasValidType) return false

    const hasBlockedType = types.some(t => BLOCKED_TYPES.has(t))
    if (hasBlockedType) return false

    if ((details.user_ratings_total ?? 0) < 100) return false
    if (HOTEL_NAME_PATTERN.test(details.name)) return false

    return true
  })

  log(`After filtering: ${filtered.length} restaurants`)

  const final = filtered.slice(0, TARGET_RESTAURANTS)

  // Map to Cravia schema
  const now = new Date().toISOString()
  const restaurants: RawRestaurant[] = final.map(({ details, sourceArea }) => ({
    id: `gp-${details.place_id}`,
    name: details.name.trim(),
    city: 'gurugram',
    area: matchArea(sourceArea),
    address: details.formatted_address,
    cuisines: deriveCuisines(
      details.types,
      details.name,
      details.editorial_summary?.overview,
    ),
    googlePlaceId: details.place_id,
    coordinates: {
      lat: details.geometry.location.lat,
      lng: details.geometry.location.lng,
    },
    coverImage: null,
    phoneNumber: details.formatted_phone_number ?? null,
    website: details.website ?? null,
    googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${details.place_id}`,
    googleRating: details.rating ?? null,
    ownerId: null,
    isVerified: false as const,
    isActive: true as const,
    createdAt: now,
  }))

  // Area breakdown
  const areasFound: Record<string, number> = {}
  for (const r of restaurants) {
    areasFound[r.area] = (areasFound[r.area] ?? 0) + 1
  }

  const output = {
    generatedAt: now,
    totalRestaurants: restaurants.length,
    areasFound,
    restaurants,
  }

  const outPath = path.join(DATA_DIR, 'restaurants-raw.json')
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2))
  log(`Saved to ${outPath}`)

  // Summary
  const avgRating =
    restaurants.reduce((sum, r) => sum + (r.googleRating ?? 0), 0) /
    restaurants.filter(r => r.googleRating !== null).length

  console.log('\n══════════════════════════════════════════════════')
  console.log(`✅ Found ${candidates.size} unique restaurants after deduplication`)
  console.log(`✅ After filtering: ${filtered.length} restaurants`)
  console.log(`✅ Saved ${restaurants.length} restaurants`)
  console.log(`\nAreas:`)
  for (const [area, count] of Object.entries(areasFound).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${area}: ${count}`)
  }
  console.log(`\nAverage Google rating: ${avgRating.toFixed(2)}`)
  console.log(`\nTop 10 restaurants by rating:`)
  const sorted = [...restaurants]
    .sort((a, b) => (b.googleRating ?? 0) - (a.googleRating ?? 0))
    .slice(0, 10)
  sorted.forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.name} (${r.area}) — ${r.googleRating ?? 'N/A'}⭐`)
  })
  console.log('══════════════════════════════════════════════════\n')
}

main().catch((err) => {
  logError('Step 1 failed', err)
  process.exit(1)
})

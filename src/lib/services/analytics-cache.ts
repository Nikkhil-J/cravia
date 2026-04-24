import { Redis } from '@upstash/redis'
import { adminDb } from '@/lib/firebase/admin-server'
import { COLLECTIONS, SUBCOLLECTIONS } from '@/lib/firebase/config'
import type { RestaurantAnalytics } from './restaurant-analytics'
import { logError } from '@/lib/logger'

const CACHE_TTL_SECS = 60 * 60     // 1 hour
const CACHE_TTL_MS   = CACHE_TTL_SECS * 1000
const CACHE_DOC_ID   = 'analytics'

interface AnalyticsCacheEntry {
  data: RestaurantAnalytics
  computedAt: string
  expiresAt: string
}

// ── Tier 1: Upstash Redis ────────────────────────────────
// Survives serverless cold starts and is shared across all instances.
// Falls back to Firestore if env vars are absent or Redis is unavailable.

let redis: Redis | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

function redisKey(restaurantId: string) {
  return `analytics:${restaurantId}`
}

function isExpired(entry: AnalyticsCacheEntry): boolean {
  return Date.now() > new Date(entry.expiresAt).getTime()
}

// ── Tier 2: Firestore subcollection cache ────────────────

function cacheRef(restaurantId: string) {
  return adminDb
    .collection(COLLECTIONS.RESTAURANTS)
    .doc(restaurantId)
    .collection(SUBCOLLECTIONS.ANALYTICS_CACHE)
    .doc(CACHE_DOC_ID)
}

export async function getAnalyticsCache(restaurantId: string): Promise<RestaurantAnalytics | null> {
  // Try Redis first
  if (redis) {
    try {
      const cached = await redis.get<AnalyticsCacheEntry>(redisKey(restaurantId))
      if (cached && !isExpired(cached)) return cached.data
    } catch (e) {
      logError('getAnalyticsCache:redis', e)
    }
  }

  // Fall back to Firestore
  try {
    const snap = await cacheRef(restaurantId).get()
    if (!snap.exists) return null

    const raw = snap.data()
    if (!raw?.expiresAt) return null

    const expiresAtStr =
      typeof raw.expiresAt === 'string'
        ? raw.expiresAt
        : raw.expiresAt.toDate?.()?.toISOString?.() ?? ''

    if (Date.now() > new Date(expiresAtStr).getTime()) return null

    return raw.data as RestaurantAnalytics
  } catch (e) {
    logError('getAnalyticsCache:firestore', e)
    return null
  }
}

export async function setAnalyticsCache(
  restaurantId: string,
  data: RestaurantAnalytics,
): Promise<void> {
  const now = new Date()
  const entry: AnalyticsCacheEntry = {
    data,
    computedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + CACHE_TTL_MS).toISOString(),
  }

  // Write to Redis (primary)
  if (redis) {
    try {
      await redis.set(redisKey(restaurantId), entry, { ex: CACHE_TTL_SECS })
    } catch (e) {
      logError('setAnalyticsCache:redis', e)
    }
  }

  // Write to Firestore (secondary fallback)
  try {
    await cacheRef(restaurantId).set(entry)
  } catch (e) {
    logError('setAnalyticsCache:firestore', e)
  }
}

export async function invalidateAnalyticsCache(restaurantId: string): Promise<void> {
  if (redis) {
    try {
      await redis.del(redisKey(restaurantId))
    } catch (e) {
      logError('invalidateAnalyticsCache:redis', e)
    }
  }

  try {
    await cacheRef(restaurantId).delete()
  } catch (e) {
    logError('invalidateAnalyticsCache:firestore', e)
  }
}

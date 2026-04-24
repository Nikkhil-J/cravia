import { NextResponse } from 'next/server'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { assertAdmin, AdminAuthError } from '@/lib/auth/assert-admin'
import { adminDb } from '@/lib/firebase/admin-server'
import { COLLECTIONS } from '@/lib/firebase/config'
import { isTypesenseConfigured, getTypesenseClient } from '@/lib/repositories/typesense/typesenseClient'
import { captureError } from '@/lib/monitoring/sentry'
import { API_ERRORS } from '@/lib/constants/errors'

const BATCH_SIZE = 500

function mapDishDoc(doc: QueryDocumentSnapshot) {
  const d = doc.data()
  const createdAt = d.createdAt?.toDate?.()
  return {
    id: doc.id,
    name:           (d.name           as string)   ?? '',
    nameLower:      (d.nameLower      as string)   ?? ((d.name as string) ?? '').toLowerCase(),
    restaurantId:   (d.restaurantId   as string)   ?? '',
    restaurantName: (d.restaurantName as string)   ?? '',
    city:           (d.city           as string)   ?? '',
    area:           (d.area           as string)   ?? '',
    cuisines:       (d.cuisines       as string[]) ?? [],
    description:    (d.description    as string)   ?? '',
    category:       (d.category       as string)   ?? '',
    dietary:        (d.dietary        as string)   ?? 'veg',
    priceRange:     (d.priceRange     as string)   ?? '',
    coverImage:     (d.coverImage     as string)   ?? '',
    avgTaste:       (d.avgTaste       as number)   ?? 0,
    avgPortion:     (d.avgPortion     as number)   ?? 0,
    avgValue:       (d.avgValue       as number)   ?? 0,
    avgOverall:     (d.avgOverall     as number)   ?? 0,
    reviewCount:    (d.reviewCount    as number)   ?? 0,
    topTags:        (d.topTags        as string[]) ?? [],
    isActive:       (d.isActive       as boolean)  ?? true,
    createdAt:      createdAt ? Math.floor(createdAt.getTime() / 1000) : 0,
  }
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

  if (!isTypesenseConfigured()) {
    return NextResponse.json({ message: 'Typesense is not configured' }, { status: 503 })
  }

  try {
    const client = getTypesenseClient()
    let synced = 0
    let failed = 0
    let total  = 0
    let lastDoc: QueryDocumentSnapshot | undefined

    // Paginate through the dishes collection in batches to avoid loading
    // the entire collection into memory at once.
    while (true) {
      let q = adminDb
        .collection(COLLECTIONS.DISHES)
        .orderBy('__name__')
        .limit(BATCH_SIZE)

      if (lastDoc) q = q.startAfter(lastDoc) as typeof q

      const snap = await q.get()
      if (snap.empty) break

      total += snap.size
      const documents = snap.docs.map(mapDishDoc)

      const results = await client
        .collections('dishes')
        .documents()
        .import(documents, { action: 'upsert' })

      const batchFailed = results.filter((r: { success: boolean }) => !r.success)
      synced += results.length - batchFailed.length
      failed += batchFailed.length

      if (snap.size < BATCH_SIZE) break
      lastDoc = snap.docs[snap.docs.length - 1]
    }

    return NextResponse.json({ synced, failed, total })
  } catch (e) {
    captureError(e, { route: '/api/admin/sync-typesense' })
    const message = e instanceof Error ? e.message : 'Sync failed'
    return NextResponse.json({ message }, { status: 500 })
  }
}

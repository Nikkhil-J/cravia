import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type QueryConstraint,
  type DocumentSnapshot,
} from 'firebase/firestore'
import { db, COLLECTIONS } from '@/lib/firebase/config'
import type { Restaurant } from '@/lib/types'
import type { RestaurantSearchRepository, GetRestaurantsParams } from '@/lib/repositories/restaurantSearchRepository'
import type { PaginatedData } from '@/lib/repositories/dishRepository'
import { mapRestaurant } from './mappers'
import { logError } from '@/lib/logger'

const DEFAULT_PAGE_SIZE = 20

async function getRestaurantSnapshot(id: string): Promise<DocumentSnapshot | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.RESTAURANTS, id))
    return snap.exists() ? snap : null
  } catch {
    return null
  }
}

function sortInMemory(items: Restaurant[], sortBy: string | undefined): Restaurant[] {
  if (sortBy === 'most-reviewed') {
    return [...items].sort((a, b) => (b.dishCount ?? 0) - (a.dishCount ?? 0))
  }
  if (sortBy === 'newest') {
    return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  if (sortBy === 'alphabetical') {
    return [...items].sort((a, b) => a.name.localeCompare(b.name))
  }
  return items
}

export class FirebaseRestaurantSearchRepository implements RestaurantSearchRepository {
  async search(params: GetRestaurantsParams): Promise<PaginatedData<Restaurant>> {
    try {
      return await this.indexedSearch(params)
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      if (msg.includes('index') || msg.includes('FAILED_PRECONDITION')) {
        return this.fallbackSearch(params)
      }
      logError('FirebaseRestaurantSearchRepository.search', e)
      return { data: [], hasMore: false }
    }
  }

  private async indexedSearch(params: GetRestaurantsParams): Promise<PaginatedData<Restaurant>> {
    const ref = collection(db, COLLECTIONS.RESTAURANTS)
    const constraints: QueryConstraint[] = [where('isActive', '==', true)]

    const searchQuery = params.query?.toLowerCase().trim() ?? ''

    if (searchQuery.length > 0) {
      constraints.push(
        where('nameLower', '>=', searchQuery),
        where('nameLower', '<=', searchQuery + '\uf8ff'),
      )
    } else {
      if (params.city) {
        constraints.push(where('city', '==', params.city))
      }
      if (params.area) {
        constraints.push(where('area', '==', params.area))
      }
    }

    if (!searchQuery && params.sortBy === 'most-reviewed') {
      constraints.push(orderBy('dishCount', 'desc'))
    } else if (!searchQuery && params.sortBy === 'newest') {
      constraints.push(orderBy('createdAt', 'desc'))
    } else if (!searchQuery && params.sortBy === 'alphabetical') {
      constraints.push(orderBy('name', 'asc'))
    }

    const pageSize = params.limit ?? DEFAULT_PAGE_SIZE
    constraints.push(limit(pageSize + 1))

    if (params.cursor) {
      const cursorSnap = await getRestaurantSnapshot(params.cursor)
      if (cursorSnap) constraints.push(startAfter(cursorSnap))
    }

    const snap = await getDocs(query(ref, ...constraints))
    const docs = snap.docs
    const hasMore = docs.length > pageSize
    const resultDocs = hasMore ? docs.slice(0, pageSize) : docs

    let items = resultDocs.map((d) =>
      mapRestaurant({ id: d.id, ...d.data() } as Restaurant)
    )

    if (searchQuery && params.city) {
      items = items.filter((r) => r.city === params.city)
    }
    if (searchQuery && params.cuisine) {
      items = items.filter((r) => r.cuisines.includes(params.cuisine!))
    }

    const lastDoc = resultDocs[resultDocs.length - 1]

    return {
      data: items,
      hasMore,
      nextCursor: hasMore && lastDoc ? lastDoc.id : undefined,
    }
  }

  private async fallbackSearch(params: GetRestaurantsParams): Promise<PaginatedData<Restaurant>> {
    try {
      const ref = collection(db, COLLECTIONS.RESTAURANTS)
      const constraints: QueryConstraint[] = [where('isActive', '==', true)]

      const searchQuery = params.query?.toLowerCase().trim() ?? ''

      if (searchQuery.length > 0) {
        constraints.push(
          where('nameLower', '>=', searchQuery),
          where('nameLower', '<=', searchQuery + '\uf8ff'),
        )
      } else {
        if (params.city) {
          constraints.push(where('city', '==', params.city))
        }
      }

      const snap = await getDocs(query(ref, ...constraints))
      let items = snap.docs.map((d) =>
        mapRestaurant({ id: d.id, ...d.data() } as Restaurant)
      )

      if (searchQuery && params.city) {
        items = items.filter((r) => r.city === params.city)
      }
      if (searchQuery && params.cuisine) {
        items = items.filter((r) => r.cuisines.includes(params.cuisine!))
      }
      if (params.area) {
        items = items.filter((r) => r.area === params.area)
      }

      items = sortInMemory(items, params.sortBy)

      const pageSize = params.limit ?? DEFAULT_PAGE_SIZE
      const startIndex = 0
      const page = items.slice(startIndex, startIndex + pageSize)
      const hasMore = items.length > startIndex + pageSize

      return {
        data: page,
        hasMore,
        nextCursor: hasMore && page.length > 0 ? page[page.length - 1].id : undefined,
      }
    } catch (e) {
      logError('FirebaseRestaurantSearchRepository.fallbackSearch', e)
      return { data: [], hasMore: false }
    }
  }
}

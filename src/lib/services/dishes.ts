import { cache } from 'react'
import { dishRepository } from '@/lib/repositories'
import { getRelatedDishes as getRelatedDishesFirebase, getAllActiveDishes as getAllActiveDishesFirebase } from '@/lib/firebase/dishes'
import type { SearchFilters } from '@/lib/types'
import { SORT_OPTIONS } from '@/lib/constants'

export const getDish = cache(async (id: string) => {
  return dishRepository.getById(id)
})

export function getDishCount() {
  return dishRepository.getCount()
}

export function getDishComparison(id1: string, id2: string) {
  return dishRepository.compare(id1, id2)
}

export function getTopDishes(limit?: number, city?: string | null) {
  return dishRepository.getTop(limit, city)
}

export function searchDishes(
  searchQuery: string,
  filters?: Partial<SearchFilters>,
  cursor?: string | null
) {
  return dishRepository.search({
    query: searchQuery,
    cuisine: filters?.cuisine ?? null,
    area: filters?.area ?? null,
    dietary: filters?.dietary ?? null,
    priceRange: filters?.priceRange ?? null,
    sortBy: filters?.sortBy ?? SORT_OPTIONS.HIGHEST_RATED,
    cursor: cursor ?? undefined,
  }).then((result) => ({
    items: result.data,
    lastDoc: result.nextCursor ?? null,
    hasMore: result.hasMore,
  }))
}

export function getRelatedDishes(restaurantId: string, excludeId: string, limit?: number) {
  return getRelatedDishesFirebase(restaurantId, excludeId, limit)
}

export function getAllActiveDishes() {
  return getAllActiveDishesFirebase()
}


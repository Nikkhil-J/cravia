import { cache } from 'react'
import { dishRepository, restaurantRepository, restaurantSearchRepository, reviewRepository } from '@/lib/repositories'
import type { DietaryType, Dish, PriceRange, Restaurant, Review, SearchFilters } from '@/lib/types'
import { SORT_OPTIONS } from '@/lib/constants'
import { listCityAreas, resolveCity } from './city'

export interface ListRestaurantsParams {
  city?: string | null
  userCity?: string | null
  area?: string | null
  limit?: number
}

export interface RestaurantCatalogResult {
  city: string
  areas: readonly string[]
  items: Restaurant[]
}

export async function listRestaurants(params?: ListRestaurantsParams): Promise<RestaurantCatalogResult> {
  const city = resolveCity({ requestedCity: params?.city, userCity: params?.userCity })
  const limit = Math.max(1, Math.min(params?.limit ?? 100, 200))
  const area = params?.area?.trim() || null

  const restaurants = await restaurantRepository.getAll(city, limit)
  const items = area ? restaurants.filter((r) => r.area === area) : restaurants

  return {
    city,
    areas: listCityAreas(city),
    items,
  }
}

export type RestaurantSortOption = 'most-reviewed' | 'newest' | 'alphabetical'

export interface SearchRestaurantsParams {
  query?: string | null
  city?: string | null
  userCity?: string | null
  area?: string | null
  cuisine?: string | null
  sortBy?: RestaurantSortOption
  cursorId?: string | null
  limit?: number
}

export interface SearchRestaurantsResult {
  city: string
  areas: readonly string[]
  items: Restaurant[]
  hasMore: boolean
  nextCursorId: string | null
}

export async function searchRestaurants(params?: SearchRestaurantsParams): Promise<SearchRestaurantsResult> {
  const city = resolveCity({ requestedCity: params?.city, userCity: params?.userCity })
  const area = params?.area?.trim() || null
  const queryText = params?.query?.trim() ?? ''
  const result = await restaurantSearchRepository.search({
    query: queryText,
    city,
    cuisine: params?.cuisine ?? null,
    area,
    sortBy: params?.sortBy ?? 'most-reviewed',
    cursor: params?.cursorId ?? undefined,
    limit: params?.limit,
  })

  return {
    city,
    areas: listCityAreas(city),
    items: result.data,
    hasMore: result.hasMore,
    nextCursorId: result.nextCursor ?? null,
  }
}

export const getRestaurantDetails = cache(async (restaurantId: string): Promise<Restaurant | null> => {
  return restaurantRepository.getById(restaurantId)
})

export async function listRestaurantDishes(restaurantId: string): Promise<Dish[]> {
  return dishRepository.getByRestaurant(restaurantId)
}

export interface SearchDishesParams {
  query?: string | null
  city?: string | null
  userCity?: string | null
  area?: string | null
  cuisine?: string | null
  dietary?: DietaryType | null
  priceRange?: PriceRange | null
  sortBy?: SearchFilters['sortBy'] | 'needs-review'
  maxReviewCount?: number | null
  cursorId?: string | null
}

export interface SearchDishesResult {
  city: string
  areas: readonly string[]
  items: Dish[]
  hasMore: boolean
  nextCursorId: string | null
}

export async function listDishes(params?: SearchDishesParams): Promise<SearchDishesResult> {
  const city = resolveCity({ requestedCity: params?.city, userCity: params?.userCity })
  const area = params?.area?.trim() || null
  const queryText = params?.query?.trim() ?? ''
  const sortBy = params?.sortBy === 'needs-review' ? SORT_OPTIONS.NEWEST : (params?.sortBy ?? SORT_OPTIONS.HIGHEST_RATED)
  const result = await dishRepository.search({
    query: queryText,
    city,
    cuisine: params?.cuisine ?? null,
    area,
    dietary: params?.dietary ?? null,
    priceRange: params?.priceRange ?? null,
    sortBy,
    maxReviewCount: params?.maxReviewCount ?? undefined,
    cursor: params?.cursorId ?? undefined,
  })

  let items = result.data
  if (params?.sortBy === 'needs-review') {
    items = [...items].sort((a, b) => a.reviewCount - b.reviewCount || new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime())
  }

  return {
    city,
    areas: listCityAreas(city),
    items,
    hasMore: result.hasMore,
    nextCursorId: result.nextCursor ?? null,
  }
}

export interface DishReviewsResult {
  items: Review[]
  hasMore: boolean
  nextCursorId: string | null
}

export const listDishReviews = cache(async (dishId: string, cursorId?: string | null): Promise<DishReviewsResult> => {
  const result = await reviewRepository.getMany({ dishId, cursor: cursorId ?? undefined })
  return {
    items: result.data,
    hasMore: result.hasMore,
    nextCursorId: result.nextCursor ?? null,
  }
})


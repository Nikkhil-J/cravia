import type { Restaurant } from '@/lib/types'
import type { PaginatedData } from './dishRepository'

export interface GetRestaurantsParams {
  query?: string
  city?: string | null
  area?: string | null
  cuisine?: string | null
  limit?: number
  cursor?: string
}

export interface RestaurantSearchRepository {
  search(params: GetRestaurantsParams): Promise<PaginatedData<Restaurant>>
}

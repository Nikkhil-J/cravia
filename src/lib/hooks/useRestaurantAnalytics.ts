import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { API_ENDPOINTS } from '@/lib/constants/api'
import type { RestaurantAnalytics } from '@/lib/services/restaurant-analytics'

export class ForbiddenError extends Error {
  constructor() {
    super('Forbidden')
    this.name = 'ForbiddenError'
  }
}

export function useRestaurantAnalytics(restaurantId: string | null) {
  const { authUser } = useAuth()

  return useQuery<RestaurantAnalytics>({
    queryKey: ['restaurant-analytics', restaurantId],
    queryFn: async () => {
      const token = await authUser!.getIdToken()
      const res = await fetch(
        API_ENDPOINTS.restaurantAnalytics(encodeURIComponent(restaurantId!)),
        { headers: { authorization: `Bearer ${token}` } },
      )

      if (res.status === 403) throw new ForbiddenError()
      if (!res.ok) throw new Error('Failed to fetch analytics')

      return res.json()
    },
    enabled: !!restaurantId && !!authUser,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ForbiddenError) return false
      return failureCount < 3
    },
  })
}

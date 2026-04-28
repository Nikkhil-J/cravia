'use client'

import { useEffect } from 'react'
import { trackRecentlyViewed, type RecentDishEntry } from '@/lib/utils/recently-viewed'

export function TrackDishView({ dish }: { dish: RecentDishEntry }) {
  useEffect(() => {
    trackRecentlyViewed(dish)
  }, [dish])

  return null
}

'use client'

import { useEffect, useState } from 'react'
import { getDish } from '@/lib/firebase/dishes'
import type { Review } from '@/lib/types'

export type ReviewDishContext = { dishName: string; restaurantName: string }

/**
 * Resolves restaurant + dish labels for a list of reviews (e.g. profile pages).
 * Reviews with denormalized dishName/restaurantName are used directly;
 * older reviews without these fields fall back to individual getDish() reads.
 */
export function useReviewDishContexts(reviews: Review[]) {
  const [map, setMap] = useState<Record<string, ReviewDishContext>>({})

  const dishIdsKey = reviews.map((r) => r.dishId).join('\0')

  useEffect(() => {
    if (!dishIdsKey) {
      setMap({})
      return
    }

    const withFields = reviews.filter((r) => r.dishName && r.restaurantName)
    const missingFields = reviews.filter((r) => !r.dishName || !r.restaurantName)

    const fromDenormalized: Record<string, ReviewDishContext> = {}
    for (const r of withFields) {
      fromDenormalized[r.dishId] = { dishName: r.dishName!, restaurantName: r.restaurantName! }
    }

    if (missingFields.length === 0) {
      setMap(fromDenormalized)
      return
    }

    const uniqueDishIds = [...new Set(missingFields.map((r) => r.dishId))]
    let cancelled = false
    void Promise.all(uniqueDishIds.map((id) => getDish(id))).then((dishes) => {
      if (cancelled) return
      const fromFirestore: Record<string, ReviewDishContext> = {}
      for (const d of dishes) {
        if (d) {
          fromFirestore[d.id] = { dishName: d.name, restaurantName: d.restaurantName }
        }
      }
      setMap({ ...fromDenormalized, ...fromFirestore })
    })
    return () => {
      cancelled = true
    }
  }, [dishIdsKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return map
}

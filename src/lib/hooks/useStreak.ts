'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { API_ENDPOINTS } from '@/lib/constants/api'

interface StreakData {
  currentStreak: number
  bonusEligible: boolean
}

export function useStreak(): StreakData {
  const authUser = useAuthStore((s) => s.authUser)
  const [streak, setStreak] = useState(0)
  const [bonusEligible, setBonusEligible] = useState(false)

  useEffect(() => {
    if (!authUser) return
    let cancelled = false
    authUser.getIdToken().then(async (token) => {
      const res = await fetch(API_ENDPOINTS.USER_STREAK, {
        headers: { authorization: `Bearer ${token}` },
      })
      if (!res.ok || cancelled) return
      const data = await res.json()
      setStreak(data.currentStreak ?? 0)
      setBonusEligible(data.bonusEligible ?? false)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [authUser])

  return { currentStreak: streak, bonusEligible }
}

'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useStreak } from '@/lib/hooks/useStreak'

interface StreakCTAProps {
  /** @deprecated dishId is no longer used — will be removed in a future cleanup */
  dishId?: string
}

export function StreakCTA(_props: StreakCTAProps) {
  const { user } = useAuth()
  const { currentStreak: streak, bonusEligible } = useStreak()

  if (!user || streak === 0) return null

  if (streak >= 14 && bonusEligible) {
    return (
      <p className="text-sm font-bold text-destructive">
        🔥 {streak}-day streak at risk! You&apos;re this close to a double-bonus day — don&apos;t break it now
      </p>
    )
  }

  if (streak >= 7 && bonusEligible) {
    return (
      <p className="text-sm font-medium text-destructive">
        Don&apos;t lose your streak — review today to keep your 2x bonus
      </p>
    )
  }

  if (streak >= 2) {
    return (
      <p className="text-sm font-medium text-brand-orange">
        🔥 {streak}-day streak — review today for 2x points
      </p>
    )
  }

  return null
}

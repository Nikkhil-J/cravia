'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useStreak } from '@/lib/hooks/useStreak'
import { LEVEL_THRESHOLDS } from '@/lib/constants'
import type { UserLevel } from '@/lib/types'
import { ROUTES } from '@/lib/constants/routes'
import { Reveal } from '@/components/ui/AnimateReveal'

const NEXT_LEVEL: Record<UserLevel, UserLevel | null> = {
  Newbie: 'Foodie',
  Foodie: 'Critic',
  Critic: 'Legend',
  Legend: null,
}

interface BannerStat {
  num: string | number
  label: string
}

export function PersonalStatsBanner() {
  const { user, isLoading } = useAuth()
  const { currentStreak: streak } = useStreak()

  // AppLoader keeps the screen hidden while auth resolves, so no space
  // reservation is needed — return null and let the banner appear naturally.
  if (isLoading) return null

  // Confirmed logged-out or user has no reviews — no banner, no reserved space.
  if (!user || user.reviewCount < 1) return null

  const nextLevel = NEXT_LEVEL[user.level]
  const nextThreshold = nextLevel ? LEVEL_THRESHOLDS[nextLevel].min : null
  const reviewsRemaining = nextThreshold ? nextThreshold - user.reviewCount : 0
  const isLegend = user.level === 'Legend'

  const title = isLegend ? "You've reached the top. 👑" : "You're on a roll! 🔥"
  const sub = isLegend
    ? "You're a Legend — keep the reviews coming."
    : `${reviewsRemaining} review${reviewsRemaining !== 1 ? 's' : ''} to reach ${nextLevel}. Keep going!`

  const stats: BannerStat[] = [
    { num: user.reviewCount, label: 'Reviews' },
    { num: user.helpfulVotesReceived, label: 'Helpful' },
    { num: user.badges.length, label: 'Badges' },
    { num: user.dishPointsBalance ?? 0, label: 'Crumbs' },
  ]
  if (streak > 0) stats.push({ num: `🔥 ${streak}`, label: 'Streak' })

  return (
    <section className="mx-auto mt-8 max-w-[1200px] px-6 sm:px-8">
      <Reveal from="scale">
        <div className="flex flex-wrap items-center gap-5 rounded-3xl bg-gradient-to-br from-primary to-brand-orange p-7 text-white shadow-lg">
          <div className="min-w-[200px] flex-1">
            <p className="font-display text-xl font-bold leading-tight">
              {title}
            </p>
            <p className="mt-1 text-sm text-white/80">{sub}</p>
          </div>

          <div className="flex flex-wrap gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl font-bold leading-none">
                  {stat.num}
                </div>
                <div className="mt-1 text-[11px] text-white/70">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <Link
            href={ROUTES.MY_PROFILE}
            className="inline-flex min-h-[44px] items-center justify-center rounded-pill bg-white px-6 py-2.5 text-sm font-bold text-primary transition-transform hover:-translate-y-0.5"
          >
            View profile
          </Link>
        </div>
      </Reveal>
    </section>
  )
}

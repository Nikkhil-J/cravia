'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useStreak } from '@/lib/hooks/useStreak'
import { LEVEL_THRESHOLDS } from '@/lib/constants'
import type { UserLevel } from '@/lib/types'
import { ROUTES } from '@/lib/constants/routes'

const NEXT_LEVEL: Record<UserLevel, UserLevel | null> = {
  Newbie: 'Foodie',
  Foodie: 'Critic',
  Critic: 'Legend',
  Legend: null,
}

export function PersonalStatsBanner() {
  const { user } = useAuth()
  const { currentStreak: streak } = useStreak()
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (!user || user.reviewCount < 1) return
    const id = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(id)
  }, [user])

  if (!user || user.reviewCount < 1) return null

  const nextLevel = NEXT_LEVEL[user.level]
  const threshold = LEVEL_THRESHOLDS[user.level]
  const nextThreshold = nextLevel ? LEVEL_THRESHOLDS[nextLevel].min : null
  const progress = nextThreshold
    ? Math.min(100, ((user.reviewCount - threshold.min) / (nextThreshold - threshold.min)) * 100)
    : 100
  const reviewsRemaining = nextThreshold ? nextThreshold - user.reviewCount : 0
  const isLegend = user.level === 'Legend'

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-primary to-brand-orange px-4 py-3 sm:px-6 sm:py-4">
      {/* Depth overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 50% 120% at 0% 50%, rgba(0,0,0,0.15), transparent)',
            'radial-gradient(ellipse 50% 120% at 100% 50%, rgba(255,255,255,0.06), transparent)',
          ].join(', '),
        }}
      />

      {/* Single shimmer gleam on entrance */}
      {animate && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
            animation: 'banner-gleam 0.8s 0.3s ease-out both',
          }}
        />
      )}

      <div
        className="relative mx-auto flex max-w-[1200px] flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6"
        style={{
          opacity: animate ? 1 : 0,
          transform: animate ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
        }}
      >
        {/* Left: progress */}
        <div
          className="w-full flex-1 sm:min-w-[220px]"
          style={{
            opacity: animate ? 1 : 0,
            transform: animate ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.5s ease-out 0.1s, transform 0.5s ease-out 0.1s',
          }}
        >
          {isLegend ? (
            <p className="font-display text-base font-bold text-white">
              You&apos;ve reached the top. You&apos;re a Legend. 👑
            </p>
          ) : (
            <div className="space-y-1.5">
              <p className="text-xs text-white/60">
                Your progress
              </p>
              <p className="flex items-center gap-1.5 text-[15px] font-semibold text-white">
                <span>{reviewsRemaining} review{reviewsRemaining !== 1 ? 's' : ''} to reach</span>
                <span
                  className="inline-flex rounded-full border border-white/25 bg-black/20 px-2.5 py-0.5 text-xs font-bold leading-none text-white"
                >
                  {nextLevel}
                </span>
              </p>
              <div className="h-1.5 max-w-[60%] overflow-hidden rounded-full bg-black/20 sm:max-w-[40%]">
                <div
                  className="h-full rounded-full bg-white"
                  style={{
                    width: animate ? `${progress}%` : '0%',
                    transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s',
                  }}
                />
              </div>
              <p className="text-xs text-white/50">
                currently {user.level} · {user.reviewCount} review{user.reviewCount !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Right: stats + profile link */}
        <div
          className="flex items-center gap-3 sm:gap-5"
          style={{
            opacity: animate ? 1 : 0,
            transform: animate ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.5s ease-out 0.2s, transform 0.5s ease-out 0.2s',
          }}
        >
          <div className="text-center">
            <div className="font-display text-xl font-bold text-white">{user.reviewCount}</div>
            <div className="text-xs text-white/60">Reviews</div>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center">
            <div className="font-display text-xl font-bold text-white">{user.badges.length}</div>
            <div className="text-xs text-white/60">Badges</div>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center">
            <div className="font-display text-xl font-bold text-white">{user.dishPointsBalance ?? 0}</div>
            <div className="text-xs text-white/60">DishPoints</div>
          </div>
          {streak > 0 && (
            <>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center">
                <div className="font-display text-xl font-bold text-white">🔥 {streak}</div>
                <div className="text-xs text-white/60">Streak</div>
              </div>
            </>
          )}
          {user.helpfulVotesReceived > 0 && (
            <>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center">
                <div className="font-display text-xl font-bold text-white">{user.helpfulVotesReceived}</div>
                <div className="text-xs text-white/60">Helpful</div>
              </div>
            </>
          )}
          <div className="h-8 w-px bg-white/20" />
          <Link
            href={ROUTES.MY_PROFILE}
            className="inline-flex min-h-[44px] items-center rounded-pill border border-white/30 bg-white/15 px-4 py-1.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/25"
          >
            View profile
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes banner-gleam {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
      `}</style>
    </section>
  )
}

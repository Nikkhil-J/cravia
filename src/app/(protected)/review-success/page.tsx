'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { DEFAULT_COUPON_POINTS_COST } from '@/lib/types/rewards'
import type { BadgeDefinition, Dish } from '@/lib/types'
import { ROUTES } from '@/lib/constants/routes'
import { API_ENDPOINTS } from '@/lib/constants/api'
import { formatRating } from '@/lib/utils/index'
import { getCuisineEmoji } from '@/lib/utils/dish-display'

interface SuccessData {
  dishId: string
  dishName: string
  restaurantName: string
  restaurantId?: string
  newBadges: BadgeDefinition[]
  newReviewCount: number
  pointsAwarded: number
  newBalance: number
  isFullReview: boolean
  helpfulVotesReceived?: number
  currentStreak?: number
}

function readSuccessData(): SuccessData | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem('reviewSuccess')
  if (!raw) return null
  try {
    return JSON.parse(raw) as SuccessData
  } catch {
    return null
  }
}

export default function ReviewSuccessPage() {
  const router = useRouter()
  const [data] = useState<SuccessData | null>(readSuccessData)
  const [relatedDishes, setRelatedDishes] = useState<Dish[]>([])

  useEffect(() => {
    if (data) {
      sessionStorage.removeItem('reviewSuccess')
    } else {
      router.replace(ROUTES.HOME)
    }
  }, [data, router])

  useEffect(() => {
    if (!data?.restaurantId) return
    let cancelled = false
    fetch(API_ENDPOINTS.restaurantDishes(encodeURIComponent(data.restaurantId)))
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled || !json) return
        const items: Dish[] = json.items ?? json ?? []
        setRelatedDishes(items.filter((d) => d.id !== data.dishId).slice(0, 4))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [data?.restaurantId, data?.dishId])

  if (!data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const progressPercent = Math.min((data.newBalance / DEFAULT_COUPON_POINTS_COST) * 100, 100)
  const pointsRemaining = Math.max(DEFAULT_COUPON_POINTS_COST - data.newBalance, 0)
  const hasBothCards = data.pointsAwarded > 0 && data.newBadges && data.newBadges.length > 0
  const streak = data.currentStreak ?? 0
  const helpfulVotes = data.helpfulVotesReceived ?? 0

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-start px-4 py-10 text-center sm:px-6 sm:py-16 md:max-w-2xl md:items-center md:py-12">
      <div className="w-full animate-pop-in md:rounded-2xl md:border md:border-border/50 md:bg-card md:px-10 md:py-10 md:shadow-lg">
        <div className="text-5xl sm:text-6xl">🎉</div>
        <h1 className="mt-4 font-display text-2xl font-bold text-heading sm:mt-5 sm:text-3xl md:text-4xl">Review Published!</h1>
        <p className="mt-3 text-text-secondary">
          Your review for <strong className="text-heading">{data.dishName}</strong> at{' '}
          <strong className="text-heading">{data.restaurantName}</strong> is now live.
        </p>

        {/* 1. Points + Badge cards */}
        <div className={`mt-6 grid grid-cols-1 gap-6 text-center ${hasBothCards ? 'md:grid-cols-2 md:text-left' : ''}`}>
          {data.pointsAwarded > 0 && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <p className="font-display text-2xl font-bold text-primary">
                +{data.pointsAwarded} DishPoints
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                {data.isFullReview
                  ? 'Full review bonus: photo + tags + detailed text'
                  : 'Keep adding photos, tags, and longer text for more points!'}
              </p>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>{data.newBalance} / {DEFAULT_COUPON_POINTS_COST}</span>
                  <span>Next coupon</span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {pointsRemaining > 0 ? (
                  <p className="mt-2 text-xs text-text-secondary">
                    {pointsRemaining} more points to your next coupon
                  </p>
                ) : (
                  <p className="mt-2 text-xs font-semibold text-primary">
                    You can redeem a coupon now!
                  </p>
                )}
              </div>
            </div>
          )}

          {data.newBadges && data.newBadges.length > 0 && (
            <div className="rounded-xl border border-brand-gold bg-brand-gold-light p-6">
              <p className="font-display text-sm font-bold text-brand-gold">
                New Badge{data.newBadges.length > 1 ? 's' : ''} Earned!
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                {data.newBadges.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center gap-1.5 rounded-lg bg-card px-5 py-3 shadow-sm">
                    <span className="text-3xl">{badge.icon}</span>
                    <span className="font-display text-xs font-bold text-heading">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Streak status */}
        {streak >= 2 && (
          <div className="mt-6 rounded-lg bg-brand-orange/10 px-4 py-3">
            {streak >= 14 ? (
              <p className="text-sm font-bold text-destructive">
                🔥 {streak}-day streak at risk! Don&apos;t break it now.
              </p>
            ) : streak >= 7 ? (
              <p className="text-sm font-medium text-destructive">
                Don&apos;t lose your streak — review again tomorrow.
              </p>
            ) : (
              <p className="text-sm font-medium text-brand-orange">
                🔥 {streak}-day streak! Come back tomorrow to keep it going.
              </p>
            )}
          </div>
        )}

        {/* 3. Social impact */}
        {helpfulVotes > 0 && (
          <div className="mt-4 rounded-lg bg-brand-orange/10 px-4 py-3">
            <p className="text-sm font-medium text-brand-orange">
              Your reviews have helped {helpfulVotes} people decide what to order
            </p>
          </div>
        )}

        {/* Stats row */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-center">
          <div>
            <span className="font-display text-lg font-bold text-primary">{data.newReviewCount}</span>
            <p className="text-xs text-text-muted">review{data.newReviewCount !== 1 ? 's' : ''} total</p>
          </div>
          {helpfulVotes > 0 && (
            <>
              <div className="h-8 w-px bg-border" />
              <div>
                <span className="font-display text-lg font-bold text-brand-gold">{helpfulVotes}</span>
                <p className="text-xs text-text-muted">people found your reviews helpful</p>
              </div>
            </>
          )}
        </div>

        <p className="mt-4 text-xs text-text-muted">
          You can edit this review within 24 hours of posting.
        </p>

        {/* 4. CTA buttons */}
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href={ROUTES.WRITE_REVIEW}
            className="w-full rounded-pill bg-primary py-3 text-center text-sm font-semibold text-white transition-all hover:bg-primary-dark hover:shadow-glow"
          >
            {streak >= 2 ? 'Keep the streak going' : 'Review another dish'}
          </Link>
          <Link
            href={ROUTES.dish(data.dishId)}
            className="w-full rounded-pill border-2 border-border py-3 text-center text-sm font-semibold text-text-primary transition-colors hover:border-primary hover:text-primary"
          >
            View your review
          </Link>
        </div>

        {/* 5. Related dish row */}
        {relatedDishes.length > 0 && data.restaurantId && (
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-sm font-semibold text-text-primary">
              Had more here? Review another dish
            </p>
            <div className="mt-3 space-y-2">
              {relatedDishes.map((dish) => (
                <Link
                  key={dish.id}
                  href={`${ROUTES.WRITE_REVIEW}?dishId=${dish.id}&restaurantId=${data.restaurantId}&dishName=${encodeURIComponent(dish.name)}&restaurantName=${encodeURIComponent(data.restaurantName)}`}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/30 hover:shadow-sm"
                >
                  {dish.coverImage ? (
                    <Image
                      src={dish.coverImage}
                      alt={dish.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xl">
                      {getCuisineEmoji(dish.cuisines?.[0])}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-semibold text-heading line-clamp-1">{dish.name}</p>
                    <p className="text-xs text-text-muted">{dish.restaurantName}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-brand-gold">
                    ★ {formatRating(dish.avgOverall)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

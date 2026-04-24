'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Star, Gift, Settings, ChevronRight } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useMyReviews } from '@/lib/hooks/useMyReviews'
import { BADGE_DEFINITIONS, LEVEL_THRESHOLDS } from '@/lib/constants'
import { ReviewCardV2 } from '@/components/features/ReviewCardV2'
import { useReviewDishContexts } from '@/lib/hooks/useReviewDishContexts'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/button'
import type { Review } from '@/lib/types'
import { ROUTES } from '@/lib/constants/routes'
import { API_ENDPOINTS } from '@/lib/constants/api'
import { CLIENT_ERRORS } from '@/lib/constants/errors'

const QUICK_LINKS = [
  { label: 'Wishlist', desc: 'Saved dishes', icon: Star, href: ROUTES.WISHLIST },
  { label: 'Rewards', desc: 'DishPoints available', icon: Gift, href: ROUTES.REWARDS },
  { label: 'Settings', desc: 'Profile, preferences', icon: Settings, href: ROUTES.SETTINGS },
] as const

export default function MyProfilePage() {
  const { user, authUser } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: reviews = [], isLoading: loading } = useMyReviews()
  const dishContexts = useReviewDishContexts(reviews)

  function handleEdit(review: Review) {
    const ctx = dishContexts[review.dishId]
    const params = new URLSearchParams({
      dishId: review.dishId,
      restaurantId: review.restaurantId,
      editReviewId: review.id,
      ...(ctx ? { dishName: ctx.dishName, restaurantName: ctx.restaurantName } : {}),
    })
    router.push(ROUTES.writeReviewForDish(params.toString()))
  }

  async function handleDelete(review: Review) {
    if (!user || !authUser) return
    const token = await authUser.getIdToken()
    const confirmed = window.confirm('Delete this review? This cannot be undone.')
    if (!confirmed) return

    try {
      const res = await fetch(`${API_ENDPOINTS.review(encodeURIComponent(review.id))}?dishId=${encodeURIComponent(review.dishId)}`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(CLIENT_ERRORS.DELETE_FAILED)
      await queryClient.invalidateQueries({ queryKey: ['my-reviews'] })
    } catch {
      alert('Failed to delete review. Please try again.')
    }
  }

  if (!user) return null

  const levelThreshold = LEVEL_THRESHOLDS[user.level]
  const nextLevel = user.level === 'Legend' ? null
    : user.level === 'Critic' ? 'Legend'
    : user.level === 'Foodie' ? 'Critic'
    : 'Foodie'
  const nextThreshold = nextLevel ? LEVEL_THRESHOLDS[nextLevel].min : null
  const progress = nextThreshold
    ? Math.min(100, ((user.reviewCount - levelThreshold.min) / (nextThreshold - levelThreshold.min)) * 100)
    : 100

  const earnedBadges = BADGE_DEFINITIONS.filter((b) => user.badges.includes(b.id))
  const allBadges = BADGE_DEFINITIONS.map((b) => ({
    ...b,
    earned: user.badges.includes(b.id),
  }))

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })

  const stats = [
    { label: 'Reviews', value: user.reviewCount },
    { label: 'Helpful', value: user.helpfulVotesReceived },
    { label: 'Badges', value: earnedBadges.length },
    { label: 'Points', value: user.dishPointsBalance },
  ]

  return (
    <div className="mx-auto max-w-[1080px] px-4 pb-20 sm:px-6">
      {/* ── Hero Banner ─────────────────────────────────── */}
      <div className="rounded-b-xl border border-t-0 border-border bg-card p-6 sm:p-8"
        style={{
          backgroundImage: [
            'radial-gradient(ellipse 60% 120% at 10% 50%, var(--color-primary-light), transparent)',
            'radial-gradient(ellipse 50% 100% at 90% 30%, color-mix(in srgb, var(--color-brand-orange) 8%, transparent), transparent)',
          ].join(', '),
        }}
      >
        {/* Top row: avatar + info + actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border-[3px] border-background bg-gradient-to-br from-primary to-brand-orange shadow-glow">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt={user.displayName} width={72} height={72} className="rounded-full object-cover" />
            ) : (
              <span className="font-display text-[26px] font-extrabold text-white">
                {user.displayName[0]?.toUpperCase()}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[22px] font-extrabold tracking-tight text-heading">
              {user.displayName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px]">
              <span className="text-text-muted">{user.city || 'Bengaluru'}</span>
              <span className="text-border">·</span>
              <span className="inline-flex items-center gap-1 rounded-pill border border-brand-gold/15 bg-brand-gold-light px-2.5 py-0.5 text-[11px] font-bold text-brand-gold">
                ⭐ {user.level}
              </span>
              <span className="text-border">·</span>
              <span className="text-xs text-text-muted">Member since {memberSince}</span>
            </div>
          </div>

          <div className="flex w-full shrink-0 gap-2 sm:w-auto">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-initial" render={<Link href={ROUTES.SETTINGS} />}>
              Edit Profile
            </Button>
            <Button size="sm" render={<Link href={ROUTES.WRITE_REVIEW} />}
              className="flex-1 bg-gradient-to-r from-primary to-brand-orange text-white shadow-sm hover:opacity-90 sm:flex-initial"
            >
              ✍️ Write Review
            </Button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-4 grid grid-cols-4 gap-1.5 border-t border-border pt-4 sm:mt-5 sm:gap-2 sm:pt-5">
          {stats.map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-border bg-surface-2 py-2 text-center sm:py-2.5">
              <div className="font-display text-base font-extrabold leading-none text-heading sm:text-xl">{value}</div>
              <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-text-muted sm:text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Dashboard Grid ──────────────────────────────── */}
      <div className="mt-7 grid grid-cols-1 items-start gap-6 md:grid-cols-[1fr_280px]">

        {/* ── Main: Reviews ───────────────────────────── */}
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <h2 className="font-display text-[17px] font-extrabold text-heading">My Reviews</h2>
            <span className="text-xs font-medium text-text-muted">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="mt-8 flex justify-center"><LoadingSpinner /></div>
          ) : reviews.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon="📝"
                title="No reviews yet"
                description="Write your first review to get started."
                ctaLabel="Explore dishes"
                ctaHref={ROUTES.EXPLORE}
              />
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {reviews.map((review) => (
                <ReviewCardV2
                  key={review.id}
                  review={review}
                  variant="profile"
                  currentUserId={user.id}
                  dishContext={dishContexts[review.dishId] ?? null}
                  onEdit={() => handleEdit(review)}
                  onDelete={() => handleDelete(review)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Sidebar ─────────────────────────────────── */}
        <div className="flex flex-col gap-3.5 md:sticky md:top-20 md:order-none max-md:order-last">

          {/* Level progress */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="font-display text-[13px] font-bold text-heading">Level Progress</span>
              <span className="text-[11px] font-semibold text-brand-orange">
                {nextLevel ? `${nextThreshold! - user.reviewCount} more to ${nextLevel}` : 'Max level!'}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-brand-orange transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-text-muted">
              <span>{user.reviewCount}{nextThreshold ? ` / ${nextThreshold}` : ''} reviews</span>
              {nextLevel && <span>{nextLevel}</span>}
            </div>
          </div>

          {/* Badges */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-[13px] font-bold text-heading">Badges</span>
              <span className="text-[11px] text-text-muted">{earnedBadges.length} / {BADGE_DEFINITIONS.length}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {allBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`rounded-lg bg-surface-2 py-2.5 text-center transition-all ${
                    badge.earned
                      ? 'border border-border bg-card hover:-translate-y-0.5 hover:shadow-md'
                      : 'opacity-30'
                  }`}
                >
                  <div className="text-xl leading-none">{badge.earned ? badge.icon : '🔒'}</div>
                  <div className="mt-1.5 text-[10px] font-semibold text-text-muted sm:text-xs">
                    {badge.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {QUICK_LINKS.map(({ label, desc, icon: Icon, href }) => (
              <Link
                key={label}
                href={href}
                className="group flex items-center gap-3 border-b border-border px-3.5 py-3 transition-colors last:border-b-0 hover:bg-surface-2"
              >
                <div className="flex size-[34px] shrink-0 items-center justify-center rounded-lg bg-surface-2 transition-colors group-hover:bg-surface-3">
                  <Icon className="size-[15px] text-text-muted" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-text-primary">{label}</div>
                  <div className="text-[10px] text-text-muted">{desc}</div>
                </div>
                <ChevronRight className="size-4 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-text-secondary" />
              </Link>
            ))}
          </div>

          {/* Premium upsell — only show to non-premium */}
          {!user.isPremium && (
            <div className="rounded-xl border border-border bg-card p-4"
              style={{
                backgroundImage: 'radial-gradient(ellipse 80% 100% at 20% 0%, var(--color-primary-light), transparent)',
              }}
            >
              <div className="font-display text-[13px] font-bold text-heading">Upgrade to Premium</div>
              <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
                Unlock advanced filters, dish comparison, and exclusive badges.
              </p>
              <Button
                variant="link"
                size="sm"
                render={<Link href={ROUTES.UPGRADE} />}
                className="mt-2 h-auto min-h-0 p-0 text-xs font-semibold text-primary"
              >
                Learn more →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { getUser } from '@/lib/services/users'
import { getReviewsByUser } from '@/lib/services/reviews'
import { BADGE_DEFINITIONS, CITY_DISPLAY_NAME } from '@/lib/constants'
import type { City } from '@/lib/constants'
import { ReviewCardV2 } from '@/components/features/ReviewCardV2'
import { useReviewDishContexts } from '@/lib/hooks/useReviewDishContexts'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { MobileBackButton } from '@/components/ui/MobileBackButton'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import type { User, Review } from '@/lib/types'
import { Reveal } from '@/components/ui/AnimateReveal'

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState<User | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const dishContexts = useReviewDishContexts(reviews)

  useEffect(() => {
    if (!userId) return
    Promise.all([getUser(userId), getReviewsByUser(userId)])
      .then(([u, r]) => {
        setProfile(u)
        setReviews(r.items)
      })
      .catch(() => {
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [userId, retryCount])

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>
  if (error) return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <p className="text-text-secondary">Couldn&apos;t load this profile. Try again.</p>
      <Button
        onClick={() => {
          setLoading(true)
          setError(false)
          setRetryCount((c) => c + 1)
        }}
        className="rounded-pill px-6 font-semibold hover:bg-primary-dark"
      >
        Retry
      </Button>
    </div>
  )
  if (!profile) return <div className="py-20 text-center text-text-muted">User not found.</div>

  const earnedBadges = BADGE_DEFINITIONS.filter((b) => profile.badges.includes(b.id))

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <MobileBackButton />
      <div className="flex items-center gap-3 sm:gap-4">
        {profile.avatarUrl ? (
          <Image src={profile.avatarUrl} alt={profile.displayName} width={72} height={72} className="h-14 w-14 rounded-full object-cover sm:h-[72px] sm:w-[72px]" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-xl font-bold text-primary sm:h-[72px] sm:w-[72px] sm:text-2xl">
            {profile.displayName[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="font-display text-lg font-bold text-heading sm:text-xl">{profile.displayName}</h1>
          <p className="text-sm text-text-muted">{CITY_DISPLAY_NAME[profile.city as City] ?? profile.city ?? 'Gurugram'}</p>
          <span className="mt-1 inline-block rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-semibold text-primary-dark">
            {profile.level}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
        {[
          { label: 'Reviews', value: profile.reviewCount },
          { label: 'Helpful votes', value: profile.helpfulVotesReceived },
          { label: 'Badges', value: earnedBadges.length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-bg-cream p-3 text-center sm:p-4">
            <p className="font-display text-xl font-bold text-heading sm:text-2xl">{value}</p>
            <p className="text-[10px] text-text-muted sm:text-xs">{label}</p>
          </div>
        ))}
      </div>

      {earnedBadges.length > 0 && (
        <Reveal className="mt-6">
          <h2 className="text-sm font-semibold text-text-primary">Badges</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {earnedBadges.map((badge) => (
              <div key={badge.id} title={badge.description} className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs">
                <span>{badge.icon}</span>
                <span className="font-medium text-text-primary">{badge.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      <Reveal className="mt-8">
        <h2 className="font-display text-lg font-semibold text-heading">Reviews</h2>
        {reviews.length === 0 ? (
          <EmptyState icon="📝" title="No reviews yet" description="This user hasn't reviewed anything yet." />
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {reviews.map((review) => (
              <ReviewCardV2
                key={review.id}
                review={review}
                variant="profile"
                currentUserId={currentUser?.id}
                dishContext={dishContexts[review.dishId] ?? null}
              />
            ))}
          </div>
        )}
      </Reveal>
    </div>
  )
}

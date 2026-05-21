'use client'

import { useCallback, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Review } from '@/lib/types'
import { canEditReview, computeOverall, formatRelativeTime, formatRating } from '@/lib/utils/index'
import { getOptimizedImageUrl } from '@/lib/utils/image'
import { LEVEL_COLORS } from '@/lib/constants'
import { useAuth } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2 } from 'lucide-react'
import { API_ENDPOINTS } from '@/lib/constants/api'
import { CLIENT_ERRORS } from '@/lib/constants/errors'

type ReviewCardVariant = 'profile' | 'dish'

interface ReviewCardV2Props {
  review: Review
  variant: ReviewCardVariant
  currentUserId?: string
  onEdit?: () => void
  onDelete?: () => void
  dishContext?: { dishName: string; restaurantName: string } | null
  index?: number
}

const MAX_VISIBLE_TAGS = 4
const TEXT_CLAMP_LENGTH = 140

function SubRatingPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-baseline gap-1 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-[11px]">
      <span className="text-text-muted">{label}</span>
      <span className="font-bold tabular-nums text-brand-orange">{formatRating(value)}</span>
    </span>
  )
}

function ScoreBadge({ score, className }: { score: number; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-0.5 rounded-md bg-gradient-to-br from-primary to-brand-orange px-2.5 py-1 text-[13px] font-extrabold leading-none text-white shadow-sm',
        className,
      )}
    >
      {formatRating(score)}
      <span className="text-[10px] font-medium opacity-70">/5</span>
    </span>
  )
}

function VerifiedBillBadge({ className }: { className?: string }) {
  return (
    <span
      title="This reviewer uploaded a bill as proof of visit"
      className={cn(
        'inline-flex w-fit shrink-0 items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success',
        className,
      )}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
      Verified visit
    </span>
  )
}

export function ReviewCardV2({
  review,
  variant,
  currentUserId,
  onEdit,
  onDelete,
  dishContext,
  index = 0,
}: ReviewCardV2Props) {
  const { authUser } = useAuth()
  const [photoExpanded, setPhotoExpanded] = useState(false)
  const [textExpanded, setTextExpanded] = useState(false)

  const [hasVoted, setHasVoted] = useState(
    currentUserId ? review.helpfulVotedBy.includes(currentUserId) : false,
  )
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulVotes)
  const [isBursting, setIsBursting] = useState(false)
  const [flagged, setFlagged] = useState(review.isFlagged)

  const isOwn = currentUserId === review.userId
  const canEdit = isOwn && canEditReview(review.createdAt)
  const overallScore = computeOverall(review.tasteRating, review.portionRating, review.valueRating)
  const hasExpandableText = review.text !== null && review.text.length > TEXT_CLAMP_LENGTH

  const levelColorClass =
    LEVEL_COLORS[review.userLevel as keyof typeof LEVEL_COLORS] ?? 'bg-border text-text-secondary'

  const initials = review.userName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const visibleTags = review.tags.slice(0, MAX_VISIBLE_TAGS)
  const overflowTagCount = review.tags.length - MAX_VISIBLE_TAGS
  const [showAllTags, setShowAllTags] = useState(false)

  const helpfulVoteSessionCount = useRef(
    typeof window !== 'undefined'
      ? parseInt(sessionStorage.getItem('helpfulVoteCount') ?? '0', 10)
      : 0
  )

  const handleVote = useCallback(async () => {
    if (!currentUserId || isOwn) return
    const token = authUser ? await authUser.getIdToken() : null
    if (!token) return

    if (hasVoted) {
      // Un-vote: optimistic update, no animation
      setHasVoted(false)
      setHelpfulCount((n) => Math.max(n - 1, 0))
      const res = await fetch(API_ENDPOINTS.reviewHelpful(encodeURIComponent(review.id)), {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        setHasVoted(true)
        setHelpfulCount((n) => n + 1)
        toast.error(CLIENT_ERRORS.COULD_NOT_UNMARK_HELPFUL)
      }
    } else {
      // Vote: optimistic update + burst animation
      setHasVoted(true)
      setHelpfulCount((n) => n + 1)
      setIsBursting(true)
      setTimeout(() => setIsBursting(false), 600)
      helpfulVoteSessionCount.current += 1
      sessionStorage.setItem('helpfulVoteCount', String(helpfulVoteSessionCount.current))
      if (helpfulVoteSessionCount.current <= 3) {
        toast.success('You helped highlight a great review', { duration: 2000 })
      }
      const res = await fetch(API_ENDPOINTS.reviewHelpful(encodeURIComponent(review.id)), {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        setHasVoted(false)
        setHelpfulCount((n) => Math.max(n - 1, 0))
        toast.error(CLIENT_ERRORS.COULD_NOT_MARK_HELPFUL)
      }
    }
  }, [authUser, currentUserId, hasVoted, isOwn, review.id])

  async function handleFlag() {
    if (!currentUserId || isOwn) return
    const token = authUser ? await authUser.getIdToken() : null
    if (!token) return
    setFlagged(true)
    const res = await fetch(API_ENDPOINTS.reviewFlag(encodeURIComponent(review.id)), {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      setFlagged(false)
      toast.error(CLIENT_ERRORS.COULD_NOT_REPORT_REVIEW)
    } else {
      toast.success('Review reported')
    }
  }

  return (
    <div
      className="animate-pop-in overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-text-muted"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      {/* ── Photo banner ─────────────────────────────── */}
      {review.photoUrl && (
        <button
          type="button"
          onClick={() => setPhotoExpanded(true)}
          className="relative w-full overflow-hidden cursor-pointer"
          style={{ aspectRatio: '4/3' }}
        >
          <Image
            src={getOptimizedImageUrl(review.photoUrl, 'banner') ?? ''}
            alt="Review photo"
            fill
            sizes="(max-width: 640px) 100vw, 360px"
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        </button>
      )}
      {photoExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setPhotoExpanded(false)}
        >
          <div className="relative w-full max-w-2xl mx-4" style={{ aspectRatio: '3/4' }}>
            <Image
              src={getOptimizedImageUrl(review.photoUrl, 'lightbox') ?? ''}
              alt="Review photo"
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>
          <button
            className="absolute top-4 right-4 text-white text-2xl font-bold"
            onClick={() => setPhotoExpanded(false)}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Card body ────────────────────────────────── */}
      <div className="px-3.5 py-3">
        {/* Variant: profile — dish header with score */}
        {variant === 'profile' && dishContext && (
          <div className="flex items-start gap-2.5">
            <div className="min-w-0 flex-1">
              <Link
                href={`/dish/${review.dishId}`}
                className="group inline-block max-w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="truncate font-display text-sm font-bold text-heading underline-offset-2 group-hover:underline">
                  {dishContext.dishName}
                </h3>
              </Link>
              <p className="truncate text-[11px] text-text-muted">
                at <span className="font-medium text-text-secondary">{dishContext.restaurantName}</span>
              </p>
              {review.isVerified && <VerifiedBillBadge className="mt-1" />}
            </div>
            <ScoreBadge score={overallScore} />
          </div>
        )}

        {/* Variant: profile without context (standalone review page) */}
        {variant === 'profile' && !dishContext && (
          <div className="flex items-start gap-2.5">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-display text-sm font-bold text-heading">
                {review.userName}
              </h3>
              <Badge className={cn('mt-0.5 rounded-full px-1.5 py-0 text-[9px] font-semibold', levelColorClass)}>
                {review.userLevel}
              </Badge>
              {review.isVerified && <VerifiedBillBadge className="mt-1" />}
            </div>
            <ScoreBadge score={overallScore} />
          </div>
        )}

        {/* Variant: dish — user row with score on right */}
        {variant === 'dish' && (
          <div className="flex flex-wrap items-center gap-2 border-b border-border pb-2.5">
            <div
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                levelColorClass,
              )}
            >
              {initials}
            </div>
            <span className="text-xs font-semibold text-text-primary">{review.userName}</span>
            <Badge className={cn('shrink-0 rounded-full px-1.5 py-0 text-[9px] font-semibold', levelColorClass)}>
              {review.userLevel}
            </Badge>
            {review.isVerified && <VerifiedBillBadge />}
            <ScoreBadge score={overallScore} className="ml-auto text-xs" />
          </div>
        )}

        {/* ── Sub-rating pills (always visible) ──────── */}
        <div
          className={cn(
            'flex flex-wrap items-center gap-1',
            variant === 'dish' ? 'mt-2.5' : 'mt-2 border-t border-border pt-2',
          )}
        >
          <SubRatingPill label="Taste" value={review.tasteRating} />
          <SubRatingPill label="Portion" value={review.portionRating} />
          <SubRatingPill label="Value" value={review.valueRating} />
        </div>

        {/* ── Review text ────────────────────────────── */}
        {review.text && (
          <div className="mt-2">
            <p
              className={cn(
                'text-xs leading-relaxed text-text-secondary',
                !textExpanded && hasExpandableText && 'line-clamp-2',
              )}
            >
              {review.text}
            </p>
            {hasExpandableText && (
              <button
                type="button"
                onClick={() => setTextExpanded((v) => !v)}
                className="mt-0.5 text-[11px] font-semibold text-brand-orange hover:underline"
              >
                {textExpanded ? 'See less' : 'See more'}
              </button>
            )}
          </div>
        )}

        {/* ── Tags ───────────────────────────────────── */}
        {review.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {(showAllTags ? review.tags : visibleTags).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2 py-0.5 text-[10px] text-text-muted"
              >
                {tag}
              </span>
            ))}
            {overflowTagCount > 0 && !showAllTags && (
              <button
                type="button"
                onClick={() => setShowAllTags(true)}
                className="px-1 text-[10px] font-semibold text-brand-orange"
              >
                +{overflowTagCount}
              </button>
            )}
          </div>
        )}

        {/* ── Meta row: timestamp, helpful, report, actions ── */}
        <div className="mt-2.5 flex items-center gap-2.5">
          <span className="text-[10px] text-text-muted">
            {formatRelativeTime(review.createdAt)}
          </span>

          {/* Helpful button — burst variant */}
          <div className="relative inline-flex shrink-0">
            {/* Burst particles — only mounted while animating */}
            {isBursting && (
              <>
                <span className="pointer-events-none absolute left-1/2 top-1/2 size-1.5 rounded-full bg-primary animate-burst-ne" />
                <span className="pointer-events-none absolute left-1/2 top-1/2 size-1.5 rounded-full bg-brand-orange animate-burst-e" />
                <span className="pointer-events-none absolute left-1/2 top-1/2 size-1.5 rounded-full bg-brand-gold animate-burst-se" />
                <span className="pointer-events-none absolute left-1/2 top-1/2 size-1 rounded-full bg-primary animate-burst-s" />
                <span className="pointer-events-none absolute left-1/2 top-1/2 size-1.5 rounded-full bg-brand-orange animate-burst-sw" />
                <span className="pointer-events-none absolute left-1/2 top-1/2 size-1.5 rounded-full bg-brand-gold animate-burst-w" />
                <span className="pointer-events-none absolute left-1/2 top-1/2 size-1 rounded-full bg-primary animate-burst-nw" />
                <span className="pointer-events-none absolute left-1/2 top-1/2 size-1.5 rounded-full bg-brand-orange animate-burst-n" />
              </>
            )}
            <button
              type="button"
              onClick={handleVote}
              disabled={!currentUserId || isOwn}
              title={hasVoted ? 'Remove helpful vote' : 'Mark as helpful'}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-150',
                hasVoted
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border text-text-muted hover:border-primary/30 hover:bg-primary/5 hover:text-brand-orange',
                'disabled:cursor-default disabled:opacity-100',
              )}
            >
              <svg
                className={cn('size-3.5 shrink-0 transition-all duration-150', hasVoted && 'scale-110')}
                viewBox="0 0 24 24"
                fill={hasVoted ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
              <span>
                {helpfulCount > 0 ? `Helpful · ${helpfulCount}` : 'Helpful'}
              </span>
            </button>
          </div>

          {currentUserId && !isOwn && !flagged && (
            <button
              type="button"
              onClick={handleFlag}
              className="shrink-0 text-[10px] text-text-muted transition-colors hover:text-destructive"
            >
              Report
            </button>
          )}
          {flagged && <span className="shrink-0 text-[10px] text-text-muted">Reported</span>}

          {/* Edit/Delete or "Edit closed" */}
          {isOwn && (onEdit || onDelete) && (
            <div className="ml-auto flex shrink-0 items-center gap-0.5">
              {canEdit ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onEdit}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center text-primary/70 hover:bg-primary/10 hover:text-primary"
                    title="Edit review"
                  >
                    <Pencil className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onDelete}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
                    title="Delete review"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </>
              ) : (
                <span
                  className="group relative cursor-help text-[10px] text-text-muted"
                >
                  Edit closed
                  <span className="pointer-events-none absolute bottom-full right-0 z-10 mb-1.5 hidden whitespace-nowrap rounded-md border border-border bg-surface-3 px-2.5 py-1.5 text-[11px] text-text-secondary shadow-lg sm:group-hover:block">
                    Reviews can only be edited within 24 hours
                  </span>
                  <span className="block text-[10px] text-text-muted sm:hidden">
                    Editable within 24h only
                  </span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

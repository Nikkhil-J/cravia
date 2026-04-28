'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import type { Review } from '@/lib/types'
import { canEditReview, computeOverall, formatRelativeTime, formatRating } from '@/lib/utils/index'
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

export function ReviewCardV2({
  review,
  variant,
  currentUserId,
  onEdit,
  onDelete,
  dishContext,
}: ReviewCardV2Props) {
  const { authUser } = useAuth()
  const [photoExpanded, setPhotoExpanded] = useState(false)
  const [textExpanded, setTextExpanded] = useState(false)

  const [hasVoted, setHasVoted] = useState(
    currentUserId ? review.helpfulVotedBy.includes(currentUserId) : false,
  )
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulVotes)
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

  async function handleVote() {
    if (!currentUserId || isOwn || hasVoted) return
    const token = authUser ? await authUser.getIdToken() : null
    if (!token) return
    setHasVoted(true)
    setHelpfulCount((n) => n + 1)
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
    <div className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-text-muted">
      {/* ── Photo banner ─────────────────────────────── */}
      {review.photoUrl && (
        <button
          type="button"
          onClick={() => setPhotoExpanded((v) => !v)}
          className={cn(
            'relative w-full cursor-pointer overflow-hidden transition-[height] duration-400 ease-out',
            photoExpanded ? 'h-[200px] sm:h-[260px] md:h-[320px]' : 'h-[140px] sm:h-[160px] md:h-[180px]',
          )}
        >
          <Image
            src={review.photoUrl}
            alt="Review photo"
            fill
            sizes="(max-width: 640px) 100vw, 360px"
            className={cn(
              'transition-[object-fit] duration-300',
              photoExpanded ? 'bg-surface-dark object-contain' : 'object-cover',
            )}
          />
          <span className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold text-white/85 backdrop-blur-sm">
            {photoExpanded ? '↕ Collapse' : '↕ Expand'}
          </span>
        </button>
      )}

      {/* ── Card body ────────────────────────────────── */}
      <div className="px-3.5 py-3">
        {/* Variant: profile — dish header with score */}
        {variant === 'profile' && dishContext && (
          <div className="flex items-start gap-2.5">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-display text-sm font-bold text-heading">
                {dishContext.dishName}
              </h3>
              <p className="truncate text-[11px] text-text-muted">
                at <span className="font-medium text-text-secondary">{dishContext.restaurantName}</span>
              </p>
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

          <button
            type="button"
            onClick={handleVote}
            disabled={!currentUserId || isOwn}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors',
              hasVoted
                ? 'border-primary/30 bg-primary/10 font-bold text-primary'
                : 'border-border text-text-muted hover:border-primary/40 hover:bg-primary/5',
              'disabled:cursor-default disabled:opacity-100',
            )}
          >
            {hasVoted
              ? helpfulCount === 1
                ? '👍 You found this helpful'
                : `👍 You and ${helpfulCount - 1} other${helpfulCount - 1 !== 1 ? 's' : ''}`
              : helpfulCount === 0
                ? '👍 Helpful?'
                : `👍 ${helpfulCount} found this helpful`}
          </button>

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

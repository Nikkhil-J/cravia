'use client'

import { useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import type { Review } from '@/lib/types'
import { canEditReview } from '@/lib/utils/index'
import { LEVEL_COLORS, CONFIG } from '@/lib/constants'
import { useAuth } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2 } from 'lucide-react'
import { API_ENDPOINTS } from '@/lib/constants/api'
import { CLIENT_ERRORS } from '@/lib/constants/errors'

interface ReviewCardProps {
  review: Review
  currentUserId?: string
  onEdit?: () => void
  onDelete?: () => void
  /** When set (e.g. user profile), shows "at restaurant · dish". Omit on dish page. */
  dishContext?: { dishName: string; restaurantName: string } | null
}

function RatingPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-baseline gap-1 rounded-full border border-border px-2 py-0.5 text-[11px]">
      <span className="font-medium text-text-muted">{label}</span>
      <span className="font-semibold tabular-nums text-brand-orange">{value.toFixed(1)}</span>
    </span>
  )
}

export function ReviewCard({ review, currentUserId, onEdit, onDelete, dishContext }: ReviewCardProps) {
  const { authUser } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [photoOpen, setPhotoOpen] = useState(false)

  const [hasVoted, setHasVoted] = useState(
    currentUserId ? review.helpfulVotedBy.includes(currentUserId) : false,
  )
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulVotes)
  const [flagged, setFlagged] = useState(review.isFlagged)

  const isOwn = currentUserId === review.userId
  const canEdit = isOwn && canEditReview(review.createdAt)

  async function handleVote() {
    if (!currentUserId || isOwn || hasVoted) return
    const token = authUser ? await authUser.getIdToken() : null
    if (!token) return
    setHasVoted(true)
    setHelpfulCount((n) => n + 1)
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

  const levelColorClass = LEVEL_COLORS[review.userLevel as keyof typeof LEVEL_COLORS] ?? 'bg-border text-text-secondary'

  const initials = review.userName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const previewText = review.text
    ? review.text.length > CONFIG.REVIEW_CARD_PREVIEW_LENGTH ? `${review.text.slice(0, CONFIG.REVIEW_CARD_PREVIEW_LENGTH)}…` : review.text
    : null

  const hasExpandableText = review.text && review.text.length > CONFIG.REVIEW_CARD_PREVIEW_LENGTH

  return (
    <div className="rounded-md border-[0.5px] border-border bg-card px-3.5 py-3 transition-colors hover:border-text-muted">
      {/* Row 1: identity + ratings */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <div
          className={cn(
            'flex size-[30px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
            levelColorClass,
          )}
        >
          {initials}
        </div>

        <span className="shrink-0 text-[13px] font-medium text-text-primary">{review.userName}</span>

        <Badge className={cn('shrink-0 rounded-full px-1.5 py-0 text-[9px] font-semibold', levelColorClass)}>
          {review.userLevel}
        </Badge>

        <div className="flex shrink-0 items-center gap-1">
          <RatingPill label="T" value={review.tasteRating} />
          <RatingPill label="P" value={review.portionRating} />
          <RatingPill label="V" value={review.valueRating} />
        </div>

        {isOwn && (onEdit || onDelete) && (
          <div className="ml-auto flex shrink-0 gap-0.5">
            {canEdit ? (
              <>
                <Button variant="ghost" size="icon-sm" onClick={onEdit} className="flex min-h-[44px] min-w-[44px] items-center justify-center text-primary/70 hover:bg-primary/10 hover:text-primary" title="Edit review">
                  <Pencil className="size-3" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={onDelete} className="flex min-h-[44px] min-w-[44px] items-center justify-center text-destructive/70 hover:bg-destructive/10 hover:text-destructive" title="Delete review">
                  <Trash2 className="size-3" />
                </Button>
              </>
            ) : (
              <span className="cursor-not-allowed text-[10px] text-text-muted" title="Reviews can only be edited within 24 hours">
                Edit closed
              </span>
            )}
          </div>
        )}
      </div>

      {/* Preview text */}
      {review.text && !expanded && (
        <div className="mt-1.5 flex items-baseline gap-1.5 pl-[38px]">
          <span className="min-w-0 flex-1 truncate text-[13px] italic text-text-muted">
            &ldquo;{previewText}&rdquo;
          </span>
          {hasExpandableText && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="shrink-0 text-[12px] font-semibold text-brand-orange hover:underline"
            >
              See more
            </button>
          )}
        </div>
      )}

      {expanded && hasExpandableText && (
        <div className="mt-1 pl-[38px]">
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="text-[12px] font-semibold text-brand-orange hover:underline"
          >
            See less
          </button>
        </div>
      )}

      {/* Dish context (profile pages only) */}
      {dishContext && (
        <p className="mt-1 truncate pl-[38px] text-[11px] text-text-muted">
          at <span className="font-medium text-text-primary">{dishContext.restaurantName}</span>
          {' · '}
          <span className="font-medium text-text-primary">{dishContext.dishName}</span>
        </p>
      )}

      {/* Expanded text */}
      {review.text && (
        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-200 ease-out',
            expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="overflow-hidden">
            <div className="mt-2 border-t border-border pt-2">
              <p className="break-words text-[13px] leading-relaxed text-text-secondary">
                {review.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Row 2: tags, helpful, report — photo on far right */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {review.tags.length > 0 && review.tags.map((tag) => (
          <span key={tag} className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] text-text-muted">
            {tag}
          </span>
        ))}

        <button
          type="button"
          onClick={handleVote}
          disabled={!currentUserId || isOwn}
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium transition-colors',
            hasVoted
              ? 'bg-primary/10 font-bold text-primary'
              : 'text-text-muted hover:text-text-secondary',
            'disabled:cursor-default disabled:opacity-100',
          )}
        >
          Helpful · {helpfulCount}
        </button>

        {currentUserId && !isOwn && !flagged && (
          <button type="button" onClick={handleFlag} className="shrink-0 text-[10px] text-text-muted transition-colors hover:text-destructive">
            Report
          </button>
        )}
        {flagged && <span className="shrink-0 text-[10px] text-text-muted">Reported</span>}

        {review.photoUrl && (
          <button
            type="button"
            onClick={() => setPhotoOpen((v) => !v)}
            className={cn(
              'relative ml-auto h-14 w-14 shrink-0 overflow-hidden border transition-all hover:scale-105',
              photoOpen ? 'border-primary' : 'border-border hover:border-text-muted',
            )}
          >
            <Image
              src={review.photoUrl}
              alt="Review photo"
              fill
              sizes="56px"
              className="object-cover"
            />
          </button>
        )}
      </div>

      {/* Inline photo expand */}
      {review.photoUrl && (
        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-200 ease-out',
            photoOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="overflow-hidden">
            <div className="mt-2 flex justify-end">
              <Image
                src={review.photoUrl}
                alt="Review photo"
                width={400}
                height={300}
                className="max-h-[240px] max-w-full w-auto rounded-md object-contain"
                onClick={() => setPhotoOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

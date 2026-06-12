'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { Dialog } from '@base-ui/react/dialog'
import { toast } from 'sonner'
import { getReview, unflagReview } from '@/lib/services/admin'
import { useAuth } from '@/lib/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminDetailHeader } from '@/components/features/admin/AdminDetailHeader'
import { cn } from '@/lib/utils'
import { getOptimizedImageUrl } from '@/lib/utils/image'
import { formatRelativeTime } from '@/lib/utils/index'
import type { Review } from '@/lib/types'
import { API_ENDPOINTS } from '@/lib/constants/api'
import { ROUTES } from '@/lib/constants/routes'

const PRESET_REASONS = [
  'Violates community guidelines',
  'Spam or fake review',
  'Inappropriate or offensive content',
] as const

export default function AdminReviewDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { authUser } = useAuth()
  const [review, setReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState<string>(PRESET_REASONS[0])
  const [customReason, setCustomReason] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getReview(id)
      .then(setReview)
      .catch(() => toast.error('Failed to load review'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleApprove() {
    if (!review || !authUser) return
    setBusy(true)
    try {
      const token = await authUser.getIdToken()
      const success = await unflagReview(review.id, token)
      if (success) {
        toast.success('Review kept and unflagged')
        router.push(ROUTES.ADMIN_REVIEWS)
      } else {
        toast.error('Failed to unflag review')
      }
    } finally {
      setBusy(false)
    }
  }

  async function confirmDelete() {
    if (!review || !authUser) return
    setDeleting(true)
    const token = await authUser.getIdToken()
    const reason = customReason.trim() || selectedReason
    const res = await fetch(API_ENDPOINTS.adminReview(encodeURIComponent(review.id)), {
      method: 'DELETE',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    setDeleting(false)
    if (res.ok) {
      toast.success('Review deleted and user notified')
      router.push(ROUTES.ADMIN_REVIEWS)
    } else {
      toast.error('Failed to delete review')
      setDeleteOpen(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>

  if (!review) {
    return (
      <div>
        <AdminDetailHeader backHref={ROUTES.ADMIN_REVIEWS} backLabel="Flagged Reviews" title="Review not found" />
        <div className="mt-8">
          <EmptyState icon="🔍" title="Not found" description="This review may have already been removed." />
        </div>
      </div>
    )
  }

  const photoSrc = review.photoUrl ? getOptimizedImageUrl(review.photoUrl, 'card') : null

  return (
    <>
      <Dialog.Root open={deleteOpen} onOpenChange={(open) => { if (!deleting) setDeleteOpen(open) }}>
        <Dialog.Portal>
          <Dialog.Backdrop
            className={cn(
              'fixed inset-0 z-50 bg-black/50 transition-opacity duration-150',
              'data-starting-style:opacity-0 data-ending-style:opacity-0',
              'supports-backdrop-filter:backdrop-blur-sm',
            )}
          />
          <Dialog.Popup
            className={cn(
              'fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2',
              'rounded-2xl border border-border bg-card p-6 shadow-xl transition-all duration-150',
              'data-starting-style:opacity-0 data-starting-style:scale-95',
              'data-ending-style:opacity-0 data-ending-style:scale-95',
            )}
          >
            <Dialog.Title className="font-display text-base font-bold text-heading">Delete review?</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-text-secondary">
              Select a reason — the user will be notified with this explanation.
            </Dialog.Description>

            <fieldset className="mt-4 space-y-2">
              {PRESET_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors',
                    selectedReason === reason && !customReason.trim()
                      ? 'border-destructive/50 bg-destructive/5 text-heading'
                      : 'border-border bg-background text-text-secondary hover:border-border/80',
                  )}
                >
                  <input
                    type="radio"
                    name="delete-reason"
                    value={reason}
                    checked={selectedReason === reason && !customReason.trim()}
                    onChange={() => {
                      setSelectedReason(reason)
                      setCustomReason('')
                    }}
                    className="accent-destructive"
                  />
                  {reason}
                </label>
              ))}
            </fieldset>

            <div className="mt-3">
              <label className="mb-1.5 block text-xs font-medium text-text-muted">Or write a custom reason (optional)</label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="e.g. Review contains personal contact information…"
                rows={3}
                className={cn(
                  'w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5',
                  'text-sm text-text-primary placeholder:text-text-muted',
                  'focus:outline-none focus:ring-2 focus:ring-destructive/30 focus:border-destructive/50 transition-colors',
                )}
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Dialog.Close render={<Button variant="outline" size="sm" disabled={deleting} />}>Cancel</Dialog.Close>
              <Button variant="destructive" size="sm" disabled={deleting} onClick={confirmDelete}>
                {deleting ? 'Deleting…' : 'Delete & notify user'}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="space-y-6">
        <AdminDetailHeader
          backHref={ROUTES.ADMIN_REVIEWS}
          backLabel="Flagged Reviews"
          title={review.dishName ?? 'Review'}
          subtitle={review.restaurantName ?? undefined}
          badge={review.isFlagged ? <Badge className="bg-destructive/15 text-destructive">Flagged</Badge> : undefined}
        />

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-heading">{review.userName}</p>
              <p className="text-xs capitalize text-text-muted">{review.userLevel} · {formatRelativeTime(review.createdAt)}</p>
            </div>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs" render={<Link href={ROUTES.profile(review.userId)} target="_blank" />}>
              Profile
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>

          {photoSrc && (
            <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-xl">
              <Image src={photoSrc} alt="Review photo" fill sizes="(max-width: 768px) 100vw, 672px" className="object-cover" />
            </div>
          )}

          {review.text && <p className="mt-4 whitespace-pre-wrap text-sm text-text-primary">&ldquo;{review.text}&rdquo;</p>}

          <div className="mt-4 grid grid-cols-3 gap-3">
            <RatingCard label="Taste" value={review.tasteRating} />
            <RatingCard label="Portion" value={review.portionRating} />
            <RatingCard label="Value" value={review.valueRating} />
          </div>

          {review.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {review.tags.map((tag) => (
                <Badge key={tag} className="bg-surface-2 text-text-secondary">{tag}</Badge>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
            <span>{review.helpfulVotes} helpful votes</span>
            {review.isVerified && <span className="text-success">✓ Verified</span>}
            {review.editedAt && <span>Edited {formatRelativeTime(review.editedAt)}</span>}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" render={<Link href={ROUTES.dish(review.dishId)} target="_blank" />}>
              View dish
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
            {review.billUrl && (
              <Button variant="outline" size="sm" render={<a href={review.billUrl} target="_blank" rel="noopener noreferrer" />}>
                View bill
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Moderation</h2>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button onClick={handleApprove} disabled={busy} className="flex-1 sm:flex-none">
              {busy ? 'Saving…' : 'Keep (unflag)'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
              disabled={busy}
              className="flex-1 sm:flex-none"
            >
              Delete review
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

function RatingCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-3 text-center">
      <p className="font-display text-lg font-bold text-heading">{value}</p>
      <p className="mt-0.5 text-xs text-text-muted">{label}</p>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { toast } from 'sonner'
import { getFlaggedReviews, unflagReview } from '@/lib/services/admin'
import { useAuth } from '@/lib/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Review } from '@/lib/types'
import { API_ENDPOINTS } from '@/lib/constants/api'

const PRESET_REASONS = [
  'Violates community guidelines',
  'Spam or fake review',
  'Inappropriate or offensive content',
] as const

export default function AdminReviewsPage() {
  const { authUser } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null)
  const [selectedReason, setSelectedReason] = useState<string>(PRESET_REASONS[0])
  const [customReason, setCustomReason] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getFlaggedReviews()
      .then(setReviews)
      .catch(() => {
        toast.error('Failed to load flagged reviews. Please refresh.')
      })
      .finally(() => setLoading(false))
  }, [])

  function openDeleteModal(review: Review) {
    setReviewToDelete(review)
    setSelectedReason(PRESET_REASONS[0])
    setCustomReason('')
  }

  function closeDeleteModal() {
    if (deleting) return
    setReviewToDelete(null)
  }

  async function handleApprove(id: string) {
    if (!authUser) return
    const token = await authUser.getIdToken()
    const success = await unflagReview(id, token)
    if (success) {
      setReviews((prev) => prev.filter((r) => r.id !== id))
    }
  }

  async function confirmDelete() {
    if (!reviewToDelete || !authUser) return
    setDeleting(true)
    const token = await authUser.getIdToken()
    const reason = customReason.trim() || selectedReason
    const res = await fetch(API_ENDPOINTS.adminReview(encodeURIComponent(reviewToDelete.id)), {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    })
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id))
    }
    setDeleting(false)
    setReviewToDelete(null)
  }

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>

  return (
    <>
      {/* Delete with reason modal */}
      <Dialog.Root open={reviewToDelete !== null} onOpenChange={(open) => { if (!open) closeDeleteModal() }}>
        <Dialog.Portal>
          <Dialog.Backdrop
            className={cn(
              'fixed inset-0 z-50 bg-black/50 transition-opacity duration-150',
              'data-starting-style:opacity-0 data-ending-style:opacity-0',
              'supports-backdrop-filter:backdrop-blur-sm'
            )}
          />
          <Dialog.Popup
            className={cn(
              'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
              'rounded-2xl border border-border bg-card p-6 shadow-xl',
              'transition-all duration-150',
              'data-starting-style:opacity-0 data-starting-style:scale-95',
              'data-ending-style:opacity-0 data-ending-style:scale-95'
            )}
          >
            <Dialog.Title className="font-display text-base font-bold text-heading">
              Delete review?
            </Dialog.Title>
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
                      : 'border-border bg-background text-text-secondary hover:border-border/80'
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
              <label className="mb-1.5 block text-xs font-medium text-text-muted">
                Or write a custom reason (optional)
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="e.g. Review contains personal contact information…"
                rows={3}
                className={cn(
                  'w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5',
                  'text-sm text-text-primary placeholder:text-text-muted',
                  'focus:outline-none focus:ring-2 focus:ring-destructive/30 focus:border-destructive/50',
                  'transition-colors'
                )}
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Dialog.Close
                render={<Button variant="outline" size="sm" disabled={deleting} />}
              >
                Cancel
              </Dialog.Close>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleting}
                onClick={confirmDelete}
              >
                {deleting ? 'Deleting…' : 'Delete & notify user'}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <div>
        <h1 className="font-display text-xl font-bold text-heading">Flagged Reviews</h1>
        <p className="mt-1 text-sm text-text-muted">{reviews.length} flagged</p>

        {reviews.length === 0 ? (
          <div className="mt-8">
            <EmptyState icon="✅" title="No flagged reviews" description="All reviews are clean." />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-destructive/20 bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-heading">{review.userName}</p>
                    <p className="text-xs text-text-muted">Dish: {review.dishId}</p>
                    {review.text && <p className="mt-1 text-sm text-text-primary">&ldquo;{review.text}&rdquo;</p>}
                    <div className="mt-1 flex gap-2 text-xs text-text-muted">
                      <span>Taste: {review.tasteRating}</span>
                      <span>Portion: {review.portionRating}</span>
                      <span>Value: {review.valueRating}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={() => handleApprove(review.id)}
                    size="xs"
                    className="rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-primary-dark"
                  >
                    Keep (unflag)
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => openDeleteModal(review)}
                    size="xs"
                    className="rounded-lg bg-transparent border border-destructive/30 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

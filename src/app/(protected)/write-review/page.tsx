'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { useAuth } from '@/lib/hooks/useAuth'
import { useReviewFormStore } from '@/lib/store/reviewFormStore'
import { getDish } from '@/lib/services/dishes'
import { getReview } from '@/lib/services/reviews'
import { uploadDishPhoto } from '@/lib/services/cloudinary'
import { validatePhotoFile } from '@/lib/utils/index'
import { getNewlyEarnedBadges } from '@/lib/gamification'
import { StarRating } from '@/components/ui/StarRating'
import { TagPill } from '@/components/ui/TagPill'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { TAG_GROUPS, RATING_LABELS, SUB_RATING_LABELS, HTTP_HEADERS } from '@/lib/constants'
import type { Dish } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants/routes'
import { API_ENDPOINTS } from '@/lib/constants/api'

function WriteReviewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dishId = searchParams.get('dishId') ?? ''
  const restaurantId = searchParams.get('restaurantId') ?? ''
  const editReviewId = searchParams.get('editReviewId') ?? ''
  const dishNameParam = searchParams.get('dishName') ?? ''
  const restaurantNameParam = searchParams.get('restaurantName') ?? ''

  const { user, authUser } = useAuth()
  const { data, currentStep, setStep, updateField, reset } = useReviewFormStore()

  const hasUnsavedChanges = useCallback(() => {
    return !!(data.photoFile || data.tasteRating || data.portionRating || data.valueRating || data.tags.length > 0 || data.text)
  }, [data])

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (hasUnsavedChanges()) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const [dish, setDish] = useState<Dish | null>(null)
  const displayName = dishNameParam || dish?.name || ''
  const displayRestaurant = restaurantNameParam || dish?.restaurantName || ''
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const prevDishIdRef = useRef(dishId)
  const mountResetRef = useRef(false)
  if (!mountResetRef.current && dishId && data.dishId && data.dishId !== dishId) {
    reset()
    mountResetRef.current = true
  }

  useEffect(() => {
    if (!dishId) return
    if (prevDishIdRef.current !== dishId) {
      reset()
      prevDishIdRef.current = dishId
    }
    if (dishId !== data.dishId) {
      updateField('dishId', dishId)
      updateField('restaurantId', restaurantId)
    }
    getDish(dishId).then(setDish)
  }, [dishId, restaurantId, data.dishId, updateField, reset])

  const resetRef = useRef(reset)
  resetRef.current = reset
  useEffect(() => {
    return () => { resetRef.current() }
  }, [])

  useEffect(() => {
    if (!editReviewId) return
    setIsEditMode(true)
    getReview(editReviewId).then((review) => {
      if (!review) return
      updateField('tasteRating', review.tasteRating)
      updateField('portionRating', review.portionRating)
      updateField('valueRating', review.valueRating)
      updateField('tags', review.tags)
      updateField('text', review.text ?? '')
      if (review.photoUrl) {
        setExistingPhotoUrl(review.photoUrl)
        updateField('photoPreviewUrl', review.photoUrl)
      }
      setStep(2)
    })
  }, [editReviewId, updateField, setStep])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const { valid, error } = validatePhotoFile(file)
    if (!valid) { setPhotoError(error); return }
    setPhotoError(null)
    if (data.photoPreviewUrl) URL.revokeObjectURL(data.photoPreviewUrl)
    updateField('photoFile', file)
    updateField('photoPreviewUrl', URL.createObjectURL(file))
  }

  async function handleSubmit() {
    if (!user || !authUser || !dishId || !data.tasteRating || !data.portionRating || !data.valueRating) return
    const token = await authUser.getIdToken()

    if (isEditMode) {
      if (!editReviewId) return
      setSubmitting(true)
      setSubmitError(null)
      try {
        const res = await fetch(API_ENDPOINTS.review(encodeURIComponent(editReviewId)), {
          method: 'PATCH',
          headers: {
            [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON,
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tasteRating: data.tasteRating,
            portionRating: data.portionRating,
            valueRating: data.valueRating,
            tags: data.tags,
            text: data.text,
          }),
        })
        const payload = (await res.json()) as { item?: unknown; message?: string }
        const result = payload.item
        if (!res.ok || !result) {
          const msg = payload.message ?? 'Failed to update your review. The edit window may have expired.'
          setSubmitError(msg)
          toast.error(msg)
          return
        }
        reset()
        router.push(ROUTES.dish(dishId))
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Update failed. Please try again.'
        setSubmitError(msg)
        toast.error(msg)
      } finally {
        setSubmitting(false)
      }
      return
    }

    if (!restaurantId || !data.photoFile) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const photoUrl = await uploadDishPhoto(data.photoFile, dishId)
      const res = await fetch(API_ENDPOINTS.REVIEWS, {
        method: 'POST',
        headers: {
          [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON,
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dishId,
          restaurantId,
          tasteRating: data.tasteRating,
          portionRating: data.portionRating,
          valueRating: data.valueRating,
          tags: data.tags,
          text: data.text,
          photoUrl,
        }),
      })
      const payload = (await res.json()) as {
        item?: unknown
        message?: string
        pointsAwarded?: number
        newBalance?: number
        isFullReview?: boolean
      }
      const result = payload.item

      if (!res.ok || !result) {
        const msg = payload.message ?? 'Failed to save your review. Please try again.'
        setSubmitError(msg)
        toast.error(msg)
        return
      }

      const newBadges = getNewlyEarnedBadges(
        user.reviewCount,
        user.reviewCount + 1,
        user.helpfulVotesReceived,
        user.helpfulVotesReceived,
      )
      sessionStorage.setItem('reviewSuccess', JSON.stringify({
        dishId,
        dishName: displayName,
        restaurantName: displayRestaurant,
        newBadges,
        newReviewCount: user.reviewCount + 1,
        pointsAwarded: payload.pointsAwarded ?? 0,
        newBalance: payload.newBalance ?? 0,
        isFullReview: payload.isFullReview ?? false,
      }))
      reset()
      router.push(ROUTES.REVIEW_SUCCESS)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Submission failed. Please try again.'
      setSubmitError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const steps = isEditMode ? ['Rate & Tag', 'Write'] : ['Photo', 'Rate & Tag', 'Write']

  if (!dishId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <span className="text-5xl">🍽️</span>
        <h1 className="mt-4 font-display text-xl font-bold text-heading">Which dish are you reviewing?</h1>
        <p className="mt-2 text-sm text-text-secondary">Find a dish first, then tap &quot;Write a Review&quot; from its page.</p>
        <Button
          render={<Link href={ROUTES.EXPLORE} />}
          className="mt-6 h-auto rounded-pill px-6 py-3 text-sm font-semibold hover:bg-primary-dark"
        >
          Explore Dishes
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      {/* Dish context — name from URL params (instant), cover image from background fetch */}
      <div className="mb-6 flex items-center gap-3">
        {dish?.coverImage ? (
          <Image src={dish.coverImage} alt={displayName} width={48} height={48} className="h-12 w-12 rounded-md object-cover" />
        ) : dishNameParam ? (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-surface-2 text-xl">🍽️</div>
        ) : (
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-md bg-border" />
        )}
        {displayName ? (
          <div>
            <h1 className="font-display text-lg font-bold text-heading">
              {isEditMode ? `Editing review: ${displayName}` : displayName}
            </h1>
            <p className="text-xs text-text-muted">{displayRestaurant}</p>
          </div>
        ) : (
          <div>
            <div className="h-5 w-40 animate-pulse rounded bg-border" />
            <div className="mt-1.5 h-3 w-24 animate-pulse rounded bg-border" />
          </div>
        )}
      </div>
      {isEditMode && existingPhotoUrl && (
        <div className="mb-6 overflow-hidden rounded-xl">
          <Image src={existingPhotoUrl} alt="Your review photo" width={600} height={200} className="h-40 w-full object-cover" />
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-2">
        <div className="h-[3px] rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-brand-orange transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - (isEditMode ? 2 : 1)) / steps.length) * 100 + (100 / steps.length)}%` }}
          />
        </div>
      </div>
      <div className="mb-8 flex justify-between px-1">
        {steps.map((label, i) => {
          const stepNum = isEditMode ? i + 2 : i + 1
          const isActive = currentStep === stepNum
          const isDone = currentStep > stepNum
          return (
            <span
              key={label}
              className={cn(
                'text-[11px] font-semibold uppercase tracking-wide transition-colors duration-300',
                isDone ? 'text-success' : isActive ? 'text-primary' : 'text-text-muted'
              )}
            >
              {label}
            </span>
          )
        })}
      </div>

      {/* Step 1 — Photo (skip in edit mode) */}
      {currentStep === 1 && !isEditMode && (
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-heading">Upload a photo</h2>
          <div
            onClick={() => fileRef.current?.click()}
            className="flex h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-bg-cream transition-all hover:border-primary"
          >
            {data.photoPreviewUrl ? (
              <Image src={data.photoPreviewUrl} alt="Preview" width={400} height={224} className="h-full w-full rounded-xl object-cover" />
            ) : (
              <>
                <span className="text-4xl">📸</span>
                <p className="mt-2 text-sm font-medium text-text-secondary">Click to upload a photo</p>
                <p className="text-xs text-text-muted">JPG, PNG, WebP &middot; max 5MB</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
          {data.photoPreviewUrl && (
            <Button
              variant="ghost"
              onClick={() => { updateField('photoFile', null); updateField('photoPreviewUrl', null) }}
              className="h-auto p-0 text-xs font-medium text-text-muted hover:bg-transparent hover:text-destructive dark:hover:bg-transparent"
            >
              Remove photo
            </Button>
          )}
          {photoError && <p className="text-xs font-medium text-destructive">{photoError}</p>}
          <Button
            onClick={() => setStep(2)}
            disabled={!data.photoFile}
            className="w-full h-auto rounded-pill py-3 text-sm font-semibold hover:bg-primary-dark hover:shadow-glow"
          >
            Rate & Tag
          </Button>
        </div>
      )}

      {/* Step 2 — Ratings + Tags */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Ratings section */}
          <div>
            <h2 className="font-display text-xl font-bold text-heading">
              {isEditMode ? 'Edit your ratings' : 'Rate this dish'}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">Tap the stars — be honest, it helps everyone.</p>
          </div>

          <div className="flex flex-col gap-3">
            {([
              { label: SUB_RATING_LABELS[0], field: 'tasteRating' as const, emoji: '😋' },
              { label: SUB_RATING_LABELS[1], field: 'portionRating' as const, emoji: '📏' },
              { label: SUB_RATING_LABELS[2], field: 'valueRating' as const, emoji: '💰' },
            ] as const).map(({ label, field, emoji }) => {
              const value = data[field] ?? 0
              const isRated = value > 0
              return (
                <div
                  key={label}
                  className={cn(
                    'rounded-xl border-[1.5px] p-4 transition-all duration-300',
                    isRated
                      ? 'border-primary/30 bg-primary/[0.04]'
                      : 'border-border bg-card'
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-transform duration-300',
                        isRated ? 'scale-110 bg-surface' : 'bg-surface'
                      )}>
                        {emoji}
                      </div>
                      <Label className="font-display text-base font-bold text-text-primary">
                        {label}
                      </Label>
                    </div>
                    <span className={cn(
                      'rounded-pill px-2.5 py-0.5 text-xs font-bold transition-colors duration-300',
                      isRated
                        ? 'bg-brand-gold/15 text-brand-gold'
                        : 'bg-surface text-text-muted'
                    )}>
                      {RATING_LABELS[value]}
                    </span>
                  </div>
                  <StarRating
                    value={value}
                    onChange={(v) => updateField(field, v)}
                    size="lg"
                  />
                </div>
              )
            })}
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Tags section */}
          <div>
            <h2 className="font-display text-xl font-bold text-heading">Tag it</h2>
            <p className="mt-1 text-sm text-text-secondary">Help others know what to expect.</p>
          </div>

          {TAG_GROUPS.map(({ label: groupLabel, tags }) => (
            <div key={groupLabel}>
              <div className="mb-2.5 flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted">
                  {groupLabel}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <TagPill
                    key={tag}
                    label={tag}
                    selected={data.tags.includes(tag)}
                    onClick={() => {
                      const next = data.tags.includes(tag)
                        ? data.tags.filter((t) => t !== tag)
                        : [...data.tags, tag]
                      updateField('tags', next)
                    }}
                  />
                ))}
              </div>
            </div>
          ))}

          <p className={cn(
            'text-xs font-medium',
            data.tags.length >= 1 ? 'text-success' : 'text-text-muted'
          )}>
            <span className="font-bold">{data.tags.length}</span> / 1 minimum selected
          </p>

          <div className="flex gap-3">
            {!isEditMode && (
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 h-auto rounded-pill border-2 py-3 text-sm font-semibold text-text-primary hover:border-primary hover:text-primary hover:bg-transparent"
              >
                Back
              </Button>
            )}
            <Button
              onClick={() => setStep(3)}
              disabled={!data.tasteRating || !data.portionRating || !data.valueRating || data.tags.length === 0}
              className="flex-1 h-auto rounded-pill py-3 text-sm font-semibold hover:bg-primary-dark hover:shadow-glow"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — Text + Submit */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-heading">Write your review</h2>
          <textarea
            value={data.text}
            onChange={(e) => updateField('text', e.target.value)}
            rows={5}
            placeholder="Tell others what made this dish memorable..."
            className="w-full rounded-xl border-2 border-border bg-bg-cream px-4 py-3 text-base outline-none transition-colors placeholder:text-text-muted focus:border-primary"
          />
          <div className="flex items-center justify-between text-xs">
            <span className={cn(
              'font-medium',
              data.text.length >= 30 ? 'text-success' : 'text-text-muted'
            )}>
              {data.text.length}/{30} minimum
            </span>
            {data.text.length > 0 && data.text.length < 30 && (
              <span className="font-medium text-brand-gold">{30 - data.text.length} more characters needed</span>
            )}
          </div>
          {submitError && <p className="text-xs font-medium text-destructive">{submitError}</p>}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="flex-1 h-auto rounded-pill border-2 py-3 text-sm font-semibold text-text-primary hover:border-primary hover:text-primary hover:bg-transparent"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !data.text || data.text.length < 30}
              className="flex-1 h-auto rounded-pill py-3 text-sm font-semibold hover:bg-primary-dark hover:shadow-glow"
            >
              {submitting ? <LoadingSpinner size="md" /> : isEditMode ? 'Update Review' : 'Submit Review'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function WriteReviewPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner /></div>}>
      <WriteReviewContent />
    </Suspense>
  )
}

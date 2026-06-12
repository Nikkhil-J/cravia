'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Cropper, { type Area, type Point } from 'react-easy-crop'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useReviewFormStore } from '@/lib/store/reviewFormStore'
import { revalidateDishPage, revalidateRestaurantPage } from '@/lib/actions/revalidate'
import { getDish } from '@/lib/services/dishes'
import { getReview } from '@/lib/services/reviews'
import { uploadDishPhoto, uploadBillPhoto } from '@/lib/services/cloudinary'
import { validateBillFile, validatePhotoFile } from '@/lib/utils/index'
import { cropImageToFile, getOptimizedImageUrl } from '@/lib/utils/image'
import { getNewlyEarnedBadges } from '@/lib/gamification'
import { StarRating } from '@/components/ui/StarRating'
import { TagPill } from '@/components/ui/TagPill'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  TAG_GROUPS,
  RATING_LABELS,
  SUB_RATING_LABELS,
  HTTP_HEADERS,
  REVIEW_TEXT_MIN_CHARS,
} from '@/lib/constants'
import type { Dish, ReviewFormData } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants/routes'
import { API_ENDPOINTS } from '@/lib/constants/api'
import { RewardsPreview } from '@/components/features/RewardsPreview'
import { DishPicker } from '@/components/features/DishPicker'

const RATING_FIELDS = [
  { label: SUB_RATING_LABELS[0], field: 'tasteRating' as const, emoji: '😋', hint: 'How did it taste?' },
  { label: SUB_RATING_LABELS[1], field: 'portionRating' as const, emoji: '📏', hint: 'Was the serving size fair?' },
  { label: SUB_RATING_LABELS[2], field: 'valueRating' as const, emoji: '💰', hint: 'Worth the price?' },
] as const

const REVIEW_TEXT_PLACEHOLDER = 'Share specifics: what did it taste like, how was the portion, was it worth the price, and would you order it again?'

const REVIEW_SENTENCE_STARTERS = [
  'The first thing I noticed was',
  'The flavour was',
  'The portion size felt',
  'For the price, it was',
  "I'd order this again because",
] as const

function revokeObjectUrl(url: string | null) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
}

function WriteReviewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dishId = searchParams.get('dishId') ?? ''
  const restaurantId = searchParams.get('restaurantId') ?? ''
  const editReviewId = searchParams.get('editReviewId') ?? ''
  const dishNameParam = searchParams.get('dishName') ?? ''
  const restaurantNameParam = searchParams.get('restaurantName') ?? ''
  const fromParam = searchParams.get('from')

  const { user, authUser } = useAuth()
  const { data, updateField, reset, activeDishId, setActiveDishId } = useReviewFormStore()

  const hasUnsavedChanges = useCallback(() => {
    return !!(data.photoFile || data.billFile || data.tasteRating || data.portionRating || data.valueRating || data.tags.length > 0 || data.text)
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
  const [billError, setBillError] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null)
  const [cropSourceFile, setCropSourceFile] = useState<File | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isCroppingPhoto, setIsCroppingPhoto] = useState(false)
  const reviewTextRef = useRef<HTMLTextAreaElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)
  const billRef = useRef<HTMLInputElement>(null)

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
      if (restaurantId) updateField('restaurantId', restaurantId)
    } else if (restaurantId && data.restaurantId !== restaurantId) {
      updateField('restaurantId', restaurantId)
    }
    getDish(dishId).then(setDish)
  }, [dishId, restaurantId, data.dishId, data.restaurantId, updateField, reset])

  useEffect(() => {
    if (!dish || restaurantId || data.restaurantId === dish.restaurantId) return
    updateField('restaurantId', dish.restaurantId)
  }, [dish, restaurantId, data.restaurantId, updateField])

  useEffect(() => {
    if (!dishId) return
    if (activeDishId === dishId && (data.tasteRating || data.tags.length > 0 || data.text)) {
      toast.info('Draft restored', { duration: 2000 })
    } else if (activeDishId !== dishId) {
      setActiveDishId(dishId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dishId])

  const resetRef = useRef(reset)
  resetRef.current = reset
  useEffect(() => {
    return () => { resetRef.current() }
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    return () => {
      revokeObjectUrl(cropImageUrl)
    }
  }, [cropImageUrl])

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
    })
  }, [editReviewId, updateField])

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const { valid, error } = validatePhotoFile(file)
    if (!valid) {
      setPhotoError(error)
      e.target.value = ''
      return
    }
    setPhotoError(null)
    revokeObjectUrl(cropImageUrl)
    setCropImageUrl(URL.createObjectURL(file))
    setCropSourceFile(file)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    e.target.value = ''
  }

  const handleCropComplete = useCallback((_croppedArea: Area, nextCroppedAreaPixels: Area) => {
    setCroppedAreaPixels(nextCroppedAreaPixels)
  }, [])

  function closePhotoCropper() {
    revokeObjectUrl(cropImageUrl)
    setCropImageUrl(null)
    setCropSourceFile(null)
    setCroppedAreaPixels(null)
    setIsCroppingPhoto(false)
  }

  async function handleConfirmPhotoCrop() {
    if (!cropImageUrl || !cropSourceFile || !croppedAreaPixels) return

    setIsCroppingPhoto(true)
    setPhotoError(null)
    try {
      const croppedFile = await cropImageToFile(cropImageUrl, croppedAreaPixels, cropSourceFile.name)
      const previewUrl = URL.createObjectURL(croppedFile)
      revokeObjectUrl(data.photoPreviewUrl)
      updateField('photoFile', croppedFile)
      updateField('photoPreviewUrl', previewUrl)
      closePhotoCropper()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not crop this photo. Please try another image.'
      setPhotoError(msg)
      toast.error(msg)
      setIsCroppingPhoto(false)
    }
  }

  function handleRemovePhoto() {
    revokeObjectUrl(data.photoPreviewUrl)
    updateField('photoFile', null)
    updateField('photoPreviewUrl', null)
  }

  function handleBillChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const { valid, error } = validateBillFile(file)
    if (!valid) {
      setBillError(error)
      e.target.value = ''
      return
    }
    setBillError(null)
    revokeObjectUrl(data.billPreviewUrl)
    updateField('billFile', file)
    updateField('billPreviewUrl', URL.createObjectURL(file))
    e.target.value = ''
  }

  function handleSentenceStarterClick(starter: string) {
    const needsSpace = data.text.length > 0 && !/\s$/.test(data.text)
    const nextText = `${data.text}${needsSpace ? ' ' : ''}${starter} `
    const caretPosition = nextText.length

    reviewTextRef.current?.focus({ preventScroll: true })
    updateField('text', nextText)
    requestAnimationFrame(() => {
      reviewTextRef.current?.focus()
      reviewTextRef.current?.setSelectionRange(caretPosition, caretPosition)
    })
  }

  function handleCancel() {
    if (fromParam) {
      router.push(decodeURIComponent(fromParam))
    } else {
      router.back()
    }
  }

  const ratingsComplete = !!(data.tasteRating && data.portionRating && data.valueRating)
  const tagsComplete = data.tags.length >= 1
  const textComplete = data.text.length >= REVIEW_TEXT_MIN_CHARS
  const canSubmit = ratingsComplete && tagsComplete && textComplete

  const [ratingsTouched, setRatingsTouched] = useState(false)
  const [tagsTouched, setTagsTouched] = useState(false)

  const completedCount = useMemo(() => {
    let count = 0
    if (ratingsComplete) count++
    if (tagsComplete) count++
    if (textComplete) count++
    return count
  }, [ratingsComplete, tagsComplete, textComplete])

  const progressPercent = Math.round((completedCount / 3) * 100)

  async function handleSubmit() {
    if (!user || !authUser || !dishId || !canSubmit) return
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
        if (!res.ok || !payload.item) {
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

    const submitRestaurantId = restaurantId || dish?.restaurantId || data.restaurantId
    if (!submitRestaurantId) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      let photoUrl: string | undefined
      if (data.photoFile) {
        photoUrl = await uploadDishPhoto(data.photoFile, dishId)
      }

      let billUrl: string | undefined
      try {
        if (data.billFile) {
          billUrl = await uploadBillPhoto(data.billFile, dishId)
        }
      } catch (err) {
        console.error('Bill upload failed, submitting without bill', err)
        billUrl = undefined
      }

      const res = await fetch(API_ENDPOINTS.REVIEWS, {
        method: 'POST',
        headers: {
          [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON,
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dishId,
          restaurantId: submitRestaurantId,
          tasteRating: data.tasteRating,
          portionRating: data.portionRating,
          valueRating: data.valueRating,
          tags: data.tags,
          text: data.text,
          photoUrl,
          billUrl,
        }),
      })
      const payload = (await res.json()) as {
        item?: unknown
        message?: string
        pointsAwarded?: number
        newBalance?: number
        isFullReview?: boolean
        isVerified?: boolean
        currentStreak?: number
        pointsBreakdown?: {
          base: number
          photoBonus: number
          billBonus: number
        }
      }

      if (res.status === 409) {
        toast.error("You've already reviewed this dish. Edit your existing review instead.")
        router.push(ROUTES.dish(dishId))
        return
      }
      if (res.status === 429) {
        const retryAfter = res.headers.get('Retry-After') ?? '60'
        toast.error(`You're reviewing too fast. Try again in ${retryAfter} seconds.`)
        return
      }
      if (!res.ok || !payload.item) {
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
        restaurantId: submitRestaurantId,
        newBadges,
        newReviewCount: user.reviewCount + 1,
        pointsAwarded: payload.pointsAwarded ?? 0,
        newBalance: payload.newBalance ?? 0,
        isFullReview: payload.isFullReview ?? false,
        isVerified: payload.isVerified ?? false,
        pointsBreakdown: payload.pointsBreakdown ?? null,
        helpfulVotesReceived: user.helpfulVotesReceived,
        currentStreak: payload.currentStreak ?? 0,
        hadPhoto: !!photoUrl,
        hadBill: !!billUrl,
      }))
      reset()
      await revalidateDishPage(dishId)
      await revalidateRestaurantPage(submitRestaurantId)
      router.push(ROUTES.REVIEW_SUCCESS)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Submission failed. Please try again.'
      setSubmitError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (!dishId) {
    return (
      <DishPicker
        onSelect={(selectedDish) => {
          const params = new URLSearchParams({
            dishId: selectedDish.id,
            restaurantId: selectedDish.restaurantId,
            dishName: selectedDish.name,
            restaurantName: selectedDish.restaurantName,
          })
          router.push(`${ROUTES.WRITE_REVIEW}?${params.toString()}`)
        }}
      />
    )
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-24 pt-8 sm:px-6 lg:pb-8">

      {/* Dish hero card */}
      <div className="mb-8 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 sm:gap-4 sm:p-7">
        {dish?.coverImage ? (
          <Image src={getOptimizedImageUrl(dish.coverImage, 'thumbnail') ?? ''} alt={displayName} width={72} height={72} className="h-14 w-14 shrink-0 rounded-xl object-cover sm:h-[72px] sm:w-[72px]" />
        ) : displayName ? (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-2xl sm:h-[72px] sm:w-[72px] sm:text-3xl">🍽️</div>
        ) : (
          <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-border sm:h-[72px] sm:w-[72px]" />
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-lg font-bold leading-snug text-heading">
            {isEditMode
              ? 'Editing review'
              : dishId
                ? <Link href={`/dish/${dishId}`} className="hover:underline underline-offset-2">{displayName || <span className="inline-block h-6 w-48 animate-pulse rounded bg-border" />}</Link>
                : displayName || <span className="inline-block h-6 w-48 animate-pulse rounded bg-border" />
            }
          </h1>
          <p className="mt-0.5 truncate text-sm text-text-secondary">
            {isEditMode && displayName ? displayName + ' · ' : ''}
            {displayRestaurant || <span className="inline-block h-4 w-32 animate-pulse rounded bg-border" />}
          </p>
          {dish && (
            <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-text-muted sm:gap-3">
              <span>⭐ {dish.avgOverall.toFixed(1)} ({dish.reviewCount} reviews)</span>
              {dish.priceRange && <span>💰 {dish.priceRange}</span>}
              <span>🍽️ {dish.category}</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="shrink-0 rounded-full border-[1.5px] border-primary p-2 text-primary transition-colors hover:bg-primary hover:text-white sm:rounded-pill sm:px-4 sm:py-2"
          aria-label="Cancel"
        >
          <svg className="h-4 w-4 sm:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          <span className="hidden text-sm font-semibold sm:inline">Cancel</span>
        </button>
      </div>

      {isEditMode && existingPhotoUrl && (
        <div className="relative mb-8 aspect-square w-full max-w-sm overflow-hidden rounded-xl">
          <Image src={existingPhotoUrl} alt="Your review photo" fill sizes="384px" className="object-cover" />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">

        {/* Main form */}
        <div className="space-y-10">

          {/* Rewards Preview */}
          {!isEditMode && (
            <RewardsPreview currentBalance={user?.dishPointsBalance ?? 0} />
          )}

          {/* Section 1: Ratings */}
          <section>
            <SectionHeader num={1} done={ratingsComplete} title="How was this dish?" desc="Tap the stars. Be honest — it helps everyone decide better." />
            <div className="mt-3 mb-4 flex flex-wrap justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className="inline-flex items-center gap-1 rounded-pill border border-border bg-surface-2 px-2.5 py-1 text-[11px]"
                >
                  <span className="text-brand-gold">{'★'.repeat(n)}</span>
                  <span className="text-text-muted">{RATING_LABELS[n]}</span>
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {RATING_FIELDS.map(({ label, field, emoji, hint }) => {
                const value = data[field] ?? 0
                const isRated = value > 0
                return (
                  <div
                    key={label}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border-[1.5px] p-3 transition-all duration-300 sm:gap-4 sm:p-4',
                      isRated ? 'border-brand-gold/30 bg-bg-cream' : 'border-border bg-card',
                    )}
                  >
                    <div className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg transition-transform duration-300 sm:h-10 sm:w-10 sm:text-xl',
                      isRated ? 'scale-110 bg-bg-warm' : 'bg-surface-2',
                    )}>
                      {emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Label className="font-display text-sm font-bold text-text-primary sm:text-base">{label}</Label>
                      <p className={cn(
                        'text-xs transition-colors duration-300',
                        isRated ? 'font-semibold text-brand-gold' : 'text-text-muted',
                      )}>
                        {isRated ? RATING_LABELS[value] : hint}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <StarRating value={value} onChange={(v) => { updateField(field, v); setRatingsTouched(true) }} size="lg" />
                    </div>
                  </div>
                )
              })}
            </div>
            {ratingsTouched && !ratingsComplete && (
              <p className="text-xs text-destructive/80 mt-1">Rate all three categories to continue</p>
            )}
          </section>

          {/* Section 2: Tags */}
          <section>
            <SectionHeader num={2} done={tagsComplete} title="Describe it in a few words" desc="Help others know what to expect. Pick at least one." />
            <div className="mt-5 space-y-5">
              {TAG_GROUPS.map(({ label: groupLabel, tags }) => (
                <div key={groupLabel}>
                  <div className="mb-2.5 flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted">{groupLabel}</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <TagPill
                        key={tag}
                        label={tag}
                        selected={data.tags.includes(tag)}
                        onClick={() => {
                          setTagsTouched(true)
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
              <p className={cn('text-xs font-medium', tagsComplete ? 'text-success' : 'text-text-muted')}>
                <span className="font-bold">{data.tags.length}</span> / 1 minimum selected
              </p>
              {tagsTouched && !tagsComplete && (
                <p className="text-xs text-destructive/80 mt-1">Select at least one tag</p>
              )}
            </div>
          </section>

          {/* Section 3: Written review */}
          <section>
            <SectionHeader num={3} done={textComplete} title="Tell the story" desc="What made this memorable? Would you order it again?" />
            <div className="mt-5 overflow-hidden rounded-2xl border-2 border-border transition-colors focus-within:border-primary">
              <textarea
                ref={reviewTextRef}
                value={data.text}
                onChange={(e) => updateField('text', e.target.value)}
                rows={5}
                placeholder={REVIEW_TEXT_PLACEHOLDER}
                className="w-full resize-none border-none bg-bg-cream px-5 py-4 text-base outline-none placeholder:text-text-muted"
              />
              <div className="bg-bg-cream px-5 pb-4">
                <p className="mb-2 text-xs font-semibold text-text-muted">Need a start? Tap one:</p>
                <div className="flex flex-wrap gap-2">
                  {REVIEW_SENTENCE_STARTERS.map((starter) => (
                    <Button
                      key={starter}
                      type="button"
                      variant="outline"
                      onPointerDown={(event) => event.preventDefault()}
                      onClick={() => handleSentenceStarterClick(starter)}
                      className="h-auto rounded-pill border-border bg-card px-3 py-1.5 text-xs font-semibold text-text-secondary hover:border-primary hover:bg-bg-cream hover:text-primary"
                    >
                      {starter}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between bg-bg-cream px-5 pb-3">
                <span className={cn('text-xs font-semibold', textComplete ? 'text-success' : 'text-text-muted')}>
                  {data.text.length} / {REVIEW_TEXT_MIN_CHARS} minimum
                </span>
                {data.text.length > 0 && data.text.length < REVIEW_TEXT_MIN_CHARS && (
                  <span className="text-xs font-medium text-brand-gold">
                    {REVIEW_TEXT_MIN_CHARS - data.text.length} more to go
                  </span>
                )}
              </div>
            </div>
            {data.text.length > 0 && data.text.length < 30 && (
              <p className="text-xs text-brand-orange mt-1">{30 - data.text.length} more characters needed</p>
            )}
          </section>

          {!isEditMode && (
            /* Dish photo — incentivized */
            <div className="rounded-2xl border-2 border-dashed border-brand-gold/40 bg-gradient-to-br from-brand-gold-light/30 to-transparent p-5">
              <div className="flex items-center gap-4">
                <span className="text-3xl">📸</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-heading">Add a photo of the dish</p>
                  <p className="text-xs text-text-secondary">Photo reviews earn <strong className="text-brand-gold">20 pts</strong> vs <strong className="text-text-muted">10 pts</strong> without</p>
                  {photoError && <p className="mt-1 text-xs font-medium text-destructive">{photoError}</p>}
                </div>
                {data.photoPreviewUrl ? (
                  <span className="shrink-0 rounded-pill border-[1.5px] border-success bg-success/10 px-4 py-2 text-sm font-semibold text-success">
                    Photo added
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => photoRef.current?.click()}
                    className="shrink-0 rounded-pill border-[1.5px] border-border bg-card px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:border-primary hover:text-primary"
                  >
                    Add Photo
                  </button>
                )}
              </div>
              {data.photoPreviewUrl && (
                <div className="mt-3 w-full">
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl">
                    <Image
                      src={data.photoPreviewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="mt-2 block w-full text-right text-xs font-semibold text-destructive"
                  >
                    Remove photo
                  </button>
                </div>
              )}
              <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
            </div>
          )}

          {/* Verify your visit */}
          <div className="rounded-2xl border-[1.5px] border-brand-gold/30 bg-gradient-to-br from-brand-gold-light/50 to-brand-gold-light/20 p-6 sm:p-7">
            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-card text-2xl shadow-sm">🧾</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-heading">Verify your visit</h3>
                  <span className="inline-flex items-center gap-1 rounded-pill bg-success px-2.5 py-0.5 text-[11px] font-bold text-white">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>
                    Verified
                  </span>
                </div>
                <p className="mt-1 text-sm text-text-secondary">
                  Upload your bill for proof of visit. Your review gets a <strong className="text-heading">Bill attached</strong> badge and you earn <strong className="text-success">+5 Crumbs</strong> on top of your photo bonus.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {data.billPreviewUrl ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-pill border border-success bg-success/10 px-4 py-2.5 text-sm font-semibold text-success">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>
                    Bill uploaded
                  </div>
                  <button
                    type="button"
                    onClick={() => { updateField('billFile', null); updateField('billPreviewUrl', null) }}
                    className="text-xs font-semibold text-destructive"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => billRef.current?.click()}
                  className="flex items-center gap-2 rounded-pill border-2 border-dashed border-brand-gold/40 bg-card px-5 py-2.5 text-sm font-semibold text-heading transition-colors hover:border-brand-gold hover:bg-brand-gold-light/30"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                  Upload Bill / Receipt
                </button>
              )}
              <span className="text-xs italic text-text-muted">100% optional</span>
            </div>
            {billError && <p className="mt-2 text-xs font-medium text-destructive">{billError}</p>}
            <div className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-brand-gold"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              Your bill is only used for verification — never shown publicly
            </div>
            <input ref={billRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={handleBillChange} />
          </div>

          {/* Submit bar */}
          <div className="hidden flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6 lg:flex">
            <p className="text-sm text-text-muted">
              {canSubmit ? (
                <><strong className="text-success">Ready to go!</strong> Your review looks great.</>
              ) : (
                'Complete all required fields to submit'
              )}
            </p>
            {submitError && <p className="w-full text-xs font-medium text-destructive">{submitError}</p>}
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="h-auto rounded-pill px-8 py-3.5 text-base font-semibold hover:bg-primary-dark hover:shadow-glow"
            >
              {submitting ? (
                <LoadingSpinner size="md" />
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-1"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                  {isEditMode ? 'Update Review' : 'Submit Review'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar (desktop only) */}
        <aside className="hidden space-y-4 lg:block">
          <div className="sticky top-24 space-y-4">

            {/* Progress card */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-base font-bold text-heading">Your progress</h3>
              <div className="mt-4 flex items-center gap-5">
                <ProgressRing percent={progressPercent} />
                <p className="text-sm text-text-secondary">
                  {completedCount === 3 ? (
                    <strong className="text-heading">All done!</strong>
                  ) : (
                    <><strong className="text-heading">{3 - completedCount} section{3 - completedCount > 1 ? 's' : ''}</strong> remaining</>
                  )}
                </p>
              </div>
              <div className="mt-5 space-y-3">
                <CheckItem done={ratingsComplete} label="Rate all 3 categories" />
                <CheckItem done={tagsComplete} label="Pick at least 1 tag" />
                <CheckItem done={textComplete} label={`Write ${REVIEW_TEXT_MIN_CHARS}+ characters`} />
              </div>
            </div>

            {/* Live preview card */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-base font-bold text-heading">Live preview</h3>
              <LivePreview data={data} hasBill={!!data.billFile} />
            </div>

          </div>
        </aside>
      </div>

      {isMounted && cropImageUrl && createPortal(
        <PhotoCropModal
          imageUrl={cropImageUrl}
          crop={crop}
          zoom={zoom}
          isCropping={isCroppingPhoto}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
          onCancel={closePhotoCropper}
          onConfirm={handleConfirmPhotoCrop}
        />,
        document.body,
      )}

      {isMounted && createPortal(
        <div
          className="fixed left-4 right-4 z-40 rounded-2xl border border-border bg-card/95 shadow-lg backdrop-blur-xl lg:hidden"
          style={{ bottom: 'calc(70px + env(safe-area-inset-bottom, 0px) + 12px)' }}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex items-center gap-1.5">
              {[ratingsComplete, tagsComplete, textComplete].map((done, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-2.5 w-2.5 rounded-full transition-colors duration-300',
                    done ? 'bg-success' : 'border-2 border-border',
                  )}
                />
              ))}
            </div>
            <span className="flex-1 text-xs font-semibold text-text-secondary">
              {completedCount === 3 ? 'Ready!' : `${completedCount} of 3 done`}
            </span>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="h-auto rounded-pill px-5 py-2 text-sm font-semibold hover:bg-primary-dark"
            >
              {submitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  {isEditMode ? 'Update' : 'Submit'}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-1"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </>
              )}
            </Button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}

function PhotoCropModal({
  imageUrl,
  crop,
  zoom,
  isCropping,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onCancel,
  onConfirm,
}: {
  imageUrl: string
  crop: Point
  zoom: number
  isCropping: boolean
  onCropChange: (crop: Point) => void
  onZoomChange: (zoom: number) => void
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/80 p-0 sm:items-center sm:justify-center sm:p-6">
      <div className="w-full overflow-hidden rounded-t-3xl bg-card shadow-2xl sm:max-w-2xl sm:rounded-3xl">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-bold text-heading">Fit your dish photo</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Move and zoom the image into a square frame. We&apos;ll save it as a consistent 1200x1200 photo.
          </p>
        </div>

        <div className="relative h-[52vh] min-h-[320px] bg-black sm:h-[480px]">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            minZoom={1}
            maxZoom={3}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropComplete}
            showGrid={false}
          />
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label htmlFor="photo-zoom" className="text-xs font-semibold uppercase tracking-widest text-text-muted">
              Zoom
            </label>
            <input
              id="photo-zoom"
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(event) => onZoomChange(Number(event.target.value))}
              className="mt-2 w-full accent-primary"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isCropping}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isCropping}
              className="flex-1"
            >
              {isCropping ? <LoadingSpinner size="sm" /> : 'Use photo'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ num, done, title, desc }: { num: number; done: boolean; title: string; desc: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <span className={cn(
          'flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white transition-colors duration-300',
          done ? 'bg-success' : 'bg-heading',
        )}>
          {done ? '✓' : num}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted">
          {num === 1 ? 'Rate' : num === 2 ? 'Tag' : 'Write'}
        </span>
      </div>
      <h2 className="font-display text-xl font-bold text-heading sm:text-2xl">{title}</h2>
      <p className="mt-1 text-sm text-text-secondary">{desc}</p>
    </div>
  )
}

function ProgressRing({ percent }: { percent: number }) {
  const circumference = 2 * Math.PI * 30
  const offset = circumference - (circumference * percent) / 100
  return (
    <div className="relative h-[72px] w-[72px] shrink-0">
      <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
        <circle cx="36" cy="36" r="30" fill="none" strokeWidth="6" className="stroke-border" />
        <circle
          cx="36" cy="36" r="30" fill="none" strokeWidth="6" strokeLinecap="round"
          className="stroke-primary transition-[stroke-dashoffset] duration-500"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-lg font-bold text-heading">
        {percent}%
      </span>
    </div>
  )
}

function CheckItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-all duration-300',
        done ? 'border-success bg-success text-white' : 'border-border text-transparent',
      )}>
        ✓
      </div>
      <span className={cn(
        'text-sm transition-colors',
        done ? 'text-text-secondary line-through opacity-60' : 'text-text-primary',
      )}>
        {label}
      </span>
    </div>
  )
}

function LivePreview({ data, hasBill }: { data: ReviewFormData; hasBill: boolean }) {
  const hasAnything = !!(data.tasteRating || data.portionRating || data.valueRating || data.tags.length > 0 || data.text)

  if (!hasAnything) {
    return <p className="mt-4 text-center text-sm text-text-muted">Your review will appear here as you fill it in...</p>
  }

  const rated = [data.tasteRating ?? 0, data.portionRating ?? 0, data.valueRating ?? 0].filter((v) => v > 0)
  const overall = rated.length ? Math.round(rated.reduce((a, b) => a + b, 0) / rated.length) : 0

  return (
    <div className="mt-4 space-y-3">
      <div className="flex gap-1 text-lg">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < overall ? 'text-brand-gold' : 'text-border'}>★</span>
        ))}
      </div>
      <div className="flex gap-3 text-xs text-text-muted">
        {(['tasteRating', 'portionRating', 'valueRating'] as const).map((key, i) => {
          const v = data[key] ?? 0
          return (
            <span key={key} className={v > 0 ? 'font-semibold text-text-primary' : ''}>
              {SUB_RATING_LABELS[i]}: {v > 0 ? `${v}.0` : '—'}
            </span>
          )
        })}
      </div>
      {data.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.tags.map((t) => (
            <span key={t} className="rounded-pill bg-bg-cream px-2.5 py-0.5 text-[11px] font-medium text-text-secondary">{t}</span>
          ))}
        </div>
      )}
      {data.text && (
        <p className="text-sm italic text-text-secondary">
          &ldquo;{data.text.length > 120 ? data.text.substring(0, 120) + '...' : data.text}&rdquo;
        </p>
      )}
      {hasBill && (
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-success">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>
          Verified Purchase
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

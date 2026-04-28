'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, X, Images } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DishPhoto } from '@/lib/types'
import { ROUTES } from '@/lib/constants/routes'
import { CONFIG } from '@/lib/constants'

interface DishPhotoGridProps {
  photos: DishPhoto[]
  dishName: string
  dishId: string
  restaurantId: string
  restaurantName: string
  reviewCount: number
}

function FoodIllustration({ width = 80, height = 80, className }: { width?: number; height?: number; className?: string }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-text-muted', className)}
      style={!className ? { opacity: 0.5 } : undefined}
    >
      <path d="M30 24C30 19 34 19 34 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 22C40 17 44 17 44 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M50 24C50 19 54 19 54 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 42C12 42 12 30 40 30C68 30 68 42 68 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="40" cy="42" rx="28" ry="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 42C12 46 14 53 17 55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M68 42C68 46 66 53 63 55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 55C17 59 27 64 40 64C53 64 63 59 63 55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 40C32 37 36 40 40 37" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 40C44 37 48 40 52 37" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function EmptySlot() {
  return (
    <div
      className="flex items-center justify-center bg-surface-2"
      style={{ border: '0.5px dashed var(--border)' }}
    >
      <FoodIllustration width={43} height={43} />
    </div>
  )
}

export function DishPhotoGrid({
  photos,
  dishName,
  dishId,
  restaurantId,
  restaurantName,
  reviewCount,
}: DishPhotoGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // TODO: replace with most-helpful sort once photo likes are implemented
  const sortedPhotos = [...photos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const gridPhotos = sortedPhotos.slice(0, CONFIG.PHOTO_GRID_MAX)
  const totalPhotos = sortedPhotos.length

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }, [])

  const closeLightbox = useCallback(() => setLightboxOpen(false), [])

  const goNext = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % totalPhotos)
  }, [totalPhotos])

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos)
  }, [totalPhotos])

  useEffect(() => {
    if (!lightboxOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [lightboxOpen, closeLightbox, goNext, goPrev])

  const writeReviewHref = `${ROUTES.WRITE_REVIEW}?dishId=${dishId}&restaurantId=${restaurantId}&dishName=${encodeURIComponent(dishName)}&restaurantName=${encodeURIComponent(restaurantName)}&from=${encodeURIComponent(ROUTES.dish(dishId))}`
  const hasReviews = reviewCount > 0

  return (
    <>
      <div
        className="grid h-[220px] grid-cols-1 grid-rows-[1fr] gap-[4px] overflow-hidden rounded-[12px] border border-border sm:h-[280px] sm:grid-cols-[60%_40%] sm:grid-rows-[1fr_1fr]"
      >
        {/* Left panel — spans both rows */}
        {totalPhotos === 0 ? (
          <div
            className="sm:row-span-2 flex flex-col items-center justify-center bg-surface-2 p-6"
            style={{ border: '0.5px dashed var(--border)' }}
          >
            <FoodIllustration />
            <div className="mt-3 flex flex-col items-center gap-1">
              <p className="text-sm text-text-secondary">
                {hasReviews ? 'No photos yet' : 'No reviews yet'}
              </p>
              <p className="text-[13px] text-text-muted">
                {hasReviews
                  ? 'Photos from reviews will appear here'
                  : 'Be the first to review this dish'}
              </p>
            </div>
            {!hasReviews && (
              <Button variant="ghost" size="sm" className="mt-3" render={<Link href={writeReviewHref} />}>
                Write a review
              </Button>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="relative sm:row-span-2 cursor-pointer overflow-hidden"
            onClick={() => openLightbox(0)}
          >
            <Image
              src={gridPhotos[0].url}
              alt={`${dishName} photo 1`}
              fill
              sizes="60vw"
              className="object-cover"
              priority
            />
            {totalPhotos >= 3 && (
              <div className="absolute bottom-3 right-3 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 bg-black/60 text-white backdrop-blur-sm hover:bg-black/70 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    openLightbox(0)
                  }}
                >
                  <Images className="size-4" />
                  Show all photos
                </Button>
              </div>
            )}
          </button>
        )}

        {/* Top-right slot */}
        {totalPhotos >= 2 ? (
          <button
            type="button"
            className="relative hidden cursor-pointer overflow-hidden sm:block"
            onClick={() => openLightbox(1)}
          >
            <Image
              src={gridPhotos[1].url}
              alt={`${dishName} photo 2`}
              fill
              sizes="40vw"
              className="object-cover"
            />
          </button>
        ) : (
          <div className="hidden sm:block"><EmptySlot /></div>
        )}

        {/* Bottom-right slot */}
        {totalPhotos >= 3 ? (
          <button
            type="button"
            className="relative hidden cursor-pointer overflow-hidden sm:block"
            onClick={() => openLightbox(2)}
          >
            <Image
              src={gridPhotos[2].url}
              alt={`${dishName} photo 3`}
              fill
              sizes="40vw"
              className="object-cover"
            />
          </button>
        ) : (
          <div className="hidden sm:block"><EmptySlot /></div>
        )}
      </div>

      {lightboxOpen && totalPhotos > 0 && (
        <PhotoLightbox
          photos={sortedPhotos}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={goNext}
          onPrev={goPrev}
          dishName={dishName}
        />
      )}
    </>
  )
}

function PhotoLightbox({
  photos,
  currentIndex,
  onClose,
  onNext,
  onPrev,
  dishName,
}: {
  photos: DishPhoto[]
  currentIndex: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
  dishName: string
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${dishName} photo gallery`}
    >
      <div className="absolute right-4 top-4 rounded-pill bg-black/50 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
        {currentIndex + 1} / {photos.length}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-4 text-white hover:bg-white/20"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        aria-label="Close gallery"
      >
        <X className="size-5" />
      </Button>

      {photos.length > 1 && (
        <Button
          variant="ghost"
          size="icon-lg"
          className="absolute left-4 top-1/2 min-h-[44px] min-w-[44px] -translate-y-1/2 text-white hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation()
            onPrev()
          }}
          aria-label="Previous photo"
        >
          <ChevronLeft className="size-6" />
        </Button>
      )}

      <div
        className="relative mx-4 h-[80vh] w-full max-w-4xl sm:mx-8 lg:mx-16"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={photos[currentIndex].url}
          alt={`${dishName} photo ${currentIndex + 1}`}
          fill
          sizes="100vw"
          className="object-contain"
          priority
          data-no-dim
        />
      </div>

      {photos.length > 1 && (
        <Button
          variant="ghost"
          size="icon-lg"
          className="absolute right-4 top-1/2 min-h-[44px] min-w-[44px] -translate-y-1/2 text-white hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          aria-label="Next photo"
        >
          <ChevronRight className="size-6" />
        </Button>
      )}
    </div>
  )
}

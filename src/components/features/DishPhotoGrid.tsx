'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ImageIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DishPhoto } from '@/lib/types'
import { getOptimizedImageUrl } from '@/lib/utils/image'

interface DishPhotoGridProps {
  photos: DishPhoto[]
  dishName: string
  dishId: string
  restaurantId: string
  restaurantName: string
  reviewCount: number
}

export function DishPhotoGrid({
  photos,
  dishName,
}: DishPhotoGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // TODO: replace with most-helpful sort once photo likes are implemented
  const sortedPhotos = [...photos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const totalPhotoCount = sortedPhotos.length
  const mainPhoto = sortedPhotos[0]
  const thumbnailPhotos = sortedPhotos.slice(1, 5)
  const extraPhotoCount = totalPhotoCount - thumbnailPhotos.length - 1

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }, [])

  const closeLightbox = useCallback(() => setLightboxOpen(false), [])

  const goNext = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % totalPhotoCount)
  }, [totalPhotoCount])

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + totalPhotoCount) % totalPhotoCount)
  }, [totalPhotoCount])

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

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Main slot: cover photo, or an empty-state placeholder */}
        {mainPhoto ? (
          <button
            type="button"
            className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-xl"
            onClick={() => openLightbox(0)}
          >
            <Image
              src={getOptimizedImageUrl(mainPhoto.url, 'grid') ?? ''}
              alt={mainPhoto.alt ?? `${dishName} photo 1`}
              fill
              sizes="(max-width: 768px) 100vw, 460px"
              className="object-cover transition-transform duration-300 hover:scale-105"
              priority
            />
          </button>
        ) : (
          <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl bg-surface-2">
            <span className="text-3xl opacity-40">📷</span>
            <p className="text-sm font-medium text-text-secondary">No photos yet</p>
            <p className="text-xs text-text-muted">Be the first to review this dish</p>
          </div>
        )}

        {/* Thumbnail strip: always 4 slots — filled slots are interactive,
            remaining slots render as subtle empty placeholders so the layout
            stays consistent (and matches the loading skeleton). */}
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => {
            const photo = thumbnailPhotos[i]

            if (!photo) {
              return (
                <div
                  key={`empty-${i}`}
                  aria-hidden="true"
                  className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-border bg-surface-2/50"
                >
                  <ImageIcon className="h-4 w-4 text-text-muted/50" />
                </div>
              )
            }

            const isLastThumb = i === thumbnailPhotos.length - 1
            return (
              <button
                key={photo.url}
                type="button"
                className="relative aspect-square cursor-pointer overflow-hidden rounded-lg"
                onClick={() => openLightbox(i + 1)}
              >
                <Image
                  src={getOptimizedImageUrl(photo.url, 'card') ?? ''}
                  alt={photo.alt ?? `${dishName} photo ${i + 2}`}
                  fill
                  sizes="(max-width: 768px) 25vw, 110px"
                  className="object-cover"
                />
                {isLastThumb && extraPhotoCount > 0 && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60">
                    <span className="text-sm font-bold text-white">+{extraPhotoCount}</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {lightboxOpen && totalPhotoCount > 0 && (
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
          src={getOptimizedImageUrl(photos[currentIndex].url, 'grid') ?? ''}
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

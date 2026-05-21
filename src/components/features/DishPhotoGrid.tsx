'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
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

  const gridPhotos = sortedPhotos.slice(0, 3)
  const totalPhotoCount = sortedPhotos.length

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
      {totalPhotoCount === 0 && (
        <div className="flex flex-col items-center justify-center w-full rounded-xl bg-background-tertiary py-16 gap-3">
          <span className="text-5xl opacity-40">📷</span>
          <p className="text-text-secondary text-sm font-medium">No photos yet</p>
          <p className="text-text-muted text-xs">Be the first to review this dish</p>
        </div>
      )}

      {totalPhotoCount === 1 && (
        <div
          className="relative w-full overflow-hidden rounded-xl max-h-[360px] sm:max-h-[420px] md:max-h-[480px]"
          style={{ aspectRatio: '4/3' }}
        >
          <Image
            src={getOptimizedImageUrl(photos[0].url, 'grid') ?? ''}
            alt={photos[0].alt ?? 'Dish photo'}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      {totalPhotoCount === 2 && (
        <div className="flex w-full gap-[4px] overflow-hidden rounded-[12px] border border-border">
          <button
            type="button"
            className="relative flex-[6] cursor-pointer overflow-hidden"
            style={{ aspectRatio: '3/4' }}
            onClick={() => openLightbox(0)}
          >
            <Image
              src={getOptimizedImageUrl(gridPhotos[0].url, 'grid') ?? ''}
              alt={gridPhotos[0].alt ?? `${dishName} photo 1`}
              fill
              sizes="60vw"
              className="object-cover"
              priority
            />
          </button>
          <button
            type="button"
            className="relative flex-[4] cursor-pointer overflow-hidden"
            style={{ aspectRatio: '3/4' }}
            onClick={() => openLightbox(1)}
          >
            <Image
              src={getOptimizedImageUrl(gridPhotos[1].url, 'grid') ?? ''}
              alt={gridPhotos[1].alt ?? `${dishName} photo 2`}
              fill
              sizes="40vw"
              className="object-cover"
            />
          </button>
        </div>
      )}

      {totalPhotoCount >= 3 && (
        <div
          className="grid h-[260px] grid-cols-1 grid-rows-[1fr] gap-[4px] overflow-hidden rounded-[12px] border border-border sm:h-[320px] sm:grid-cols-[60%_40%] sm:grid-rows-[1fr_1fr] md:h-[400px]"
        >
          {/* Left panel — spans both rows */}
          <button
            type="button"
            className="relative sm:row-span-2 cursor-pointer overflow-hidden"
            onClick={() => openLightbox(0)}
          >
            <Image
              src={getOptimizedImageUrl(gridPhotos[0].url, 'grid') ?? ''}
              alt={gridPhotos[0].alt ?? `${dishName} photo 1`}
              fill
              sizes="60vw"
              className="object-cover"
              priority
            />
          </button>

          {/* Top-right slot */}
          <button
            type="button"
            className="relative hidden cursor-pointer overflow-hidden sm:block"
            onClick={() => openLightbox(1)}
          >
            <Image
              src={getOptimizedImageUrl(gridPhotos[1].url, 'grid') ?? ''}
              alt={gridPhotos[1].alt ?? `${dishName} photo 2`}
              fill
              sizes="40vw"
              className="object-cover"
            />
          </button>

          {/* Bottom-right slot */}
          <button
            type="button"
            className="relative hidden cursor-pointer overflow-hidden sm:block"
            onClick={() => openLightbox(2)}
          >
            <div className="relative w-full h-full">
              <Image
                src={getOptimizedImageUrl(gridPhotos[2].url, 'grid') ?? ''}
                alt={gridPhotos[2].alt ?? `${dishName} photo 3`}
                fill
                sizes="40vw"
                className="object-cover"
              />
              {totalPhotoCount > 3 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
                  <span className="text-white text-sm font-bold">+{totalPhotoCount - 3} more</span>
                </div>
              )}
            </div>
          </button>
        </div>
      )}

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

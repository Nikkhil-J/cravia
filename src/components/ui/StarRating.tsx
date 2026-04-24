'use client'

import { useId, useState } from 'react'
import { MAX_RATING } from '@/lib/constants'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
}

const STAR_PATH = 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'

export function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const uniqueId = useId()
  const [hoverValue, setHoverValue] = useState(0)
  const stars = Array.from({ length: MAX_RATING }, (_, i) => i + 1)
  const starClass = sizeClasses[size]

  if (readonly) {
    return (
      <div className="flex items-center gap-0.5">
        {stars.map((star) => {
          const fill = Math.min(Math.max(value - (star - 1), 0), 1)
          const gradientId = `star-gradient-${uniqueId}-${star}`

          return (
            <svg
              key={star}
              className={starClass}
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id={gradientId}>
                  <stop offset={`${fill * 100}%`} stopColor="var(--color-brand-gold)" />
                  <stop offset={`${fill * 100}%`} stopColor="var(--color-border)" />
                </linearGradient>
              </defs>
              <path fill={`url(#${gradientId})`} d={STAR_PATH} />
            </svg>
          )
        })}
      </div>
    )
  }

  const displayValue = hoverValue || value

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => {
        const isFilled = star <= displayValue
        const isHoverPreview = hoverValue > 0 && star <= hoverValue && star > value

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            className="p-1.5 sm:p-1 focus:outline-none transition-opacity duration-150"
            aria-label={`Rate ${star} out of ${MAX_RATING}`}
          >
            <svg
              className={starClass}
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isFilled ? (
                <path
                  d={STAR_PATH}
                  fill={isHoverPreview ? 'color-mix(in srgb, var(--color-brand-gold) 70%, transparent)' : 'var(--color-brand-gold)'}
                />
              ) : (
                <path
                  d={STAR_PATH}
                  fill="none"
                  stroke="var(--color-border)"
                  strokeWidth="1.5"
                />
              )}
            </svg>
          </button>
        )
      })}
    </div>
  )
}

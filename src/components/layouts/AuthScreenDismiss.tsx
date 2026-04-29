'use client'

import { Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants/routes'

const dismissClassName = cn(
  'absolute right-4 top-4 z-10 flex min-h-11 min-w-11 items-center justify-center rounded-full',
  'border border-border bg-card text-text-secondary shadow-sm transition-colors',
  'hover:border-primary hover:text-primary',
  'lg:right-8 lg:top-8'
)

function DismissButton() {
  const router = useRouter()

  function handleDismiss() {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(ROUTES.HOME)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDismiss}
      className={dismissClassName}
      aria-label="Close and go back"
    >
      <X className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
    </button>
  )
}

export function AuthScreenDismiss() {
  return (
    <Suspense
      fallback={
        <button
          type="button"
          className={dismissClassName}
          aria-label="Close and go back"
          disabled
        >
          <X className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
        </button>
      }
    >
      <DismissButton />
    </Suspense>
  )
}

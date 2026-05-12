'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePWA } from '@/context/PWAContext'

interface MobileBackButtonProps {
  parentHref: string
  variant?: 'floating' | 'inline'
  label?: string
  className?: string
}

export function MobileBackButton({ parentHref, variant = 'inline', label = 'Back', className }: MobileBackButtonProps) {
  const router = useRouter()
  const { isPWA } = usePWA()

  const handleBack = () => {
    if (isPWA) {
      router.replace(parentHref)
    } else {
      if (window.history.length > 1) {
        router.back()
      } else {
        router.replace(parentHref)
      }
    }
  }

  if (variant === 'floating') {
    return (
      <button
        type="button"
        onClick={handleBack}
        aria-label="Go back"
        className={cn(
          'absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-colors active:bg-black/60 md:hidden',
          className,
        )}
      >
        <ChevronLeft className="h-5 w-5 text-white" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={cn(
        'mb-3 flex items-center gap-0.5 text-xs font-medium text-text-muted transition-colors hover:text-primary md:hidden',
        className,
      )}
    >
      <ChevronLeft className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}

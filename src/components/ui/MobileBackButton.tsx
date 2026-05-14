'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface MobileBackButtonProps {
  parentHref: string
  variant?: 'floating' | 'inline'
  label?: string
  className?: string
}

export function MobileBackButton({ parentHref, variant = 'inline', className }: MobileBackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.replace(parentHref)
    }
  }

  if (variant === 'floating') {
    return (
      <Button
        variant="ghost"
        onClick={handleBack}
        aria-label="Go back"
        className={cn(
          'absolute left-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 p-0 backdrop-blur-sm transition-colors active:bg-black/60 md:hidden',
          className,
        )}
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      aria-label="Go back"
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground/10 p-0 transition-colors hover:bg-foreground/15 active:bg-foreground/20 md:hidden',
        className,
      )}
    >
      <ChevronLeft className="h-6 w-6 text-foreground" />
    </Button>
  )
}

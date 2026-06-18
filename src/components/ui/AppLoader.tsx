'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { CraviaMark } from '@/components/ui/Logo'
import { cn } from '@/lib/utils'

// Minimum time the splash stays visible so the logo entrance animation
// has room to play and the experience feels intentional, not accidental.
const MIN_DISPLAY_MS = 900

/**
 * Full-screen splash overlay that covers the app during the initial auth check.
 *
 * Lifecycle:
 *   1. Mounts immediately (SSR + client) as an opaque warm overlay — prevents
 *      any content flash before auth state is known.
 *   2. The Cravia logo animates in on mount (scale + fade via animate-pop-in).
 *   3. Fade-out starts only when BOTH conditions are met:
 *        a) Firebase auth has resolved (isInitialized)
 *        b) MIN_DISPLAY_MS has elapsed since mount
 *   4. After the 350ms fade-out, the overlay unmounts entirely.
 */
export function AppLoader() {
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const [minTimePassed, setMinTimePassed] = useState(false)
  const [hidden, setHidden] = useState(false)
  const exiting = isInitialized && minTimePassed

  // Start the minimum display timer once on mount.
  useEffect(() => {
    const t = setTimeout(() => setMinTimePassed(true), MIN_DISPLAY_MS)
    return () => clearTimeout(t)
  }, [])

  // Trigger fade-out once both conditions are satisfied.
  useEffect(() => {
    if (!exiting) return
    const t = setTimeout(() => setHidden(true), 350)
    return () => clearTimeout(t)
  }, [exiting])

  if (hidden) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex flex-col items-center justify-center app-loader-bg',
        'transition-opacity duration-300 ease-out',
        exiting ? 'pointer-events-none opacity-0' : 'opacity-100',
      )}
      aria-hidden="true"
    >
      <div className="flex h-16 items-center gap-2.5">
        <span className="relative h-16 w-16 shrink-0">
          <CraviaMark
            size={56}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[42%]"
          />
        </span>
        <span
          className="text-coral-deep flex h-16 items-center text-[2.5rem] font-extrabold uppercase leading-none tracking-[0.07em]"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          Cravia
        </span>
      </div>
    </div>
  )
}

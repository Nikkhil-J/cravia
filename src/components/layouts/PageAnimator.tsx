'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

interface PageAnimatorProps {
  children: ReactNode
}

/**
 * Restarts the `animate-page-enter` CSS animation on every client-side
 * navigation without unmounting or remounting children. This means:
 *
 *  - No RSC refetch triggered (unlike template.tsx which forced re-renders)
 *  - No loading flash — content comes instantly from the Next.js router cache
 *  - Works on every browser (pure CSS, no View Transitions API required)
 *  - Plays on both forward and back navigation
 *
 * Technique: force a DOM reflow on the element to restart a running animation.
 * This is safe and widely used (WAAPI / CSS animation reset pattern).
 */
export function PageAnimator({ children }: PageAnimatorProps) {
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Remove the animation, force a reflow, then re-apply it.
    el.style.animation = 'none'
    void el.offsetHeight
    el.style.animation = ''
  }, [pathname])

  return (
    <div ref={ref} className="animate-page-enter">
      {children}
    </div>
  )
}

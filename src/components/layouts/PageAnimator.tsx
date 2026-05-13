'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

interface PageAnimatorProps {
  children: ReactNode
}

// popstate fires (before React processes the URL) whenever the user goes back
// or forward via router.back() / router.forward() / native swipe-back gesture.
// It does NOT fire on forward router.push() navigations.
let isPopNavigation = false
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    isPopNavigation = true
  })
}

/**
 * Restarts the `animate-page-enter` CSS animation on forward navigations.
 * Skips the animation on back/forward navigations so returning to a page
 * feels instant rather than looking like a full-page refresh.
 *
 *  - No RSC refetch triggered (unlike template.tsx which forced re-renders)
 *  - No loading flash — content comes instantly from the Next.js router cache
 *  - Works on every browser (pure CSS, no View Transitions API required)
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

    if (isPopNavigation) {
      isPopNavigation = false
      // Cancel the animation so the page snaps in instantly on back navigation.
      el.style.animation = 'none'
      void el.offsetHeight
      return
    }

    // Forward navigation — replay the entrance animation.
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

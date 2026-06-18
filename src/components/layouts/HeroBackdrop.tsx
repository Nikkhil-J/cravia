'use client'

import { usePathname } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

/**
 * A single continuous gradient layer that sits behind both the (transparent)
 * navbar and the hero on the landing page. Anchored to the top of the shared
 * PageShell container so the cream surface starts at the very top of the page
 * and flows seamlessly into the hero — no seam between navbar and hero.
 *
 * Cream is held solid through the navbar + upper-hero zone (via the `from-[60%]`
 * colour stop) so there is no tonal shift under the navbar on load, then fades
 * to the page background colour lower down. Because it terminates in the page
 * background, the exact height and hold point are non-critical — overshooting
 * just fades slightly later and can never create a hard edge.
 */
export function HeroBackdrop() {
  const pathname = usePathname()
  if (pathname !== ROUTES.HOME) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[820px] bg-gradient-to-b from-bg-cream from-[60%] to-background to-100%"
    />
  )
}

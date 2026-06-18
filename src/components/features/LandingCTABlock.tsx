'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { ROUTES } from '@/lib/constants/routes'
import { Reveal } from '@/components/ui/AnimateReveal'

export function LandingCTABlock() {
  const { isAuthenticated, isLoading } = useAuth()

  // AppLoader keeps the screen hidden while auth resolves, so we can wait
  // for a confirmed auth state before choosing which CTA to show.
  if (isLoading) return null

  const eyebrow = isAuthenticated ? 'Keep exploring' : 'Join the community'

  const heading = isAuthenticated ? (
    <>
      Found something
      <br />
      worth sharing?
    </>
  ) : (
    <>
      Stop guessing.
      <br />
      Start eating better.
    </>
  )

  const body = isAuthenticated
    ? 'Discover top-rated dishes near you and share your honest reviews. Earn Crumbs for every review — redeem for real restaurant coupons.'
    : "Join Gurgaon's first dish-level review community. Earn Crumbs for every review — redeem for real restaurant coupons."

  const primary = isAuthenticated
    ? { href: ROUTES.WRITE_REVIEW, label: 'Write a review' }
    : { href: ROUTES.SIGNUP, label: 'Create free account' }

  return (
    <section className="relative mt-20 overflow-hidden bg-heading px-6 py-24 text-center sm:px-8">
      {/* Decorative warm blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-[500px] w-[500px] rounded-full bg-coral/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-brand-gold/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-[640px]">
        <Reveal>
          <div className="mb-3 text-[13px] font-bold uppercase tracking-[0.12em] text-brand-gold">
            {eyebrow}
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mb-3 font-display text-[clamp(28px,3.5vw,42px)] font-bold leading-[1.2] text-white">
            {heading}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mb-9 max-w-[560px] text-base leading-relaxed text-white/60">
            {body}
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={primary.href}
              className="inline-flex items-center justify-center rounded-pill bg-white px-8 py-3.5 text-base font-semibold text-heading transition-transform hover:-translate-y-0.5"
            >
              {primary.label}
            </Link>
            <Link
              href={`${ROUTES.EXPLORE}?tab=dishes`}
              className="inline-flex items-center justify-center rounded-pill border-2 border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              Explore dishes
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

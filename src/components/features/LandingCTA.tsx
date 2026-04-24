'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { ROUTES } from '@/lib/constants/routes'

export function LandingCTA() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return null

  return (
    <section className="bg-gradient-to-r from-primary to-brand-orange px-4 py-10 text-center text-white sm:px-6 sm:py-16">
      <h2 className="font-display text-2xl font-bold sm:text-3xl">Ready to discover?</h2>
      <p className="mt-2 text-base text-white/70 sm:mt-3 sm:text-lg">
        {isAuthenticated
          ? 'Explore dishes and share your honest reviews.'
          : 'Join the community and share your honest reviews.'}
      </p>
      <Link
        href={isAuthenticated ? ROUTES.EXPLORE : ROUTES.SIGNUP}
        className="mt-6 inline-flex items-center justify-center rounded-pill bg-background px-8 py-3 text-sm font-bold text-primary transition-all hover:-translate-y-0.5 active:translate-y-0 hover:shadow-lg active:shadow-md"
      >
        {isAuthenticated ? 'Explore dishes' : 'Create free account'}
      </Link>
    </section>
  )
}

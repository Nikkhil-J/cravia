'use client'

import { Suspense, type ReactNode } from 'react'
import { useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { PageShell } from '@/components/layouts/PageShell'
import { ROUTES } from '@/lib/constants/routes'

const SKIP_EMAIL_VERIFICATION =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION === 'true'

function ProtectedPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar skeleton */}
      <div className="h-16 w-full border-b border-border bg-background px-4">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
          <div className="h-7 w-24 animate-pulse rounded bg-muted" />
          <div className="flex gap-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>

      {/* Content area skeleton */}
      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-xl space-y-4">
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-32 w-full animate-pulse rounded-lg bg-muted" />
        </div>
      </main>

      {/* Mobile bottom nav skeleton */}
      <div className="fixed bottom-0 left-0 right-0 h-[70px] border-t border-border bg-background md:hidden">
        <div className="flex h-full items-center justify-around px-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 w-6 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    </div>
  )
}

function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, authUser } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      const returnUrl = searchParams.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname
      router.replace(ROUTES.loginWithRedirect(encodeURIComponent(returnUrl)))
      return
    }

    // Block email/password users who haven't verified yet.
    // Google sign-ins always have emailVerified === true so they pass through.
    if (!SKIP_EMAIL_VERIFICATION && authUser && !authUser.emailVerified) {
      const returnUrl = searchParams.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname
      router.replace(`${ROUTES.VERIFY_EMAIL}?redirect=${encodeURIComponent(returnUrl)}`)
    }
  }, [isAuthenticated, isLoading, authUser, router, pathname, searchParams])

  if (isLoading) {
    return <ProtectedPageSkeleton />
  }

  if (!isAuthenticated || (!SKIP_EMAIL_VERIFICATION && authUser && !authUser.emailVerified)) return null

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <PageShell>{children}</PageShell>
    </>
  )
}

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ProtectedPageSkeleton />}>
      <AuthGate>{children}</AuthGate>
    </Suspense>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { Logo } from '@/components/ui/Logo'
import { cn } from '@/lib/utils'

/**
 * Full-screen splash overlay that covers the app during the initial auth check.
 * Stays visible until isInitialized becomes true (Firebase has resolved), then
 * fades out and unmounts. This prevents the nav, banners, and auth-gated content
 * from flickering into view before auth state is known.
 */
export function AppLoader() {
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!isInitialized) return
    const t = setTimeout(() => setHidden(true), 350)
    return () => clearTimeout(t)
  }, [isInitialized])

  if (hidden) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex flex-col items-center justify-center app-loader-bg',
        'transition-opacity duration-300 ease-out',
        isInitialized ? 'pointer-events-none opacity-0' : 'opacity-100',
      )}
      aria-hidden="true"
    >
      <Logo size="lg" />
    </div>
  )
}

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense, useEffect, useState, type ReactNode } from 'react'
import { ThemeProvider, useTheme } from 'next-themes'
import { AppProgressBar } from 'next-nprogress-bar'
import { MotionConfig } from 'motion/react'
import { Toaster, toast } from 'sonner'
import { AuthProvider } from '@/lib/hooks/useAuth'
import { CONFIG } from '@/lib/constants'
import { PWAProvider } from '@/lib/context/PWAContext'
import { AppLoader } from '@/components/ui/AppLoader'

function ThemedToaster() {
  const { resolvedTheme } = useTheme()
  return (
    <Toaster
      position="bottom-center"
      richColors
      closeButton
      theme={(resolvedTheme as 'light' | 'dark') ?? 'light'}
    />
  )
}

/**
 * Watches for a waiting service worker (installed but blocked by skipWaiting: false)
 * and shows a toast offering to reload into the new version. This prevents the new
 * SW from taking over mid-session and wiping the Next.js router cache, which was
 * causing every back-navigation to look like a full page refresh.
 */
function useSWUpdateNotifier() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    const notifyUpdate = (reg: ServiceWorkerRegistration) => {
      const waiting = reg.waiting
      if (!waiting) return

      toast('App updated', {
        description: 'A new version is ready.',
        duration: Infinity,
        action: {
          label: 'Reload',
          onClick: () => {
            waiting.postMessage({ type: 'SKIP_WAITING' })
            // Reload once the new SW has taken control.
            navigator.serviceWorker.addEventListener('controllerchange', () => {
              window.location.reload()
            }, { once: true })
          },
        },
      })
    }

    navigator.serviceWorker.ready.then((reg) => {
      // Already waiting (e.g., page was loaded after a deploy).
      if (reg.waiting) {
        notifyUpdate(reg)
        return
      }
      // New SW found after initial page load.
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (!newWorker) return
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            notifyUpdate(reg)
          }
        })
      })
    }).catch(() => {
      // SW not ready yet — not a problem.
    })
  }, [])
}

export function Providers({ children }: { children: ReactNode }) {
  useSWUpdateNotifier()

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: CONFIG.REACT_QUERY_STALE_TIME_MS,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <PWAProvider>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <Suspense>
        <AppProgressBar
          height="3px"
          color="var(--color-primary)"
          options={{ showSpinner: false }}
          shallowRouting
        />
      </Suspense>
      <MotionConfig reducedMotion="user">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </MotionConfig>
      <AppLoader />
      <ThemedToaster />
    </ThemeProvider>
    </PWAProvider>
  )
}

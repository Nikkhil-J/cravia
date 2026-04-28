'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense, useState, type ReactNode } from 'react'
import { ThemeProvider, useTheme } from 'next-themes'
import { AppProgressBar } from 'next-nprogress-bar'
import { MotionConfig } from 'motion/react'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/lib/hooks/useAuth'
import { CONFIG } from '@/lib/constants'

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

export function Providers({ children }: { children: ReactNode }) {
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
      <ThemedToaster />
    </ThemeProvider>
  )
}

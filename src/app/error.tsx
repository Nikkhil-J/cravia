'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { CLIENT_ERRORS } from '@/lib/constants/errors'
import { captureError } from '@/lib/monitoring/sentry'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    captureError(error, { route: 'GlobalError' })
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl">😕</div>
      <h1 className="mt-6 font-display text-2xl font-bold text-heading">
        {CLIENT_ERRORS.SOMETHING_WENT_WRONG}
      </h1>
      <p className="mt-3 max-w-md text-text-secondary">
        We hit an unexpected error. Our team has been notified.
      </p>
      <div className="mt-8 flex gap-3">
        <Button
          variant="default"
          onClick={reset}
          className="rounded-pill px-6 py-2.5 text-sm font-semibold hover:bg-primary-dark"
        >
          Try again
        </Button>
        <Button
          variant="outline"
          render={<Link href={ROUTES.HOME} />}
          className="rounded-pill px-6 py-2.5 text-sm font-semibold"
        >
          Go home
        </Button>
      </div>
      {error.digest && (
        <p className="mt-6 font-mono text-xs text-text-muted">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  )
}

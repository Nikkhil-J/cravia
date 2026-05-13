'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthShell } from '@/components/layouts/AuthShell'
import { sendVerificationEmail, reloadAuthUser } from '@/lib/hooks/useAuth'
import { useAuthStore } from '@/lib/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'

const RESEND_COOLDOWN_SECS = 60
const POLL_INTERVAL_MS = 3000

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || ROUTES.ONBOARDING
  const authUser = useAuthStore((s) => s.authUser)

  const [checking, setChecking] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Redirect away if already verified or not logged in
  useEffect(() => {
    if (!authUser) {
      router.replace(ROUTES.LOGIN)
      return
    }
    if (authUser.emailVerified) {
      router.replace(redirectTo)
    }
  }, [authUser, redirectTo, router])

  // Auto-poll — when the user clicks the link in their email, we catch it
  useEffect(() => {
    const interval = setInterval(async () => {
      const verified = await reloadAuthUser()
      if (verified) router.replace(redirectTo)
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [redirectTo, router])

  function startCooldown() {
    setResendCooldown(RESEND_COOLDOWN_SECS)
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  async function handleResend() {
    setResending(true)
    setResendError(null)
    const err = await sendVerificationEmail()
    setResending(false)
    if (err) {
      setResendError(err)
    } else {
      startCooldown()
    }
  }

  async function handleCheckNow() {
    setChecking(true)
    const verified = await reloadAuthUser()
    setChecking(false)
    if (verified) {
      router.replace(redirectTo)
    }
  }

  const email = authUser?.email ?? 'your email'

  return (
    <div className="text-center">
      <div className="text-5xl">📬</div>
      <p className="mt-4 font-display text-lg font-bold text-heading">Check your inbox</p>
      <p className="mt-2 text-sm text-text-secondary">
        We sent a verification link to{' '}
        <span className="font-semibold text-text-primary">{email}</span>.
        Click the link to activate your account.
      </p>
      <p className="mt-1 text-xs text-text-muted">
        Don&apos;t see it? Check your spam folder.
      </p>

      <Button
        onClick={handleCheckNow}
        disabled={checking}
        className="mt-8 w-full rounded-lg py-3 font-semibold"
      >
        {checking ? <LoadingSpinner size="sm" /> : "I've verified — continue"}
      </Button>

      <Button
        variant="outline"
        onClick={handleResend}
        disabled={resending || resendCooldown > 0}
        className="mt-3 w-full rounded-lg border-2 py-3 font-semibold"
      >
        {resending
          ? <LoadingSpinner size="sm" />
          : resendCooldown > 0
          ? `Resend in ${resendCooldown}s`
          : 'Resend verification email'}
      </Button>

      {resendError && (
        <p className="mt-3 text-xs font-medium text-destructive">{resendError}</p>
      )}

      <p className="mt-6 text-xs text-text-muted">
        Wrong email?{' '}
        <button
          onClick={async () => {
            const { logout } = await import('@/lib/hooks/useAuth')
            await logout()
            router.replace(ROUTES.SIGNUP)
          }}
          className="font-semibold text-primary hover:underline"
        >
          Sign up again
        </button>
      </p>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <AuthShell title="Verify your email" subtitle="One last step before you start exploring">
      <Suspense fallback={<div className="flex justify-center py-4"><LoadingSpinner /></div>}>
        <VerifyEmailContent />
      </Suspense>
    </AuthShell>
  )
}

'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { updateUser } from '@/lib/services/users'
import { useAuthStore } from '@/lib/store/authStore'
import { CUISINE_TYPES, CITY_AREAS, CUISINE_EMOJI, GURUGRAM } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { CLIENT_ERRORS } from '@/lib/constants/errors'
import { captureError } from '@/lib/monitoring/sentry'

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><LoadingSpinner /></div>}>
      <OnboardingContent />
    </Suspense>
  )
}

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || ROUTES.HOME
  const { user } = useAuth()
  const authUser = useAuthStore((s) => s.authUser)
  const setUser = useAuthStore((s) => s.setUser)
  const [step, setStep] = useState(1)
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  function toggleCuisine(c: string) {
    setSelectedCuisines(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    )
  }

  async function handleComplete() {
    if (!user) { router.push(redirectTo); return }
    setSaving(true)
    setSaveError(null)

    try {
      const updates: Parameters<typeof updateUser>[1] = { city: GURUGRAM }
      if (selectedCuisines.length > 0) updates.favoriteCuisines = selectedCuisines
      if (selectedArea) updates.area = selectedArea

      const success = await updateUser(user.id, updates)

      if (!success) {
        setSaveError(CLIENT_ERRORS.SOMETHING_WENT_WRONG_RETRY)
        setSaving(false)
        return
      }

      setUser({ ...user, city: GURUGRAM }, authUser)
      router.push(redirectTo)
    } catch (err) {
      captureError(err, { route: 'OnboardingPage' })
      setSaveError(CLIENT_ERRORS.SOMETHING_WENT_WRONG_RETRY)
    } finally {
      setSaving(false)
    }
  }

  const areas: readonly string[] = CITY_AREAS[GURUGRAM] ?? []

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-8 flex gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={cn('h-1.5 flex-1 rounded-full transition-colors', s <= step ? 'bg-primary' : 'bg-border')} />
          ))}
        </div>

        {/* Step 1: Cuisine preferences */}
        {step === 1 && (
          <div>
            <h1 className="font-display text-2xl font-bold text-heading">
              What cuisines do you love?
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Pick your favourites to personalize your feed.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              {CUISINE_TYPES.map((c) => (
                <Button
                  key={c}
                  variant="outline"
                  onClick={() => toggleCuisine(c)}
                  className={cn(
                    'h-auto justify-start gap-2 rounded-lg border-2 px-3 py-2.5 text-left text-sm font-medium',
                    selectedCuisines.includes(c)
                      ? 'border-primary bg-primary-light text-primary-dark hover:bg-primary-light'
                      : 'border-border bg-card text-text-secondary hover:border-primary/50'
                  )}
                >
                  <span>{CUISINE_EMOJI[c] ?? '🍴'}</span>
                  {c}
                </Button>
              ))}
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={selectedCuisines.length === 0}
              className="mt-8 w-full h-auto rounded-pill py-3 text-sm font-semibold hover:bg-primary-dark"
            >
              Continue
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push(redirectTo)}
              className="mt-3 w-full h-auto text-sm text-text-muted hover:text-text-secondary hover:bg-transparent"
            >
              Skip for now
            </Button>
          </div>
        )}

        {/* Step 2: Area selection */}
        {step === 2 && (
          <div>
            <h1 className="font-display text-2xl font-bold text-heading">
              What area are you in?
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              We&apos;ll show you dishes near you in Gurugram.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {areas.map((a) => (
                <Button
                  key={a}
                  variant="outline"
                  onClick={() => setSelectedArea(a)}
                  className={cn(
                    'h-auto min-h-[44px] rounded-pill border px-3 text-xs font-medium',
                    selectedArea === a
                      ? 'border-primary bg-primary text-white hover:bg-primary hover:text-white'
                      : 'border-border bg-card text-text-secondary hover:border-primary'
                  )}
                >
                  {a}
                </Button>
              ))}
            </div>
            <div className="mt-8 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 h-auto rounded-pill border-2 border-border py-3 text-sm font-semibold text-text-primary hover:border-primary hover:text-primary hover:bg-transparent"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="flex-1 h-auto rounded-pill py-3 text-sm font-semibold hover:bg-primary-dark"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <div className="text-center">
            <div className="text-6xl">🎉</div>
            <h1 className="mt-5 font-display text-3xl font-bold text-heading">
              You&apos;re all set!
            </h1>
            <p className="mt-3 text-text-secondary">
              Welcome{user ? `, ${user.displayName.split(' ')[0]}` : ''}! Start discovering amazing dishes.
            </p>

            <div className="mx-auto mt-6 max-w-xs rounded-xl border border-brand-gold/30 bg-bg-cream p-4 text-left">
              <p className="text-sm font-semibold text-heading">🏆 Earn DishPoints</p>
              <p className="mt-1 text-xs text-text-secondary">
                Every review you write earns DishPoints. Earn 500 points to unlock real restaurant coupons.
              </p>
            </div>

            {saveError && (
              <div className="mt-6 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <p>{saveError}</p>
                <p className="mt-1 text-text-muted">
                  Your progress is saved — just your preferences didn&apos;t save. Please try again.
                </p>
              </div>
            )}
            <Button
              onClick={handleComplete}
              disabled={saving}
              className="mt-8 w-full h-auto rounded-pill py-3 text-sm font-semibold hover:bg-primary-dark hover:shadow-glow"
            >
              {saving ? 'Saving...' : saveError ? 'Try Again' : 'Start Exploring'}
            </Button>
            <Link
              href={ROUTES.WRITE_REVIEW}
              className="mt-3 inline-flex w-full items-center justify-center rounded-pill border-2 border-border py-3 text-sm font-semibold text-text-primary transition-colors hover:border-primary hover:text-primary"
            >
              Write your first review
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

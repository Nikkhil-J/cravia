'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/lib/hooks/useAuth'
import { ROUTES } from '@/lib/constants/routes'
import { API_ENDPOINTS } from '@/lib/constants/api'
import { HTTP_HEADERS } from '@/lib/constants'

function RequestRestaurantContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { authUser } = useAuth()
  const [restaurantName, setRestaurantName] = useState(searchParams.get('name') ?? '')
  const [location, setLocation] = useState(searchParams.get('location') ?? '')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!authUser || !restaurantName.trim()) return

    setSubmitting(true)
    try {
      const token = await authUser.getIdToken()
      const response = await fetch(API_ENDPOINTS.RESTAURANT_REQUESTS, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON,
        },
        body: JSON.stringify({
          restaurantName,
          location,
          note,
        }),
      })

      const payload = (await response.json()) as { message?: string }
      if (!response.ok) {
        throw new Error(payload.message ?? 'Could not submit restaurant request.')
      }

      toast.success('Restaurant request submitted')
      router.push(ROUTES.MY_PROFILE)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not submit restaurant request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-heading"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div>
          <span className="text-4xl">🏪</span>
          <h1 className="mt-4 font-display text-2xl font-bold text-heading">Request a restaurant</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Tell us what restaurant you want on Cravia. We will review it and add it when we can verify the details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <Label htmlFor="restaurantName">Restaurant name</Label>
            <Input
              id="restaurantName"
              value={restaurantName}
              onChange={(event) => setRestaurantName(event.target.value)}
              placeholder="e.g. Carnatic Cafe"
              maxLength={120}
              required
              className="mt-2 h-auto rounded-xl border-border px-4 py-3"
            />
          </div>

          <div>
            <Label htmlFor="location">Location or area</Label>
            <Input
              id="location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="e.g. Cyber Hub, Sector 29, near Galleria"
              maxLength={160}
              className="mt-2 h-auto rounded-xl border-border px-4 py-3"
            />
            <p className="mt-1 text-xs text-text-muted">Optional, but it helps us find the right branch.</p>
          </div>

          <div>
            <Label htmlFor="note">Anything else?</Label>
            <textarea
              id="note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Cuisine, popular dishes, landmark, or why we should add it."
              maxLength={500}
              rows={4}
              className="mt-2 w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none placeholder:text-text-muted focus:border-primary"
            />
          </div>

          <Button
            type="submit"
            disabled={!authUser || !restaurantName.trim() || submitting}
            className="h-auto w-full rounded-pill py-3 text-base font-semibold hover:bg-primary-dark"
          >
            {submitting ? <LoadingSpinner size="sm" /> : 'Submit request'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function RequestRestaurantPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner /></div>}>
      <RequestRestaurantContent />
    </Suspense>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/lib/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AdminDetailHeader } from '@/components/features/admin/AdminDetailHeader'
import { formatRelativeTime } from '@/lib/utils/index'
import type { RestaurantRequest } from '@/lib/types'
import { API_ENDPOINTS } from '@/lib/constants/api'
import { ROUTES } from '@/lib/constants/routes'
import { HTTP_HEADERS } from '@/lib/constants'

export default function AdminRequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { authUser } = useAuth()
  const [request, setRequest] = useState<RestaurantRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [adminNote, setAdminNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      if (!authUser) return
      const token = await authUser.getIdToken()
      const res = await fetch(API_ENDPOINTS.ADMIN_RESTAURANT_REQUESTS, {
        headers: { authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const payload = (await res.json()) as { requests?: RestaurantRequest[] }
        setRequest(payload.requests?.find((r) => r.id === id) ?? null)
      }
      setLoading(false)
    }
    load()
  }, [authUser, id])

  async function handleMarkDone() {
    if (!request || !authUser) return
    setSubmitting(true)
    try {
      const token = await authUser.getIdToken()
      const res = await fetch(API_ENDPOINTS.adminRestaurantRequest(encodeURIComponent(request.id)), {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${token}`,
          [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON,
        },
        body: JSON.stringify({ action: 'done', note: adminNote }),
      })
      if (res.ok) {
        toast.success('Request marked as done')
        router.push(ROUTES.ADMIN_REQUESTS)
      } else {
        toast.error('Failed to update request')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>

  if (!request) {
    return (
      <div>
        <AdminDetailHeader backHref={ROUTES.ADMIN_REQUESTS} backLabel="Restaurant Requests" title="Request not found" />
        <div className="mt-8">
          <EmptyState icon="🔍" title="Not found" description="This request may have already been resolved." />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref={ROUTES.ADMIN_REQUESTS}
        backLabel="Restaurant Requests"
        title={request.restaurantName}
        subtitle={request.location ?? undefined}
        badge={<Badge className="bg-brand-gold-light text-brand-gold capitalize">{request.status}</Badge>}
      />

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Details</h2>
        <dl className="mt-3 space-y-3 text-sm">
          <DetailRow label="Requested by" value={request.requestedByName} />
          {request.requestedByCity && <DetailRow label="City" value={request.requestedByCity} />}
          <DetailRow label="Submitted" value={formatRelativeTime(request.createdAt)} />
          {request.note && (
            <div>
              <dt className="text-text-muted">User note</dt>
              <dd className="mt-1 whitespace-pre-wrap rounded-lg bg-surface-2 p-3 text-text-primary">{request.note}</dd>
            </div>
          )}
          {request.adminNote && (
            <div>
              <dt className="text-text-muted">Existing admin note</dt>
              <dd className="mt-1 whitespace-pre-wrap rounded-lg bg-surface-2 p-3 text-text-primary">{request.adminNote}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Resolve</h2>
        <div className="mt-3">
          <Label className="mb-1.5 block text-xs font-medium text-text-secondary">Admin note (optional)</Label>
          <Input
            placeholder="Add a note about how this was handled…"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
          />
        </div>
        <Button onClick={handleMarkDone} disabled={submitting} className="mt-4 w-full sm:w-auto">
          {submitting ? 'Saving…' : 'Mark done'}
        </Button>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-right font-medium text-text-primary">{value}</dd>
    </div>
  )
}

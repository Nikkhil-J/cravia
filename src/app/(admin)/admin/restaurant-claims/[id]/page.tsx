'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
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
import type { RestaurantClaim } from '@/lib/types'
import { API_ENDPOINTS } from '@/lib/constants/api'
import { ROUTES } from '@/lib/constants/routes'
import { HTTP_HEADERS } from '@/lib/constants'

export default function AdminClaimDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { authUser } = useAuth()
  const [claim, setClaim] = useState<RestaurantClaim | null>(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState<'approve' | 'reject' | null>(null)

  useEffect(() => {
    async function load() {
      if (!authUser) return
      const token = await authUser.getIdToken()
      const res = await fetch(API_ENDPOINTS.ADMIN_RESTAURANT_CLAIMS, {
        headers: { authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = (await res.json()) as { claims?: RestaurantClaim[] }
        setClaim(data.claims?.find((c) => c.id === id) ?? null)
      }
      setLoading(false)
    }
    load()
  }, [authUser, id])

  async function handleAction(action: 'approve' | 'reject') {
    if (!claim || !authUser) return
    setSubmitting(action)
    try {
      const token = await authUser.getIdToken()
      const res = await fetch(API_ENDPOINTS.ADMIN_RESTAURANT_CLAIMS, {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${token}`,
          [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON,
        },
        body: JSON.stringify({ claimId: claim.id, action, note }),
      })
      if (res.ok) {
        toast.success(action === 'approve' ? 'Claim approved' : 'Claim rejected')
        router.push(ROUTES.ADMIN_CLAIMS)
      } else {
        toast.error('Failed to update claim')
      }
    } finally {
      setSubmitting(null)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>

  if (!claim) {
    return (
      <div>
        <AdminDetailHeader backHref={ROUTES.ADMIN_CLAIMS} backLabel="Restaurant Claims" title="Claim not found" />
        <div className="mt-8">
          <EmptyState icon="🔍" title="Not found" description="This claim may have already been reviewed." />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref={ROUTES.ADMIN_CLAIMS}
        backLabel="Restaurant Claims"
        title={claim.restaurantName}
        subtitle={`Submitted ${formatRelativeTime(claim.createdAt)}`}
        badge={<Badge className="bg-brand-gold-light text-brand-gold capitalize">{claim.status}</Badge>}
      />

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Claimant</h2>
        <dl className="mt-3 space-y-3 text-sm">
          <DetailRow label="Name" value={claim.userName} />
          <DetailRow label="Email" value={claim.userEmail} />
          <DetailRow label="Phone" value={claim.phone} />
          <DetailRow label="Role" value={claim.role} />
        </dl>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" size="sm" render={<Link href={ROUTES.restaurant(claim.restaurantId)} target="_blank" />}>
            View restaurant
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
          {claim.proofDocumentUrl && (
            <Button variant="outline" size="sm" render={<a href={claim.proofDocumentUrl} target="_blank" rel="noopener noreferrer" />}>
              Proof document
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        {claim.adminNote && (
          <div className="mt-4">
            <p className="text-text-muted">Existing admin note</p>
            <p className="mt-1 whitespace-pre-wrap rounded-lg bg-surface-2 p-3 text-sm text-text-primary">{claim.adminNote}</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Decision</h2>
        <div className="mt-3">
          <Label className="mb-1.5 block text-xs font-medium text-text-secondary">Note (optional)</Label>
          <Input
            placeholder="Reason for approval / rejection…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => handleAction('approve')} disabled={submitting !== null} className="flex-1 sm:flex-none">
            {submitting === 'approve' ? 'Approving…' : 'Approve'}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAction('reject')}
            disabled={submitting !== null}
            className="flex-1 sm:flex-none"
          >
            {submitting === 'reject' ? 'Rejecting…' : 'Reject'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-text-muted">{label}</dt>
      <dd className="break-all text-right font-medium text-text-primary">{value}</dd>
    </div>
  )
}

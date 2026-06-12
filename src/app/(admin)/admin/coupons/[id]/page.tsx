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
import { Badge } from '@/components/ui/badge'
import { AdminDetailHeader } from '@/components/features/admin/AdminDetailHeader'
import { formatRelativeTime } from '@/lib/utils/index'
import type { Coupon } from '@/lib/types/rewards'
import { API_ENDPOINTS } from '@/lib/constants/api'
import { ROUTES } from '@/lib/constants/routes'

export default function AdminCouponDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { authUser } = useAuth()
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      if (!authUser) return
      const token = await authUser.getIdToken()
      const res = await fetch(API_ENDPOINTS.ADMIN_COUPONS, {
        headers: { authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = (await res.json()) as { items: Coupon[] }
        setCoupon(data.items.find((c) => c.id === id) ?? null)
      }
      setLoading(false)
    }
    load()
  }, [authUser, id])

  async function handleDeactivate() {
    if (!coupon || !authUser) return
    setSubmitting(true)
    try {
      const token = await authUser.getIdToken()
      const res = await fetch(API_ENDPOINTS.adminCoupon(encodeURIComponent(coupon.id)), {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        toast.success('Coupon deactivated')
        router.push(ROUTES.ADMIN_COUPONS)
      } else {
        toast.error('Failed to deactivate coupon')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>

  if (!coupon) {
    return (
      <div>
        <AdminDetailHeader backHref={ROUTES.ADMIN_COUPONS} backLabel="Coupons" title="Coupon not found" />
        <div className="mt-8">
          <EmptyState icon="🔍" title="Not found" description="This coupon may have been deactivated." />
        </div>
      </div>
    )
  }

  const discount = coupon.discountType === 'flat' ? `₹${coupon.discountValue} off` : `${coupon.discountValue}% off`
  const remaining = coupon.totalStock - coupon.claimedCount

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref={ROUTES.ADMIN_COUPONS}
        backLabel="Coupons"
        title={coupon.title}
        subtitle={coupon.restaurantName}
        badge={
          <Badge className={coupon.isActive ? 'bg-success/15 text-success' : 'bg-surface-2 text-text-muted'}>
            {coupon.isActive ? 'Active' : 'Inactive'}
          </Badge>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Discount" value={discount} />
        <StatCard label="Points cost" value={String(coupon.pointsCost)} />
        <StatCard label="Claimed" value={`${coupon.claimedCount}/${coupon.totalStock}`} />
        <StatCard label="Remaining" value={String(remaining)} />
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Details</h2>
        <dl className="mt-3 space-y-3 text-sm">
          <DetailRow label="Restaurant" value={coupon.restaurantName} />
          <DetailRow label="Created" value={formatRelativeTime(coupon.createdAt)} />
          <DetailRow label="Expires" value={coupon.expiresAt ? formatRelativeTime(coupon.expiresAt) : 'No expiry'} />
        </dl>
        {coupon.restaurantId && (
          <Button variant="outline" size="sm" className="mt-4" render={<Link href={ROUTES.restaurant(coupon.restaurantId)} target="_blank" />}>
            View restaurant
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {coupon.isActive && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Actions</h2>
          <p className="mt-1 text-sm text-text-muted">
            Deactivating hides this coupon from the rewards store. Already-claimed codes stay valid.
          </p>
          <Button variant="destructive" onClick={handleDeactivate} disabled={submitting} className="mt-4 w-full sm:w-auto">
            {submitting ? 'Deactivating…' : 'Deactivate coupon'}
          </Button>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center shadow-sm">
      <p className="font-display text-lg font-bold text-heading">{value}</p>
      <p className="mt-0.5 text-xs text-text-muted">{label}</p>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-text-muted">{label}</dt>
      <dd className="break-words text-right font-medium text-text-primary">{value}</dd>
    </div>
  )
}

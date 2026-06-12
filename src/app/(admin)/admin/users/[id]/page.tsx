'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { getUser, toggleAdmin, togglePremium } from '@/lib/services/admin'
import { useAuth } from '@/lib/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminDetailHeader } from '@/components/features/admin/AdminDetailHeader'
import { formatRelativeTime } from '@/lib/utils/index'
import type { User } from '@/lib/types'
import { ROUTES } from '@/lib/constants/routes'

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { authUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<'admin' | 'premium' | null>(null)

  useEffect(() => {
    getUser(id)
      .then(setUser)
      .finally(() => setLoading(false))
  }, [id])

  async function handleToggleAdmin() {
    if (!user || !authUser) return
    setBusy('admin')
    try {
      const token = await authUser.getIdToken()
      const success = await toggleAdmin(user.id, !user.isAdmin, token)
      if (success) {
        setUser({ ...user, isAdmin: !user.isAdmin })
        toast.success(user.isAdmin ? 'Admin access revoked' : 'Admin access granted')
      } else {
        toast.error('Failed to update role')
      }
    } finally {
      setBusy(null)
    }
  }

  async function handleTogglePremium() {
    if (!user || !authUser) return
    setBusy('premium')
    try {
      const token = await authUser.getIdToken()
      const success = await togglePremium(user.id, !user.isPremium, token)
      if (success) {
        setUser({ ...user, isPremium: !user.isPremium })
        toast.success(user.isPremium ? 'Premium revoked' : 'Premium granted')
      } else {
        toast.error('Failed to update premium')
      }
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>

  if (!user) {
    return (
      <div>
        <AdminDetailHeader backHref={ROUTES.ADMIN_USERS} backLabel="Users" title="User not found" />
        <div className="mt-8">
          <EmptyState icon="🔍" title="Not found" description="No user exists with this ID." />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref={ROUTES.ADMIN_USERS}
        backLabel="Users"
        title={user.displayName}
        subtitle={user.email}
        badge={
          <div className="flex gap-1.5">
            {user.isAdmin && <Badge className="bg-destructive/15 text-destructive">Admin</Badge>}
            {user.isPremium && <Badge className="bg-brand-gold-light text-brand-gold">Premium</Badge>}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Level" value={user.level} />
        <StatCard label="Reviews" value={String(user.reviewCount)} />
        <StatCard label="Helpful votes" value={String(user.helpfulVotesReceived)} />
        <StatCard label="Points" value={String(user.dishPointsBalance)} />
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Profile</h2>
        <dl className="mt-3 space-y-3 text-sm">
          <DetailRow label="City" value={user.city || '—'} />
          <DetailRow label="Joined" value={formatRelativeTime(user.createdAt)} />
          <DetailRow label="Points earned" value={String(user.totalPointsEarned)} />
          <DetailRow label="Points redeemed" value={String(user.totalPointsRedeemed)} />
          {user.premiumSince && <DetailRow label="Premium since" value={formatRelativeTime(user.premiumSince)} />}
          {user.badges.length > 0 && (
            <div>
              <dt className="text-text-muted">Badges</dt>
              <dd className="mt-1.5 flex flex-wrap gap-1.5">
                {user.badges.map((badge) => (
                  <Badge key={badge} className="bg-surface-2 text-text-secondary">{badge}</Badge>
                ))}
              </dd>
            </div>
          )}
        </dl>
        <Button variant="outline" size="sm" className="mt-4" render={<Link href={ROUTES.profile(user.id)} target="_blank" />}>
          View public profile
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Manage access</h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handleToggleAdmin} disabled={busy !== null} className="flex-1 sm:flex-none">
            {busy === 'admin' ? 'Saving…' : user.isAdmin ? 'Revoke admin' : 'Make admin'}
          </Button>
          <Button
            variant="outline"
            onClick={handleTogglePremium}
            disabled={busy !== null}
            className="flex-1 text-brand-gold sm:flex-none"
          >
            {busy === 'premium' ? 'Saving…' : user.isPremium ? 'Revoke premium' : 'Grant premium'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center shadow-sm">
      <p className="font-display text-lg font-bold capitalize text-heading">{value}</p>
      <p className="mt-0.5 text-xs text-text-muted">{label}</p>
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

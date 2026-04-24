'use client'

import { useEffect, useState } from 'react'
import { getUsers, toggleAdmin, togglePremium } from '@/lib/services/admin'
import { useAuth } from '@/lib/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { User } from '@/lib/types'

export default function AdminUsersPage() {
  const { authUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .finally(() => setLoading(false))
  }, [])

  async function handleToggleAdmin(user: User) {
    if (!authUser) return
    const token = await authUser.getIdToken()
    const success = await toggleAdmin(user.id, !user.isAdmin, token)
    if (success) {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isAdmin: !u.isAdmin } : u))
    }
  }

  async function handleTogglePremium(user: User) {
    if (!authUser) return
    const token = await authUser.getIdToken()
    const success = await togglePremium(user.id, !user.isPremium, token)
    if (success) {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isPremium: !u.isPremium } : u))
    }
  }

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-heading">Users</h1>
      <p className="mt-1 text-sm text-text-muted">{users.length} users</p>

      {/* Mobile card list */}
      <div className="mt-6 flex flex-col gap-3 md:hidden">
        {users.map((user) => (
          <div key={user.id} className="rounded-lg border border-border p-4">
            <p className="font-medium text-heading">{user.displayName}</p>
            <p className="mt-0.5 text-xs text-text-muted">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-text-secondary">{user.level}</span>
              <span className="text-border">·</span>
              <span className="text-xs text-text-secondary">{user.reviewCount} reviews</span>
              {user.isAdmin && <Badge className="bg-destructive/15 text-destructive">Admin</Badge>}
              {user.isPremium && <Badge className="bg-brand-gold-light text-brand-gold">Premium</Badge>}
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleToggleAdmin(user)} className="min-h-[44px] flex-1 text-xs">
                {user.isAdmin ? 'Revoke admin' : 'Make admin'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleTogglePremium(user)} className="min-h-[44px] flex-1 text-xs text-brand-gold">
                {user.isPremium ? 'Revoke premium' : 'Grant premium'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="mt-6 hidden overflow-x-auto rounded-xl border border-border bg-card shadow-sm md:block">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="border-b border-border bg-bg-cream">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">User</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Level</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Reviews</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Flags</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-bg-cream">
                <td className="px-4 py-3">
                  <p className="font-medium text-heading">{user.displayName}</p>
                  <p className="text-xs text-text-muted">{user.email}</p>
                </td>
                <td className="px-4 py-3 text-text-secondary">{user.level}</td>
                <td className="px-4 py-3 text-text-secondary">{user.reviewCount}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {user.isAdmin && <Badge className="bg-destructive/15 text-destructive">Admin</Badge>}
                    {user.isPremium && <Badge className="bg-brand-gold-light text-brand-gold">Premium</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="link" onClick={() => handleToggleAdmin(user)} className="h-auto p-0 text-xs text-primary">
                      {user.isAdmin ? 'Revoke admin' : 'Make admin'}
                    </Button>
                    <Button variant="link" onClick={() => handleTogglePremium(user)} className="h-auto p-0 text-xs text-brand-gold">
                      {user.isPremium ? 'Revoke premium' : 'Grant premium'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

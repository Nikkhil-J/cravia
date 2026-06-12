'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { RestaurantRequest } from '@/lib/types'
import { API_ENDPOINTS } from '@/lib/constants/api'
import { HTTP_HEADERS } from '@/lib/constants'
import { ROUTES } from '@/lib/constants/routes'

export default function AdminRequestsPage() {
  const { user, authUser } = useAuth()
  const [requests, setRequests] = useState<RestaurantRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [adminNote, setAdminNote] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadRequests() {
      if (!authUser) return
      const token = await authUser.getIdToken()
      const response = await fetch(API_ENDPOINTS.ADMIN_RESTAURANT_REQUESTS, {
        headers: { authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const payload = (await response.json()) as { requests?: RestaurantRequest[] }
        setRequests(payload.requests ?? [])
      }
      setLoading(false)
    }
    loadRequests()
  }, [authUser])

  async function handleMarkDone(id: string) {
    if (!user || !authUser) return
    const token = await authUser.getIdToken()
    const response = await fetch(API_ENDPOINTS.adminRestaurantRequest(encodeURIComponent(id)), {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${token}`,
        [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON,
      },
      body: JSON.stringify({ action: 'done', note: adminNote[id] ?? '' }),
    })
    if (response.ok) {
      setRequests((prev) => prev.filter((r) => r.id !== id))
    }
  }

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-heading">Restaurant Requests</h1>
      <p className="mt-1 text-sm text-text-muted">{requests.length} pending</p>

      {requests.length === 0 ? (
        <div className="mt-8"><EmptyState icon="✅" title="All clear" description="No pending restaurant requests." /></div>
      ) : (
        <div className="mt-6 space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="rounded-xl border border-border bg-card p-5">
              <Link
                href={ROUTES.adminRequest(req.id)}
                className="group -m-2 flex items-start justify-between gap-4 rounded-lg p-2 transition-colors hover:bg-bg-cream"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-heading">{req.restaurantName}</p>
                  {req.location && <p className="text-sm text-text-secondary">{req.location}</p>}
                  {req.note && <p className="mt-1 line-clamp-2 text-xs text-text-muted">{req.note}</p>}
                  <p className="mt-1 text-xs text-text-muted">Requested by {req.requestedByName}</p>
                </div>
                <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
              </Link>
              <div className="mt-3">
                <Input
                  placeholder="Admin note (optional)..."
                  value={adminNote[req.id] ?? ''}
                  onChange={(e) => setAdminNote((prev) => ({ ...prev, [req.id]: e.target.value }))}
                  className="h-auto px-3 py-1.5 text-xs border-border focus:border-primary"
                />
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  onClick={() => handleMarkDone(req.id)}
                  size="xs"
                  className="rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-primary-dark"
                >
                  Mark done
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

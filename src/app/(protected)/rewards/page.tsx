'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DEFAULT_COUPON_POINTS_COST } from '@/lib/types/rewards'
import type { Coupon, CouponClaim, PointsBalance } from '@/lib/types/rewards'
import { API_ENDPOINTS } from '@/lib/constants/api'
import { CLIENT_ERRORS } from '@/lib/constants/errors'
import { HTTP_HEADERS } from '@/lib/constants'
import { captureError } from '@/lib/monitoring/sentry'

type Tab = 'coupons' | 'claims'

export default function RewardsPage() {
  const { authUser } = useAuth()
  const [balance, setBalance] = useState<PointsBalance | null>(null)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [claims, setClaims] = useState<CouponClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [redeemError, setRedeemError] = useState<string | null>(null)
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('coupons')

  const fetchAll = useCallback(async () => {
    if (!authUser) return
    setLoading(true)
    setFetchError(null)
    try {
      const token = await authUser.getIdToken()
      const headers = { authorization: `Bearer ${token}` }

      const [balRes, coupRes, claimRes] = await Promise.all([
        fetch(API_ENDPOINTS.REWARDS_BALANCE, { headers }),
        fetch(API_ENDPOINTS.REWARDS_COUPONS, { headers }),
        fetch(API_ENDPOINTS.REWARDS_CLAIMS, { headers }),
      ])

      if (balRes.ok) setBalance(await balRes.json() as PointsBalance)
      if (coupRes.ok) {
        const data = await coupRes.json() as { items: Coupon[] }
        setCoupons(data.items)
      }
      if (claimRes.ok) {
        const data = await claimRes.json() as { items: CouponClaim[] }
        setClaims(data.items)
      }
    } catch (err) {
      setFetchError("Couldn't load your rewards. Please try again.")
      captureError(err)
    } finally {
      setLoading(false)
    }
  }, [authUser])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  async function handleRedeem(couponId: string) {
    if (!authUser) return
    setRedeeming(couponId)
    setRedeemError(null)
    setRedeemSuccess(null)

    try {
      const token = await authUser.getIdToken()
      const res = await fetch(API_ENDPOINTS.REWARDS_REDEEM, {
        method: 'POST',
        headers: {
          [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON,
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ couponId }),
      })

      if (!res.ok) {
        const data = await res.json() as { message?: string }
        const msg = data.message ?? 'Redemption failed'
        setRedeemError(msg)
        toast.error(msg)
        return
      }

      const data = await res.json() as { claim: CouponClaim }
      setRedeemSuccess(`Coupon claimed! Your code: ${data.claim.code}`)
      toast.success(`Coupon claimed! Your code: ${data.claim.code}`, {
        duration: 6000,
        description: 'Check the "My Coupons" tab for details',
      })
      await fetchAll()
      setTab('claims')
    } catch {
      const msg = CLIENT_ERRORS.SOMETHING_WENT_WRONG_RETRY
      setRedeemError(msg)
      toast.error(msg)
    } finally {
      setRedeeming(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-text-secondary">{fetchError}</p>
        <Button onClick={fetchAll} className="rounded-pill px-6 font-semibold hover:bg-primary-dark">
          Try again
        </Button>
      </div>
    )
  }

  const progressPercent = balance
    ? Math.min((balance.balance / DEFAULT_COUPON_POINTS_COST) * 100, 100)
    : 0

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="font-display text-xl font-bold text-heading sm:text-2xl">DishPoints & Rewards</h1>

      {/* Balance card */}
      {balance && (
        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:mt-6 sm:p-6">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-primary sm:text-4xl">{balance.balance}</span>
            <span className="text-sm text-text-secondary">DishPoints</span>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>{balance.balance} / {DEFAULT_COUPON_POINTS_COST}</span>
              <span>Next coupon</span>
            </div>
            <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-6 text-sm">
            <div>
              <span className="text-text-muted">Earned: </span>
              <span className="font-semibold text-heading">{balance.totalEarned}</span>
            </div>
            <div>
              <span className="text-text-muted">Redeemed: </span>
              <span className="font-semibold text-heading">{balance.totalRedeemed}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-8 flex gap-1 rounded-xl bg-bg-cream p-1">
        {(['coupons', 'claims'] as const).map((t) => (
          <Button
            key={t}
            variant="ghost"
            onClick={() => setTab(t)}
            className={`flex-1 h-auto rounded-lg py-2.5 text-sm font-semibold ${
              tab === t
                ? 'bg-card text-primary shadow-sm hover:bg-card'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {t === 'coupons' ? 'Available Coupons' : `My Coupons (${claims.length})`}
          </Button>
        ))}
      </div>

      {/* Alerts */}
      {redeemError && (
        <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {redeemError}
        </div>
      )}
      {redeemSuccess && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          {redeemSuccess}
        </div>
      )}

      {/* Coupons catalogue */}
      {tab === 'coupons' && (
        <div className="mt-6 space-y-4">
          {coupons.length === 0 ? (
            <EmptyState
              icon="🎟️"
              title="No coupons available"
              description="Check back soon — new coupons are added regularly."
            />
          ) : (
            coupons.map((coupon) => {
              const remaining = coupon.totalStock - coupon.claimedCount
              const canAfford = (balance?.balance ?? 0) >= coupon.pointsCost

              return (
                <div
                  key={coupon.id}
                  className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold text-heading">{coupon.title}</h3>
                      <p className="mt-1 text-sm text-text-secondary">{coupon.restaurantName}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-display text-lg font-bold text-primary">
                        {coupon.discountType === 'flat' ? `₹${coupon.discountValue}` : `${coupon.discountValue}%`}
                      </span>
                      <span className="block text-xs text-text-muted">off</span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                      <span>{coupon.pointsCost} pts</span>
                      <span>{remaining} left</span>
                      {coupon.expiresAt && (
                        <span>Expires {new Date(coupon.expiresAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    <Button
                      onClick={() => handleRedeem(coupon.id)}
                      disabled={!canAfford || redeeming === coupon.id}
                      className="h-auto w-full rounded-pill px-5 py-2 text-xs font-semibold hover:bg-primary-dark hover:shadow-glow sm:w-auto"
                    >
                      {redeeming === coupon.id ? (
                        <LoadingSpinner size="sm" />
                      ) : canAfford ? (
                        'Redeem'
                      ) : (
                        `Need ${coupon.pointsCost - (balance?.balance ?? 0)} more pts`
                      )}
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Claimed coupons */}
      {tab === 'claims' && (
        <div className="mt-6 space-y-4">
          {claims.length === 0 ? (
            <EmptyState
              icon="🎫"
              title="No claimed coupons yet"
              description="Redeem your DishPoints for coupons from your favorite restaurants."
            />
          ) : (
            claims.map((claim) => (
              <div
                key={claim.id}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-bold text-heading">{claim.couponTitle}</h3>
                    <p className="mt-1 text-xs text-text-muted">
                      Claimed {new Date(claim.claimedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={claim.isRedeemed ? 'secondary' : 'default'}
                    className={`rounded-pill px-3 py-1 text-xs font-semibold ${
                      claim.isRedeemed
                        ? 'bg-border text-text-muted'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {claim.isRedeemed ? 'Used' : 'Active'}
                  </Badge>
                </div>

                <div className="mt-4 rounded-lg bg-bg-cream p-3 text-center">
                  <span className="text-xs text-text-muted">Your code</span>
                  <p className="font-mono text-lg font-bold tracking-widest text-heading">{claim.code}</p>
                </div>

                {claim.expiresAt && (
                  <p className="mt-2 text-xs text-text-muted">
                    Expires {new Date(claim.expiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'
import Script from 'next/script'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { API_ENDPOINTS } from '@/lib/constants/api'
import { CLIENT_ERRORS } from '@/lib/constants/errors'

const FEATURES = [
  { icon: '📊', label: 'Dish comparison', description: 'Compare two dishes side-by-side on all metrics' },
  { icon: '🏷️', label: 'Priority badge display', description: 'Stand out with a premium badge on your reviews' },
  { icon: '📈', label: 'Advanced stats', description: 'See your reviewing trends and streaks over time' },
  { icon: '🔓', label: 'Early access', description: 'Be the first to try new Cravia features' },
]

type PlanType = 'monthly' | 'yearly'

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

export default function UpgradePage() {
  const { user, authUser } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handlePayment = useCallback(async () => {
    if (!authUser) return
    setLoading(true)
    setError(null)

    try {
      const token = await authUser.getIdToken()
      const orderRes = await fetch(API_ENDPOINTS.BILLING_CREATE_ORDER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: selectedPlan }),
      })

      if (!orderRes.ok) {
        const data = await orderRes.json().catch(() => ({ message: 'Failed to create order' }))
        throw new Error(data.message || 'Failed to create order')
      }

      const { orderId, amount, currency, keyId } = await orderRes.json() as {
        orderId: string
        amount: number
        currency: string
        keyId: string
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Cravia',
        description: selectedPlan === 'monthly' ? 'Premium — Monthly' : 'Premium — Yearly',
        order_id: orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch(API_ENDPOINTS.BILLING_VERIFY, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${await authUser.getIdToken()}`,
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            if (!verifyRes.ok) {
              throw new Error('Payment verification failed')
            }

            setSuccess(true)
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Verification failed')
          } finally {
            setLoading(false)
          }
        },
        prefill: {
          email: user?.email ?? '',
          name: user?.displayName ?? '',
        },
        theme: { color: '#E23744' }, // APPROVED HARDCODED COLOR — Razorpay SDK requires hex
        modal: {
          ondismiss: () => setLoading(false),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      setError(err instanceof Error ? err.message : CLIENT_ERRORS.SOMETHING_WENT_WRONG)
      setLoading(false)
    }
  }, [authUser, selectedPlan, user])

  if (success || user?.isPremium) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <div className="text-5xl">⭐</div>
        <h1 className="mt-4 font-display text-2xl font-bold text-heading">
          {success ? 'Welcome to Premium!' : "You're already Premium!"}
        </h1>
        <p className="mt-2 text-text-secondary">
          Enjoy all premium features, and thank you for supporting Cravia.
        </p>
        <Button
          render={<Link href={ROUTES.HOME} />}
          className="mt-6 h-auto rounded-pill px-6 py-2.5 text-sm font-semibold hover:bg-primary-dark"
        >
          Go home
        </Button>
      </div>
    )
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="mx-auto max-w-md px-6 py-10">
        <div className="text-center">
          <div className="text-4xl">🚀</div>
          <h1 className="mt-3 font-display text-2xl font-bold text-heading">Upgrade to Premium</h1>
          <p className="mt-2 text-text-secondary">Unlock powerful features for food enthusiasts.</p>
        </div>

        <div className="mt-8 space-y-3">
          {FEATURES.map((f) => (
            <div key={f.label} className="flex gap-3 rounded-xl border border-border bg-card p-4">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <p className="font-medium text-heading">{f.label}</p>
                <p className="text-sm text-text-secondary">{f.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <Button
            variant="outline"
            onClick={() => setSelectedPlan('monthly')}
            className={`flex-1 h-auto rounded-xl border-2 p-4 ${
              selectedPlan === 'monthly'
                ? 'border-primary bg-primary/5 hover:bg-primary/5'
                : 'border-border bg-card hover:bg-card'
            }`}
          >
            <div className="text-center">
              <p className="font-display text-xl font-bold text-heading">₹199</p>
              <p className="text-xs text-text-secondary">per month</p>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => setSelectedPlan('yearly')}
            className={`flex-1 h-auto rounded-xl border-2 p-4 ${
              selectedPlan === 'yearly'
                ? 'border-primary bg-primary/5 hover:bg-primary/5'
                : 'border-border bg-card hover:bg-card'
            }`}
          >
            <div className="text-center">
              <p className="font-display text-xl font-bold text-heading">₹1,999</p>
              <p className="text-xs text-text-secondary">per year</p>
              <p className="mt-1 text-xs font-semibold text-success">Save 16%</p>
            </div>
          </Button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">{error}</div>
        )}

        <Button
          onClick={handlePayment}
          disabled={loading}
          className="mt-6 w-full h-auto rounded-pill py-3 text-sm font-semibold hover:bg-primary-dark"
        >
          {loading ? 'Processing...' : `Subscribe — ₹${selectedPlan === 'monthly' ? '199/mo' : '1,999/yr'}`}
        </Button>

        <p className="mt-3 text-center text-xs text-text-secondary">
          Secure payment via Razorpay. Cancel anytime.
        </p>
      </div>
    </>
  )
}

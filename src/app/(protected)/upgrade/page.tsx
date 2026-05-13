'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'

const FEATURES = [
  { icon: '📊', label: 'Dish comparison', description: 'Compare two dishes side-by-side on all metrics' },
  { icon: '🏷️', label: 'Priority badge display', description: 'Stand out with a premium badge on your reviews' },
  { icon: '📈', label: 'Advanced stats', description: 'See your reviewing trends and streaks over time' },
  { icon: '🔓', label: 'Early access', description: 'Be the first to try new Cravia features' },
]

export default function UpgradePage() {
  const { user } = useAuth()

  if (user?.isPremium) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <div className="text-5xl">⭐</div>
        <h1 className="mt-4 font-display text-2xl font-bold text-heading">You&apos;re already Premium!</h1>
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

      <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-6 text-center">
        <p className="text-2xl">⏳</p>
        <p className="mt-2 font-display text-base font-bold text-heading">Launching soon</p>
        <p className="mt-1 text-sm text-text-secondary">
          Premium is almost here. We&apos;re putting the finishing touches on it — stay tuned!
        </p>
      </div>
    </div>
  )
}

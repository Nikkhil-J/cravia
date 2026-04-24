import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'

const PREMIUM_FEATURES = [
  'Side-by-side dish comparison',
  'Priority review visibility',
  'Advanced reviewing stats',
  'Early access to new features',
]

export function UpgradePrompt() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-brand-gold bg-brand-gold-light p-6 text-center">
      <div className="text-3xl">⭐</div>
      <div>
        <h3 className="font-display text-base font-semibold text-heading">Premium Feature</h3>
        <p className="mt-1 text-sm text-text-secondary">Upgrade to unlock this and more:</p>
      </div>
      <ul className="w-full space-y-2 text-left">
        {PREMIUM_FEATURES.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-text-primary">
            <svg className="h-4 w-4 shrink-0 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={ROUTES.UPGRADE}
        /* TODO: add --color-accent-dark to design system for hover states */
        className="block min-h-[44px] w-full rounded-pill bg-brand-gold py-3 text-center text-sm font-semibold text-white transition-all hover:opacity-90"
      >
        Upgrade to Premium
      </Link>
    </div>
  )
}

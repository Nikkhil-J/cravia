import { POINTS_BASIC_REVIEW, POINTS_WITH_PHOTO, POINTS_WITH_BILL } from '@/lib/types/rewards'

interface RewardsPreviewProps {
  currentBalance?: number
}

export function RewardsPreview({ currentBalance = 0 }: RewardsPreviewProps) {
  const pointsToNextCoupon = Math.max(0, 500 - currentBalance)

  return (
    <div className="rounded-2xl border border-brand-gold/30 bg-gradient-to-br from-brand-gold-light/30 to-transparent p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-heading">
          Earn up to {POINTS_WITH_BILL} DishPoints
        </h3>
        <span className="text-xs font-semibold text-brand-gold">{POINTS_WITH_BILL} max</span>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between rounded-lg bg-card px-3 py-2 text-xs">
          <span className="flex items-center gap-2 text-text-secondary">
            <span>📝</span> Basic review
          </span>
          <span className="font-bold tabular-nums text-text-primary">{POINTS_BASIC_REVIEW} pts</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-card px-3 py-2 text-xs">
          <span className="flex items-center gap-2 text-text-secondary">
            <span>📸</span> Add a dish photo
            <span className="text-brand-gold">+{POINTS_WITH_PHOTO - POINTS_BASIC_REVIEW} pts</span>
          </span>
          <span className="font-bold tabular-nums text-brand-gold">→ {POINTS_WITH_PHOTO} pts</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-card px-3 py-2 text-xs">
          <span className="flex items-center gap-2 text-text-secondary">
            <span>🧾</span> Upload your bill
            <span className="text-success">+{POINTS_WITH_BILL - POINTS_WITH_PHOTO} pts</span>
          </span>
          <span className="font-bold tabular-nums text-success">→ {POINTS_WITH_BILL} pts</span>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-text-muted">
        🔥 7-day streak adds a <strong className="text-text-primary">2× bonus</strong> on top
      </p>

      {currentBalance > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>{currentBalance} pts</span>
            <span>{pointsToNextCoupon} pts until your first coupon</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-brand-gold transition-all"
              style={{ width: `${Math.min(100, (currentBalance / 500) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

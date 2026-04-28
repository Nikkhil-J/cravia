interface RewardsPreviewProps {
  currentBalance?: number
}

export function RewardsPreview({ currentBalance = 0 }: RewardsPreviewProps) {
  const pointsToNextCoupon = Math.max(0, 500 - currentBalance)

  return (
    <div className="rounded-2xl border border-brand-gold/30 bg-gradient-to-br from-brand-gold-light/30 to-transparent p-5 sm:p-6">
      <h3 className="font-display text-base font-bold text-heading">
        Your review earns DishPoints
      </h3>
      <ul className="mt-3 space-y-1.5 text-sm text-text-secondary">
        <li className="flex items-center gap-2">
          <span className="text-brand-gold">📸</span>
          Add a photo + detailed text: <strong className="text-heading">25 pts</strong>
        </li>
        <li className="flex items-center gap-2">
          <span className="text-brand-gold">⭐</span>
          Ratings + tags only: <strong className="text-heading">10 pts</strong>
        </li>
        <li className="flex items-center gap-2">
          <span className="text-brand-gold">🔥</span>
          7-day streak bonus: <strong className="text-heading">2x points</strong>
        </li>
      </ul>
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

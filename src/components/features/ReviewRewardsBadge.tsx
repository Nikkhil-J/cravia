interface ReviewRewardsBadgeProps {
  reviewCount?: number
}

export function ReviewRewardsBadge({ reviewCount = 0 }: ReviewRewardsBadgeProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-brand-gold">
        Earn up to 25 DishPoints
      </span>
      <span className="text-[11px] text-text-muted">
        Photo + detailed review = 25 pts | Quick review = 10 pts
      </span>
      {reviewCount < 5 && (
        <span className="text-[11px] font-medium text-primary">
          Early reviewer bonus: help build this dish&apos;s profile
        </span>
      )}
    </div>
  )
}

import { MAX_RATING } from '@/lib/constants'

interface SubRatingBarProps {
  label: string
  value: number
}

export function SubRatingBar({ label, value }: SubRatingBarProps) {
  const pct = Math.round((value / MAX_RATING) * 100)

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-16 shrink-0 font-medium text-text-secondary">{label}</span>
      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-border">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-brand-orange transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right font-bold text-heading">{value.toFixed(1)}</span>
    </div>
  )
}

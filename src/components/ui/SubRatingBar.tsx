interface SubRatingBarProps {
  label: string
  value: number
}

export function SubRatingBar({ label, value }: SubRatingBarProps) {
  const pct = Math.round((value / 5) * 100)

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-16 shrink-0 text-gray-500">{label}</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-brand"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right font-medium text-gray-700">{value.toFixed(1)}</span>
    </div>
  )
}

import { Fragment } from 'react'
import { cn } from '@/lib/utils'
import { env } from '@/lib/env'

interface StatDef {
  value: string
  suffix?: string
  label: string
  sub?: string
  badge?: string
}

interface StatsBarProps {
  restaurantCount: number
  reviewCount: number
  dishCount?: number
}

function roundStat(n: number): { display: string; showPlus: boolean } {
  if (n < 10) return { display: n.toLocaleString('en-IN'), showPlus: false }
  let step: number
  if (n < 100) step = 5
  else if (n < 1_000) step = 50
  else if (n < 10_000) step = 100
  else step = 1_000
  const rounded = Math.floor(n / step) * step
  return { display: rounded.toLocaleString('en-IN'), showPlus: true }
}

export function StatsBar({ restaurantCount, reviewCount, dishCount }: StatsBarProps) {
  const isSeedingComplete = env.NEXT_PUBLIC_SEEDING_COMPLETE === 'true'
  const badgeText = isSeedingComplete && reviewCount >= 50 ? 'Growing fast' : 'Just launched'

  const reviewStat = roundStat(reviewCount)
  const dishStat = roundStat(dishCount ?? 0)
  const restStat = roundStat(restaurantCount)

  const stats: StatDef[] = [
    {
      value: reviewStat.display,
      suffix: reviewStat.showPlus ? '+' : undefined,
      label: 'Dish Reviews',
      sub: 'from real diners',
      badge: badgeText,
    },
    {
      value: dishStat.display,
      suffix: dishStat.showPlus ? '+' : undefined,
      label: 'Dishes',
      sub: 'across Gurugram',
    },
    {
      value: restStat.display,
      suffix: restStat.showPlus ? '+' : undefined,
      label: 'Restaurants',
      sub: 'in Gurugram',
    },
  ]

  return (
    <div className="py-4 sm:px-12 sm:py-8">
      <div className="grid grid-cols-3 gap-4 sm:flex sm:items-center sm:justify-evenly sm:gap-0">
        {stats.map((stat, i) => (
          <Fragment key={stat.label}>
            {i > 0 && (
              <div
                className="hidden h-[60px] w-px shrink-0 sm:block"
                style={{
                  background:
                    'linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent)',
                }}
              />
            )}
            <div
              className={cn(
                'flex flex-col items-center justify-center text-center sm:flex-1',
              )}
            >
              <p className="font-display text-2xl font-bold tracking-tight text-primary sm:text-[48px]">
                {stat.value}
                {stat.suffix && (
                  <span className="ml-px inline-block align-top text-base leading-[1.4] sm:text-[28px]">
                    {stat.suffix}
                  </span>
                )}
              </p>

              <p className="mt-1 font-sans text-[9px] font-medium uppercase tracking-widest text-text-muted sm:mt-2 sm:text-[10px]">
                {stat.label}
              </p>

              {stat.sub && (
                <p className="mt-0.5 text-[10px] italic text-primary/50 sm:mt-1 sm:text-[11px]">
                  {stat.sub}
                </p>
              )}

              {stat.badge && (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/[0.12] px-2 py-0.5 text-[10px] text-primary sm:mt-1.5">
                  ↑ {stat.badge}
                </span>
              )}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}

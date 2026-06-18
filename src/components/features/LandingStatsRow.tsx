'use client'

import { CITY_DISPLAY_NAME, type City } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Reveal } from '@/components/ui/AnimateReveal'
import { CountUp } from '@/components/ui/CountUp'

/** Round down to the nearest "step" and return a formatted string with "+". */
function roundedPlus(value: number, locale = 'en-IN'): {
  rounded: number
  formatter: (n: number) => string
} {
  const step = value >= 1000 ? 100 : value >= 100 ? 10 : 5
  const rounded = Math.floor(value / step) * step
  const formatter = (n: number) => `${Math.round(n).toLocaleString(locale)}+`
  return { rounded, formatter }
}

interface LandingStatsRowProps {
  dishCount: number
  restaurantCount: number
  city: City
}

interface Stat {
  value: React.ReactNode
  label: string
}

export function LandingStatsRow({
  dishCount,
  restaurantCount,
  city,
}: LandingStatsRowProps) {
  const cityName = CITY_DISPLAY_NAME[city]

  const dishes = roundedPlus(dishCount)
  const restaurants = roundedPlus(restaurantCount)

  const stats: Stat[] = [
    {
      value: <CountUp value={dishes.rounded} formatter={dishes.formatter} />,
      label: `Dishes rated in ${cityName}`,
    },
    {
      value: (
        <CountUp value={restaurants.rounded} formatter={restaurants.formatter} />
      ),
      label: 'Restaurants covered',
    },
    { value: '3', label: 'Scores per dish' },
    { value: '₹0', label: 'Free to use' },
  ]

  return (
    <section className="mx-auto max-w-[1200px] px-6 sm:px-8">
      <Reveal>
        <div className="grid grid-cols-2 gap-6 border-y-[0.5px] border-border py-12 text-center md:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={i} className={cn(i > 0 && 'md:border-l-[0.5px] md:border-border')}>
              <div className="bg-gradient-to-r from-coral to-brand-orange bg-clip-text font-display text-[clamp(28px,4vw,42px)] font-bold leading-tight text-transparent">
                {stat.value}
              </div>
              <div className="mt-1 text-sm font-medium text-text-secondary">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

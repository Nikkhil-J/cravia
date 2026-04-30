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
  const formatter = (n: number) =>
    `${Math.round(n).toLocaleString(locale)}+`
  return { rounded, formatter }
}

interface LandingStatsRowProps {
  dishCount: number
  restaurantCount: number
  city: City
}

interface Stat {
  value: React.ReactNode
  label: React.ReactNode
  accent?: boolean
}

export function LandingStatsRow({ dishCount, restaurantCount, city }: LandingStatsRowProps) {
  const cityName = CITY_DISPLAY_NAME[city]

  const dishes = roundedPlus(dishCount)
  const restaurants = roundedPlus(restaurantCount)

  const stats: Stat[] = [
    {
      value: (
        <CountUp
          value={dishes.rounded}
          formatter={dishes.formatter}
        />
      ),
      label: (
        <>
          dishes rated
          <br />
          across {cityName}
        </>
      ),
      accent: true,
    },
    {
      value: (
        <CountUp
          value={restaurants.rounded}
          formatter={restaurants.formatter}
        />
      ),
      label: (
        <>
          restaurants
          <br />
          covered
        </>
      ),
    },
    {
      value: '3',
      label: (
        <>
          scores per dish —<br />
          taste, portion, value
        </>
      ),
    },
  ]

  return (
    <section className="mx-auto max-w-[1120px] px-4 sm:px-8">
      <div className="my-8 h-px bg-border" />
      <Reveal from="scale">
        <div className="grid grid-cols-3 overflow-hidden rounded-2xl border-[0.5px] border-border">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={cn(
                'py-5 text-center sm:py-[22px]',
                i > 0 && 'border-l-[0.5px] border-border',
              )}
            >
              <div
                className={cn(
                  'text-[22px] font-medium leading-none sm:text-[30px]',
                  stat.accent ? 'text-coral' : 'text-text-primary',
                )}
              >
                {stat.value}
              </div>
              <div className="mt-[5px] px-2 text-xs leading-[1.4] text-text-secondary">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

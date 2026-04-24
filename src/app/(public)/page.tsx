import Link from 'next/link'
import { getTopDishes, getDishCount } from '@/lib/services/dishes'
import { getReviewCount } from '@/lib/services/reviews'
import { DishCard } from '@/components/features/DishCard'
import { RestaurantCard } from '@/components/features/RestaurantCard'
import { LandingCTA } from '@/components/features/LandingCTA'
import { HeroSection } from '@/components/features/HeroSection'
import { CUISINE_TYPES, CUISINE_EMOJI, SUPPORTED_CITIES, CONFIG } from '@/lib/constants'
import { StatsBar } from '@/components/features/StatsBar'
import { PersonalStatsBanner } from '@/components/features/PersonalStatsBanner'
import { listRestaurants } from '@/lib/services/catalog'
import { getRestaurantCount } from '@/lib/services/restaurants'
import { Reveal, RevealGrid } from '@/components/ui/AnimateReveal'
import { getCityFromCookie } from '@/lib/utils/get-city-from-cookie'
import { captureError } from '@/lib/monitoring/sentry'
import type { Dish } from '@/lib/types'
import { ROUTES } from '@/lib/constants/routes'

export const revalidate = 3600

const HOW_IT_WORKS = [
  { icon: '🔍', title: 'Search a dish', desc: 'Find a specific dish at a specific restaurant.' },
  { icon: '📸', title: 'Read real reviews', desc: 'See photos, sub-ratings, and honest tags from food lovers.' },
  { icon: '✍️', title: 'Share your take', desc: 'Rate taste, portion, and value. Help others decide.' },
]

export default async function LandingPage() {
  const selectedCity = await getCityFromCookie()

  let topDishes: Dish[] = []
  let restaurantsResult: { city: string; areas: readonly string[]; items: import('@/lib/types').Restaurant[] } = { city: selectedCity ?? 'Bengaluru', areas: [], items: [] }
  let dishCount = 0
  let restaurantCount = 0
  let reviewCount = 0

  try {
    const [dishes, restaurants, dCount, rCount, revCount] = await Promise.all([
      getTopDishes(CONFIG.LANDING_TOP_DISHES, selectedCity),
      listRestaurants({ city: selectedCity, limit: CONFIG.LANDING_FEATURED_RESTAURANTS }),
      getDishCount(),
      getRestaurantCount(selectedCity ?? undefined),
      getReviewCount(),
    ])
    topDishes = dishes
    restaurantsResult = restaurants
    dishCount = dCount
    restaurantCount = rCount
    reviewCount = revCount
  } catch (error) {
    captureError(error, { route: 'LandingPage', extra: { context: 'data fetching' } })
  }

  const featuredRestaurants = restaurantsResult.items

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-bg-cream via-bg-warm to-surface px-4 pt-12 pb-10 text-center sm:px-6 sm:pt-[101px] sm:pb-24">
        <HeroSection />
      </section>

      {/* Social proof stats */}
      <Reveal>
        <section className="mx-auto mt-2 max-w-5xl px-4 py-4 sm:mt-5 sm:px-6 sm:py-8">
          <StatsBar dishCount={dishCount} cityCount={SUPPORTED_CITIES.length} />
        </section>
      </Reveal>

      {/* Personal stats (auth users with reviews only) */}
      <div className="mt-4">
        <PersonalStatsBanner />
      </div>

      {/* Top dishes */}
      {topDishes.length > 0 && (
        <section className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-heading sm:text-2xl">Top rated dishes</h2>
            <Link href={ROUTES.EXPLORE} className="flex items-center gap-1 text-sm font-semibold text-primary transition-all hover:gap-2">
              See all <span>&rsaquo;</span>
            </Link>
          </div>
          <RevealGrid className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {topDishes.map((dish, i) => (
              <div key={dish.id} data-reveal="" style={{ '--reveal-index': i } as React.CSSProperties}>
                <DishCard dish={dish} index={i} />
              </div>
            ))}
          </RevealGrid>
        </section>
      )}

      {/* Browse by cuisine */}
      <Reveal>
        <section className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12">
          <h2 className="font-display text-xl font-bold text-heading sm:text-2xl">Browse by cuisine</h2>
          <RevealGrid className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
            {CUISINE_TYPES.slice(0, 10).map((cuisine, i) => (
              <Link
                key={cuisine}
                href={`${ROUTES.EXPLORE}?cuisine=${encodeURIComponent(cuisine)}`}
                data-reveal=""
                style={{ '--reveal-index': i } as React.CSSProperties}
                className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
              >
                <span className="text-3xl">{CUISINE_EMOJI[cuisine] ?? '🍴'}</span>
                <span className="text-sm font-medium text-text-primary">{cuisine}</span>
              </Link>
            ))}
          </RevealGrid>
        </section>
      </Reveal>

      {/* How it works */}
      <section className="bg-bg-cream px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <h2 className="text-center font-display text-xl font-bold text-heading sm:text-2xl">How it works</h2>
          </Reveal>
          <RevealGrid className="mt-6 grid gap-6 sm:mt-10 sm:grid-cols-3 sm:gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} data-reveal="" style={{ '--reveal-index': i } as React.CSSProperties} className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-card text-3xl shadow-sm">
                  {step.icon}
                </div>
                <div className="mt-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {i + 1}
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-heading">{step.title}</h3>
                <p className="mt-1 text-sm text-text-secondary">{step.desc}</p>
              </div>
            ))}
          </RevealGrid>
        </div>
      </section>

      {/* Featured restaurants */}
      {featuredRestaurants.length > 0 && (
        <section className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12">
          <h2 className="font-display text-xl font-bold text-heading sm:text-2xl">
            Featured restaurants in {restaurantsResult.city}
          </h2>
          <RevealGrid className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {featuredRestaurants.map((r, i) => (
              <div key={r.id} data-reveal="" style={{ '--reveal-index': i } as React.CSSProperties}>
                <RestaurantCard restaurant={r} index={i} />
              </div>
            ))}
          </RevealGrid>
        </section>
      )}

      {/* CTA */}
      <LandingCTA />
    </>
  )
}

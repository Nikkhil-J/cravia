import Link from 'next/link'
import { HeroBento } from '@/components/features/proto/HeroBento'
import { getTopDishes } from '@/lib/services/dishes'
import { getRecentFeaturedReviews } from '@/lib/services/reviews'
import { getRestaurantCount } from '@/lib/services/restaurants'
import { getDishCount } from '@/lib/services/dishes'
import { GURUGRAM, SUB_RATING_LABELS } from '@/lib/constants'
import { ROUTES } from '@/lib/constants/routes'
import { captureError } from '@/lib/monitoring/sentry'
import type { Dish, Review } from '@/lib/types'

export const revalidate = 3600

const FEATURE_BLOCKS = [
  {
    icon: '🎯',
    title: 'Dish-level, not restaurant-level',
    body: 'A 4-star place can have a 2-star pasta. We rate the actual food, so you stop guessing what to order.',
  },
  {
    icon: '🔬',
    title: 'Three axes, no fluff',
    body: 'Taste tells you if it’s good. Portion tells you if you’ll be full. Value tells you if it’s worth the bill.',
  },
  {
    icon: '📸',
    title: 'Every review has a photo',
    body: 'See what actually arrives — not what the menu pretends. Honest, diner-shot, well-lit.',
  },
]

export default async function ProtoBentoPage() {
  let spotlightDish: Dish | null = null
  let spotlightReview: Review | null = null
  let restaurantCount = 0
  let dishCount = 0

  try {
    const [dishes, reviews, rCount, dCount] = await Promise.all([
      getTopDishes(6, GURUGRAM),
      getRecentFeaturedReviews(6),
      getRestaurantCount(GURUGRAM),
      getDishCount(),
    ])
    spotlightDish = dishes.find((d) => d.coverImage) ?? dishes[0] ?? null
    spotlightReview = reviews.find((r) => r.text && r.text.length > 30) ?? reviews[0] ?? null
    restaurantCount = rCount
    dishCount = dCount
  } catch (error) {
    captureError(error, { route: 'ProtoBento' })
  }

  return (
    <>
      <HeroBento
        spotlightDish={spotlightDish}
        spotlightReview={spotlightReview}
        restaurantCount={restaurantCount}
        dishCount={dishCount}
      />

      {/* The thesis — broken down */}
      <section className="bg-background px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
            {FEATURE_BLOCKS.map((block, i) => (
              <div
                key={block.title}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <span className="text-3xl">{block.icon}</span>
                <h3 className="mt-5 font-display text-xl font-bold text-heading">
                  {block.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {block.body}
                </p>
                <span
                  className="mt-6 font-display text-7xl font-bold text-heading/[0.04]"
                  aria-hidden="true"
                >
                  0{i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Anatomy of a rating — visual demo */}
      <section className="border-y border-border bg-bg-warm px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-20">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Anatomy of a rating
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-heading sm:text-4xl">
              Every dish, broken down honestly.
            </h2>
            <p className="mt-4 text-base text-text-secondary sm:text-lg">
              No more cryptic 4.2 stars. Each rating is decomposed so you can
              decide which axis matters most for tonight.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-md sm:p-8">
            {SUB_RATING_LABELS.map((label, i) => {
              const values = [4.8, 4.5, 4.7]
              const captions = [
                'Smoky, deep, perfectly spiced.',
                'Generous — easy meal for two.',
                'Premium feel at fair pricing.',
              ]
              return (
                <div
                  key={label}
                  className={i > 0 ? 'mt-5 border-t border-border pt-5' : ''}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-lg font-semibold text-heading">
                      {label}
                    </span>
                    <span className="font-display text-2xl font-bold text-primary">
                      {values[i].toFixed(1)}
                      <span className="ml-0.5 text-sm font-medium text-text-muted">
                        / 5
                      </span>
                    </span>
                  </div>
                  <div className="mt-3 flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => {
                      const filled = n <= Math.floor(values[i])
                      const partial = n === Math.ceil(values[i]) && !filled
                      return (
                        <span
                          key={n}
                          className={`h-2 flex-1 rounded-full ${
                            filled
                              ? 'bg-primary'
                              : partial
                                ? 'bg-primary/40'
                                : 'bg-border'
                          }`}
                        />
                      )
                    })}
                  </div>
                  <p className="mt-2 text-xs italic text-text-secondary">
                    {captions[i]}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-background px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-[800px] text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-heading sm:text-5xl">
            Stop ordering blind.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base text-text-secondary sm:text-lg">
            Search any dish in Gurgaon, see how diners actually rated it, and
            walk in already knowing what to get.
          </p>
          <Link
            href={ROUTES.EXPLORE}
            className="mt-9 inline-flex items-center gap-2 rounded-pill bg-primary px-7 py-4 text-sm font-semibold text-white shadow-glow transition-all hover:gap-3 hover:bg-primary-dark"
          >
            Explore dishes
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  )
}

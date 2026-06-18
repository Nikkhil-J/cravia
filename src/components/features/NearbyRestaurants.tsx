import Link from 'next/link'
import Image from 'next/image'
import type { Restaurant } from '@/lib/types'
import { ROUTES } from '@/lib/constants/routes'
import { CITY_DISPLAY_NAME, type City } from '@/lib/constants'
import { getCuisineEmoji } from '@/lib/utils/dish-display'
import { Reveal, RevealGrid, RevealItem } from '@/components/ui/AnimateReveal'

interface NearbyRestaurantsProps {
  restaurants: Restaurant[]
  city: City
}

export function NearbyRestaurants({ restaurants, city }: NearbyRestaurantsProps) {
  if (restaurants.length === 0) return null

  return (
    <section className="mt-20 bg-bg-warm py-20">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
        <Reveal>
          <div className="mb-9 flex items-end justify-between gap-4">
            <div>
              <div className="mb-3 text-[13px] font-bold uppercase tracking-[0.12em] text-coral">
                Featured spots
              </div>
              <h2 className="font-display text-[clamp(28px,3.5vw,42px)] font-bold leading-tight text-heading">
                Restaurants worth exploring
              </h2>
            </div>
            <Link
              href={`${ROUTES.EXPLORE}?tab=restaurants`}
              className="shrink-0 text-sm font-semibold text-coral transition-colors hover:text-coral-deep"
            >
              See all →
            </Link>
          </div>
        </Reveal>

        <RevealGrid
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.08}
        >
          {restaurants.map((r) => (
            <RevealItem key={r.id}>
              <Link
                href={ROUTES.restaurant(r.id)}
                prefetch
                className="group flex h-full flex-col overflow-hidden rounded-2xl border-[0.5px] border-border bg-card transition-all hover:-translate-y-1.5 hover:border-coral hover:shadow-lg"
              >
                <div className="relative h-40 w-full overflow-hidden bg-coral-bg">
                  {r.coverImage ? (
                    <Image
                      src={r.coverImage}
                      alt={r.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl">
                      <span aria-hidden="true">
                        {getCuisineEmoji(r.cuisines?.[0])}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="mb-1 line-clamp-1 font-display text-[17px] font-semibold text-text-primary">
                    {r.name}
                  </h3>
                  <p className="mb-2.5 line-clamp-1 text-[13px] text-text-secondary">
                    📍 {r.area}, {CITY_DISPLAY_NAME[city]}
                  </p>

                  {r.cuisines.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {r.cuisines.slice(0, 3).map((cuisine) => (
                        <span
                          key={cuisine}
                          className="rounded-pill bg-bg-cream px-2.5 py-[3px] text-[11px] font-medium text-text-secondary"
                        >
                          {cuisine}
                        </span>
                      ))}
                    </div>
                  )}

                  {(r.dishCount || r.totalReviews) ? (
                    <p className="mt-3 text-[11px] font-medium text-coral">
                      {r.dishCount
                        ? `${r.dishCount} dish${r.dishCount === 1 ? '' : 'es'}`
                        : ''}
                      {r.dishCount && r.totalReviews ? ' · ' : ''}
                      {r.totalReviews
                        ? `${r.totalReviews} review${r.totalReviews === 1 ? '' : 's'}`
                        : ''}
                    </p>
                  ) : (
                    <p className="mt-3 text-[11px] text-text-muted">
                      Be the first to review
                    </p>
                  )}
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGrid>
      </div>
    </section>
  )
}

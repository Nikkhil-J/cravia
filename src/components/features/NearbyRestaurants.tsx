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
    <section className="mx-auto max-w-[1120px] px-4 pt-10 sm:px-8">
      <Reveal>
        <div className="mb-2 flex items-end justify-between">
          <div>
            <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-coral">
              Restaurants in {CITY_DISPLAY_NAME[city]}
            </div>
            <h2 className="text-[22px] font-medium leading-[1.2] text-text-primary">
              Most-reviewed places near you
            </h2>
          </div>
          <Link
            href={`${ROUTES.EXPLORE}?tab=restaurants`}
            className="text-[12px] font-medium text-coral hover:text-coral-deep"
          >
            See all →
          </Link>
        </div>
      </Reveal>

      <RevealGrid
        className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        stagger={0.06}
      >
        {restaurants.map((r) => (
          <RevealItem key={r.id}>
            <Link
              href={ROUTES.restaurant(r.id)}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border-[0.5px] border-border bg-card transition-colors hover:border-coral"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-2">
                {r.coverImage ? (
                  <Image
                    src={r.coverImage}
                    alt={r.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-coral-bg">
                    <span className="text-5xl" aria-hidden="true">
                      {getCuisineEmoji(r.cuisines?.[0])}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-3">
                <h3 className="line-clamp-1 text-[13px] font-medium text-text-primary">
                  {r.name}
                </h3>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-text-secondary">
                  {r.area}
                </p>
                {r.cuisines.length > 0 && (
                  <p className="mt-1 line-clamp-1 text-[11px] text-text-muted">
                    {r.cuisines.slice(0, 2).join(' · ')}
                  </p>
                )}
                {(r.dishCount || r.totalReviews) ? (
                  <p className="mt-2 text-[11px] font-medium text-coral">
                    {r.dishCount ? `${r.dishCount} dish${r.dishCount === 1 ? '' : 'es'}` : ''}
                    {r.dishCount && r.totalReviews ? ' · ' : ''}
                    {r.totalReviews
                      ? `${r.totalReviews} review${r.totalReviews === 1 ? '' : 's'}`
                      : ''}
                  </p>
                ) : (
                  <p className="mt-2 text-[11px] text-text-muted">Be the first to review</p>
                )}
              </div>
            </Link>
          </RevealItem>
        ))}
      </RevealGrid>
    </section>
  )
}

import Link from 'next/link'
import Image from 'next/image'
import type { Dish } from '@/lib/types'
import { ROUTES } from '@/lib/constants/routes'
import { type City } from '@/lib/constants'
import { getCuisineEmoji } from '@/lib/utils/dish-display'
import { getOptimizedImageUrl } from '@/lib/utils/image'
import { Reveal, RevealGrid, RevealItem } from '@/components/ui/AnimateReveal'

interface TopRatedStripProps {
  dishes: Dish[]
  city: City
}

function priceLabel(dish: Dish): string | null {
  const num = dish.priceRange?.match(/\d+/)?.[0]
  return num ? `₹${num}` : null
}

export function TopRatedStrip({ dishes }: TopRatedStripProps) {
  const reviewedDishes = dishes.filter((d) => d.reviewCount > 0)
  if (reviewedDishes.length === 0) return null

  return (
    <section className="mx-auto max-w-[1200px] px-6 pt-20 sm:px-8">
      <Reveal>
        <div className="mb-9 flex items-end justify-between gap-4">
          <div>
            <div className="mb-3 text-[13px] font-bold uppercase tracking-[0.12em] text-coral">
              Trending now 🔥
            </div>
            <h2 className="font-display text-[clamp(28px,3.5vw,42px)] font-bold leading-tight text-heading">
              Dishes everyone&rsquo;s talking about
            </h2>
          </div>
          <Link
            href={`${ROUTES.EXPLORE}?tab=dishes`}
            className="shrink-0 text-sm font-semibold text-coral transition-all hover:text-coral-deep"
          >
            See all →
          </Link>
        </div>
      </Reveal>

      <RevealGrid
        className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 sm:-mx-8 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        stagger={0.08}
      >
        {reviewedDishes.map((dish) => {
          const totalReviews = dish.totalReviews ?? dish.reviewCount
          const price = priceLabel(dish)
          return (
            <RevealItem key={dish.id} from="left">
              <Link
                href={ROUTES.dish(dish.id)}
                prefetch
                className="group flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border-[0.5px] border-border bg-card transition-all hover:-translate-y-1.5 hover:border-coral hover:shadow-lg"
              >
                <div className="relative h-[180px] w-full overflow-hidden bg-coral-bg">
                  {dish.coverImage ? (
                    <Image
                      src={getOptimizedImageUrl(dish.coverImage, 'card') ?? ''}
                      alt={dish.name}
                      fill
                      sizes="280px"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl">
                      <span aria-hidden="true">
                        {getCuisineEmoji(dish.cuisines?.[0])}
                      </span>
                    </div>
                  )}
                  {dish.avgOverall > 0 && (
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-success px-2.5 py-1 text-[13px] font-bold text-white">
                      ★ {dish.avgOverall.toFixed(1)}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="mb-1 line-clamp-1 font-display text-[17px] font-semibold leading-snug text-text-primary">
                    {dish.name}
                  </h3>
                  <p className="mb-3 line-clamp-1 text-[13px] text-text-secondary">
                    {dish.restaurantName}
                    {dish.area ? ` · ${dish.area}` : ''}
                  </p>

                  {dish.topTags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {dish.topTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-pill bg-bg-cream px-2.5 py-[3px] text-[11px] font-medium text-text-secondary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto flex items-center justify-between border-t-[0.5px] border-border pt-3">
                    <span className="text-xs text-text-muted">
                      {totalReviews} review{totalReviews === 1 ? '' : 's'}
                    </span>
                    {price && (
                      <span className="text-[15px] font-semibold text-text-primary">
                        {price}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </RevealItem>
          )
        })}
      </RevealGrid>
    </section>
  )
}

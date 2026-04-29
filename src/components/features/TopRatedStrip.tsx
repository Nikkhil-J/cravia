import Link from 'next/link'
import Image from 'next/image'
import type { Dish } from '@/lib/types'
import { ROUTES } from '@/lib/constants/routes'
import { CITY_DISPLAY_NAME, type City } from '@/lib/constants'
import { getCuisineEmoji } from '@/lib/utils/dish-display'
import { Reveal, RevealGrid, RevealItem } from '@/components/ui/AnimateReveal'

interface TopRatedStripProps {
  dishes: Dish[]
  city: City
}

export function TopRatedStrip({ dishes, city }: TopRatedStripProps) {
  const reviewedDishes = dishes.filter((d) => d.reviewCount > 0)
  if (reviewedDishes.length === 0) return null

  return (
    <section className="mx-auto max-w-[1120px] px-4 sm:px-8">
      <div className="my-8 h-px bg-border" />
      <Reveal className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">
        Top rated this week across {CITY_DISPLAY_NAME[city]}
      </Reveal>
      <RevealGrid className="grid grid-cols-2 gap-2.5 sm:grid-cols-4" stagger={0.08}>
        {reviewedDishes.map((dish) => (
          <RevealItem key={dish.id}>
            <Link
              href={ROUTES.dish(dish.id)}
              className="group block rounded-xl bg-surface-2 p-3.5 transition-colors hover:bg-surface-3"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-coral-bg">
                {dish.coverImage ? (
                  <Image
                    src={dish.coverImage}
                    alt={dish.name}
                    width={40}
                    height={40}
                    sizes="40px"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xl" aria-hidden="true">
                    {getCuisineEmoji(dish.cuisines?.[0])}
                  </span>
                )}
              </div>
              <div className="mb-0.5 line-clamp-1 text-[13px] font-medium text-text-primary">
                {dish.name}
              </div>
              <div className="mb-2 line-clamp-1 text-[11px] text-text-secondary">
                {dish.restaurantName}
              </div>
              <div className="text-[11px] font-medium text-coral">
                {dish.avgTaste.toFixed(1)} taste · {dish.avgPortion.toFixed(1)} portion
              </div>
            </Link>
          </RevealItem>
        ))}
      </RevealGrid>
      <div className="my-8 h-px bg-border" />
    </section>
  )
}

import Link from 'next/link'
import Image from 'next/image'
import { HeroSocial } from '@/components/features/proto/HeroSocial'
import { getRecentFeaturedReviews, getReviewCount } from '@/lib/services/reviews'
import { getTopDishes } from '@/lib/services/dishes'
import { GURUGRAM } from '@/lib/constants'
import { ROUTES } from '@/lib/constants/routes'
import { captureError } from '@/lib/monitoring/sentry'
import type { Dish, Review } from '@/lib/types'

export const revalidate = 3600

export default async function ProtoSocialPage() {
  let recentReviews: Review[] = []
  let reviewCount = 0
  let trending: Dish[] = []

  try {
    const [revs, count, dishes] = await Promise.all([
      getRecentFeaturedReviews(6),
      getReviewCount(),
      getTopDishes(8, GURUGRAM),
    ])
    recentReviews = revs
    reviewCount = count
    trending = dishes.filter((d) => d.coverImage).slice(0, 6)
  } catch (error) {
    captureError(error, { route: 'ProtoSocial' })
  }

  return (
    <>
      <HeroSocial recentReviews={recentReviews} reviewCount={reviewCount} />

      {/* Hot right now strip */}
      {trending.length > 0 && (
        <section className="bg-background px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-[1300px]">
            <div className="flex items-end justify-between px-1">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                  🔥 Hot right now
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold text-heading sm:text-4xl">
                  What Gurgaon is eating today
                </h2>
              </div>
              <Link
                href={`${ROUTES.EXPLORE}?tab=dishes`}
                className="hidden text-sm font-semibold text-primary transition-all hover:gap-2 sm:inline-flex sm:items-center sm:gap-1"
              >
                See all <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="scrollbar-hide mt-8 flex gap-4 overflow-x-auto pb-4 sm:gap-5">
              {trending.map((d, i) => (
                <Link
                  key={d.id}
                  href={ROUTES.dish(d.id)}
                  className="group relative h-[340px] w-[260px] shrink-0 overflow-hidden rounded-2xl bg-surface-2 transition-all hover:-translate-y-1.5 hover:shadow-xl"
                >
                  {d.coverImage && (
                    <Image
                      src={d.coverImage}
                      alt={d.name}
                      fill
                      sizes="260px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 pt-20">
                    <div className="flex items-center gap-2">
                      <span className="rounded-pill bg-success px-2 py-0.5 text-xs font-bold text-white">
                        ★ {d.avgOverall.toFixed(1)}
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
                        #{i + 1}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-lg font-bold text-white line-clamp-1">
                      {d.name}
                    </h3>
                    <p className="text-xs text-white/70 line-clamp-1">
                      {d.restaurantName}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Activity feed band */}
      <section className="border-y border-border bg-bg-warm px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-[900px] text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Built by diners, for diners
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-heading sm:text-5xl">
            Every review, with a photo and a price.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-text-secondary sm:text-lg">
            No paid placements. No fake stars. Just real diners rating Taste,
            Portion, and Value — the three things that actually matter.
          </p>
          <Link
            href={ROUTES.EXPLORE}
            className="mt-9 inline-flex items-center gap-2 rounded-pill bg-primary px-7 py-4 text-sm font-semibold text-white shadow-glow transition-all hover:gap-3 hover:bg-primary-dark"
          >
            Find tonight&rsquo;s order
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  )
}

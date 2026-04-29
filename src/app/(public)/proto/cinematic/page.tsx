import Link from 'next/link'
import { HeroCinematic } from '@/components/features/proto/HeroCinematic'
import { getTopDishes } from '@/lib/services/dishes'
import { GURUGRAM, SUB_RATING_LABELS } from '@/lib/constants'
import { ROUTES } from '@/lib/constants/routes'
import { captureError } from '@/lib/monitoring/sentry'
import type { Dish } from '@/lib/types'

export const revalidate = 3600

const RATING_STORY: Record<
  (typeof SUB_RATING_LABELS)[number],
  { caption: string; emoji: string }
> = {
  Taste: {
    caption: 'Was it actually delicious — by people who eat there often.',
    emoji: '🍴',
  },
  Portion: {
    caption: 'Will you leave full. No surprise tiny plates.',
    emoji: '🥣',
  },
  Value: {
    caption: 'Worth the price tag — judged by real diners, not influencers.',
    emoji: '💰',
  },
}

export default async function ProtoCinematicPage() {
  let topDishes: Dish[] = []
  try {
    topDishes = await getTopDishes(8, GURUGRAM)
  } catch (error) {
    captureError(error, { route: 'ProtoCinematic' })
  }

  return (
    <>
      <HeroCinematic dishes={topDishes} />

      {/* Differentiator: the science of a great order */}
      <section className="bg-bg-cream px-6 py-20 sm:px-12 sm:py-28">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
              The science of a great order
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-heading sm:text-5xl">
              Three numbers.
              <br />
              <span className="bg-gradient-to-r from-primary to-brand-orange bg-clip-text text-transparent">
                One perfect order.
              </span>
            </h2>
            <p className="mt-5 text-base text-text-secondary sm:text-lg">
              Cravia rates every dish — not just restaurants — across the three
              things that actually matter at the table.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:mt-20 sm:grid-cols-3 sm:gap-6">
            {SUB_RATING_LABELS.map((label, i) => (
              <div
                key={label}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-7xl font-bold text-heading/10 sm:text-8xl">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-3xl">{RATING_STORY[label].emoji}</span>
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-heading">
                  {label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {RATING_STORY[label].caption}
                </p>
                <div className="mt-6 flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        n <= 4 ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center sm:mt-20">
            <Link
              href={ROUTES.EXPLORE}
              className="inline-flex items-center gap-2 rounded-pill bg-heading px-7 py-4 text-sm font-semibold text-card transition-all hover:gap-3 hover:bg-heading/90"
            >
              Start exploring
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Closing band */}
      <section className="border-t border-border bg-bg-warm px-6 py-16 sm:px-12 sm:py-20">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 text-center sm:gap-8">
          <p className="font-display text-2xl font-medium leading-snug text-heading sm:text-4xl">
            &ldquo;Stop ordering blind. Start ordering well.&rdquo;
          </p>
          <p className="text-sm text-text-secondary sm:text-base">
            Curated by Gurgaon&rsquo;s most opinionated diners.
          </p>
        </div>
      </section>
    </>
  )
}

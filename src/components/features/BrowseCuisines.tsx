import Link from 'next/link'
import { FEATURED_CUISINES, CUISINE_EMOJI } from '@/lib/constants'
import { ROUTES } from '@/lib/constants/routes'
import { Reveal, RevealGrid, RevealItem } from '@/components/ui/AnimateReveal'

export function BrowseCuisines() {
  return (
    <section className="mt-20 bg-bg-warm py-20">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
        <Reveal className="mb-12 text-center">
          <div className="mb-3 text-[13px] font-bold uppercase tracking-[0.12em] text-coral">
            Explore by cuisine
          </div>
          <h2 className="mb-3 font-display text-[clamp(28px,3.5vw,42px)] font-bold leading-tight text-heading">
            What are you craving?
          </h2>
          <p className="mx-auto max-w-[560px] text-base leading-relaxed text-text-secondary">
            From street-side chaat to fine-dining Italian — find the best of
            every cuisine in your city.
          </p>
        </Reveal>

        <RevealGrid
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          stagger={0.05}
        >
          {FEATURED_CUISINES.map((cuisine) => (
            <RevealItem key={cuisine}>
              <Link
                href={`${ROUTES.EXPLORE}?cuisine=${encodeURIComponent(cuisine)}`}
                className="group flex flex-col items-center rounded-2xl border-[0.5px] border-border bg-card px-5 py-7 text-center transition-all hover:-translate-y-1 hover:border-coral hover:shadow-lg"
              >
                <span
                  className="mb-3 block text-[42px] leading-none transition-transform duration-300 group-hover:scale-110"
                  aria-hidden="true"
                >
                  {CUISINE_EMOJI[cuisine] ?? '🍴'}
                </span>
                <span className="font-display text-base font-semibold text-text-primary">
                  {cuisine}
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGrid>
      </div>
    </section>
  )
}

import Link from 'next/link'
import { CUISINE_TYPES, CUISINE_EMOJI } from '@/lib/constants'
import { ROUTES } from '@/lib/constants/routes'
import { Reveal, RevealGrid, RevealItem } from '@/components/ui/AnimateReveal'

const FEATURED_CUISINES: ReadonlyArray<(typeof CUISINE_TYPES)[number]> = [
  'North Indian',
  'South Indian',
  'Mughlai',
  'Biryani',
  'Chinese',
  'Italian',
  'Continental',
  'Cafe',
  'Street Food',
  'Bakery',
  'Desserts',
  'Beverages',
] as const

export function BrowseCuisines() {
  return (
    <section className="mx-auto max-w-[1120px] px-4 pt-10 sm:px-8">
      <Reveal className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-coral">
        Browse by cuisine
      </Reveal>
      <Reveal>
        <h2 className="mb-6 text-[22px] font-medium leading-[1.2] text-text-primary">
          Find your next craving
        </h2>
      </Reveal>

      <RevealGrid
        className="-mx-4 flex gap-2 overflow-x-auto scroll-smooth px-4 pb-2 sm:-mx-8 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        stagger={0.05}
      >
        {FEATURED_CUISINES.map((cuisine) => (
          <RevealItem key={cuisine} from="left">
            <Link
              href={`${ROUTES.EXPLORE}?cuisine=${encodeURIComponent(cuisine)}`}
              className="group inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border-[0.5px] border-border bg-surface-2 px-4 py-2 text-[13px] font-medium text-text-primary transition-colors hover:border-coral hover:bg-coral-bg hover:text-coral-deep"
            >
              <span className="text-base" aria-hidden="true">
                {CUISINE_EMOJI[cuisine] ?? '🍴'}
              </span>
              <span>{cuisine}</span>
            </Link>
          </RevealItem>
        ))}
      </RevealGrid>
    </section>
  )
}

import { cn } from '@/lib/utils'
import { Reveal, RevealGrid, RevealItem } from '@/components/ui/AnimateReveal'

interface Testimonial {
  quote: string
  name: string
  meta: string
  initial: string
  tint: string
}

const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote:
      'Finally an app that reviews dishes, not just restaurants. I knew exactly which biryani to order before I even walked in!',
    name: 'Aanya Sharma',
    meta: '42 reviews · Critic',
    initial: 'A',
    tint: 'bg-coral',
  },
  {
    quote:
      'The sub-ratings for taste, portion and value are genius. No more paying ₹500 for a tiny plate of pasta.',
    name: 'Rahul Menon',
    meta: '28 reviews · Foodie',
    initial: 'R',
    tint: 'bg-brand-orange',
  },
  {
    quote:
      "Love the Crumbs system — it's addictive. I've reviewed 50+ dishes and my friends actually follow my recommendations now.",
    name: 'Priya Patel',
    meta: '53 reviews · Legend',
    initial: 'P',
    tint: 'bg-success',
  },
] as const

export function Testimonials() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-20 sm:px-8">
      <Reveal className="mb-12 text-center">
        <div className="mb-3 text-[13px] font-bold uppercase tracking-[0.12em] text-coral">
          What people say
        </div>
        <h2 className="font-display text-[clamp(28px,3.5vw,42px)] font-bold leading-tight text-heading">
          Loved by food enthusiasts
        </h2>
      </Reveal>

      <RevealGrid className="grid grid-cols-1 gap-5 md:grid-cols-3" stagger={0.1}>
        {TESTIMONIALS.map((t) => (
          <RevealItem
            key={t.name}
            className="rounded-2xl border-[0.5px] border-border bg-card p-7 transition-shadow hover:shadow-md"
          >
            <div className="mb-4 tracking-[2px] text-brand-gold" aria-hidden="true">
              ★★★★★
            </div>
            <p className="mb-5 text-[15px] italic leading-[1.7] text-text-primary">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-base font-bold text-white',
                  t.tint,
                )}
                aria-hidden="true"
              >
                {t.initial}
              </span>
              <div>
                <div className="text-sm font-semibold text-text-primary">
                  {t.name}
                </div>
                <div className="text-xs text-text-muted">{t.meta}</div>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGrid>
    </section>
  )
}

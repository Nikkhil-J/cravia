import { cn } from '@/lib/utils'
import { Reveal, RevealGrid, RevealItem } from '@/components/ui/AnimateReveal'

interface Step {
  num: string
  title: string
  desc: string
  accent?: boolean
}

const STEPS: readonly Step[] = [
  {
    num: '01',
    title: 'Search any dish',
    desc:
      'Type "Biryani" and see every version across all restaurants in Gurgaon — with separate ratings for each.',
    accent: true,
  },
  {
    num: '02',
    title: 'Read dish-level scores',
    desc:
      'Taste, portion, and value — three separate scores from people who actually ordered and ate that exact dish.',
  },
  {
    num: '03',
    title: 'Order with confidence',
    desc:
      'Walk in knowing exactly what to order. No guessing. No regret. Just good food.',
  },
] as const

export function LandingHowItWorks() {
  return (
    <section className="mx-auto max-w-[1120px] px-4 py-10 sm:px-8">
      <Reveal className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-coral">
        How it works
      </Reveal>
      <Reveal>
        <h2 className="mb-6 text-[22px] font-medium leading-[1.2] text-text-primary">
          Three steps to knowing what to order
        </h2>
      </Reveal>
      <RevealGrid className="grid grid-cols-1 gap-3.5 md:grid-cols-3" stagger={0.1}>
        {STEPS.map((step) => (
          <RevealItem
            key={step.num}
            className={cn(
              'rounded-2xl p-[22px]',
              step.accent
                ? 'border border-coral bg-coral-bg'
                : 'border-[0.5px] border-border bg-card',
            )}
          >
            <div
              className={cn(
                'mb-3 text-[40px] font-medium leading-none',
                step.accent ? 'text-coral-mid' : 'text-border',
              )}
            >
              {step.num}
            </div>
            <h3
              className={cn(
                'mb-1.5 text-sm font-medium',
                step.accent ? 'text-coral-deep' : 'text-text-primary',
              )}
            >
              {step.title}
            </h3>
            <p
              className={cn(
                'text-[13px] leading-[1.55]',
                step.accent ? 'text-coral-deeper' : 'text-text-secondary',
              )}
            >
              {step.desc}
            </p>
          </RevealItem>
        ))}
      </RevealGrid>
    </section>
  )
}

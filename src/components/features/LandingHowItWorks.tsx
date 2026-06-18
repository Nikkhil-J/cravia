import { Reveal, RevealGrid, RevealItem } from '@/components/ui/AnimateReveal'

interface Step {
  num: string
  icon: string
  title: string
  desc: string
}

const STEPS: readonly Step[] = [
  {
    num: '1',
    icon: '🔍',
    title: 'Search a dish',
    desc:
      "Look up any dish by name, cuisine, or restaurant. We've got detailed reviews for hundreds of dishes near you.",
  },
  {
    num: '2',
    icon: '⭐',
    title: 'Read real reviews',
    desc:
      'See taste, portion, and value sub-ratings from real diners. Photos, tags, and detailed feedback — not just a number.',
  },
  {
    num: '3',
    icon: '✍️',
    title: 'Share your take',
    desc:
      'Tried the dish? Rate it, tag it, snap a photo. Earn Crumbs and level up as you help others eat better.',
  },
] as const

export function LandingHowItWorks() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-20 sm:px-8">
      <Reveal className="mb-12 text-center">
        <div className="mb-3 text-[13px] font-bold uppercase tracking-[0.12em] text-coral">
          How it works
        </div>
        <h2 className="mb-3 font-display text-[clamp(28px,3.5vw,42px)] font-bold leading-tight text-heading">
          Three steps to your next great meal
        </h2>
        <p className="mx-auto max-w-[560px] text-base leading-relaxed text-text-secondary">
          Cravia makes it ridiculously easy to find dishes worth eating.
        </p>
      </Reveal>

      <RevealGrid className="grid grid-cols-1 gap-6 md:grid-cols-3" stagger={0.1}>
        {STEPS.map((step) => (
          <RevealItem
            key={step.num}
            className="relative rounded-3xl border-[0.5px] border-border bg-card px-7 py-10 text-center transition-all hover:-translate-y-1 hover:border-coral hover:shadow-lg"
          >
            <span className="absolute left-5 top-5 flex h-7 w-7 items-center justify-center rounded-full bg-bg-warm font-display text-sm font-bold text-coral">
              {step.num}
            </span>
            <span
              className="mx-auto mb-5 flex h-[76px] w-[76px] items-center justify-center rounded-full bg-coral-bg text-[34px]"
              aria-hidden="true"
            >
              {step.icon}
            </span>
            <h3 className="mb-2.5 font-display text-xl font-semibold text-heading">
              {step.title}
            </h3>
            <p className="text-sm leading-[1.7] text-text-secondary">
              {step.desc}
            </p>
          </RevealItem>
        ))}
      </RevealGrid>
    </section>
  )
}

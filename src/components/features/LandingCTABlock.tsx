import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'
import { Reveal } from '@/components/ui/AnimateReveal'

export function LandingCTABlock() {
  return (
    <section className="mt-10 border-t-[0.5px] border-border bg-surface-2 px-4 py-12 text-center sm:px-8">
      <Reveal>
        <h2 className="mb-2.5 text-[22px] font-medium leading-[1.25] text-text-primary sm:text-[26px]">
          Know what to order.
          <br />
          <span className="text-coral">Every time.</span>
        </h2>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mb-6 text-sm leading-[1.6] text-text-secondary">
          Join Gurgaon&rsquo;s first dish-level review community. Earn DishPoints for every
          review — redeem for real restaurant coupons.
        </p>
      </Reveal>
      <Reveal delay={0.16}>
        <div className="flex flex-wrap justify-center gap-2.5">
          <Link
            href={`${ROUTES.EXPLORE}?tab=dishes`}
            className="inline-flex items-center justify-center rounded-lg bg-coral px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-coral-deep"
          >
            Start exploring dishes
          </Link>
          <Link
            href={ROUTES.WRITE_REVIEW}
            className="inline-flex items-center justify-center rounded-lg border-[0.5px] border-border bg-card px-6 py-2.5 text-sm font-normal text-text-primary transition-colors hover:border-coral hover:text-coral"
          >
            Write your first review
          </Link>
        </div>
      </Reveal>
    </section>
  )
}

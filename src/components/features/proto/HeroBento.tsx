'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Search, Sparkles, MapPin } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import { HERO_TAGS } from '@/lib/constants'
import type { Dish, Review } from '@/lib/types'

interface HeroBentoProps {
  spotlightDish: Dish | null
  spotlightReview: Review | null
  restaurantCount: number
  dishCount: number
}

const SUB_RATINGS_DEMO = [
  { label: 'Taste', value: 4.8, color: 'bg-primary' },
  { label: 'Portion', value: 4.5, color: 'bg-brand-orange' },
  { label: 'Value', value: 4.7, color: 'bg-brand-gold' },
] as const

export function HeroBento({
  spotlightDish,
  spotlightReview,
  restaurantCount,
  dishCount,
}: HeroBentoProps) {
  const router = useRouter()

  return (
    <section className="relative overflow-hidden bg-bg-cream px-4 pt-24 pb-16 sm:px-6 sm:pt-32 sm:pb-24">
      {/* Soft radial accent */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-0 h-[460px] w-[460px] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute -right-40 bottom-0 h-[460px] w-[460px] rounded-full bg-brand-orange/10 blur-[140px]" />
      </div>

      <div className="relative mx-auto grid max-w-[1300px] gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        {/* LEFT: Editorial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col justify-center"
        >
          <div className="inline-flex w-fit items-center gap-2 rounded-pill border border-border bg-card px-3 py-1.5 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Dish-level reviews · Gurgaon
            </span>
          </div>

          <h1 className="mt-6 font-display text-[40px] font-bold leading-[1.02] tracking-[-0.02em] text-heading sm:text-[64px] lg:text-[76px]">
            Three numbers.
            <br />
            <span className="bg-gradient-to-r from-primary via-brand-orange to-brand-gold bg-clip-text text-transparent">
              One perfect order.
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-base text-text-secondary sm:text-lg">
            Cravia rates every dish — not just restaurants — on the three
            things that actually matter:{' '}
            <span className="font-semibold text-heading">Taste</span>,{' '}
            <span className="font-semibold text-heading">Portion</span>, and{' '}
            <span className="font-semibold text-heading">Value</span>. So you
            know exactly what to order, before you even sit down.
          </p>

          {/* Search */}
          <button
            type="button"
            onClick={() => router.push(`${ROUTES.EXPLORE}?focus=1`)}
            className="group mt-9 flex w-full max-w-lg items-center gap-3 rounded-pill border border-border bg-card px-5 py-4 text-left shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Search className="h-5 w-5 shrink-0 text-text-muted" />
            <span className="flex-1 text-sm font-medium text-text-secondary">
              Search a dish, restaurant, or cuisine…
            </span>
            <span className="hidden rounded-pill bg-surface-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted sm:inline">
              ⌘ K
            </span>
          </button>

          {/* Tag pills */}
          <div className="mt-5 flex flex-wrap gap-2">
            {HERO_TAGS.slice(0, 5).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => router.push(`${ROUTES.EXPLORE}?tab=dishes&q=${encodeURIComponent(tag)}`)}
                className="rounded-pill border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-text-secondary transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>

        {/* RIGHT: Bento */}
        <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
          {/* Tile 1 — Live dish rating card (large, top-left) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="col-span-2 row-span-2 overflow-hidden rounded-2xl border border-border bg-card shadow-lg sm:col-span-1"
          >
            <div className="relative h-44 w-full bg-bg-warm">
              {spotlightDish?.coverImage ? (
                <Image
                  src={spotlightDish.coverImage}
                  alt={spotlightDish.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 320px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-5xl">
                  🍛
                </div>
              )}
              <div className="absolute right-3 top-3 rounded-pill bg-success px-2.5 py-1 text-xs font-bold text-white shadow-md">
                ★ {(spotlightDish?.avgOverall ?? 4.7).toFixed(1)}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-display font-semibold text-heading line-clamp-1">
                {spotlightDish?.name ?? 'Hyderabadi Biryani'}
              </h3>
              <p className="text-xs text-text-muted line-clamp-1">
                {spotlightDish?.restaurantName ?? 'Paradise · Sector 14'}
              </p>

              <div className="mt-4 space-y-2.5">
                {SUB_RATINGS_DEMO.map((r, i) => (
                  <div key={r.label} className="flex items-center gap-3">
                    <span className="w-14 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                      {r.label}
                    </span>
                    <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(r.value / 5) * 100}%` }}
                        transition={{
                          duration: 0.9,
                          delay: 0.3 + i * 0.15,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className={`absolute inset-y-0 left-0 rounded-full ${r.color}`}
                      />
                    </div>
                    <span className="w-8 text-right font-display text-xs font-bold text-heading">
                      {r.value.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Tile 2 — Pull quote (top-right) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="col-span-2 flex flex-col justify-between rounded-2xl border border-border bg-gradient-to-br from-primary to-brand-orange p-5 text-white shadow-lg sm:col-span-1"
          >
            <span className="font-display text-5xl leading-none text-white/40">
              &ldquo;
            </span>
            <p className="mt-1 font-display text-base font-medium leading-snug text-white sm:text-lg">
              {spotlightReview?.text
                ? spotlightReview.text.length > 110
                  ? `${spotlightReview.text.slice(0, 110).trim()}…`
                  : spotlightReview.text
                : 'Insanely creamy gravy, generous portion. Worth every rupee.'}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-white/85">
              <span className="h-1 w-6 rounded-full bg-white/60" />
              <span>{spotlightReview?.userName ?? 'Aarav K.'}</span>
              <span className="text-white/50">·</span>
              <span className="text-white/70">
                Taste{' '}
                {(spotlightReview?.tasteRating ?? 4.8).toString().slice(0, 3)}
              </span>
            </div>
          </motion.div>

          {/* Tile 3 — Map count */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-md"
          >
            <div className="flex items-start justify-between">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Gurgaon
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-heading sm:text-4xl">
              {restaurantCount > 0 ? `${restaurantCount}+` : '65+'}
            </p>
            <p className="text-xs text-text-secondary">restaurants mapped</p>
            <p className="mt-3 font-display text-3xl font-bold text-heading sm:text-4xl">
              {dishCount > 0
                ? dishCount > 1000
                  ? `${(dishCount / 1000).toFixed(1)}K+`
                  : `${dishCount}+`
                : '5.9K+'}
            </p>
            <p className="text-xs text-text-secondary">dishes rated</p>
          </motion.div>

          {/* Tile 4 — How it works snippet */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="rounded-2xl border border-border bg-heading p-5 text-card shadow-md"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-card/60">
              How it works
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                'Search for a dish',
                'See real ratings',
                'Order with confidence',
              ].map((step, i) => (
                <li key={step} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-card/15 text-[10px] font-bold text-card">
                    {i + 1}
                  </span>
                  <span className="text-card/90">{step}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

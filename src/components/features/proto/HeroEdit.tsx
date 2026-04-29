'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Search } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import type { Dish } from '@/lib/types'

interface HeroEditProps {
  coverDish: Dish | null
  collectionDishes: Dish[]
}

const COLLECTIONS = [
  {
    title: 'The Biryani Index',
    kicker: 'Volume I',
    desc: 'Twelve plates that argue why Gurgaon\u2019s biryani game is quietly elite.',
    accent: 'from-primary to-brand-orange',
    emoji: '🍚',
    href: '/explore?cuisine=Hyderabadi&tab=dishes',
  },
  {
    title: 'Underrated Gems',
    kicker: 'Hidden',
    desc: 'High ratings, low review counts. The dishes that deserve a louder fanbase.',
    accent: 'from-[#10B981] to-[#059669]',
    emoji: '💎',
    href: '/explore?tab=dishes&sort=hidden',
  },
  {
    title: 'Date Night, Solved.',
    kicker: 'Romance',
    desc: 'Twelve restaurants where the food is as memorable as the lighting.',
    accent: 'from-[#8B5CF6] to-[#6366F1]',
    emoji: '🍷',
    href: '/explore?tab=restaurants',
  },
  {
    title: 'Cheap Eats. Big Flavor.',
    kicker: 'Under \u20b9500',
    desc: 'When you want bang per buck and zero compromise on taste.',
    accent: 'from-brand-gold to-brand-orange',
    emoji: '💸',
    href: '/explore?tab=dishes',
  },
  {
    title: 'Sunday Brunch.',
    kicker: 'Lazy weekends',
    desc: 'Eggs, mimosas, and the kind of pasta that justifies the morning.',
    accent: 'from-[#F43F5E] to-[#EC4899]',
    emoji: '🥂',
    href: '/explore?tab=restaurants',
  },
  {
    title: 'Worth The Drive.',
    kicker: 'Far-flung',
    desc: 'You\u2019ll happily cross the city. We promise it earns the diesel.',
    accent: 'from-[#3B82F6] to-[#06B6D4]',
    emoji: '🚗',
    href: '/explore?tab=restaurants',
  },
] as const

const today = new Date().toLocaleDateString('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function HeroEdit({ coverDish, collectionDishes }: HeroEditProps) {
  const router = useRouter()

  return (
    <div className="bg-bg-cream pt-24 pb-20 sm:pt-28 sm:pb-28">
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
        {/* Masthead */}
        <header className="border-y border-heading/15 py-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.32em] text-text-muted">
              The Cravia Edit
            </p>
            <p className="font-display text-[10px] uppercase tracking-[0.22em] text-text-muted">
              Volume 01 · Gurugram
            </p>
            <p className="font-display text-[10px] uppercase tracking-[0.22em] text-text-muted">
              {today}
            </p>
          </div>
          <h1 className="mt-6 font-display text-[44px] font-bold leading-[0.95] tracking-[-0.03em] text-heading sm:text-[72px] lg:text-[96px]">
            Eat with intent.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-text-secondary sm:text-lg">
            A weekly edit of the dishes worth your stomach in Gurgaon —
            curated, rated, and explained by the diners who actually live here.
          </p>
        </header>

        {/* Today's pick */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center"
        >
          <Link
            href={coverDish ? ROUTES.dish(coverDish.id) : ROUTES.EXPLORE}
            className="group relative block aspect-[4/3] overflow-hidden rounded-3xl bg-bg-warm sm:aspect-[5/4]"
          >
            {coverDish?.coverImage && (
              <Image
                src={coverDish.coverImage}
                alt={coverDish.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 720px"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 pt-16 sm:p-8 sm:pt-24">
              <span className="rounded-pill bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                Today’s pick
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-white sm:text-4xl">
                {coverDish?.name ?? 'Hyderabadi Dum Biryani'}
              </h2>
              <p className="mt-1 text-sm text-white/75 sm:text-base">
                {coverDish?.restaurantName ?? 'Paradise · Sector 14'}
              </p>
            </div>
          </Link>

          <div>
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.32em] text-primary">
              Why this dish
            </p>
            <h3 className="mt-3 font-display text-2xl font-medium leading-tight text-heading sm:text-3xl">
              &ldquo;Smoky, deeply spiced, generous to a fault — the kind of
              biryani that makes you cancel dinner plans for the week.&rdquo;
            </h3>
            <div className="mt-6 space-y-3">
              {[
                ['Taste', coverDish?.avgTaste ?? 4.8],
                ['Portion', coverDish?.avgPortion ?? 4.6],
                ['Value', coverDish?.avgValue ?? 4.7],
              ].map(([label, value]) => (
                <div key={label as string} className="flex items-baseline justify-between border-b border-heading/10 pb-2.5">
                  <span className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                    {label as string}
                  </span>
                  <span className="font-display text-2xl font-bold text-heading">
                    {(value as number).toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => router.push(`${ROUTES.EXPLORE}?focus=1`)}
              className="group mt-8 flex w-full items-center gap-3 rounded-pill border border-heading/20 bg-card px-5 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-heading hover:shadow-md"
            >
              <Search className="h-5 w-5 shrink-0 text-text-muted" />
              <span className="flex-1 text-sm font-medium text-text-secondary">
                Search the edit
              </span>
              <span className="rounded-pill bg-bg-warm px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                ⌘ K
              </span>
            </button>
          </div>
        </motion.section>

        {/* Editorial collections grid */}
        <section className="mt-20">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-bold tracking-tight text-heading sm:text-3xl">
              The Edit, this week
            </h2>
            <Link
              href={ROUTES.EXPLORE}
              className="hidden text-sm font-semibold text-heading transition-all hover:gap-2 sm:inline-flex sm:items-center sm:gap-1.5"
            >
              All editions <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {COLLECTIONS.map((c, i) => {
              const accent = collectionDishes[i]
              return (
                <Link
                  key={c.title}
                  href={c.href}
                  className="group relative flex aspect-[4/5] flex-col overflow-hidden rounded-3xl bg-card shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-xl"
                >
                  <div className="relative h-2/3 w-full overflow-hidden bg-bg-warm">
                    {accent?.coverImage ? (
                      <Image
                        src={accent.coverImage}
                        alt={c.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                      />
                    ) : (
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${c.accent} opacity-90`}
                      />
                    )}
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${c.accent} mix-blend-multiply opacity-30`}
                    />
                    <span className="absolute right-4 top-4 text-3xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
                      {c.emoji}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                        {c.kicker}
                      </p>
                      <h3 className="mt-2 font-display text-xl font-bold leading-tight text-heading group-hover:text-primary">
                        {c.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-text-secondary line-clamp-2">
                        {c.desc}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                      <span>Issue {String(i + 1).padStart(2, '0')}</span>
                      <span className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Editorial colophon */}
        <footer className="mt-20 border-t border-heading/15 pt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
            <span>Curated by Gurgaon’s most opinionated diners</span>
            <span>Updated weekly</span>
            <span>No paid placements</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

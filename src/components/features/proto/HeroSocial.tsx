'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { Search } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import { HERO_TAGS } from '@/lib/constants'
import type { Review } from '@/lib/types'

interface HeroSocialProps {
  recentReviews: Review[]
  reviewCount: number
}

const FLOATING_EMOJI = ['🍕', '🥘', '🍜', '🍔', '🍣', '🍛', '🍰', '🥟', '🌮', '🍝']

function pickAvg(r: Review) {
  return ((r.tasteRating + r.portionRating + r.valueRating) / 3).toFixed(1)
}

export function HeroSocial({ recentReviews, reviewCount }: HeroSocialProps) {
  const router = useRouter()
  const [wordIndex, setWordIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex((i) => (i + 1) % HERO_TAGS.length)
    }, 2200)
    return () => clearInterval(id)
  }, [])

  const tickerItems = useMemo(() => {
    const items = recentReviews.length > 0 ? recentReviews : []
    return [...items, ...items, ...items]
  }, [recentReviews])

  const polaroids = recentReviews.filter((r) => r.photoUrl).slice(0, 3)

  return (
    <section className="relative overflow-hidden bg-surface-dark px-4 pt-24 pb-16 sm:px-6 sm:pt-32 sm:pb-24">
      {/* Background ambience */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/30 blur-[140px]" />
        <div className="absolute right-[-10%] top-[10%] h-[420px] w-[420px] rounded-full bg-brand-orange/20 blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[-10%] h-[460px] w-[460px] rounded-full bg-brand-gold/15 blur-[140px]" />
        {/* Grain */}
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' /></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>\")",
          }}
        />
      </div>

      {/* Floating emoji bokeh */}
      <div className="pointer-events-none absolute inset-0 hidden sm:block">
        {FLOATING_EMOJI.map((e, i) => (
          <motion.span
            key={`${e}-${i}`}
            initial={{ y: 0, opacity: 0.35 }}
            animate={{ y: [0, -18, 0], opacity: [0.35, 0.6, 0.35] }}
            transition={{
              duration: 6 + (i % 5),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.4,
            }}
            className="absolute text-3xl"
            style={{
              left: `${(i * 11 + 7) % 90}%`,
              top: `${(i * 17 + 12) % 80}%`,
              filter: 'blur(0.4px)',
            }}
          >
            {e}
          </motion.span>
        ))}
      </div>

      <div className="relative mx-auto max-w-[1200px]">
        {/* Live status pill */}
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-pill border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-success/70" />
              <span className="relative h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
              Live in Gurgaon · {reviewCount > 0 ? `${reviewCount}+ reviews` : 'Just launched'}
            </span>
          </motion.div>
        </div>

        {/* Headline */}
        <div className="mt-8 text-center">
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            <span className="block">Find the best</span>
            <span className="relative mt-2 block h-[1.15em] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={HERO_TAGS[wordIndex]}
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  exit={{ y: '-100%', opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block bg-gradient-to-r from-primary via-brand-orange to-brand-gold bg-clip-text text-transparent"
                >
                  {HERO_TAGS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="block">in Gurgaon, tonight.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base text-white/70 sm:mt-7 sm:text-lg">
            Real diners. Real photos. Real ratings. Decide what to order before
            you even sit down.
          </p>
        </div>

        {/* Search */}
        <div className="mx-auto mt-9 max-w-xl">
          <button
            type="button"
            onClick={() => router.push(`${ROUTES.EXPLORE}?focus=1`)}
            className="group flex w-full items-center gap-3 rounded-pill border border-white/15 bg-white/[0.06] px-5 py-4 text-left text-white shadow-[0_8px_40px_rgba(226,55,68,0.18)] backdrop-blur-md transition-all hover:border-white/25 hover:bg-white/[0.1]"
          >
            <Search className="h-5 w-5 shrink-0 text-white/60" />
            <span className="flex-1 text-sm font-medium text-white/70">
              Search for a dish, restaurant, or cuisine…
            </span>
            <span className="hidden rounded-pill bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/60 sm:inline">
              ⌘ K
            </span>
          </button>

          {/* Tag pills */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {HERO_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => router.push(`${ROUTES.EXPLORE}?tab=dishes&q=${encodeURIComponent(tag)}`)}
                className="rounded-pill border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80 transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Floating polaroid review cards */}
        {polaroids.length > 0 && (
          <div className="relative mt-16 hidden h-[280px] sm:block">
            {polaroids.map((review, i) => {
              const positions = [
                { left: '4%', top: '0px', rotate: -6, delay: 0 },
                { left: '50%', top: '40px', rotate: 2, delay: 0.4, translateX: '-50%' },
                { right: '4%', top: '10px', rotate: 5, delay: 0.8 },
              ]
              const pos = positions[i] ?? positions[0]
              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 30, rotate: pos.rotate }}
                  animate={{
                    opacity: 1,
                    y: [0, -10, 0],
                    rotate: pos.rotate,
                  }}
                  transition={{
                    opacity: { duration: 0.6, delay: pos.delay },
                    y: {
                      duration: 5 + i,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: pos.delay,
                    },
                  }}
                  className="absolute w-[210px] rounded-2xl border border-white/10 bg-white p-2.5 shadow-2xl"
                  style={{
                    left: pos.left,
                    right: pos.right,
                    top: pos.top,
                    transform: pos.translateX
                      ? `translateX(${pos.translateX})`
                      : undefined,
                  }}
                >
                  <div className="relative h-[180px] w-full overflow-hidden rounded-xl bg-surface-2">
                    {review.photoUrl && (
                      <Image
                        src={review.photoUrl}
                        alt={review.dishName ?? 'Dish'}
                        fill
                        sizes="210px"
                        className="object-cover"
                      />
                    )}
                    <div className="absolute right-2 top-2 rounded-pill bg-success px-2 py-0.5 text-[11px] font-bold text-white shadow-md">
                      ★ {pickAvg(review)}
                    </div>
                  </div>
                  <div className="px-1 pt-2.5 pb-1">
                    <p className="font-display text-sm font-semibold text-heading line-clamp-1">
                      {review.dishName ?? 'Dish'}
                    </p>
                    <p className="text-[11px] text-text-muted line-clamp-1">
                      by {review.userName} · {review.restaurantName}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Activity ticker */}
        {tickerItems.length > 0 && (
          <div className="relative mt-12 overflow-hidden border-y border-white/10 py-4 sm:mt-16">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-surface-dark to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-surface-dark to-transparent" />
            <motion.div
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 50, ease: 'linear', repeat: Infinity }}
              className="flex w-max items-center gap-10 whitespace-nowrap"
            >
              {tickerItems.map((r, i) => (
                <span
                  key={`${r.id}-${i}`}
                  className="flex items-center gap-3 text-sm text-white/70"
                >
                  <span className="rounded-pill bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80">
                    Just rated
                  </span>
                  <span className="font-semibold text-white">
                    {r.userName}
                  </span>
                  <span className="text-white/50">rated</span>
                  <span className="font-semibold text-white">
                    {r.dishName ?? 'a dish'}
                  </span>
                  <span className="text-white/40">at</span>
                  <span className="text-white/80">{r.restaurantName}</span>
                  <span className="rounded-pill bg-success/20 px-2 py-0.5 text-xs font-bold text-success">
                    ★ {pickAvg(r)}
                  </span>
                  <span className="text-white/20">•</span>
                </span>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { Search } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import type { Dish } from '@/lib/types'

interface HeroCinematicProps {
  dishes: Dish[]
}

export function HeroCinematic({ dishes }: HeroCinematicProps) {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const featured = dishes.filter((d) => d.coverImage).slice(0, 4)
  const safeFeatured = featured.length > 0 ? featured : dishes.slice(0, 4)

  useEffect(() => {
    if (safeFeatured.length <= 1) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % safeFeatured.length)
    }, 6000)
    return () => clearInterval(id)
  }, [safeFeatured.length])

  const current = safeFeatured[index]

  return (
    <section className="relative -mt-[88px] h-[100svh] min-h-[640px] w-full overflow-hidden bg-bg-cream">
      <AnimatePresence mode="sync">
        {current?.coverImage && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={current.coverImage}
              alt={current.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative flex h-full flex-col justify-end px-6 pt-32 pb-12 sm:px-12 sm:pb-20">
        <div className="mx-auto w-full max-w-[1400px]">
          {/* Floating rating chip */}
          <motion.div
            key={`chip-${current?.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 inline-flex items-center gap-3 rounded-pill border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md"
          >
            <span className="font-display text-lg font-bold text-white">
              ★ {current?.avgOverall ? current.avgOverall.toFixed(1) : '4.8'}
            </span>
            <span className="h-3 w-px bg-white/30" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
              Taste · Portion · Value
            </span>
          </motion.div>

          {/* Editorial headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[40px] font-bold leading-[1.02] tracking-[-0.02em] text-white sm:text-[88px] lg:text-[112px]"
          >
            Know what
            <br />
            to order.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.85, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="mt-4 max-w-xl text-lg text-white/85 sm:text-xl"
          >
            Real diners rate every dish on taste, portion, and value.
            <br className="hidden sm:block" />
            See exactly what to get — before you sit down.
          </motion.p>

          {/* Caption + Search */}
          <div className="mt-10 flex flex-col items-start gap-6 sm:mt-14 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <AnimatePresence mode="wait">
              {current && (
                <motion.div
                  key={`cap-${current.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.5 }}
                  className="text-sm text-white/70"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">
                    Now showing
                  </p>
                  <p className="mt-1.5 font-display text-base font-semibold text-white sm:text-lg">
                    {current.name}
                  </p>
                  <p className="text-xs text-white/60 sm:text-sm">
                    {current.restaurantName}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => router.push(`${ROUTES.EXPLORE}?focus=1`)}
              className="group flex w-full items-center gap-3 rounded-pill border border-white/20 bg-white/10 px-5 py-4 text-left text-white backdrop-blur-md transition-all hover:bg-white/15 sm:w-[420px]"
            >
              <Search className="h-5 w-5 shrink-0 text-white/70" />
              <span className="flex-1 text-sm font-medium text-white/80">
                Search a dish, restaurant, or cuisine
              </span>
              <span className="hidden rounded-pill bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/70 sm:inline">
                ⌘ K
              </span>
            </button>
          </div>

          {/* Photo dot indicator */}
          {safeFeatured.length > 1 && (
            <div className="mt-10 flex items-center gap-2">
              {safeFeatured.map((d, i) => (
                <button
                  key={d.id}
                  type="button"
                  aria-label={`Show ${d.name}`}
                  onClick={() => setIndex(i)}
                  className={`h-1 rounded-full transition-all ${
                    i === index ? 'w-10 bg-white' : 'w-5 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

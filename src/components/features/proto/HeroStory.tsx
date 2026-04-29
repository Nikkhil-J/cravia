'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, useScroll, useTransform } from 'motion/react'
import { Search } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import type { Dish } from '@/lib/types'

interface HeroStoryProps {
  spotlightDish: Dish | null
  restaurantCount: number
  dishCount: number
}

const MOMENTS: { eyebrow?: string; line: string; sub?: string }[] = [
  {
    eyebrow: '01',
    line: 'You\u2019re hungry.',
    sub: 'You open the maps. Hundreds of pins. None of them tell you what to order.',
  },
  {
    eyebrow: '02',
    line: 'Gurgaon has more dishes than you\u2019ll eat in a lifetime.',
  },
  {
    eyebrow: '03',
    line: 'Most of them, you\u2019d regret.',
    sub: 'A four-star restaurant can still serve a two-star pasta.',
  },
  {
    eyebrow: '04',
    line: 'So we rate the dish, not the place.',
    sub: 'Three numbers. Taste. Portion. Value.',
  },
  {
    eyebrow: '05',
    line: 'Now you know what to order.',
  },
]

export function HeroStory({
  spotlightDish,
  restaurantCount,
  dishCount,
}: HeroStoryProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const photoScale = useTransform(scrollYProgress, [0, 1], [1.15, 1])
  const photoOpacity = useTransform(scrollYProgress, [0, 0.1, 0.85, 1], [0.3, 0.4, 0.55, 0.7])
  const photoBlur = useTransform(scrollYProgress, [0, 0.5, 1], [12, 4, 0])
  const photoFilter = useTransform(photoBlur, (b) => `blur(${b}px)`)

  return (
    <div ref={containerRef} className="relative bg-surface-dark">
      {/* Sticky photo backdrop */}
      <div className="sticky top-0 -z-0 h-[100svh] w-full overflow-hidden">
        {spotlightDish?.coverImage && (
          <motion.div
            style={{ scale: photoScale, opacity: photoOpacity, filter: photoFilter }}
            className="absolute inset-0"
          >
            <Image
              src={spotlightDish.coverImage}
              alt={spotlightDish.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-surface-dark/60 via-surface-dark/85 to-surface-dark" />
      </div>

      {/* Scroll moments */}
      <div className="-mt-[100svh]">
        {MOMENTS.map((m, i) => {
          const isFinal = i === MOMENTS.length - 1
          return (
            <Moment key={i} eyebrow={m.eyebrow} line={m.line} sub={m.sub}>
              {isFinal && (
                <div className="mt-12 flex flex-col items-center gap-6">
                  <button
                    type="button"
                    onClick={() => router.push(`${ROUTES.EXPLORE}?focus=1`)}
                    className="group flex w-full max-w-md items-center gap-3 rounded-pill border border-white/15 bg-white/[0.07] px-5 py-4 text-left text-white shadow-[0_8px_40px_rgba(255,255,255,0.06)] backdrop-blur-md transition-all hover:bg-white/[0.12]"
                  >
                    <Search className="h-5 w-5 shrink-0 text-white/60" />
                    <span className="flex-1 text-sm font-medium text-white/80">
                      Search a dish, restaurant, or cuisine
                    </span>
                    <span className="hidden rounded-pill bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/60 sm:inline">
                      ⌘ K
                    </span>
                  </button>

                  <div className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                    <span>{restaurantCount > 0 ? `${restaurantCount}+` : '65+'} restaurants</span>
                    <span className="h-1 w-1 rounded-full bg-white/30" />
                    <span>{dishCount > 0 ? `${dishCount.toLocaleString('en-IN')}+` : '5,900+'} dishes</span>
                    <span className="h-1 w-1 rounded-full bg-white/30" />
                    <span>3 ratings each</span>
                  </div>
                </div>
              )}

              {i === 3 && (
                <div className="mt-10 flex flex-wrap justify-center gap-3">
                  {['Taste', 'Portion', 'Value'].map((label, idx) => (
                    <motion.span
                      key={label}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.6 }}
                      transition={{ duration: 0.6, delay: 0.15 * idx }}
                      className="rounded-pill border border-white/15 bg-white/5 px-5 py-2.5 font-display text-sm font-semibold text-white backdrop-blur-md sm:text-base"
                    >
                      {label}
                    </motion.span>
                  ))}
                </div>
              )}
            </Moment>
          )
        })}
      </div>
    </div>
  )
}

function Moment({
  eyebrow,
  line,
  sub,
  children,
}: {
  eyebrow?: string
  line: string
  sub?: string
  children?: React.ReactNode
}) {
  return (
    <section className="relative flex min-h-[100svh] items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.55 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-3xl text-center"
      >
        {eyebrow && (
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.32em] text-white/40">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-white sm:text-6xl lg:text-7xl">
          {line}
        </h2>
        {sub && (
          <p className="mx-auto mt-5 max-w-xl text-base text-white/65 sm:text-lg">
            {sub}
          </p>
        )}
        {children}
      </motion.div>
    </section>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'motion/react'
import { Search } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import type { Dish } from '@/lib/types'

interface HeroRingsProps {
  spotlightDishes: Dish[]
}

const RING_DEFS = [
  {
    label: 'Taste',
    radius: 130,
    stroke: 22,
    color: 'var(--color-primary)',
    track: 'rgba(226, 55, 68, 0.12)',
    desc: 'How good it actually tastes — judged by people who eat there often.',
  },
  {
    label: 'Portion',
    radius: 100,
    stroke: 22,
    color: 'var(--color-brand-orange)',
    track: 'rgba(255, 107, 53, 0.12)',
    desc: 'Will you leave full. No surprise tiny plates.',
  },
  {
    label: 'Value',
    radius: 70,
    stroke: 22,
    color: 'var(--color-brand-gold)',
    track: 'rgba(255, 184, 0, 0.14)',
    desc: 'Worth what it costs, judged by real diners — not influencers.',
  },
] as const

export function HeroRings({ spotlightDishes }: HeroRingsProps) {
  const router = useRouter()
  const reduce = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)

  const featured = spotlightDishes.filter((d) => d.coverImage).slice(0, 3)
  const safeFeatured = featured.length > 0 ? featured : spotlightDishes.slice(0, 3)
  const current = safeFeatured[activeIndex]

  useEffect(() => {
    if (safeFeatured.length <= 1 || reduce) return
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % safeFeatured.length)
    }, 5000)
    return () => clearInterval(id)
  }, [safeFeatured.length, reduce])

  const tasteVal = current?.avgTaste ?? 4.7
  const portionVal = current?.avgPortion ?? 4.4
  const valueVal = current?.avgValue ?? 4.6

  const ringValues = [tasteVal, portionVal, valueVal]

  return (
    <section className="relative overflow-hidden bg-bg-cream px-4 pt-24 pb-16 sm:px-6 sm:pt-32 sm:pb-24">
      {/* Soft accent */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1200px]">
        <div className="text-center">
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.32em] text-primary">
            Cravia · Three rings
          </p>
          <h1 className="mt-5 font-display text-[40px] font-bold leading-[1.02] tracking-[-0.02em] text-heading sm:text-[64px] lg:text-[80px]">
            Three rings.
            <br />
            <span className="bg-gradient-to-r from-primary via-brand-orange to-brand-gold bg-clip-text text-transparent">
              One perfect bite.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-text-secondary sm:text-lg">
            Every dish in Gurgaon, scored on the only three things that matter
            at the table.
          </p>
        </div>

        {/* Rings + Dish */}
        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div className="flex justify-center">
            <Rings values={ringValues} reduce={reduce ?? false} />
          </div>

          <div className="flex flex-col">
            {current && (
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden rounded-3xl border border-border bg-card shadow-md"
              >
                <div className="relative h-56 w-full bg-bg-warm">
                  {current.coverImage && (
                    <Image
                      src={current.coverImage}
                      alt={current.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 480px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                    Now showing
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-heading">
                    {current.name}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {current.restaurantName}
                  </p>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {RING_DEFS.map((r, i) => (
                      <div
                        key={r.label}
                        className="rounded-2xl border border-border bg-bg-warm p-3"
                      >
                        <span
                          className="block h-1.5 w-6 rounded-full"
                          style={{ background: r.color }}
                        />
                        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                          {r.label}
                        </p>
                        <p className="mt-1 font-display text-2xl font-bold text-heading">
                          {ringValues[i].toFixed(1)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {safeFeatured.length > 1 && (
              <div className="mt-5 flex items-center justify-center gap-2">
                {safeFeatured.map((d, i) => (
                  <button
                    key={d.id}
                    type="button"
                    aria-label={`Show ${d.name}`}
                    onClick={() => setActiveIndex(i)}
                    className={`h-1 rounded-full transition-all ${
                      i === activeIndex
                        ? 'w-10 bg-heading'
                        : 'w-5 bg-heading/20 hover:bg-heading/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mx-auto mt-16 max-w-xl">
          <button
            type="button"
            onClick={() => router.push(`${ROUTES.EXPLORE}?focus=1`)}
            className="group flex w-full items-center gap-3 rounded-pill border border-border bg-card px-5 py-4 text-left shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Search className="h-5 w-5 shrink-0 text-text-muted" />
            <span className="flex-1 text-sm font-medium text-text-secondary">
              Search a dish, restaurant, or cuisine
            </span>
            <span className="hidden rounded-pill bg-bg-warm px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted sm:inline">
              ⌘ K
            </span>
          </button>
        </div>

        {/* Ring legend */}
        <div className="mt-16 grid gap-4 sm:mt-20 sm:grid-cols-3">
          {RING_DEFS.map((r) => (
            <div
              key={r.label}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5"
            >
              <span
                className="mt-1 inline-block h-3 w-3 shrink-0 rounded-full"
                style={{ background: r.color }}
              />
              <div>
                <p className="font-display text-sm font-bold uppercase tracking-wider text-heading">
                  {r.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  {r.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Rings({ values, reduce }: { values: number[]; reduce: boolean }) {
  const size = 320
  const center = size / 2

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="drop-shadow-[0_8px_30px_rgba(226,55,68,0.18)]"
      initial={reduce ? false : { rotate: -8, opacity: 0 }}
      animate={reduce ? undefined : { rotate: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      {RING_DEFS.map((r, i) => {
        const value = values[i] ?? 0
        const fraction = Math.max(0, Math.min(1, value / 5))
        const circumference = 2 * Math.PI * r.radius
        return (
          <g key={r.label} transform={`rotate(-90 ${center} ${center})`}>
            <circle
              cx={center}
              cy={center}
              r={r.radius}
              fill="none"
              stroke={r.track}
              strokeWidth={r.stroke}
            />
            <motion.circle
              cx={center}
              cy={center}
              r={r.radius}
              fill="none"
              stroke={r.color}
              strokeWidth={r.stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={reduce ? false : { strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - fraction) }}
              transition={{
                duration: 1.4,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.2 + i * 0.18,
              }}
            />
          </g>
        )
      })}

      {/* Center label */}
      <text
        x={center}
        y={center - 6}
        textAnchor="middle"
        className="fill-heading font-display"
        style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em' }}
      >
        {((values[0] + values[1] + values[2]) / 3).toFixed(1)}
      </text>
      <text
        x={center}
        y={center + 22}
        textAnchor="middle"
        className="fill-text-muted font-display"
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
        }}
      >
        Overall
      </text>
    </motion.svg>
  )
}

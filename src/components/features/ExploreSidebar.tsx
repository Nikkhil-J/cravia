'use client'

import { Suspense, useCallback, useEffect, useTransition, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { setExplorePending } from '@/components/features/ExploreResultsWrapper'
import { ROUTES } from '@/lib/constants/routes'

type ExploreTab = 'dishes' | 'restaurants'

const PRICE_RANGE_OPTIONS = [
  { value: 'under-100', label: 'Under ₹100' },
  { value: '100-200', label: '₹100–200' },
  { value: '200-400', label: '₹200–400' },
  { value: '400-600', label: '₹400–600' },
  { value: 'above-600', label: '₹600+' },
]

const DIETARY_OPTIONS = [
  { value: 'veg', label: 'Vegetarian' },
  { value: 'non-veg', label: 'Non-Vegetarian' },
  { value: 'egg', label: 'Egg' },
]

const RATING_OPTIONS = [
  { value: '4', stars: 4 },
  { value: '3', stars: 3 },
]

interface ExploreSidebarProps {
  activeTab: ExploreTab
  areas: string[]
  /** Called after a navigation is triggered (used to close the mobile sheet). */
  onNavigate?: () => void
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
      {children}
    </h4>
  )
}

function OptionRow({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 py-2 text-left text-sm font-medium text-text-primary transition-colors hover:text-primary"
    >
      <span
        className={cn(
          'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border-2 transition-colors',
          active ? 'border-primary bg-primary text-white' : 'border-border'
        )}
      >
        {active && <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />}
      </span>
      <span className="min-w-0">{children}</span>
    </button>
  )
}

function SidebarControls({ activeTab, areas, onNavigate }: ExploreSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setExplorePending(isPending)
  }, [isPending])

  const navigate = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('q')
      Object.entries(overrides).forEach(([key, val]) => {
        if (val) params.set(key, val)
        else params.delete(key)
      })
      startTransition(() => {
        router.push(`${ROUTES.EXPLORE}?${params.toString()}`, { scroll: false })
      })
      onNavigate?.()
    },
    [searchParams, router, onNavigate]
  )

  const toggle = useCallback(
    (key: string, value: string) => {
      const current = searchParams.get(key)
      navigate({ [key]: current === value ? null : value })
    },
    [searchParams, navigate]
  )

  const selectedPrice = searchParams.get('priceRange')
  const selectedRating = searchParams.get('minRating')
  const selectedDietary = searchParams.get('dietary')
  const selectedArea = searchParams.get('area')

  const isDishes = activeTab === 'dishes'

  return (
    <div className="space-y-6">
      {isDishes && (
        <section>
          <SectionTitle>Price Range</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {PRICE_RANGE_OPTIONS.map((p) => {
              const active = selectedPrice === p.value
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => toggle('priceRange', p.value)}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors',
                    active
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-bg-cream text-text-secondary hover:border-primary hover:text-primary'
                  )}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </section>
      )}

      {isDishes && (
        <section>
          <SectionTitle>Rating</SectionTitle>
          {RATING_OPTIONS.map((r) => (
            <OptionRow
              key={r.value}
              active={selectedRating === r.value}
              onClick={() => toggle('minRating', r.value)}
            >
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-3.5 w-3.5',
                        i < r.stars
                          ? 'fill-brand-gold text-brand-gold'
                          : 'fill-border text-border'
                      )}
                      aria-hidden="true"
                    />
                  ))}
                </span>
                <span className="text-text-secondary">&amp; up</span>
              </span>
            </OptionRow>
          ))}
        </section>
      )}

      {isDishes && (
        <section>
          <SectionTitle>Dietary</SectionTitle>
          {DIETARY_OPTIONS.map((d) => (
            <OptionRow
              key={d.value}
              active={selectedDietary === d.value}
              onClick={() => toggle('dietary', d.value)}
            >
              {d.label}
            </OptionRow>
          ))}
        </section>
      )}

      {areas.length > 0 && (
        <section>
          <SectionTitle>Area</SectionTitle>
          {areas.map((a) => (
            <OptionRow
              key={a}
              active={selectedArea === a}
              onClick={() => toggle('area', a)}
            >
              {a}
            </OptionRow>
          ))}
        </section>
      )}
    </div>
  )
}

/** Desktop sticky sidebar card with the prototype's filter sections. */
export function ExploreSidebar(props: ExploreSidebarProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 font-display text-base font-semibold text-heading">Filters</h3>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-surface-3" />}>
        <SidebarControls {...props} />
      </Suspense>
    </div>
  )
}

/** Filter sections without the card chrome — used inside the mobile Sheet. */
export function ExploreSidebarControls(props: ExploreSidebarProps) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-surface-3" />}>
      <SidebarControls {...props} />
    </Suspense>
  )
}

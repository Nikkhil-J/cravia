'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { X, ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useState, useTransition, Suspense, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { setExplorePending } from '@/components/features/ExploreResultsWrapper'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { ROUTES } from '@/lib/constants/routes'

type ExploreTab = 'dishes' | 'restaurants'
type DishSortOption = 'highest-rated' | 'newest' | 'most-helpful'

interface ExploreFiltersProps {
  query: string
  activeTab: ExploreTab
  selectedCuisine: string | null
  selectedArea: string | null
  selectedDietary: string | null
  selectedPriceRange: string | null
  selectedSortBy: DishSortOption
  cuisines: string[]
  areas: string[]
}

const DIETARY_OPTIONS = [
  { value: 'veg', label: 'Veg' },
  { value: 'non-veg', label: 'Non-veg' },
  { value: 'egg', label: 'Egg' },
]

const PRICE_RANGE_OPTIONS = [
  { value: 'under-100', label: 'Under ₹100' },
  { value: '100-200', label: '₹100–200' },
  { value: '200-400', label: '₹200–400' },
  { value: '400-600', label: '₹400–600' },
  { value: 'above-600', label: '₹600+' },
]

const DISH_SORT_OPTIONS: { value: DishSortOption; label: string }[] = [
  { value: 'highest-rated', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'most-helpful', label: 'Most Reviewed' },
]

function FilterChip({
  group,
  active,
  onClick,
  children,
  className,
}: {
  group: string
  active: boolean
  onClick: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative shrink-0 rounded-pill px-3.5 py-1 text-[0.8rem] font-medium transition-colors duration-200',
        active
          ? 'text-white'
          : 'border border-border bg-transparent text-foreground hover:bg-surface-2 hover:text-foreground',
        className
      )}
    >
      {active && (
        <motion.span
          layoutId={`chip-bg-${group}`}
          className="absolute inset-0 rounded-pill bg-primary"
          transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
        />
      )}
      <span className="relative z-[1] inline-flex items-center gap-2">{children}</span>
    </button>
  )
}

function SortChip({
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
      className={cn(
        'shrink-0 whitespace-nowrap rounded-pill px-3.5 py-1.5 text-[0.75rem] font-semibold transition-colors duration-200',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-text-muted hover:bg-surface-3 hover:text-text-secondary'
      )}
    >
      {children}
    </button>
  )
}

function FiltersInner({
  query,
  activeTab,
  selectedCuisine: serverCuisine,
  selectedArea: serverArea,
  selectedDietary: serverDietary,
  selectedPriceRange: serverPriceRange,
  selectedSortBy: serverSortBy,
  cuisines,
  areas,
}: ExploreFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setExplorePending(isPending)
  }, [isPending])

  const [optimisticCuisine, setOptimisticCuisine] = useState<string | null>(null)
  const [optimisticArea, setOptimisticArea] = useState<string | null>(null)
  const [optimisticDietary, setOptimisticDietary] = useState<string | null>(null)
  const [optimisticPriceRange, setOptimisticPriceRange] = useState<string | null>(null)
  const [optimisticSort, setOptimisticSort] = useState<string | null>(null)

  const selectedCuisine = optimisticCuisine ?? serverCuisine
  const selectedArea = optimisticArea ?? serverArea
  const selectedDietary = optimisticDietary ?? serverDietary
  const selectedPriceRange = optimisticPriceRange ?? serverPriceRange
  const selectedSortBy = optimisticSort ?? serverSortBy

  const [lastServerKey, setLastServerKey] = useState(
    `${serverCuisine}-${serverArea}-${serverDietary}-${serverPriceRange}-${serverSortBy}`
  )
  const currentServerKey = `${serverCuisine}-${serverArea}-${serverDietary}-${serverPriceRange}-${serverSortBy}`
  if (currentServerKey !== lastServerKey) {
    setLastServerKey(currentServerKey)
    setOptimisticCuisine(null)
    setOptimisticArea(null)
    setOptimisticDietary(null)
    setOptimisticPriceRange(null)
    setOptimisticSort(null)
  }

  const buildUrl = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('q')
      if (activeTab === 'restaurants') params.delete('sortBy')
      Object.entries(overrides).forEach(([key, val]) => {
        if (val) params.set(key, val)
        else params.delete(key)
      })
      return `${ROUTES.EXPLORE}?${params.toString()}`
    },
    [activeTab, searchParams]
  )

  // Soft client navigation: updates the URL (so filters stay shareable and
  // back-navigable) without scrolling to top or unmounting the current results.
  const navigate = useCallback(
    (href: string) => {
      startTransition(() => {
        router.push(href, { scroll: false })
      })
    },
    [router]
  )

  function handleTabChange(tab: ExploreTab) {
    const params = new URLSearchParams()
    if (tab !== 'dishes') params.set('tab', tab)
    navigate(`${ROUTES.EXPLORE}?${params.toString()}`)
  }

  function toggleFilter(key: string, value: string | null) {
    const current = searchParams.get(key)
    const newVal = current === value ? null : value

    if (key === 'cuisine') setOptimisticCuisine(newVal)
    else if (key === 'area') setOptimisticArea(newVal)
    else if (key === 'dietary') setOptimisticDietary(newVal)
    else if (key === 'priceRange') setOptimisticPriceRange(newVal)

    navigate(buildUrl({ [key]: newVal }))
  }

  function handleSort(value: string) {
    setOptimisticSort(value)
    const defaultSort = 'highest-rated'
    navigate(buildUrl({ sortBy: value === defaultSort ? null : value }))
  }

  const filterCount = [query, selectedCuisine, selectedArea, selectedDietary, selectedPriceRange].filter(
    Boolean
  ).length

  const hasAreas = areas.length > 0

  const summaryRow =
    filterCount > 0 ? (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-text-muted">
          {filterCount} filter{filterCount !== 1 ? 's' : ''}
        </span>
        {query && (
          <Badge
            variant="secondary"
            className="cursor-pointer gap-1"
            render={
              <button type="button" onClick={() => navigate(buildUrl({}))} />
            }
          >
            &ldquo;{query}&rdquo;
            <X className="h-3 w-3 text-text-muted" aria-hidden />
          </Badge>
        )}
        {selectedCuisine && (
          <Badge
            variant="secondary"
            className="cursor-pointer gap-1"
            render={
              <button type="button" onClick={() => toggleFilter('cuisine', selectedCuisine)} />
            }
          >
            {selectedCuisine}
            <X className="h-3 w-3 text-text-muted" aria-hidden />
          </Badge>
        )}
        {selectedArea && (
          <Badge
            variant="secondary"
            className="cursor-pointer gap-1"
            render={<button type="button" onClick={() => toggleFilter('area', selectedArea)} />}
          >
            {selectedArea}
            <X className="h-3 w-3 text-text-muted" aria-hidden />
          </Badge>
        )}
        {selectedDietary && (
          <Badge
            variant="secondary"
            className="cursor-pointer gap-1"
            render={
              <button type="button" onClick={() => toggleFilter('dietary', selectedDietary)} />
            }
          >
            {DIETARY_OPTIONS.find((d) => d.value === selectedDietary)?.label ?? selectedDietary}
            <X className="h-3 w-3 text-text-muted" aria-hidden />
          </Badge>
        )}
        {selectedPriceRange && (
          <Badge
            variant="secondary"
            className="cursor-pointer gap-1"
            render={
              <button type="button" onClick={() => toggleFilter('priceRange', selectedPriceRange)} />
            }
          >
            {PRICE_RANGE_OPTIONS.find((p) => p.value === selectedPriceRange)?.label ??
              selectedPriceRange}
            <X className="h-3 w-3 text-text-muted" aria-hidden />
          </Badge>
        )}
        <Button
          variant="link"
          size="xs"
          onClick={() =>
            navigate(buildUrl({ cuisine: null, area: null, dietary: null, priceRange: null }))
          }
          className="text-xs font-semibold"
        >
          Clear all
        </Button>
      </div>
    ) : null

  return (
    <div>
      {/* ── Control card: tab toggle + sort chips ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">

        {/* Row 1: tabs (left) + sort chips (right) */}
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex shrink-0 items-center gap-1 rounded-pill bg-surface-3 p-1">
            {(['dishes', 'restaurants'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={cn(
                  'relative rounded-pill px-4 py-1.5 text-sm font-semibold transition-colors duration-200',
                  activeTab === tab ? 'text-white' : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {activeTab === tab && (
                  <motion.span
                    layoutId="explore-tab-indicator"
                    className="absolute inset-0 rounded-pill bg-primary shadow-sm"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <span className="relative z-[1]">
                  {tab === 'dishes' ? 'Dishes' : 'Restaurants'}
                </span>
              </button>
            ))}
          </div>

          {/* Mobile: custom dropdown */}
          {activeTab === 'dishes' && (
            <DropdownMenu>
              <DropdownMenuTrigger className="md:hidden flex items-center gap-1.5 rounded-pill border border-border bg-card px-3 py-1.5 text-sm font-semibold text-foreground focus:outline-none focus:border-primary transition-colors hover:bg-surface-2">
                {DISH_SORT_OPTIONS.find((o) => o.value === selectedSortBy)?.label ?? 'Sort'}
                <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={6} className="w-auto min-w-[160px]">
                <DropdownMenuRadioGroup value={selectedSortBy} onValueChange={handleSort}>
                  {DISH_SORT_OPTIONS.map((opt) => (
                    <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Desktop: pills */}
          {activeTab === 'dishes' && (
            <div className="hidden md:flex items-center gap-0.5">
              {DISH_SORT_OPTIONS.map((opt) => (
                <SortChip
                  key={opt.value}
                  active={selectedSortBy === opt.value}
                  onClick={() => handleSort(opt.value)}
                >
                  {opt.label}
                </SortChip>
              ))}
            </div>
          )}
        </div>

        {/* Row 2: filter chips strip */}
        <div className="border-t border-border px-4 py-3">
          <div className="-mx-1 flex items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="shrink-0 px-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              Filter
            </span>

            {cuisines.map((c) => (
              <FilterChip
                key={c}
                group="cuisine"
                active={selectedCuisine === c}
                onClick={() => toggleFilter('cuisine', c)}
              >
                {c}
              </FilterChip>
            ))}

            {hasAreas && <div className="mx-1 h-4 w-px shrink-0 bg-border" />}
            {hasAreas &&
              areas.map((a) => (
                <FilterChip
                  key={a}
                  group="area"
                  active={selectedArea === a}
                  onClick={() => toggleFilter('area', a)}
                >
                  {a}
                </FilterChip>
              ))}

            {activeTab === 'dishes' && (
              <>
                <div className="mx-1 h-4 w-px shrink-0 bg-border" />
                {DIETARY_OPTIONS.map((d) => (
                  <FilterChip
                    key={d.value}
                    group="dietary"
                    active={selectedDietary === d.value}
                    onClick={() => toggleFilter('dietary', d.value)}
                  >
                    {d.label}
                  </FilterChip>
                ))}
                <div className="mx-1 h-4 w-px shrink-0 bg-border" />
                {PRICE_RANGE_OPTIONS.map((p) => (
                  <FilterChip
                    key={p.value}
                    group="priceRange"
                    active={selectedPriceRange === p.value}
                    onClick={() => toggleFilter('priceRange', p.value)}
                  >
                    {p.label}
                  </FilterChip>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {summaryRow}
    </div>
  )
}

function ExploreFiltersSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Row 1: tab toggle + sort chips */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="h-9 w-44 animate-pulse rounded-pill bg-surface-3" />
        <div className="flex items-center gap-0.5">
          <div className="h-7 w-24 animate-pulse rounded-pill bg-surface-3" />
          <div className="h-7 w-16 animate-pulse rounded-pill bg-surface-3" />
          <div className="h-7 w-28 animate-pulse rounded-pill bg-surface-3" />
        </div>
      </div>
      {/* Row 2: filter chips */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="h-4 w-10 animate-pulse rounded bg-surface-3" />
          <div className="h-7 w-24 animate-pulse rounded-pill bg-surface-3" />
          <div className="h-7 w-20 animate-pulse rounded-pill bg-surface-3" />
          <div className="h-7 w-16 animate-pulse rounded-pill bg-surface-3" />
          <div className="h-7 w-24 animate-pulse rounded-pill bg-surface-3" />
          <div className="h-7 w-20 animate-pulse rounded-pill bg-surface-3" />
          <div className="h-7 w-14 animate-pulse rounded-pill bg-surface-3" />
        </div>
      </div>
    </div>
  )
}

export function ExploreFilters(props: ExploreFiltersProps) {
  return (
    <Suspense fallback={<ExploreFiltersSkeleton />}>
      <FiltersInner {...props} />
    </Suspense>
  )
}

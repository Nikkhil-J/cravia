'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X } from 'lucide-react'
import { useCallback, useRef, useState, useLayoutEffect, Suspense, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { RestaurantSortOption } from '@/lib/services/catalog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/lib/constants/routes'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

type ExploreTab = 'dishes' | 'restaurants'
type DishSortOption = 'highest-rated' | 'newest' | 'most-helpful'
type AnySortOption = RestaurantSortOption | DishSortOption

interface ExploreFiltersProps {
  query: string
  activeTab: ExploreTab
  selectedCuisine: string | null
  selectedArea: string | null
  selectedDietary: string | null
  selectedPriceRange: string | null
  selectedSortBy: AnySortOption
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

const RESTAURANT_SORT_OPTIONS: { value: RestaurantSortOption; label: string }[] = [
  { value: 'most-reviewed', label: 'Most Reviewed' },
  { value: 'newest', label: 'Newest' },
  { value: 'alphabetical', label: 'A–Z' },
]

const DISH_SORT_OPTIONS: { value: DishSortOption; label: string }[] = [
  { value: 'highest-rated', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'most-helpful', label: 'Most Reviewed' },
]

const scrollRowClass =
  '-mx-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

function FilterSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <div className={scrollRowClass}>
        <div className="flex w-max gap-2 px-1">{children}</div>
      </div>
    </div>
  )
}

function FilterChip({ group, active, onClick, children, className }: {
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
          : 'border border-border bg-transparent text-foreground hover:bg-muted hover:text-foreground',
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

function SortSegmented({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null)

  function measure(active: string) {
    const container = containerRef.current
    const el = itemRefs.current.get(active)
    if (!container || !el) return
    const cRect = container.getBoundingClientRect()
    const eRect = el.getBoundingClientRect()
    setPill({ left: eRect.left - cRect.left, width: eRect.width })
  }

  useLayoutEffect(() => {
    measure(value)
  }, [value])

  return (
    <div
      ref={containerRef}
      className="relative hidden items-center gap-1 rounded-pill bg-surface-3 p-1 md:flex"
    >
      {pill && (
        <motion.div
          className="absolute top-1 bottom-1 rounded-pill bg-primary shadow-sm"
          animate={{ left: pill.left, width: pill.width }}
          transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
        />
      )}
      {options.map((opt) => (
        <button
          key={opt.value}
          ref={(el) => { if (el) itemRefs.current.set(opt.value, el) }}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'relative z-[1] rounded-pill px-3.5 py-1.5 text-[0.8rem] font-semibold transition-colors duration-200',
            value === opt.value ? 'text-white' : 'text-text-secondary hover:text-text-primary'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function FiltersInner({
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
  const currentServerKey =
    `${serverCuisine}-${serverArea}-${serverDietary}-${serverPriceRange}-${serverSortBy}`
  if (currentServerKey !== lastServerKey) {
    setLastServerKey(currentServerKey)
    setOptimisticCuisine(null)
    setOptimisticArea(null)
    setOptimisticDietary(null)
    setOptimisticPriceRange(null)
    setOptimisticSort(null)
  }

  const buildUrl = useCallback((overrides: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    Object.entries(overrides).forEach(([key, val]) => {
      if (val) params.set(key, val)
      else params.delete(key)
    })
    return `${ROUTES.EXPLORE}?${params.toString()}`
  }, [searchParams])

  function signalFilterChange() {
    window.dispatchEvent(new CustomEvent('explore-filter-change'))
  }

  function handleTabChange(tab: ExploreTab) {
    signalFilterChange()
    const params = new URLSearchParams()
    if (tab !== 'dishes') params.set('tab', tab)
    router.push(`${ROUTES.EXPLORE}?${params.toString()}`)
  }

  function toggleFilter(key: string, value: string | null) {
    const current = searchParams.get(key)
    const newVal = current === value ? null : value

    if (key === 'cuisine') setOptimisticCuisine(newVal)
    else if (key === 'area') setOptimisticArea(newVal)
    else if (key === 'dietary') setOptimisticDietary(newVal)
    else if (key === 'priceRange') setOptimisticPriceRange(newVal)

    signalFilterChange()
    router.push(buildUrl({ [key]: newVal }))
  }

  function handleSort(value: string) {
    setOptimisticSort(value)
    signalFilterChange()
    const defaultSort = activeTab === 'dishes' ? 'highest-rated' : 'most-reviewed'
    router.push(buildUrl({ sortBy: value === defaultSort ? null : value }))
  }

  const filterCount = [
    selectedCuisine,
    selectedArea,
    selectedDietary,
    selectedPriceRange,
  ].filter(Boolean).length

  const cuisineChips = cuisines.map((c) => (
    <FilterChip key={c} group="cuisine" active={selectedCuisine === c} onClick={() => toggleFilter('cuisine', c)}>
      {c}
    </FilterChip>
  ))

  const [showAllAreas, setShowAllAreas] = useState(false)
  const visibleAreas = showAllAreas ? areas : areas.slice(0, 6)

  const areaChips = (
    <>
      {visibleAreas.map((a) => (
        <FilterChip key={a} group="area" active={selectedArea === a} onClick={() => toggleFilter('area', a)}>
          {a}
        </FilterChip>
      ))}
      {areas.length > 6 && (
        <button
          type="button"
          onClick={() => setShowAllAreas((prev) => !prev)}
          className="shrink-0 text-xs font-medium text-primary hover:underline ml-1"
        >
          {showAllAreas ? 'Show less' : `+${areas.length - 6} more`}
        </button>
      )}
    </>
  )

  const dietaryChips = DIETARY_OPTIONS.map((d) => (
    <FilterChip key={d.value} group="dietary" active={selectedDietary === d.value} onClick={() => toggleFilter('dietary', d.value)}>
      {d.label}
    </FilterChip>
  ))

  const priceRangeChips = PRICE_RANGE_OPTIONS.map((p) => (
    <FilterChip key={p.value} group="priceRange" active={selectedPriceRange === p.value} onClick={() => toggleFilter('priceRange', p.value)}>
      {p.label}
    </FilterChip>
  ))

  const filterGroups = (
    <div className="space-y-5">
      <FilterSection label="Cuisine">{cuisineChips}</FilterSection>
      {areas.length > 0 && <FilterSection label="Area">{areaChips}</FilterSection>}
      {activeTab === 'dishes' && (
        <>
          <FilterSection label="Dietary">{dietaryChips}</FilterSection>
          <FilterSection label="Price Range">{priceRangeChips}</FilterSection>
        </>
      )}
    </div>
  )

  const sortOptions = activeTab === 'dishes' ? DISH_SORT_OPTIONS : RESTAURANT_SORT_OPTIONS

  const sortSelectMobile = (
    <Select
      value={selectedSortBy}
      onValueChange={(val) => { if (val) handleSort(val) }}
    >
      <SelectTrigger className="h-auto min-w-0 flex-1 rounded-pill border-2 border-border bg-card px-3.5 py-2.5 text-sm font-semibold text-text-primary">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  const summaryRow =
    filterCount > 0 ? (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-text-muted">
          {filterCount} filter{filterCount !== 1 ? 's' : ''}
        </span>
        {selectedCuisine && (
          <Badge
            variant="secondary"
            className="cursor-pointer gap-1"
            render={<button type="button" onClick={() => toggleFilter('cuisine', selectedCuisine)} />}
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
            render={<button type="button" onClick={() => toggleFilter('dietary', selectedDietary)} />}
          >
            {DIETARY_OPTIONS.find((d) => d.value === selectedDietary)?.label ?? selectedDietary}
            <X className="h-3 w-3 text-text-muted" aria-hidden />
          </Badge>
        )}
        {selectedPriceRange && (
          <Badge
            variant="secondary"
            className="cursor-pointer gap-1"
            render={<button type="button" onClick={() => toggleFilter('priceRange', selectedPriceRange)} />}
          >
            {PRICE_RANGE_OPTIONS.find((p) => p.value === selectedPriceRange)?.label ?? selectedPriceRange}
            <X className="h-3 w-3 text-text-muted" aria-hidden />
          </Badge>
        )}
        <Button
          variant="link"
          size="xs"
          onClick={() => {
            signalFilterChange()
            router.push(buildUrl({ cuisine: null, area: null, dietary: null, priceRange: null }))
          }}
          className="text-xs font-semibold"
        >
          Clear all
        </Button>
      </div>
    ) : null

  return (
    <div>
      {/* Tab toggle */}
      <div className="mb-4 flex items-center gap-1 rounded-pill bg-surface-3 p-1 w-fit">
        <button
          type="button"
          onClick={() => handleTabChange('dishes')}
          className={cn(
            'relative rounded-pill px-4 py-1.5 text-sm font-semibold transition-colors duration-200',
            activeTab === 'dishes'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          Dishes
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('restaurants')}
          className={cn(
            'relative rounded-pill px-4 py-1.5 text-sm font-medium transition-colors duration-200',
            activeTab === 'restaurants'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-muted hover:text-text-secondary'
          )}
        >
          Restaurants
        </button>
      </div>

      {/* Mobile: filters + sort inline row */}
      <div className="flex gap-2 md:hidden">
        <Sheet>
          <SheetTrigger
            className={cn(
              'relative flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-pill border-2 border-border bg-card px-3.5 py-2.5 text-sm font-semibold text-text-primary',
              'transition-colors hover:border-primary hover:text-primary'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            <span className="max-[380px]:sr-only">Filters</span>
            {filterCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-[10px] font-bold">
                {filterCount > 9 ? '9+' : filterCount}
              </Badge>
            )}
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85dvh] rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]">
            <SheetHeader>
              <SheetTitle className="font-display text-lg font-bold text-heading">Filters</SheetTitle>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{filterGroups}</div>
          </SheetContent>
        </Sheet>
        {sortSelectMobile}
      </div>

      {summaryRow}

      {/* Desktop filter groups */}
      <div className="mt-4 hidden space-y-5 rounded-2xl border border-border bg-surface-2 p-5 md:block">
        {filterGroups}
      </div>

      {/* Sort toolbar — desktop only */}
      <div className="mt-4 hidden rounded-2xl border border-border bg-surface-2 px-5 py-3 md:flex md:items-center md:justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Sort by
        </span>
        <SortSegmented value={selectedSortBy} onChange={handleSort} options={sortOptions} />
      </div>
    </div>
  )
}

export function ExploreFilters(props: ExploreFiltersProps) {
  return (
    <Suspense>
      <FiltersInner {...props} />
    </Suspense>
  )
}

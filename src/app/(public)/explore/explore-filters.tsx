'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { X, SlidersHorizontal } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useState,
  useTransition,
  Suspense,
  type ReactNode,
} from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { setExplorePending } from '@/components/features/ExploreResultsWrapper'
import { ExploreSidebarControls } from '@/components/features/ExploreSidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { CUISINE_EMOJI } from '@/lib/constants'
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
  selectedMinRating: string | null
  selectedSortBy: DishSortOption
  cuisines: string[]
  areas: string[]
}

const DIETARY_LABELS: Record<string, string> = {
  veg: 'Veg',
  'non-veg': 'Non-veg',
  egg: 'Egg',
}

const PRICE_RANGE_LABELS: Record<string, string> = {
  'under-100': 'Under ₹100',
  '100-200': '₹100–200',
  '200-400': '₹200–400',
  '400-600': '₹400–600',
  'above-600': '₹600+',
}

function FiltersInner({
  query,
  activeTab,
  selectedCuisine: serverCuisine,
  selectedArea,
  selectedDietary,
  selectedPriceRange,
  selectedMinRating,
  cuisines,
  areas,
}: ExploreFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    setExplorePending(isPending)
  }, [isPending])

  const [optimisticCuisine, setOptimisticCuisine] = useState<string | null>(null)
  const selectedCuisine = optimisticCuisine ?? serverCuisine

  const [lastServerCuisine, setLastServerCuisine] = useState(serverCuisine)
  if (serverCuisine !== lastServerCuisine) {
    setLastServerCuisine(serverCuisine)
    setOptimisticCuisine(null)
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
    navigate(buildUrl({ [key]: newVal }))
  }

  const filterCount = [
    query,
    selectedCuisine,
    selectedArea,
    selectedDietary,
    selectedPriceRange,
    selectedMinRating,
  ].filter(Boolean).length

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
            render={<button type="button" onClick={() => navigate(buildUrl({}))} />}
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
            {DIETARY_LABELS[selectedDietary] ?? selectedDietary}
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
            {PRICE_RANGE_LABELS[selectedPriceRange] ?? selectedPriceRange}
            <X className="h-3 w-3 text-text-muted" aria-hidden />
          </Badge>
        )}
        {selectedMinRating && (
          <Badge
            variant="secondary"
            className="cursor-pointer gap-1"
            render={
              <button type="button" onClick={() => toggleFilter('minRating', selectedMinRating)} />
            }
          >
            {selectedMinRating}★ &amp; up
            <X className="h-3 w-3 text-text-muted" aria-hidden />
          </Badge>
        )}
        <Button
          variant="link"
          size="xs"
          onClick={() =>
            navigate(
              buildUrl({
                cuisine: null,
                area: null,
                dietary: null,
                priceRange: null,
                minRating: null,
              })
            )
          }
          className="text-xs font-semibold"
        >
          Clear all
        </Button>
      </div>
    ) : null

  return (
    <div>
      <div className="space-y-4">
        {/* Row 1: tab toggle + mobile "More filters" trigger */}
        <div className="flex items-center justify-between gap-3">
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

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  className="h-9 shrink-0 gap-2 rounded-pill px-4 text-sm font-semibold lg:hidden"
                />
              }
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filters
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] overflow-y-auto sm:max-w-[320px]">
              <SheetHeader>
                <SheetTitle className="font-display text-lg font-semibold text-heading">
                  Filters
                </SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-6">
                <ExploreSidebarControls
                  activeTab={activeTab}
                  areas={areas}
                  onNavigate={() => setSheetOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Row 2: cuisine chips strip */}
        <div>
          <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {cuisines.map((c) => {
              const active = selectedCuisine === c
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleFilter('cuisine', c)}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-pill border px-4 py-1.5 text-[13px] font-medium transition-colors',
                    active
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-card text-text-secondary hover:border-primary hover:text-primary'
                  )}
                >
                  <span aria-hidden="true">{CUISINE_EMOJI[c] ?? '🍽️'}</span>
                  {c}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {summaryRow}
    </div>
  )
}

function ExploreFiltersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="h-9 w-44 animate-pulse rounded-pill bg-surface-3" />
        <div className="h-9 w-24 animate-pulse rounded-pill bg-surface-3 lg:hidden" />
      </div>
      <div className="flex items-center gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-24 animate-pulse rounded-pill bg-surface-3" />
        ))}
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

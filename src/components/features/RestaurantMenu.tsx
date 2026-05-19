'use client'

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { LayoutList, Search, X } from 'lucide-react'
import { DishCard } from '@/components/features/DishCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  cn,
  getDishCategorySlug,
  getOrderedDishCategories,
  getRecommendedDishes,
  groupDishesByCategory,
} from '@/lib/utils/index'
import { getCuisineEmoji } from '@/lib/utils/dish-display'
import { ROUTES } from '@/lib/constants/routes'
import type { DietaryType, Dish, DishCategory } from '@/lib/types'

type MenuDietaryFilter = Extract<DietaryType, 'veg' | 'non-veg'>

const DIETARY_FILTERS: { value: MenuDietaryFilter; label: string; tone: MenuDietaryFilter }[] = [
  { value: 'veg', label: 'Veg', tone: 'veg' },
  { value: 'non-veg', label: 'Non-veg', tone: 'non-veg' },
]

interface RestaurantMenuProps {
  dishes: Dish[]
  categories?: DishCategory[]
}

export function RestaurantMenu({ dishes, categories }: RestaurantMenuProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDietary, setSelectedDietary] = useState<MenuDietaryFilter | null>(null)
  const [jumpMenuOpen, setJumpMenuOpen] = useState(false)
  const [jumpMenuMounted, setJumpMenuMounted] = useState(false)
  const [jumpMenuPhase, setJumpMenuPhase] = useState<'enter' | 'visible' | 'exit'>('enter')
  const [mounted, setMounted] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const jumpButtonRef = useRef<HTMLButtonElement | null>(null)
  const jumpPopoverRef = useRef<HTMLDivElement | null>(null)

  const isSearching = searchQuery.trim().length > 0
  const isDietaryFiltering = selectedDietary !== null
  const hasActiveMenuFilter = isSearching || isDietaryFiltering
  const hasDietaryFilters = useMemo(
    () => dishes.some((dish) => dish.dietary === 'veg' || dish.dietary === 'non-veg'),
    [dishes]
  )

  const closeJumpMenu = useCallback(() => {
    setJumpMenuOpen(false)
    setJumpMenuPhase('exit')
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => {
      setJumpMenuMounted(false)
      setJumpMenuPhase('enter')
    }, 150)
  }, [])

  useEffect(() => {
    queueMicrotask(() => setMounted(true))

    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!jumpMenuMounted) return

    function handlePointerDown(event: PointerEvent) {
      const target = event.target
      if (!(target instanceof Node)) return
      if (jumpButtonRef.current?.contains(target)) return
      if (jumpPopoverRef.current?.contains(target)) return
      closeJumpMenu()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [jumpMenuMounted, closeJumpMenu])

  const filteredDishes = useMemo(() => {
    const dietaryFilteredDishes = selectedDietary
      ? dishes.filter((dish) => matchesDietaryFilter(dish, selectedDietary))
      : dishes

    if (!isSearching) return dietaryFilteredDishes
    const q = searchQuery.toLowerCase().trim()
    return dietaryFilteredDishes.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.category?.toLowerCase().includes(q) ||
        d.topTags.some((t) => t.toLowerCase().includes(q))
    )
  }, [dishes, searchQuery, isSearching, selectedDietary])

  const groupedVisibleDishes = useMemo(
    () => groupDishesByCategory(hasActiveMenuFilter ? filteredDishes : dishes),
    [dishes, filteredDishes, hasActiveMenuFilter]
  )

  const categoryRows = useMemo(() => {
    const categorySource = !hasActiveMenuFilter && categories && categories.length > 0
      ? categories
      : (hasActiveMenuFilter ? filteredDishes : dishes).map((dish) => dish.category)

    return getOrderedDishCategories(categorySource)
      .map((category) => ({
        category,
        count: groupedVisibleDishes[category]?.length ?? 0,
      }))
      .filter((row) => row.count > 0)
  }, [categories, dishes, filteredDishes, groupedVisibleDishes, hasActiveMenuFilter])

  const orderedDishes = useMemo(() => {
    if (isSearching) return filteredDishes
    return categoryRows.flatMap((row) => groupedVisibleDishes[row.category] ?? [])
  }, [categoryRows, filteredDishes, groupedVisibleDishes, isSearching])

  const sectionMetaByDishId = useMemo(() => {
    const seen = new Set<DishCategory>()
    const metaByDishId = new Map<string, { count: number; index: number }>()
    let sectionIndex = 0

    for (const dish of orderedDishes) {
      if (seen.has(dish.category)) continue
      seen.add(dish.category)
      const count = groupedVisibleDishes[dish.category]?.length ?? 0
      metaByDishId.set(dish.id, { count, index: sectionIndex })
      sectionIndex += 1
    }

    return metaByDishId
  }, [groupedVisibleDishes, orderedDishes])

  function openJumpMenu() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    setJumpMenuMounted(true)
    setJumpMenuPhase('enter')
    requestAnimationFrame(() => {
      setJumpMenuOpen(true)
      setJumpMenuPhase('visible')
    })
  }

  function toggleJumpMenu() {
    if (jumpMenuOpen) {
      closeJumpMenu()
      return
    }
    openJumpMenu()
  }

  function handleJump(category: DishCategory) {
    const sectionId = `section-${getDishCategorySlug(category)}`
    closeJumpMenu()
    setSearchQuery('')

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      })
    })
  }

  function toggleDietaryFilter(value: MenuDietaryFilter) {
    setSelectedDietary((current) => current === value ? null : value)
    closeJumpMenu()
  }

  const selectedDietaryLabel = DIETARY_FILTERS.find((filter) => filter.value === selectedDietary)?.label
  const emptyTitle = selectedDietaryLabel
    ? isSearching
      ? `No ${selectedDietaryLabel} dishes match "${searchQuery}"`
      : `No ${selectedDietaryLabel} dishes here`
    : `No dishes match "${searchQuery}"`
  const emptyDescription = selectedDietaryLabel
    ? 'Try clearing this filter or searching for another dish.'
    : 'Try a different search term.'

  const categoryJumpPortal = mounted && categoryRows.length > 0
    ? createPortal(
      <>
        <Button
          ref={jumpButtonRef}
          variant="outline"
          aria-label="Toggle menu sections"
          aria-expanded={jumpMenuOpen}
          onClick={toggleJumpMenu}
          className="menu-jump-button fixed right-4 z-50 h-10 min-h-10 gap-1.5 rounded-[20px] px-4 text-sm font-medium"
          style={{ bottom: 'calc(var(--menu-button-bottom, 24px) + env(safe-area-inset-bottom, 0px))' }}
        >
          <span className="relative h-[18px] w-[18px]">
            <LayoutList
              className={cn(
                'absolute inset-0 h-[18px] w-[18px] text-white transition-opacity duration-150 ease-[ease]',
                jumpMenuOpen ? 'opacity-0' : 'opacity-100'
              )}
            />
            <X
              className={cn(
                'absolute inset-0 h-[18px] w-[18px] text-white transition-opacity duration-150 ease-[ease]',
                jumpMenuOpen ? 'opacity-100' : 'opacity-0'
              )}
            />
          </span>
          <span>{jumpMenuOpen ? 'Close' : 'Menu'}</span>
        </Button>

        {jumpMenuMounted && (
          <div
            ref={jumpPopoverRef}
            aria-hidden={!jumpMenuOpen}
            style={{ bottom: 'calc(var(--menu-popover-bottom, 80px) + env(safe-area-inset-bottom, 0px))' }}
            className={cn(
              'menu-jump-popover fixed right-4 z-[51] max-h-[55vh] w-[240px] overflow-hidden rounded-[16px] border-[0.5px] border-[var(--color-menu-border)] bg-[var(--color-menu-surface)] shadow-[0_8px_32px_var(--color-menu-shadow-strong),0_2px_8px_var(--color-menu-shadow-soft)]',
              jumpMenuPhase === 'visible' && 'popover-visible',
              jumpMenuPhase === 'enter' && 'popover-enter',
              jumpMenuPhase === 'exit' && 'popover-exit'
            )}
          >
            <div className="border-b-[0.5px] border-[var(--color-menu-separator)] px-4 pb-2.5 pt-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-menu-label)]">
              Jump to section
            </div>
            <div className="scrollbar-thin-soft max-h-[calc(55vh-42px)] overflow-y-auto overflow-x-hidden">
              {categoryRows.map((row, index) => (
                <Button
                  key={row.category}
                  variant="ghost"
                  tabIndex={jumpMenuOpen ? 0 : -1}
                  onClick={() => handleJump(row.category)}
                  className={cn(
                    'min-h-12 w-full justify-between gap-3 rounded-none px-4 py-3.5 text-left transition-colors duration-100 ease-[ease] hover:bg-[var(--color-menu-hover)] active:bg-[var(--color-menu-hover)]',
                    index < categoryRows.length - 1 && 'border-b-[0.5px] border-[var(--color-menu-separator)]'
                  )}
                >
                  <span className="min-w-0 truncate text-[15px] font-medium text-[var(--color-menu-item)]">
                    {row.category}
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-[var(--color-brand-primary)]">
                    {row.count}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </>,
      document.body
    )
    : null

  return (
    <div className="relative">
      {hasDietaryFilters && (
        <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {DIETARY_FILTERS.map((filter) => (
            <DietaryFilterButton
              key={filter.value}
              label={filter.label}
              tone={filter.tone}
              active={selectedDietary === filter.value}
              onClick={() => toggleDietaryFilter(filter.value)}
            />
          ))}
        </div>
      )}

      {/* Search within menu */}
      {dishes.length > 3 && (
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-muted" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search this menu..."
            className={cn(
              'h-auto w-full rounded-pill border border-border bg-card/50 py-2.5 pl-10 pr-4 text-sm font-body',
              'placeholder:text-text-muted focus-visible:border-primary focus-visible:ring-0'
            )}
          />
        </div>
      )}

      {/* Results */}
      {orderedDishes.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-10 text-center">
          <p className="text-2xl">🍽️</p>
          <p className="mt-2 font-display font-semibold text-heading">
            {emptyTitle}
          </p>
          <p className="mt-1 text-sm text-text-muted">{emptyDescription}</p>
          {selectedDietary && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setSelectedDietary(null)}
              className="mt-2 h-auto min-h-0 px-2 py-1 text-xs font-semibold"
            >
              Clear filter
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {orderedDishes.map((dish, i) => {
            const sectionMeta = sectionMetaByDishId.get(dish.id)
            return (
              <Fragment key={dish.id}>
                {sectionMeta && (
                  <div key={`${dish.category}-header`} className="min-w-0 md:col-span-2 lg:col-span-3">
                    <div
                      id={`section-${getDishCategorySlug(dish.category)}`}
                      aria-hidden="true"
                      className="h-0 scroll-mt-[72px]"
                    />
                    <div
                      className={cn(
                        'border-b-[0.5px] border-border-tertiary pb-1',
                        sectionMeta.index === 0 ? 'pt-2' : 'pt-5'
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-bold text-text-primary">
                          {dish.category}
                        </h3>
                        <span className="shrink-0 text-[13px] text-text-secondary">
                          {sectionMeta.count} items
                        </span>
                      </div>
                    </div>
                    <div className="mb-3" />
                  </div>
                )}
                <div key={dish.id} className="min-w-0">
                  <DishCard dish={dish} index={i} />
                </div>
              </Fragment>
            )
          })}
        </div>
      )}

      {categoryJumpPortal}
    </div>
  )
}

function matchesDietaryFilter(dish: Dish, filter: MenuDietaryFilter) {
  const dietary = dish.dietary as string

  if (filter === 'veg') return dietary === 'veg' || dietary === 'vegan'
  return dietary === 'non-veg'
}

function DietaryFilterButton({
  label,
  tone,
  active,
  onClick,
}: {
  label: string
  tone: MenuDietaryFilter
  active: boolean
  onClick: () => void
}) {
  const isVeg = tone === 'veg'

  return (
    <Button
      variant="outline"
      aria-pressed={active}
      aria-label={active ? `Clear ${label} filter` : `Show only ${label} dishes`}
      onClick={onClick}
      className={cn(
        'h-9 min-h-9 shrink-0 gap-2 rounded-pill border px-3.5 text-sm font-semibold shadow-sm transition-all hover:bg-card',
        active
          ? isVeg
            ? 'border-success bg-success/10 text-success hover:text-success'
            : 'border-destructive bg-destructive/10 text-destructive hover:text-destructive'
          : 'border-border bg-card text-text-primary hover:border-border-secondary hover:text-text-primary'
      )}
    >
      <DietaryMark tone={tone} />
      <span>{label}</span>
      {active && <X className="h-3.5 w-3.5" aria-hidden />}
    </Button>
  )
}

function DietaryMark({ tone }: { tone: MenuDietaryFilter }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex h-3.5 w-3.5 items-center justify-center border',
        tone === 'veg' ? 'border-success' : 'border-destructive'
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          tone === 'veg' ? 'bg-success' : 'bg-destructive'
        )}
      />
    </span>
  )
}

export function RecommendedDishesRow({ dishes }: { dishes: Dish[] }) {
  const recommendedDishes = getRecommendedDishes(dishes)
  if (recommendedDishes.length === 0) return null

  return (
    <section className="mt-6">
      <h2 className="text-base font-semibold text-text-primary">Recommended Dishes</h2>
      <div className="scrollbar-hide -mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {recommendedDishes.map((dish) => (
          <Link
            key={dish.id}
            href={ROUTES.dish(dish.id)}
            className="w-[140px] shrink-0 overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/30 hover:shadow-sm"
          >
            <div className="relative h-24 w-full overflow-hidden bg-bg-cream">
              {dish.coverImage ? (
                <Image
                  src={dish.coverImage}
                  alt={dish.name}
                  fill
                  sizes="140px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl">
                  {getCuisineEmoji(dish.cuisines?.[0])}
                </div>
              )}
            </div>
            <div className="p-2.5">
              <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-text-primary">
                {dish.name}
              </p>
              <p className="mt-1 line-clamp-1 text-[11px] text-text-secondary">
                {dish.category}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

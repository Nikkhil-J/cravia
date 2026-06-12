'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import {
  cn,
  formatRating,
  getOrderedDishCategories,
  groupDishesByCategory,
} from '@/lib/utils/index'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import type { Dish, DishCategory } from '@/lib/types'
import { getOptimizedImageUrl } from '@/lib/utils/image'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

type PickerView = 'categories' | 'dishes'
type PickerTransitionPhase = 'idle' | 'exit-left' | 'enter-right' | 'exit-right' | 'enter-left'

const PICKER_TRANSITION_MS = 180

interface ReviewDishPickerProps {
  dishes: Dish[]
  categories?: DishCategory[]
  restaurantId: string
  restaurantName: string
}

export function ReviewDishPicker({ dishes, categories, restaurantId, restaurantName }: ReviewDishPickerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<DishCategory | null>(null)
  const [pickerView, setPickerView] = useState<PickerView>('categories')
  const [pickerTransitionPhase, setPickerTransitionPhase] = useState<PickerTransitionPhase>('idle')
  const pickerTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearPickerTimers = useCallback(() => {
    for (const timer of pickerTimersRef.current) clearTimeout(timer)
    pickerTimersRef.current = []
  }, [])

  useEffect(() => {
    return () => clearPickerTimers()
  }, [clearPickerTimers])

  const groupedDishes = useMemo(() => groupDishesByCategory(dishes), [dishes])
  const orderedCategories = useMemo(() => {
    const categorySource = categories && categories.length > 0
      ? categories
      : dishes.map((dish) => dish.category)

    return getOrderedDishCategories(categorySource).filter(
      (category) => (groupedDishes[category]?.length ?? 0) > 0
    )
  }, [categories, dishes, groupedDishes])

  const filtered = query.trim()
    ? dishes.filter((d) => d.name.toLowerCase().includes(query.toLowerCase().trim()))
    : dishes
  const isSearching = query.trim().length > 0
  const selectedCategoryDishes = selectedCategory ? groupedDishes[selectedCategory] ?? [] : []

  function handleSelect(dish: Dish) {
    setOpen(false)
    router.push(
      `${ROUTES.WRITE_REVIEW}?dishId=${dish.id}&restaurantId=${restaurantId}&dishName=${encodeURIComponent(dish.name)}&restaurantName=${encodeURIComponent(restaurantName)}`
    )
  }

  function schedulePickerStep(callback: () => void) {
    const timer = setTimeout(callback, PICKER_TRANSITION_MS)
    pickerTimersRef.current.push(timer)
  }

  function resetPickerView() {
    clearPickerTimers()
    setSelectedCategory(null)
    setPickerView('categories')
    setPickerTransitionPhase('idle')
  }

  function handleCategorySelect(category: DishCategory) {
    if (pickerTransitionPhase !== 'idle') return
    clearPickerTimers()
    setSelectedCategory(category)
    setPickerTransitionPhase('exit-left')
    schedulePickerStep(() => {
      setPickerView('dishes')
      setPickerTransitionPhase('enter-right')
      schedulePickerStep(() => setPickerTransitionPhase('idle'))
    })
  }

  function handleBackToCategories() {
    if (pickerTransitionPhase !== 'idle') return
    clearPickerTimers()
    setPickerTransitionPhase('exit-right')
    schedulePickerStep(() => {
      setPickerView('categories')
      setPickerTransitionPhase('enter-left')
      schedulePickerStep(() => {
        setSelectedCategory(null)
        setPickerTransitionPhase('idle')
      })
    })
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setQuery('')
      resetPickerView()
    }
  }

  function getPickerTransitionClass() {
    switch (pickerTransitionPhase) {
      case 'exit-left':
        return 'picker-exit-left'
      case 'enter-right':
        return 'picker-enter-right'
      case 'exit-right':
        return 'picker-exit-right'
      case 'enter-left':
        return 'picker-enter-left'
      case 'idle':
        return ''
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-glow"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
        Review a Dish
      </SheetTrigger>

      <SheetContent side="bottom" className="max-h-[85dvh] rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]">
        <SheetHeader>
          <SheetTitle className="font-display text-lg font-bold text-heading">
            Which dish did you try?
          </SheetTitle>
        </SheetHeader>

        <div className="px-4 pt-2 pb-2">
          {dishes.length > 5 && (
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-text-muted" />
              <Input
                type="search"
                value={query}
                onChange={(e) => {
                  const nextQuery = e.target.value
                  setQuery(nextQuery)
                  if (nextQuery.trim()) resetPickerView()
                }}
                placeholder="Search dishes..."
                className={cn(
                  'h-auto w-full rounded-pill border border-border bg-card/50 py-2 pl-10 pr-4 text-sm',
                  'placeholder:text-text-muted focus-visible:border-primary focus-visible:ring-0'
                )}
              />
            </div>
          )}

          <div className="scrollbar-thin-soft -mx-1 max-h-[50dvh] overflow-y-auto px-1">
            {isSearching ? (
              filtered.length === 0 ? (
                <p className="py-6 text-center text-sm text-text-muted">No dishes match your search.</p>
              ) : (
                <div className="space-y-1">
                  {filtered.map((dish) => (
                    <SearchDishRow key={dish.id} dish={dish} onSelect={handleSelect} />
                  ))}
                </div>
              )
            ) : (
              <div className={cn('space-y-1', getPickerTransitionClass())}>
                {pickerView === 'dishes' && selectedCategory ? (
                  <>
                    <div className="sticky top-0 z-10 -mx-1 bg-popover px-1 pb-2">
                      <Button
                        variant="ghost"
                        onClick={handleBackToCategories}
                        className="min-h-11 w-full justify-start gap-2 rounded-xl px-3 py-2 text-left text-[15px] font-semibold text-primary hover:bg-surface-2 hover:text-primary"
                      >
                        <ChevronLeft className="h-4 w-4 shrink-0" />
                        <span className="truncate">{selectedCategory}</span>
                      </Button>
                    </div>

                    {selectedCategoryDishes.map((dish) => (
                      <CategoryDishRow
                        key={dish.id}
                        dish={dish}
                        onSelect={handleSelect}
                      />
                    ))}
                  </>
                ) : (
                  orderedCategories.map((category) => (
                    <CategoryRow
                      key={category}
                      category={category}
                      dishCount={groupedDishes[category]?.length ?? 0}
                      onSelect={handleCategorySelect}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function CategoryRow({
  category,
  dishCount,
  onSelect,
}: {
  category: DishCategory
  dishCount: number
  onSelect: (category: DishCategory) => void
}) {
  return (
    <Button
      variant="ghost"
      onClick={() => onSelect(category)}
      className="flex min-h-12 w-full justify-between gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-surface-2"
    >
      <span className="min-w-0 flex-1 truncate text-[15px] font-normal text-text-primary">
        {category}
      </span>
      <span className="shrink-0 text-[13px] font-normal text-text-secondary">
        {dishCount}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-text-secondary" />
    </Button>
  )
}

function CategoryDishRow({ dish, onSelect }: { dish: Dish; onSelect: (dish: Dish) => void }) {
  return (
    <Button
      variant="ghost"
      onClick={() => onSelect(dish)}
      className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-surface-2"
    >
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-[15px] font-normal text-text-primary">{dish.name}</p>
        <p className="line-clamp-1 text-xs font-normal text-text-secondary">{dish.restaurantName}</p>
      </div>
      {dish.coverImage && (
        <Image
          src={getOptimizedImageUrl(dish.coverImage, 'thumbnail') ?? ''}
          alt={dish.name}
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-lg object-cover"
        />
      )}
    </Button>
  )
}

function SearchDishRow({ dish, onSelect }: { dish: Dish; onSelect: (dish: Dish) => void }) {
  return (
    <Button
      variant="ghost"
      onClick={() => onSelect(dish)}
      className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-surface-2"
    >
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-bg-cream">
        {dish.coverImage ? (
          <Image
            src={getOptimizedImageUrl(dish.coverImage, 'thumbnail') ?? ''}
            alt={dish.name}
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg">🍽️</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-semibold text-heading">{dish.name}</p>
        <p className="text-xs font-normal text-text-muted">
          ★ {formatRating(dish.avgOverall)} · {dish.reviewCount} review{dish.reviewCount !== 1 ? 's' : ''}
        </p>
      </div>
      <span className="shrink-0 text-xs font-medium text-primary">Review &rsaquo;</span>
    </Button>
  )
}

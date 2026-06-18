'use client'

import { Suspense, useCallback, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import { setExplorePending } from '@/components/features/ExploreResultsWrapper'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { ROUTES } from '@/lib/constants/routes'

type DishSortOption = 'highest-rated' | 'newest' | 'most-helpful'

const DISH_SORT_OPTIONS: { value: DishSortOption; label: string }[] = [
  { value: 'highest-rated', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'most-helpful', label: 'Most Reviewed' },
]

const DEFAULT_SORT: DishSortOption = 'highest-rated'

function HeaderInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setExplorePending(isPending)
  }, [isPending])

  const tab = searchParams.get('tab') === 'restaurants' ? 'restaurants' : 'dishes'
  const sortBy = (DISH_SORT_OPTIONS.some((o) => o.value === searchParams.get('sortBy'))
    ? searchParams.get('sortBy')
    : DEFAULT_SORT) as DishSortOption
  const view = searchParams.get('view') === 'list' ? 'list' : 'grid'

  const navigate = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(overrides).forEach(([key, val]) => {
        if (val) params.set(key, val)
        else params.delete(key)
      })
      startTransition(() => {
        router.push(`${ROUTES.EXPLORE}?${params.toString()}`, { scroll: false })
      })
    },
    [searchParams, router]
  )

  if (tab !== 'dishes') return null

  return (
    <div className="mb-4 flex items-center justify-end gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-pill border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus:border-primary focus:outline-none">
          Sort: {DISH_SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
          <ChevronDown className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={6} className="w-auto min-w-[170px]">
          <DropdownMenuRadioGroup
            value={sortBy}
            onValueChange={(value) =>
              navigate({ sortBy: value === DEFAULT_SORT ? null : value })
            }
          >
            {DISH_SORT_OPTIONS.map((opt) => (
              <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                {opt.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="hidden overflow-hidden rounded-lg border border-border sm:flex">
        <button
          type="button"
          aria-label="Grid view"
          aria-pressed={view === 'grid'}
          onClick={() => navigate({ view: null })}
          className={cn(
            'flex items-center px-2.5 py-2 transition-colors',
            view === 'grid'
              ? 'bg-primary text-white'
              : 'bg-card text-text-muted hover:text-text-secondary'
          )}
        >
          <LayoutGrid className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="List view"
          aria-pressed={view === 'list'}
          onClick={() => navigate({ view: 'list' })}
          className={cn(
            'flex items-center px-2.5 py-2 transition-colors',
            view === 'list'
              ? 'bg-primary text-white'
              : 'bg-card text-text-muted hover:text-text-secondary'
          )}
        >
          <List className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export function ExploreResultsHeader() {
  return (
    <Suspense fallback={<div className="mb-4 h-9" />}>
      <HeaderInner />
    </Suspense>
  )
}

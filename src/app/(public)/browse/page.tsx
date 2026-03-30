import type { Metadata } from 'next'
import { searchDishes } from '@/lib/firebase/dishes'
import { DishCard } from '@/components/features/DishCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { CUISINE_TYPES, BENGALURU_AREAS } from '@/lib/constants'
import type { DietaryType, PriceRange } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Browse Dishes — DishCheck',
  description: 'Explore dishes from restaurants across Bengaluru.',
}

interface BrowsePageProps {
  searchParams: Promise<{
    cuisine?: string
    area?: string
    dietary?: string
    priceRange?: string
  }>
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams
  const cuisine = params.cuisine ?? null
  const area = params.area ?? null
  const dietary = (params.dietary as DietaryType) || null
  const priceRange = (params.priceRange as PriceRange) || null

  const result = await searchDishes('', {
    cuisine,
    area,
    dietary,
    priceRange,
    query: '',
    minRating: null,
    sortBy: 'highest-rated',
  })

  const dishes = result.items

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Browse Dishes</h1>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        {/* Cuisine filter */}
        <div className="flex flex-wrap gap-1.5">
          {CUISINE_TYPES.slice(0, 10).map((c) => (
            <a
              key={c}
              href={`/browse?cuisine=${encodeURIComponent(c)}${area ? `&area=${encodeURIComponent(area)}` : ''}`}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                cuisine === c
                  ? 'border-brand bg-brand text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-brand hover:text-brand'
              }`}
            >
              {c}
            </a>
          ))}
          {cuisine && (
            <a
              href="/browse"
              className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs text-gray-500 hover:bg-gray-200"
            >
              Clear ✕
            </a>
          )}
        </div>
      </div>

      {/* Area filter */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {BENGALURU_AREAS.slice(0, 8).map((a) => (
          <a
            key={a}
            href={`/browse?area=${encodeURIComponent(a)}${cuisine ? `&cuisine=${encodeURIComponent(cuisine)}` : ''}`}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              area === a
                ? 'border-brand-dark bg-brand-dark text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-brand hover:text-brand'
            }`}
          >
            {a}
          </a>
        ))}
      </div>

      <div className="mt-6">
        {dishes.length === 0 ? (
          <EmptyState
            icon="🍽️"
            title="No dishes found"
            description="Try adjusting your filters."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

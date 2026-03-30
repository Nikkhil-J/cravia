import type { Metadata } from 'next'
import { searchDishes } from '@/lib/firebase/dishes'
import { DishCard } from '@/components/features/DishCard'
import { EmptyState } from '@/components/ui/EmptyState'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `"${q}" — DishCheck` : 'Search — DishCheck',
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  const dishResult = query ? await searchDishes(query) : null
  const dishes = dishResult && 'items' in dishResult ? dishResult.items : []

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">
        {query ? `Results for "${query}"` : 'Search dishes'}
      </h1>

      {!query && (
        <p className="mt-2 text-sm text-gray-500">
          Type a dish name in the search bar above.
        </p>
      )}

      {query && dishes.length === 0 && (
        <EmptyState
          icon="🍽️"
          title="No dishes found"
          description={`We couldn't find any dishes matching "${query}". Try a different term.`}
        />
      )}

      {dishes.length > 0 && (
        <>
          <p className="mt-1 text-sm text-gray-500">{dishes.length} result{dishes.length !== 1 ? 's' : ''}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

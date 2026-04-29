import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { searchRestaurants } from '@/lib/services/catalog'
import type { RestaurantSortOption } from '@/lib/services/catalog'
import { searchDishes, getTopDishes } from '@/lib/services/dishes'
import { DishCard } from '@/components/features/DishCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadMoreRestaurants } from '@/components/features/LoadMoreRestaurants'
import { LoadMoreDishes } from '@/components/features/LoadMoreDishes'
import { ExploreResultsWrapper } from '@/components/features/ExploreResultsWrapper'
import { ExploreEntranceWrapper } from '@/components/features/ExploreEntranceWrapper'
import { ExploreSearchResults, ExploreDefaultContent } from '@/components/features/ExploreSearchResults'
import { CUISINE_TYPES, SORT_OPTIONS, HERO_TAGS, GURUGRAM } from '@/lib/constants'
import { listCityAreas } from '@/lib/services/city'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { SearchBar } from '@/components/features/SearchBar'
import { ROUTES } from '@/lib/constants/routes'
import { ExploreFilters } from './explore-filters'

export const metadata: Metadata = {
  title: 'Explore Dishes & Restaurants — Cravia',
  description: 'Explore dishes and restaurants in Gurugram. Find the best dishes reviewed by real diners.',
}

type ExploreTab = 'dishes' | 'restaurants'
type DishSortOption = 'highest-rated' | 'newest' | 'most-helpful'

const VALID_RESTAURANT_SORT: RestaurantSortOption[] = ['most-reviewed', 'newest', 'alphabetical']
const VALID_DISH_SORT: DishSortOption[] = ['highest-rated', 'newest', 'most-helpful']

interface ExplorePageProps {
  searchParams: Promise<{
    q?: string
    tab?: string
    cuisine?: string
    area?: string
    dietary?: string
    priceRange?: string
    sortBy?: string
  }>
}

function ResultsSkeleton() {
  return (
    <div className="mt-6">
      <div className="mb-4 h-4 w-32 animate-pulse rounded bg-border" />
      <div className="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}

async function CuratedDishExplore({ city, sortBy }: { city: string | null; sortBy: DishSortOption }) {
  const isSeedingComplete = process.env.NEXT_PUBLIC_SEEDING_COMPLETE === 'true'

  const [highlyRated, newest, allResult] = await Promise.all([
    getTopDishes(6, city),
    searchDishes('', { city, sortBy: 'newest' }),
    searchDishes('', { city, sortBy }),
  ])

  const filterPayload = { city, cuisine: null, area: null, dietary: null, priceRange: null, sortBy }

  if (!isSeedingComplete) {
    return (
      <div className="mt-6">
        <LoadMoreDishes
          initialDishes={allResult.items}
          initialHasMore={allResult.hasMore}
          initialCursorId={allResult.lastDoc}
          filters={filterPayload}
          query=""
        />
      </div>
    )
  }

  const highlyRatedFiltered = highlyRated.filter((d) => d.reviewCount >= 2)

  const now = Date.now()
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
  const weekItems = newest.items.filter((d) => d.createdAt && now - new Date(d.createdAt).getTime() < SEVEN_DAYS)
  const monthItems = newest.items.filter((d) => d.createdAt && now - new Date(d.createdAt).getTime() < THIRTY_DAYS)
  const newestItems = (weekItems.length >= 3 ? weekItems : monthItems.length >= 3 ? monthItems : []).slice(0, 6)
  const newestLabel = weekItems.length >= 3 ? 'New this week' : 'New this month'

  const needsReview = newest.items.filter((d) => d.reviewCount <= 2).slice(0, 6)

  return (
    <div className="mt-6 space-y-10">
      {highlyRatedFiltered.length >= 3 && (
        <section>
          <h3 className="mb-4 font-display text-lg font-bold text-heading">Highly rated dishes</h3>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {highlyRatedFiltered.slice(0, 6).map((d, i) => (
              <DishCard key={d.id} dish={d} index={i} />
            ))}
          </div>
        </section>
      )}

      {newestItems.length >= 3 && (
        <section>
          <h3 className="mb-4 font-display text-lg font-bold text-heading">{newestLabel}</h3>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {newestItems.map((d, i) => (
              <DishCard key={d.id} dish={d} index={i} />
            ))}
          </div>
        </section>
      )}

      {needsReview.length >= 3 && (
        <section>
          <h3 className="mb-4 font-display text-lg font-bold text-heading">Needs your review</h3>
          <p className="mb-4 -mt-2 text-sm text-text-secondary">
            These dishes have few reviews — your rating helps others decide.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {needsReview.map((d, i) => (
              <DishCard key={d.id} dish={d} index={i} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-4 font-display text-lg font-bold text-heading">
          All dishes{city ? ` in ${city}` : ''}
        </h3>
        <LoadMoreDishes
          initialDishes={allResult.items}
          initialHasMore={allResult.hasMore}
          initialCursorId={allResult.lastDoc}
          filters={filterPayload}
          query=""
        />
      </section>
    </div>
  )
}

async function DishExploreResults({
  query,
  city,
  area,
  cuisine,
  dietary,
  priceRange,
  sortBy,
}: {
  query: string
  city: string | null
  area: string | null
  cuisine: string | null
  dietary: string | null
  priceRange: string | null
  sortBy: DishSortOption
}) {
  const isCurated = !query && !cuisine && !area && !dietary && !priceRange

  if (isCurated) {
    return <CuratedDishExplore city={city} sortBy={sortBy} />
  }

  const result = await searchDishes(query, {
    city,
    area,
    cuisine,
    dietary: dietary as 'veg' | 'non-veg' | 'egg' | null,
    priceRange: priceRange as 'under-100' | '100-200' | '200-400' | '400-600' | 'above-600' | null,
    sortBy,
  })

  const dishes = result.items
  const filterPayload = {
    city,
    cuisine,
    area,
    dietary: dietary as 'veg' | 'non-veg' | 'egg' | null,
    priceRange: priceRange as 'under-100' | '100-200' | '200-400' | '400-600' | 'above-600' | null,
    sortBy,
  }

  return (
    <div className="mt-6">
      <p className="mb-4 text-sm text-text-muted">
        {dishes.length}{result.hasMore ? '+' : ''} result{dishes.length !== 1 ? 's' : ''}{query ? ` for "${query}"` : ''}
      </p>

      {dishes.length === 0 ? (
        <DishEmptyFallback query={query} city={city} />
      ) : (
        <LoadMoreDishes
          initialDishes={dishes}
          initialHasMore={result.hasMore}
          initialCursorId={result.lastDoc}
          filters={filterPayload}
          query={query}
        />
      )}
    </div>
  )
}

const BROWSE_CUISINES = ['North Indian', 'South Indian', 'Chinese', 'Italian', 'Japanese', 'Street Food'] as const

async function DishEmptyFallback({ query, city }: { query: string; city: string | null }) {
  const topDishes = await getTopDishes(4, city)

  return (
    <div>
      <EmptyState
        icon="🍽️"
        title={query ? `No dishes found for "${query}"` : 'No dishes found'}
        description="Try one of these popular searches:"
        ctaLabel="Clear filters"
        ctaHref={`${ROUTES.EXPLORE}?tab=dishes`}
      />
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {HERO_TAGS.map((term) => (
          <Link
            key={term}
            href={`${ROUTES.EXPLORE}?tab=dishes&q=${encodeURIComponent(term)}`}
            className="rounded-pill border border-border bg-card px-4 py-2 text-xs font-medium text-text-secondary transition-all hover:border-primary/30 hover:text-primary"
          >
            {term}
          </Link>
        ))}
      </div>
      {topDishes.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 font-display text-lg font-bold text-heading">
            Top dishes{city ? ` in ${city}` : ''}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {topDishes.map((dish, i) => (
              <DishCard key={dish.id} dish={dish} index={i} />
            ))}
          </div>
        </div>
      )}
      <div className="mt-8">
        <h3 className="mb-3 font-display text-lg font-bold text-heading">Browse by cuisine</h3>
        <div className="flex flex-wrap gap-2">
          {BROWSE_CUISINES.map((cuisine) => (
            <Link
              key={cuisine}
              href={`${ROUTES.EXPLORE}?tab=dishes&cuisine=${encodeURIComponent(cuisine)}`}
              className="rounded-pill border border-border bg-card px-4 py-2 text-xs font-medium text-text-secondary transition-all hover:border-primary/30 hover:text-primary"
            >
              {cuisine}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

async function RestaurantExploreResults({
  query,
  city,
  area,
  cuisine,
  sortBy,
}: {
  query: string
  city: string | null
  area: string | null
  cuisine: string | null
  sortBy: RestaurantSortOption
}) {
  const result = await searchRestaurants({ query, city, area, cuisine, sortBy })
  const restaurants = result.items

  const filterPayload = { city, cuisine, area, sortBy }

  return (
    <div className="mt-6">
      <p className="mb-4 text-sm text-text-muted">
        {restaurants.length}{result.hasMore ? '+' : ''} result{restaurants.length !== 1 ? 's' : ''}{query ? ` for "${query}"` : ''}
      </p>

      {restaurants.length === 0 ? (
        <div>
          <EmptyState
            icon="🏪"
            title={query ? `No restaurants found for "${query}"` : 'No restaurants found'}
            description="Try adjusting your filters or search term."
            ctaLabel="Clear filters"
            ctaHref={`${ROUTES.EXPLORE}?tab=restaurants`}
          />
          {query && (
            <p className="mt-4 text-center text-sm text-text-muted">
              Looking for a dish?{' '}
              <Link href={`${ROUTES.EXPLORE}?tab=dishes&q=${encodeURIComponent(query)}`} className="font-medium text-primary hover:underline">
                Try the Dishes tab
              </Link>
            </p>
          )}
        </div>
      ) : (
        <LoadMoreRestaurants
          initialRestaurants={restaurants}
          initialHasMore={result.hasMore}
          filters={filterPayload}
          query={query}
          initialCursorId={result.nextCursorId}
        />
      )}
    </div>
  )
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams
  const tab: ExploreTab = params.tab === 'restaurants' ? 'restaurants' : 'dishes'
  const cuisine = params.cuisine ?? null
  const city: string | null = GURUGRAM
  const area = params.area ?? null
  const dietary = params.dietary ?? null
  const priceRange = params.priceRange ?? null

  const dishSortBy = (VALID_DISH_SORT.includes(params.sortBy as DishSortOption)
    ? params.sortBy as DishSortOption
    : SORT_OPTIONS.HIGHEST_RATED) as DishSortOption

  const restaurantSortBy = (VALID_RESTAURANT_SORT.includes(params.sortBy as RestaurantSortOption)
    ? params.sortBy as RestaurantSortOption
    : 'most-reviewed') as RestaurantSortOption

  const areas = listCityAreas(GURUGRAM)
  const paramsKey = JSON.stringify(params)

  return (
    <ExploreEntranceWrapper>
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-4 md:hidden">
          <Suspense fallback={<div className="h-[44px] animate-pulse rounded-pill bg-border" />}>
            <SearchBar
              variant="navbar"
              initialQuery=""
              className="block w-full max-w-none"
            />
          </Suspense>
        </div>

        <ExploreFilters
          query=""
          activeTab={tab}
          selectedCuisine={cuisine}
          selectedArea={area}
          selectedDietary={dietary}
          selectedPriceRange={priceRange}
          selectedSortBy={tab === 'dishes' ? dishSortBy : restaurantSortBy}
          cuisines={[...CUISINE_TYPES.slice(0, 12)]}
          areas={[...areas]}
        />

        <Suspense>
          <ExploreSearchResults />
        </Suspense>

        <ExploreDefaultContent>
          <Suspense key={paramsKey} fallback={<ResultsSkeleton />}>
            <ExploreResultsWrapper>
              {tab === 'dishes' && !cuisine && !area && !dietary && !priceRange ? (
                <CuratedDishExplore city={city} sortBy={dishSortBy} />
              ) : tab === 'dishes' ? (
                <DishExploreResults
                  query=""
                  city={city}
                  area={area}
                  cuisine={cuisine}
                  dietary={dietary}
                  priceRange={priceRange}
                  sortBy={dishSortBy}
                />
              ) : (
                <RestaurantExploreResults
                  query=""
                  city={city}
                  area={area}
                  cuisine={cuisine}
                  sortBy={restaurantSortBy}
                />
              )}
            </ExploreResultsWrapper>
          </Suspense>
        </ExploreDefaultContent>
      </div>
    </ExploreEntranceWrapper>
  )
}

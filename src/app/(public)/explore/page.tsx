import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { PWAInstallBanner } from '@/components/features/PWAInstallBanner'
import { searchRestaurants } from '@/lib/services/catalog'
import { searchDishes, getTopDishes } from '@/lib/services/dishes'
import { DishCard } from '@/components/features/DishCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadMoreRestaurants } from '@/components/features/LoadMoreRestaurants'
import { LoadMoreDishes } from '@/components/features/LoadMoreDishes'
import { ExploreResultsWrapper } from '@/components/features/ExploreResultsWrapper'
import { ExploreEntranceWrapper } from '@/components/features/ExploreEntranceWrapper'
import { ExploreSearchResults, ExploreDefaultContent } from '@/components/features/ExploreSearchResults'
import { ExploreSidebar } from '@/components/features/ExploreSidebar'
import { ExploreResultsHeader } from '@/components/features/ExploreResultsHeader'
import { FEATURED_CUISINES, SORT_OPTIONS, HERO_TAGS, GURUGRAM, CITY_DISPLAY_NAME } from '@/lib/constants'
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
type DishLayout = 'grid' | 'list'

const VALID_DISH_SORT: DishSortOption[] = ['highest-rated', 'newest', 'most-helpful']

function dishGridClass(layout: DishLayout) {
  return layout === 'list'
    ? 'flex flex-col gap-3'
    : 'grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3'
}

interface ExplorePageProps {
  searchParams: Promise<{
    q?: string
    tab?: string
    cuisine?: string
    area?: string
    dietary?: string
    priceRange?: string
    minRating?: string
    sortBy?: string
    focus?: string
    view?: string
  }>
}

// Mirrors the DishCard grid geometry: an image-header card with a 4:3 cover and
// a body of text rows.
function DishCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border-[0.5px] border-border bg-card shadow-sm">
      <div className="aspect-[4/3] w-full animate-pulse bg-surface-3" />
      <div className="flex flex-1 flex-col p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-surface-3" />
        <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-surface-3" />
        <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-surface-3" />
        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <div className="h-3 w-16 animate-pulse rounded bg-surface-3" />
          <div className="h-3 w-10 animate-pulse rounded bg-surface-3" />
        </div>
      </div>
    </div>
  )
}

function ResultsSkeleton({ tab = 'dishes' }: { tab?: ExploreTab }) {
  if (tab === 'restaurants') {
    return (
      <div className="mt-6">
        <div className="mb-4 h-4 w-32 animate-pulse rounded bg-border" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} variant="restaurant" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <div className="mb-4 h-4 w-32 animate-pulse rounded bg-border" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <DishCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

async function CuratedDishExplore({
  city,
  sortBy,
  layout,
}: {
  city: string | null
  sortBy: DishSortOption
  layout: DishLayout
}) {
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
          key={`curated-all-${city}-${sortBy}`}
          initialDishes={allResult.items}
          initialHasMore={allResult.hasMore}
          initialCursorId={allResult.lastDoc}
          filters={filterPayload}
          query=""
          layout={layout}
        />
      </div>
    )
  }

  const highlyRatedFiltered = highlyRated.filter((d) => d.reviewCount >= 2)

  // eslint-disable-next-line react-hooks/purity
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
          <div className={dishGridClass(layout)}>
            {highlyRatedFiltered.slice(0, 6).map((d, i) => (
              <DishCard key={d.id} dish={d} index={i} showRestaurantContext layout={layout} />
            ))}
          </div>
        </section>
      )}

      {newestItems.length >= 3 && (
        <section>
          <h3 className="mb-4 font-display text-lg font-bold text-heading">{newestLabel}</h3>
          <div className={dishGridClass(layout)}>
            {newestItems.map((d, i) => (
              <DishCard key={d.id} dish={d} index={i} showRestaurantContext layout={layout} />
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
          <div className={dishGridClass(layout)}>
            {needsReview.map((d, i) => (
              <DishCard key={d.id} dish={d} index={i} showRestaurantContext layout={layout} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-4 font-display text-lg font-bold text-heading">
          All dishes{city ? ` in ${city}` : ''}
        </h3>
        <LoadMoreDishes
          key={`curated-all-${city}-${sortBy}`}
          initialDishes={allResult.items}
          initialHasMore={allResult.hasMore}
          initialCursorId={allResult.lastDoc}
          filters={filterPayload}
          query=""
          layout={layout}
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
  minRating,
  sortBy,
  layout,
}: {
  query: string
  city: string | null
  area: string | null
  cuisine: string | null
  dietary: string | null
  priceRange: string | null
  minRating: number | null
  sortBy: DishSortOption
  layout: DishLayout
}) {
  const isCurated = !query && !cuisine && !area && !dietary && !priceRange && !minRating

  if (isCurated) {
    return <CuratedDishExplore city={city} sortBy={sortBy} layout={layout} />
  }

  const result = await searchDishes(query, {
    city,
    area,
    cuisine,
    dietary: dietary as 'veg' | 'non-veg' | 'egg' | null,
    priceRange: priceRange as 'under-100' | '100-200' | '200-400' | '400-600' | 'above-600' | null,
    minRating,
    sortBy,
  })

  const dishes = result.items
  const filterPayload = {
    city,
    cuisine,
    area,
    dietary: dietary as 'veg' | 'non-veg' | 'egg' | null,
    priceRange: priceRange as 'under-100' | '100-200' | '200-400' | '400-600' | 'above-600' | null,
    minRating,
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
          key={`dishes-${query}-${city}-${area}-${cuisine}-${dietary}-${priceRange}-${minRating}-${sortBy}`}
          initialDishes={dishes}
          initialHasMore={result.hasMore}
          initialCursorId={result.lastDoc}
          filters={filterPayload}
          query={query}
          layout={layout}
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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
            {topDishes.map((dish, i) => (
              <DishCard key={dish.id} dish={dish} index={i} showRestaurantContext />
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
}: {
  query: string
  city: string | null
  area: string | null
  cuisine: string | null
}) {
  const result = await searchRestaurants({ query, city, area, cuisine })
  const restaurants = result.items

  const filterPayload = { city, cuisine, area }

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
            description={query ? 'Tell us what is missing and we will review it for Cravia.' : 'Try adjusting your filters or request a restaurant we should add.'}
            ctaLabel="Clear filters"
            ctaHref={`${ROUTES.EXPLORE}?tab=restaurants`}
          />
          {query && (
            <div className="mt-4 flex flex-col items-center gap-2 text-sm text-text-muted">
              <Link
                href={`${ROUTES.REQUEST_RESTAURANT}?name=${encodeURIComponent(query)}`}
                className="font-semibold text-primary hover:underline"
              >
                Request this restaurant
              </Link>
              <p>
                Looking for a dish?{' '}
                <Link href={`${ROUTES.EXPLORE}?tab=dishes&q=${encodeURIComponent(query)}`} className="font-medium text-primary hover:underline">
                  Try the Dishes tab
                </Link>
              </p>
            </div>
          )}
          {!query && (
            <p className="mt-4 text-center text-sm text-text-muted">
              Can&apos;t find a restaurant?{' '}
              <Link href={ROUTES.REQUEST_RESTAURANT} className="font-medium text-primary hover:underline">
                Request it here
              </Link>
            </p>
          )}
        </div>
      ) : (
        <LoadMoreRestaurants
          key={`restaurants-${query}-${city}-${area}-${cuisine}`}
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
  const minRatingParam = params.minRating ? Number(params.minRating) : null
  const minRating = minRatingParam && minRatingParam > 0 ? minRatingParam : null
  const shouldFocusSearch = params.focus === '1'
  const layout: DishLayout = params.view === 'list' ? 'list' : 'grid'

  const dishSortBy = (VALID_DISH_SORT.includes(params.sortBy as DishSortOption)
    ? params.sortBy as DishSortOption
    : SORT_OPTIONS.HIGHEST_RATED) as DishSortOption

  const areas = listCityAreas(GURUGRAM)
  const cityLabel = CITY_DISPLAY_NAME[GURUGRAM] ?? 'your city'

  return (
    <ExploreEntranceWrapper>
      {/* Search hero */}
      <section className="bg-gradient-to-b from-bg-cream to-background">
        <div className="mx-auto max-w-[1200px] px-4 pb-2 pt-6 sm:px-6 sm:pt-8">
          <h1 className="font-display text-2xl font-bold text-heading sm:text-[32px]">
            Explore dishes in {cityLabel}
          </h1>
          <div className="mt-4 w-full">
            <Suspense fallback={<div className="h-[44px] animate-pulse rounded-pill bg-border" />}>
              <SearchBar
                variant="navbar"
                initialQuery=""
                autoFocus={shouldFocusSearch}
                className="block w-full max-w-none"
              />
            </Suspense>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-4 pb-10 sm:px-6">
        <ExploreFilters
          query={params.q ?? ''}
          activeTab={tab}
          selectedCuisine={cuisine}
          selectedArea={area}
          selectedDietary={dietary}
          selectedPriceRange={priceRange}
          selectedMinRating={minRating ? String(minRating) : null}
          selectedSortBy={dishSortBy}
          cuisines={[...FEATURED_CUISINES]}
          areas={[...areas]}
        />

        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-[88px]">
              <ExploreSidebar activeTab={tab} areas={[...areas]} />
            </div>
          </aside>

          <div className="min-w-0">
            <ExploreResultsHeader />

            <Suspense fallback={<ResultsSkeleton tab={tab} />}>
              <ExploreSearchResults />
            </Suspense>

            <ExploreDefaultContent>
              <Suspense fallback={<ResultsSkeleton tab={tab} />}>
                <ExploreResultsWrapper>
                  {tab === 'dishes' && !cuisine && !area && !dietary && !priceRange && !minRating ? (
                    <CuratedDishExplore city={city} sortBy={dishSortBy} layout={layout} />
                  ) : tab === 'dishes' ? (
                    <DishExploreResults
                      query=""
                      city={city}
                      area={area}
                      cuisine={cuisine}
                      dietary={dietary}
                      priceRange={priceRange}
                      minRating={minRating}
                      sortBy={dishSortBy}
                      layout={layout}
                    />
                  ) : (
                    <RestaurantExploreResults
                      query=""
                      city={city}
                      area={area}
                      cuisine={cuisine}
                    />
                  )}
                </ExploreResultsWrapper>
              </Suspense>
            </ExploreDefaultContent>
          </div>
        </div>
      </div>
      <PWAInstallBanner />
    </ExploreEntranceWrapper>
  )
}

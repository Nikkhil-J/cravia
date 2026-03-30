import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getRestaurant } from '@/lib/firebase/restaurants'
import { getDishesByRestaurant } from '@/lib/firebase/dishes'
import { DishCard } from '@/components/features/DishCard'
import { EmptyState } from '@/components/ui/EmptyState'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const restaurant = await getRestaurant(id)
  if (!restaurant) return { title: 'Not found — DishCheck' }
  return {
    title: `${restaurant.name} — DishCheck`,
    description: `Dish reviews for ${restaurant.name} in ${restaurant.area}, ${restaurant.city}.`,
  }
}

export default async function RestaurantPage({ params }: PageProps) {
  const { id } = await params
  const [restaurant, dishes] = await Promise.all([
    getRestaurant(id),
    getDishesByRestaurant(id),
  ])

  if (!restaurant) notFound()

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-gray-100 sm:w-56 sm:shrink-0">
          {restaurant.coverImage ? (
            <Image
              src={restaurant.coverImage}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl text-gray-300">🏪</div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{restaurant.area}, {restaurant.city}</p>
          <p className="mt-0.5 text-xs text-gray-400">{restaurant.address}</p>
          {restaurant.cuisines.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {restaurant.cuisines.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-medium text-brand-dark"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dishes */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-gray-900">
          Dishes ({dishes.length})
        </h2>
        {dishes.length === 0 ? (
          <EmptyState
            icon="🍽️"
            title="No dishes yet"
            description="Be the first to add a dish review for this restaurant."
          />
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

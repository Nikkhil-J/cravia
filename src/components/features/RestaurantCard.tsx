import Link from 'next/link'
import Image from 'next/image'
import type { Restaurant } from '@/lib/types'

interface RestaurantCardProps {
  restaurant: Restaurant
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link
      href={`/restaurant/${restaurant.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:shadow-md hover:ring-brand/30"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        {restaurant.coverImage ? (
          <Image
            src={restaurant.coverImage}
            alt={restaurant.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-gray-300">🏪</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{restaurant.name}</h3>
        <p className="mt-0.5 text-xs text-gray-500">{restaurant.area}, {restaurant.city}</p>
        {restaurant.cuisines.length > 0 && (
          <p className="mt-1 text-xs text-gray-400 line-clamp-1">{restaurant.cuisines.join(' · ')}</p>
        )}
      </div>
    </Link>
  )
}

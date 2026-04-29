import Link from 'next/link'
import Image from 'next/image'
import type { Restaurant } from '@/lib/types'
import { ROUTES } from '@/lib/constants/routes'
import { getPlaceholderGradient } from '@/lib/utils'

interface RestaurantCardProps {
  restaurant: Restaurant
  index?: number
}

function PlaceholderCover({ name }: { name: string }) {
  const { from, to } = getPlaceholderGradient(name)

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${from}20, ${to}40)` }}
    >
      <span className="text-3xl opacity-60">🍽️</span>
    </div>
  )
}

export function RestaurantCard({ restaurant, index = 0 }: RestaurantCardProps) {
  return (
    <Link
      href={ROUTES.restaurant(restaurant.id)}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 hover:border-transparent hover:shadow-lg active:translate-y-0 active:shadow-md animate-pop-in"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms`, animationFillMode: 'both' }}
    >
      <div className="relative h-32 w-full overflow-hidden bg-bg-cream">
        {restaurant.coverImage ? (
          <Image
            src={restaurant.coverImage}
            alt={restaurant.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
          />
        ) : (
          <PlaceholderCover name={restaurant.name} />
        )}
      </div>
      <div className="p-3.5">
        <h3 className="font-display font-semibold text-heading line-clamp-1">{restaurant.name}</h3>
        <p className="mt-0.5 text-xs text-text-muted">{restaurant.area}, {restaurant.city}</p>
        {restaurant.cuisines.length > 0 && (
          <p className="mt-1.5 text-xs text-text-secondary line-clamp-1">{restaurant.cuisines.join(' · ')}</p>
        )}
        <div className="mt-1.5 flex items-center gap-2 text-xs text-text-muted">
          {restaurant.dishCount ? (
            <span>{restaurant.dishCount} dish{restaurant.dishCount !== 1 ? 'es' : ''}</span>
          ) : null}
          {restaurant.dishCount && restaurant.totalReviews ? (
            <span className="text-border">·</span>
          ) : null}
          {restaurant.totalReviews ? (
            <span>{restaurant.totalReviews} dish review{restaurant.totalReviews !== 1 ? 's' : ''}</span>
          ) : !restaurant.dishCount ? (
            <span>Be the first to review a dish here</span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

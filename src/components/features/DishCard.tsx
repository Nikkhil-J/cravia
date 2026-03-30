import Link from 'next/link'
import Image from 'next/image'
import type { Dish } from '@/lib/types'
import { formatRating } from '@/lib/utils/index'
import { TagCloud } from '@/components/ui/TagCloud'

const DIETARY_ICON: Record<string, string> = {
  veg: '🟢',
  'non-veg': '🔴',
  egg: '🟡',
}

const PRICE_LABEL: Record<string, string> = {
  'under-100': '< ₹100',
  '100-200': '₹100–200',
  '200-400': '₹200–400',
  '400-600': '₹400–600',
  'above-600': '> ₹600',
}

interface DishCardProps {
  dish: Dish
}

export function DishCard({ dish }: DishCardProps) {
  return (
    <Link
      href={`/restaurant/${dish.restaurantId}/dish/${dish.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:shadow-md hover:ring-brand/30"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        {dish.coverImage ? (
          <Image
            src={dish.coverImage}
            alt={dish.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-gray-300">🍽️</div>
        )}
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-amber-600 shadow-sm">
          ⭐ {formatRating(dish.avgOverall)}
        </div>
        {dish.dietary && (
          <div className="absolute left-2 top-2 rounded-full bg-white/90 p-0.5 text-sm shadow-sm">
            {DIETARY_ICON[dish.dietary]}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{dish.name}</h3>
        <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{dish.restaurantName}</p>
        {dish.description && (
          <p className="mt-1 text-xs text-gray-400 line-clamp-2">{dish.description}</p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-400">{dish.reviewCount} reviews</span>
          {dish.priceRange && (
            <span className="text-xs font-medium text-gray-600">{PRICE_LABEL[dish.priceRange]}</span>
          )}
        </div>
        {dish.topTags.length > 0 && (
          <div className="mt-3">
            <TagCloud tags={dish.topTags} maxVisible={3} />
          </div>
        )}
      </div>
    </Link>
  )
}

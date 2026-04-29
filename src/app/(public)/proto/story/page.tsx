import { HeroStory } from '@/components/features/proto/HeroStory'
import { getTopDishes, getDishCount } from '@/lib/services/dishes'
import { getRestaurantCount } from '@/lib/services/restaurants'
import { GURUGRAM } from '@/lib/constants'
import { captureError } from '@/lib/monitoring/sentry'
import type { Dish } from '@/lib/types'

export const revalidate = 3600

export default async function ProtoStoryPage() {
  let spotlightDish: Dish | null = null
  let restaurantCount = 0
  let dishCount = 0

  try {
    const [dishes, rCount, dCount] = await Promise.all([
      getTopDishes(6, GURUGRAM),
      getRestaurantCount(GURUGRAM),
      getDishCount(),
    ])
    spotlightDish = dishes.find((d) => d.coverImage) ?? dishes[0] ?? null
    restaurantCount = rCount
    dishCount = dCount
  } catch (error) {
    captureError(error, { route: 'ProtoStory' })
  }

  return (
    <HeroStory
      spotlightDish={spotlightDish}
      restaurantCount={restaurantCount}
      dishCount={dishCount}
    />
  )
}

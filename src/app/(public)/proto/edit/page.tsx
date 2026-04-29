import { HeroEdit } from '@/components/features/proto/HeroEdit'
import { getTopDishes } from '@/lib/services/dishes'
import { GURUGRAM } from '@/lib/constants'
import { captureError } from '@/lib/monitoring/sentry'
import type { Dish } from '@/lib/types'

export const revalidate = 3600

export default async function ProtoEditPage() {
  let coverDish: Dish | null = null
  let collectionDishes: Dish[] = []

  try {
    const dishes = await getTopDishes(12, GURUGRAM)
    const withImages = dishes.filter((d) => d.coverImage)
    coverDish = withImages[0] ?? dishes[0] ?? null
    collectionDishes = withImages.slice(1, 7)
  } catch (error) {
    captureError(error, { route: 'ProtoEdit' })
  }

  return <HeroEdit coverDish={coverDish} collectionDishes={collectionDishes} />
}

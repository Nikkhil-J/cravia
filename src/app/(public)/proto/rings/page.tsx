import { HeroRings } from '@/components/features/proto/HeroRings'
import { getTopDishes } from '@/lib/services/dishes'
import { GURUGRAM } from '@/lib/constants'
import { captureError } from '@/lib/monitoring/sentry'
import type { Dish } from '@/lib/types'

export const revalidate = 3600

export default async function ProtoRingsPage() {
  let dishes: Dish[] = []
  try {
    dishes = await getTopDishes(8, GURUGRAM)
  } catch (error) {
    captureError(error, { route: 'ProtoRings' })
  }
  return <HeroRings spotlightDishes={dishes} />
}

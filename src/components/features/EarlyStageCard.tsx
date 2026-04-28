import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'

interface EarlyStageCardProps {
  dishId: string
  restaurantId: string
  dishName: string
  restaurantName: string
}

export function EarlyStageCard({
  dishId,
  restaurantId,
  dishName,
  restaurantName,
}: EarlyStageCardProps) {
  const writeUrl = `${ROUTES.WRITE_REVIEW}?dishId=${dishId}&restaurantId=${restaurantId}&dishName=${encodeURIComponent(dishName)}&restaurantName=${encodeURIComponent(restaurantName)}&from=${encodeURIComponent(ROUTES.dish(dishId))}`

  return (
    <div className="rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-3xl">
        ✍️
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-heading">
        Nobody&apos;s reviewed the {dishName} here yet.
      </h3>
      <p className="mt-2 text-sm text-text-secondary">
        Be the first — earn 25 DishPoints for the first review.
      </p>
      <Link
        href={writeUrl}
        className="mt-5 inline-flex items-center justify-center rounded-pill bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-glow"
      >
        Write the first review — Earn 25 pts
      </Link>
      <p className="mt-3 text-xs text-text-muted">
        Early reviewers get highlighted as founding contributors
      </p>
    </div>
  )
}

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getDish } from '@/lib/services/dishes'
import { getReview } from '@/lib/services/reviews'
import { ReviewCardV2 } from '@/components/features/ReviewCardV2'
import { MobileBackButton } from '@/components/ui/MobileBackButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const review = await getReview(id)
  if (!review) return { title: 'Review not found — Cravia' }
  const dish = await getDish(review.dishId)
  return {
    title: `Review of ${dish?.name ?? 'dish'} at ${dish?.restaurantName ?? 'restaurant'} by ${review.userName} — Cravia`,
  }
}

export default async function ReviewPage({ params }: PageProps) {
  const { id } = await params
  const review = await getReview(id)
  if (!review) notFound()

  const dish = await getDish(review.dishId)

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-start gap-2">
        <MobileBackButton parentHref={`/dish/${review.dishId}`} className="mt-0.5" />
        {dish && (
          <div>
            <Link
              href={`/dish/${review.dishId}`}
              className="group inline-block"
            >
              <h1 className="font-display text-2xl font-bold text-heading underline-offset-4 group-hover:underline">
                {dish.name}
              </h1>
            </Link>
            <p className="text-sm text-text-muted">{dish.restaurantName}</p>
          </div>
        )}
      </div>
      <ReviewCardV2
        review={review}
        variant="profile"
        dishContext={dish ? { dishName: dish.name, restaurantName: dish.restaurantName } : null}
      />
    </div>
  )
}

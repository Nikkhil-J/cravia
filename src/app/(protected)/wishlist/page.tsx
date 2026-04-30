'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/hooks/useAuth'
import { captureError } from '@/lib/monitoring/sentry'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { formatRating } from '@/lib/utils/index'
import { ROUTES } from '@/lib/constants/routes'
import { API_ENDPOINTS } from '@/lib/constants/api'

export default function WishlistPage() {
  const { user, authUser } = useAuth()
  const queryClient = useQueryClient()
  const { data: items = [], isLoading: loading } = useWishlist()

  async function handleRemove(dishId: string) {
    if (!user || !authUser) return
    try {
      const token = await authUser.getIdToken()
      const res = await fetch(
        API_ENDPOINTS.wishlistItem(encodeURIComponent(user.id), encodeURIComponent(dishId)),
        { method: 'DELETE', headers: { authorization: `Bearer ${token}` } }
      )
      if (!res.ok) {
        toast.error('Could not remove dish from wishlist')
        return
      }
      await queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      toast.success('Removed from wishlist')
    } catch (err) {
      toast.error('Failed to remove. Please try again.')
      captureError(err)
    }
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-8">
      <div className="text-center">
        <h1 className="font-display text-xl font-bold text-heading sm:text-2xl">Your Wishlist</h1>
        <p className="mt-1 text-sm text-text-secondary">Dishes you want to try next</p>
        {items.length > 0 && (
          <p className="mt-2 text-xs text-text-muted">{items.length} dishes saved</p>
        )}
      </div>

      {loading ? (
        <div className="mt-10 flex justify-center"><LoadingSpinner /></div>
      ) : items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="💭"
            title="No dishes saved yet"
            description="Browse dishes and tap the heart icon to save them here for later."
            ctaLabel="Explore Dishes"
            ctaHref={ROUTES.EXPLORE}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.dishId} className="group overflow-hidden rounded-lg border border-border bg-card transition-all hover:-translate-y-0.5 active:translate-y-0 hover:border-transparent hover:shadow-md active:shadow-sm">
              <div className="relative h-36 bg-bg-cream">
                {item.coverImage ? (
                  <Image src={item.coverImage} alt={item.dishName} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl">🍽️</div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(item.dishId)}
                  className="absolute right-2.5 top-2.5 min-h-[44px] min-w-[44px] rounded-full bg-card/90 text-primary backdrop-blur-sm hover:bg-primary hover:text-white"
                >
                  <Heart className="h-3.5 w-3.5" fill="currentColor" />
                </Button>
              </div>
              <div className="p-3.5">
                <Link href={ROUTES.dish(item.dishId)} className="font-display font-semibold text-heading line-clamp-1 hover:text-primary">
                  {item.dishName}
                </Link>
                <p className="mt-0.5 text-xs text-text-muted">{item.restaurantName}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-bold text-success">★ {formatRating(item.avgOverall)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

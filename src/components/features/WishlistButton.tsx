'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter, usePathname } from 'next/navigation'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/hooks/useAuth'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { API_ENDPOINTS } from '@/lib/constants/api'
import { CLIENT_ERRORS } from '@/lib/constants/errors'

interface WishlistButtonProps {
  dishId: string
  className?: string
}

export function WishlistButton({ dishId, className = '' }: WishlistButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const { user, authUser, isAuthenticated } = useAuth()
  const { data: wishlistItems } = useWishlist()

  const serverSaved = wishlistItems?.some((item) => item.dishId === dishId) ?? false
  const [optimistic, setOptimistic] = useState<boolean | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOptimistic(null)
  }, [serverSaved])

  const isSaved = optimistic ?? serverSaved

  async function handleToggle() {
    if (!user || !isAuthenticated) return
    const token = authUser ? await authUser.getIdToken() : null
    if (!token) return

    setIsAnimating(true)
    const wasSaved = isSaved
    setOptimistic(!wasSaved)

    const res = await fetch(
      API_ENDPOINTS.wishlistItem(encodeURIComponent(user.id), encodeURIComponent(dishId)),
      { method: wasSaved ? 'DELETE' : 'POST', headers: { authorization: `Bearer ${token}` } }
    )
    if (!res.ok) {
      setOptimistic(wasSaved)
      toast.error(CLIENT_ERRORS.COULD_NOT_UPDATE_WISHLIST)
    } else {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    }
  }

  if (!isAuthenticated) {
    return (
      <Button
        variant="outline"
        onClick={() => router.push(ROUTES.loginWithRedirect(encodeURIComponent(pathname)))}
        className={`h-auto gap-2 rounded-pill border-2 px-5 py-3 text-sm font-semibold transition-all hover:bg-transparent border-border text-text-primary hover:border-primary hover:text-primary ${className}`}
        aria-label="Save dish"
      >
        <Heart className="h-4 w-4" />
        Save
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      onClick={handleToggle}
      className={`h-auto gap-2 rounded-pill border-2 px-5 py-3 text-sm font-semibold transition-all hover:bg-transparent ${
        isSaved
          ? 'border-primary bg-primary-light text-primary'
          : 'border-border text-text-primary hover:border-primary hover:text-primary'
      } ${className}`}
      aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
    >
      <span
        className={cn('inline-flex', isAnimating && 'animate-heart-bounce')}
        onAnimationEnd={() => setIsAnimating(false)}
      >
        <Heart className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} />
      </span>
      {isSaved ? 'Saved' : 'Save'}
    </Button>
  )
}

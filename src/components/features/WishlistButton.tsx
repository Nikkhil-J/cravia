'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/hooks/useAuth'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { useWishlistStore } from '@/lib/store/wishlistStore'
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
  const { user, authUser, isAuthenticated } = useAuth()
  const { data: wishlistItems } = useWishlist()
  const { addId, removeId } = useWishlistStore()

  const serverSaved = wishlistItems?.some((item) => item.dishId === dishId) ?? false
  const [optimistic, setOptimistic] = useState<boolean | null>(null)

  useEffect(() => {
    setOptimistic(null)
  }, [serverSaved])

  const isSaved = optimistic ?? serverSaved

  async function handleToggle() {
    if (!user || !isAuthenticated) return
    const token = authUser ? await authUser.getIdToken() : null
    if (!token) return

    const wasSaved = isSaved
    setOptimistic(!wasSaved)
    if (wasSaved) removeId(dishId)
    else addId(dishId)

    const res = await fetch(
      API_ENDPOINTS.wishlistItem(encodeURIComponent(user.id), encodeURIComponent(dishId)),
      { method: wasSaved ? 'DELETE' : 'POST', headers: { authorization: `Bearer ${token}` } }
    )
    if (!res.ok) {
      setOptimistic(wasSaved)
      if (wasSaved) addId(dishId)
      else removeId(dishId)
      toast.error(CLIENT_ERRORS.COULD_NOT_UPDATE_WISHLIST)
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
      <Heart className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} />
      {isSaved ? 'Saved' : 'Save'}
    </Button>
  )
}

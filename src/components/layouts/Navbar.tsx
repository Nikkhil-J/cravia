'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { Search, Bell, User, Heart, Settings, LogOut } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { useAuth, logout } from '@/lib/hooks/useAuth'
import { UserAvatar } from '@/components/ui/Avatar'
import { Logo } from '@/components/ui/Logo'
import { SearchBar } from '@/components/features/SearchBar'
import { ROUTES } from '@/lib/constants/routes'
import { NotificationPopover } from '@/components/features/NotificationPopover'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const showSearchInNavbar = pathname !== ROUTES.HOME && !pathname.startsWith('/restaurant/')
  const showMobileSearchIcon = showSearchInNavbar && !pathname.startsWith('/explore') && !pathname.startsWith('/my-profile') && !pathname.startsWith('/profile/')
  const [scrolled, setScrolled] = useState(false)
  const [confirmingLogout, setConfirmingLogout] = useState(false)
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b bg-background/92 backdrop-blur-xl transition-all duration-200',
        scrolled ? 'border-border shadow-sm' : 'border-border'
      )}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex h-14 items-center gap-2 px-3 sm:h-[68px] sm:gap-5 sm:px-[60px]">
        <Link href={ROUTES.HOME} className="shrink-0">
          <Logo size="md" wordmarkClassName="hidden sm:inline" />
        </Link>

        <div className="mx-auto hidden min-w-0 flex-1 md:block">
          <AnimatePresence>
            {showSearchInNavbar && (
              <motion.div
                key="navbar-search"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex justify-center"
              >
                <Suspense fallback={<div className="w-full max-w-[400px]" />}>
                  <SearchBar variant="navbar" />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          {showMobileSearchIcon && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full md:hidden"
              onClick={() => router.push(`${ROUTES.EXPLORE}?focus=1`)}
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-text-secondary" />
            </Button>
          )}

          {isLoading && (
            <>
              {/* Mobile: matches the ghost icon sign-in button */}
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted sm:hidden" />
              {/* Desktop: matches the Sign in + Sign up pill buttons */}
              <div className="hidden items-center gap-2.5 sm:flex">
                <div className="h-9 w-[72px] animate-pulse rounded-full bg-muted" />
                <div className="h-9 w-[82px] animate-pulse rounded-full bg-muted" />
              </div>
            </>
          )}

          {!isLoading && !isAuthenticated && (
            <>
              <Button
                variant="outline"
                size="lg"
                className="hidden rounded-pill border-2 px-5 font-semibold sm:inline-flex"
                render={<Link href={ROUTES.LOGIN} />}
              >
                Sign in
              </Button>
              <Button
                size="lg"
                className="hidden rounded-pill px-5 font-semibold hover:-translate-y-0.5 active:translate-y-0 hover:shadow-glow sm:inline-flex"
                render={<Link href={ROUTES.SIGNUP} />}
              >
                Sign up
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full sm:hidden"
                render={<Link href={ROUTES.LOGIN} />}
                aria-label="Sign in"
              >
                <User className="h-5 w-5" />
              </Button>
            </>
          )}

          {!isLoading && isAuthenticated && user && (
            <>

              <NotificationPopover />

              <div className="hidden md:block">
              <DropdownMenu onOpenChange={(open) => { if (!open) setConfirmingLogout(false) }}>
                <DropdownMenuTrigger
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-gradient-to-br from-primary to-brand-orange shadow-sm outline-none sm:h-[38px] sm:w-[38px]"
                >
                  {user.avatarUrl ? (
                    <UserAvatar src={user.avatarUrl} name={user.displayName} size="sm" />
                  ) : (
                    <span className="text-xs font-bold text-white sm:text-sm">
                      {user.displayName?.charAt(0).toUpperCase() ?? 'U'}
                    </span>
                  )}
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" sideOffset={8} className="w-48">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs text-text-muted">DishPoints</p>
                    <p className="text-sm font-bold text-primary">
                      {user.dishPointsBalance ?? 0} pts
                    </p>
                  </div>
                  <DropdownMenuItem
                    className="gap-2 px-3 py-2"
                    render={<Link href={ROUTES.MY_PROFILE} />}
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 px-3 py-2"
                    render={<Link href={ROUTES.WISHLIST} />}
                  >
                    <Heart className="h-4 w-4" />
                    Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 px-3 py-2"
                    render={<Link href={ROUTES.NOTIFICATIONS} />}
                  >
                    <Bell className="h-4 w-4" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 px-3 py-2"
                    render={<Link href={ROUTES.SETTINGS} />}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {!confirmingLogout ? (
                    <DropdownMenuItem
                      variant="destructive"
                      className="gap-2 px-3 py-2"
                      closeOnClick={false}
                      onClick={() => setConfirmingLogout(true)}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      variant="destructive"
                      className="justify-center px-3 py-2 font-semibold"
                      onClick={() => logout()}
                    >
                      Confirm logout
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

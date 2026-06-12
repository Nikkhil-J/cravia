'use client'

import { type ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/useAuth'
import { ROUTES } from '@/lib/constants/routes'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { href: ROUTES.ADMIN, label: 'Dashboard', icon: '📊' },
  { href: ROUTES.ADMIN_REQUESTS, label: 'Restaurant Requests', icon: '📋' },
  { href: ROUTES.ADMIN_REVIEWS, label: 'Flagged Reviews', icon: '🚩' },
  { href: ROUTES.ADMIN_USERS, label: 'Users', icon: '👥' },
  { href: ROUTES.ADMIN_COUPONS, label: 'Coupons', icon: '🎟️' },
  { href: ROUTES.ADMIN_CLAIMS, label: 'Restaurant Claims', icon: '🏪' },
  { href: ROUTES.ADMIN_MAINTENANCE, label: 'Maintenance', icon: '🔧' },
]

interface AdminShellProps {
  children: ReactNode
}

function AdminNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-0.5 p-3">
      {NAV_ITEMS.map(({ href, label, icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
            pathname === href
              ? 'bg-primary-light font-medium text-primary-dark'
              : 'text-text-secondary hover:bg-bg-cream hover:text-heading',
          )}
        >
          <span>{icon}</span>
          {label}
        </Link>
      ))}
    </nav>
  )
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!user) {
    router.push(ROUTES.LOGIN)
    return null
  }

  if (!user.isAdmin) {
    router.push(ROUTES.HOME)
    return null
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Mobile top bar — padded for the device status bar / notch in standalone PWA */}
      <header
        className="fixed inset-x-0 top-0 z-40 flex items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur-xl md:hidden"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex h-14 w-full items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
          <Link href={ROUTES.HOME} className="font-headline text-sm font-extrabold uppercase tracking-wide text-primary">
            <span>🍽️</span> Cravia
          </Link>
          <span className="ml-auto rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary-dark">
            Admin
          </span>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside
            className="relative flex h-full w-[min(18rem,85vw)] flex-col bg-background shadow-xl"
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <Link href={ROUTES.HOME} className="font-headline font-extrabold uppercase tracking-wide text-primary">
                🍽️ Cravia
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <AdminNav pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-border bg-background md:flex">
        <Link href={ROUTES.HOME} className="flex items-center gap-1.5 border-b border-border px-5 py-4 font-headline font-extrabold uppercase tracking-wide text-primary">
          <span>🍽️</span>
          <span>Cravia</span>
        </Link>
        <AdminNav pathname={pathname} />
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto bg-surface pt-[calc(3.5rem+env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)] md:pt-6 md:pb-8">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">{children}</div>
      </main>
    </div>
  )
}

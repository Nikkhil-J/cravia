'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/requests', label: 'Dish Requests', icon: '📋' },
  { href: '/admin/reviews', label: 'Flagged Reviews', icon: '🚩' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
]

interface AdminShellProps {
  children: ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-gray-100 bg-white">
        <Link href="/" className="flex items-center gap-1.5 border-b border-gray-100 px-5 py-4 font-bold text-brand">
          <span>🍽️</span>
          <span>DishCheck</span>
        </Link>
        <nav className="flex-1 space-y-0.5 p-3">
          {NAV_ITEMS.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                pathname === href
                  ? 'bg-brand-light font-medium text-brand-dark'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto bg-surface p-6">{children}</main>
    </div>
  )
}

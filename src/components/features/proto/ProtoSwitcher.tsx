'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const PROTOS = [
  { slug: 'cinematic', label: 'A · Cinematic' },
  { slug: 'social', label: 'B · Social' },
  { slug: 'bento', label: 'C · Bento' },
  { slug: 'story', label: 'D · Story' },
  { slug: 'edit', label: 'E · Edit' },
  { slug: 'rings', label: 'F · Rings' },
] as const

export function ProtoSwitcher() {
  const pathname = usePathname()

  return (
    <div className="scrollbar-hide flex max-w-[calc(100vw-32px)] items-center gap-1 overflow-x-auto rounded-pill border border-border bg-card/85 p-1 shadow-md backdrop-blur-md">
      <Link
        href="/proto"
        className={cn(
          'shrink-0 rounded-pill px-3 py-1.5 text-xs font-semibold transition-all',
          pathname === '/proto'
            ? 'bg-heading text-card'
            : 'text-text-secondary hover:text-heading',
        )}
      >
        Overview
      </Link>
      {PROTOS.map((p) => {
        const href = `/proto/${p.slug}`
        const active = pathname === href
        return (
          <Link
            key={p.slug}
            href={href}
            className={cn(
              'shrink-0 rounded-pill px-3 py-1.5 text-xs font-semibold transition-all',
              active
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-heading',
            )}
          >
            {p.label}
          </Link>
        )
      })}
    </div>
  )
}

'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface AdminDetailHeaderProps {
  backHref: string
  backLabel: string
  title: string
  subtitle?: string
  badge?: ReactNode
}

export function AdminDetailHeader({ backHref, backLabel, title, subtitle, badge }: AdminDetailHeaderProps) {
  return (
    <div>
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-heading"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <h1 className="font-display text-xl font-bold text-heading sm:text-2xl">{title}</h1>
        {badge}
      </div>
      {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}
    </div>
  )
}

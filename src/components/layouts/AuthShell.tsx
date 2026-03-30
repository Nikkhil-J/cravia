import { type ReactNode } from 'react'
import Link from 'next/link'

interface AuthShellProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export function AuthShell({ children, title, subtitle }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-1.5 font-bold text-brand">
        <span className="text-2xl">🍽️</span>
        <span className="text-xl">DishCheck</span>
      </Link>
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}

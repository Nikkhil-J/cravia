'use client'

import { type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { AdminShell } from '@/components/layouts/AdminShell'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useEffect } from 'react'
import { ROUTES } from '@/lib/constants/routes'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.replace(ROUTES.HOME)
    }
  }, [user, isLoading, router])

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><LoadingSpinner /></div>
  if (!user?.isAdmin) return null

  return <AdminShell>{children}</AdminShell>
}

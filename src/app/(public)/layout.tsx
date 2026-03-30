import { type ReactNode } from 'react'
import { PageShell } from '@/components/layouts/PageShell'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <PageShell>{children}</PageShell>
}

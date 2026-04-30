import type { Metadata } from 'next'
import { WifiOff } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { ReloadButton } from './ReloadButton'

export const metadata: Metadata = {
  title: "You're offline — Cravia",
}

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <Logo size="lg" />

      <div className="flex flex-col items-center gap-3">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2">
          <WifiOff className="h-8 w-8 text-text-muted" />
        </span>

        <h1 className="font-display text-2xl font-bold text-heading">
          You&rsquo;re offline
        </h1>

        <p className="max-w-xs text-sm text-text-secondary">
          Check your connection and try again. Pages you&rsquo;ve visited before will still load.
        </p>
      </div>

      <ReloadButton />
    </div>
  )
}

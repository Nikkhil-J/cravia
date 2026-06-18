import { type ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { MobileBottomNav } from './MobileBottomNav'
import { PageAnimator } from './PageAnimator'
import { HeroBackdrop } from './HeroBackdrop'

interface PageShellProps {
  children: ReactNode
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <HeroBackdrop />
      <Navbar />
      <main className="flex-1 pb-[70px] md:pb-0">
        <PageAnimator>{children}</PageAnimator>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}

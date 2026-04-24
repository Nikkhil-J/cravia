'use client'

import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/lib/hooks/useAuth'
import { ROUTES } from '@/lib/constants/routes'
import { SUPPORTED_CITIES } from '@/lib/constants'

const EXPLORE_LINKS = [
  { label: 'Browse Dishes', href: ROUTES.EXPLORE },
  { label: 'Browse Cuisines', href: '/explore?tab=cuisines' },
  { label: 'Top Rated', href: '/explore?sort=top' },
  { label: 'New This Week', href: '/explore?sort=new' },
] as const

const ACCOUNT_LINKS_AUTH = [
  { label: 'Your Profile', href: ROUTES.MY_PROFILE },
  { label: 'Your Wishlist', href: '/my-profile?tab=wishlist' },
  { label: 'Write a Review', href: ROUTES.WRITE_REVIEW },
] as const

const ACCOUNT_LINKS_GUEST = [
  { label: 'Sign In', href: ROUTES.LOGIN },
  { label: 'Sign Up', href: ROUTES.SIGNUP },
] as const

function FooterColumn({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-5 text-xs font-semibold uppercase tracking-widest text-white/90">
        {heading}
      </h4>
      {children}
    </div>
  )
}

function FooterLinkList({ links }: { links: ReadonlyArray<{ label: string; href: string }> }) {
  return (
    <ul className="flex flex-col gap-3">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="text-sm text-white/45 transition-colors hover:text-white"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function Footer() {
  const { isAuthenticated } = useAuth()

  return (
    <footer className="bg-footer-bg pt-10 pb-[70px] text-white sm:pt-16 md:pb-0">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
        <div className="grid grid-cols-1 gap-9 md:grid-cols-2 md:gap-x-12 md:gap-y-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12">

          {/* Brand */}
          <div>
            <Logo className="text-white" size="sm" />
            <p className="mt-4 max-w-[280px] text-[0.9375rem] leading-relaxed text-white/65">
              Find your next favourite dish, wherever you are.
            </p>
            <p className="mt-2 text-[0.8125rem] text-white/35">
              Honest reviews from real food lovers.
            </p>
          </div>

          {/* Explore */}
          <FooterColumn heading="Explore">
            <FooterLinkList links={EXPLORE_LINKS} />
          </FooterColumn>

          {/* Account */}
          <FooterColumn heading="Account">
            <FooterLinkList links={isAuthenticated ? ACCOUNT_LINKS_AUTH : ACCOUNT_LINKS_GUEST} />
          </FooterColumn>

          {/* Cities */}
          <FooterColumn heading="Cities">
            <ul className="flex flex-col gap-3">
              {SUPPORTED_CITIES.map((city) => (
                <li key={city} className="flex items-center gap-2 text-sm text-white/45">
                  <span className="size-[7px] shrink-0 rounded-full bg-success shadow-[0_0_6px_var(--color-success)]" />
                  {city}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[0.8125rem] italic text-white/25">
              More coming soon&hellip;
            </p>
          </FooterColumn>

        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center gap-2 border-t border-white/[0.08] py-6 text-[0.8125rem] text-white/30 sm:flex-row sm:justify-between">
          <span>&copy; {new Date().getFullYear()} Cravia. All rights reserved.</span>
          <span>Made with ❤️ for food lovers</span>
        </div>
      </div>
    </footer>
  )
}

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <Link href="/" className="flex items-center gap-1.5 font-bold text-brand">
              <span>🍽️</span>
              <span>DishCheck</span>
            </Link>
            <p className="text-xs text-gray-400">Find your next favourite dish in Bengaluru.</p>
          </div>
          <nav className="flex gap-6 text-sm text-gray-500">
            <Link href="/browse" className="hover:text-brand">Browse</Link>
            <Link href="/search" className="hover:text-brand">Search</Link>
            <Link href="/login" className="hover:text-brand">Sign in</Link>
          </nav>
        </div>
        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} DishCheck. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

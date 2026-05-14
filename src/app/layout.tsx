import type { Metadata, Viewport } from "next";
import { Fredoka, DM_Sans, Barlow_Condensed } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cravia.app'),
  title: {
    default: 'Cravia — Discover what\'s worth craving',
    template: '%s — Cravia',
  },
  description: 'Honest dish-level reviews from real food lovers. Find your next favourite dish at the best restaurants near you.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cravia',
    // Splash screens are injected dynamically by PWACompat (see Script in RootLayout).
    // PWACompat reads manifest.json background_color + icons and generates the correct
    // splash at runtime for any device — no per-device PNG files needed.
  },
  icons: {
    icon: [
      { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-180.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icon-32.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'Cravia',
    title: 'Cravia — Discover what\'s worth craving',
    description: 'Honest dish-level reviews from real food lovers. Find your next favourite dish at the best restaurants near you.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Cravia — Restaurant Discovery' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cravia — Discover what\'s worth craving',
    description: 'Honest dish-level reviews from real food lovers.',
    images: ['/og-image.png'],
  },
};

// APPROVED HARDCODED COLORS — HTML meta viewport requires hex; colorScheme
// eliminates the white flash before CSS loads on PWA cold start.
export const viewport: Viewport = {
  themeColor: '#121009',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${fredoka.variable} ${dmSans.variable} ${barlowCondensed.variable} h-full`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col" style={{ backgroundColor: '#121009' }}>
        <Providers>{children}</Providers>
        {/* Generates apple-touch-startup-image meta tags dynamically from manifest.json
            for any iOS device, eliminating the need for per-device splash screen PNGs. */}
        <Script
          src="https://unpkg.com/pwacompat@3.0.3/pwacompat.min.js"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}

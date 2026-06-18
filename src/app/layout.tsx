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
    // Static splash images are required by iOS — it reads these from the HTML at
    // launch time before any JS runs. PWACompat (see Script below) supplements
    // coverage for devices not listed here. Images are generated at build time
    // by scripts/gen-splashscreens.mjs via the "prebuild" npm script.
    startupImage: [
      // iPhone 5/SE (1st gen) — 320×568 @2x
      { url: '/splashscreens/iphone5_splash.png',       media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)' },
      // iPhone 6/7/8/SE (2nd+3rd gen) — 375×667 @2x
      { url: '/splashscreens/iphone6_splash.png',       media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)' },
      // iPhone 6+/7+/8+ — 414×736 @3x
      { url: '/splashscreens/iphoneplus_splash.png',    media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone X/XS/11 Pro/12 mini/13 mini — 375×812 @3x
      { url: '/splashscreens/iphonex_splash.png',       media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone XR/11 — 414×896 @2x
      { url: '/splashscreens/iphonexr_splash.png',      media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)' },
      // iPhone XS Max/11 Pro Max — 414×896 @3x
      { url: '/splashscreens/iphonexsmax_splash.png',   media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone 12/12 Pro/13/13 Pro/14 — 390×844 @3x
      { url: '/splashscreens/iphone12_splash.png',      media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone 13 Pro Max/14 Plus — 428×926 @3x
      { url: '/splashscreens/iphone13promax_splash.png',media: '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone 14 Pro/15/15 Pro/16 — 393×852 @3x
      { url: '/splashscreens/iphone14pro_splash.png',   media: '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone 14 Pro Max/15 Plus/15 Pro Max/16 Plus — 430×932 @3x
      { url: '/splashscreens/iphone14promax_splash.png',media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone 16 Pro — 402×874 @3x
      { url: '/splashscreens/iphone16pro_splash.png',   media: '(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone 16 Pro Max — 440×956 @3x
      { url: '/splashscreens/iphone16promax_splash.png',media: '(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3)' },
    ],
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
// pins the light scheme so the OS does not flash a dark UI before CSS loads
// on PWA cold start. Value matches body bg + app-loader-bg + splash chrome.
export const viewport: Viewport = {
  themeColor: '#FFFAF5',
  colorScheme: 'light',
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
      className={`${fredoka.variable} ${dmSans.variable} ${barlowCondensed.variable} h-full`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col" style={{ backgroundColor: '#FFFAF5' }}>
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

import type { Metadata, Viewport } from "next";
import { Fredoka, DM_Sans } from "next/font/google";
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
    startupImage: [
      {
        url: '/splashscreens/iphone5_splash.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/splashscreens/iphone6_splash.png',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/splashscreens/iphoneplus_splash.png',
        media: '(device-width: 621px) and (device-height: 1104px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/splashscreens/iphonex_splash.png',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/splashscreens/iphonexr_splash.png',
        media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/splashscreens/iphonexsmax_splash.png',
        media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/splashscreens/iphone14pro_splash.png',
        media: '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/splashscreens/iphone14promax_splash.png',
        media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)',
      },
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

// APPROVED HARDCODED COLOR — HTML meta viewport theme-color requires hex
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#D85A30' },
    { media: '(prefers-color-scheme: dark)', color: '#2C1810' },
  ],
  width: 'device-width',
  initialScale: 1,
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
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${fredoka.variable} ${dmSans.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'maps.googleapis.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'motion/react'],
    viewTransition: true,
    staleTimes: {
      // Cache dynamic-page RSC payloads for 30 s in the client router.
      // This prevents back-navigation from triggering a full server re-render
      // and ensures prefetched loading-shells are still usable when the user taps.
      dynamic: 30,
      // Static pages (no dynamic data) are fine at the default 5 min.
      static: 300,
    },
  },
};

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

export default withSentryConfig(withSerwist(nextConfig), {
  org: process.env.SENTRY_ORG ?? 'cravia',
  project: process.env.SENTRY_PROJECT ?? 'cravia-web',
  silent: !process.env.CI,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});

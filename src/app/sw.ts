/// <reference lib="webworker" />
import { defaultCache } from '@serwist/next/worker'
import { Serwist, type PrecacheEntry } from 'serwist'

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[]
}

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // Do NOT skip waiting automatically. Activating a new SW mid-session
  // invalidates the Next.js router cache and forces hard reloads on the
  // next navigation. Instead, the app sends SKIP_WAITING when the user
  // is not actively navigating (e.g., after they tap a "New version" toast).
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher({ request }) {
          return request.destination === 'document'
        },
      },
    ],
  },
})

serwist.addEventListeners()

// Allow the app to trigger the SW update at a safe moment.
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

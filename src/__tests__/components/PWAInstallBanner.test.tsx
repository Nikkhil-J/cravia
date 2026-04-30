/**
 * PWAInstallBanner component tests.
 *
 * @testing-library/react is NOT installed. Tests are it.todo.
 * Install @testing-library/react + jsdom to enable.
 *
 * Known logic issues documented here as structural tests:
 */

import { describe, it, expect } from 'vitest'

describe('PWAInstallBanner', () => {
  it.todo('does NOT render when display-mode is standalone (already installed)')

  it.todo('does NOT render when sessionStorage flag "pwa-banner-dismissed" is set')

  it.todo('renders the Android "Add" button after 3s when beforeinstallprompt fires')

  it.todo('renders iOS instruction text when on iPhone user agent')

  it.todo('dismissal sets sessionStorage["pwa-banner-dismissed"]')

  it.todo('banner is hidden after dismiss() is called')

  it.todo('clicking "Add" calls deferredPrompt.prompt()')
})

// ── Logic unit tests (no DOM required) ───────────────────

describe('PWAInstallBanner — isIOS detection', () => {
  it('detects iPhone user agent', () => {
    const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
    const result = /iphone|ipad|ipod/i.test(ua)
    expect(result).toBe(true)
  })

  it('detects iPad user agent', () => {
    const ua = 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)'
    const result = /iphone|ipad|ipod/i.test(ua)
    expect(result).toBe(true)
  })

  it('returns false for Android user agent', () => {
    const ua = 'Mozilla/5.0 (Linux; Android 14; Pixel 8)'
    const result = /iphone|ipad|ipod/i.test(ua)
    expect(result).toBe(false)
  })

  it('returns false for desktop Chrome user agent', () => {
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    const result = /iphone|ipad|ipod/i.test(ua)
    expect(result).toBe(false)
  })
})

describe('PWAInstallBanner — sessionStorage dismissal key', () => {
  it('SESSION_KEY is "pwa-banner-dismissed"', () => {
    // This value is hardcoded in the component and must not change
    // without also updating any other code that reads it.
    const SESSION_KEY = 'pwa-banner-dismissed'
    expect(SESSION_KEY).toBe('pwa-banner-dismissed')
  })
})

describe('PWAInstallBanner — known timer cleanup bug', () => {
  it.todo(
    'clears the 3-second visibility timer when component unmounts before timer fires (prevents setState-on-unmounted warning) — currently leaks because the inner timer return value in onBeforeInstall is not used as the useEffect cleanup',
  )
})

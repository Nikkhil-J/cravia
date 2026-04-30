'use client'

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const SESSION_KEY = 'pwa-banner-dismissed'

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches
}

export function PWAInstallBanner() {
  const [visible, setVisible] = useState(false)
  const [ios, setIos] = useState(false)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isStandalone()) return
    if (sessionStorage.getItem(SESSION_KEY)) return

    const iosDevice = isIOS()
    setIos(iosDevice)

    if (iosDevice) {
      timerRef.current = setTimeout(() => setVisible(true), 3000)
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    }

    function onBeforeInstall(e: Event) {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      timerRef.current = setTimeout(() => setVisible(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, '1')
    setVisible(false)
  }

  async function handleAdd() {
    if (!deferredPrompt.current) return
    await deferredPrompt.current.prompt()
    const { outcome } = await deferredPrompt.current.userChoice
    if (outcome === 'accepted') {
      deferredPrompt.current = null
    }
    dismiss()
  }

  if (!visible) return null

  return (
    <div
      role="banner"
      aria-label="Install Cravia app"
      className="fixed bottom-[70px] left-0 right-0 z-50 mx-3 mb-2 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg md:hidden"
    >
      {/* Icon */}
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white"
        aria-hidden="true"
      >
        C
      </span>

      {/* Text */}
      <div className="min-w-0 flex-1">
        {ios ? (
          <>
            <p className="text-sm font-semibold text-text-primary leading-snug">
              Add to your home screen
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
              Tap
              {/* Share icon inline SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="inline h-3.5 w-3.5 text-text-secondary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              then &ldquo;Add to Home Screen&rdquo;
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-text-primary leading-snug">
              Add Cravia to your home screen
            </p>
            <p className="mt-0.5 text-xs text-text-muted">
              Get the full app experience
            </p>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        {!ios && (
          <Button
            size="sm"
            className="h-8 rounded-pill px-3 text-xs font-semibold"
            onClick={handleAdd}
          >
            Add
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full text-text-muted"
          onClick={dismiss}
          aria-label="Dismiss install banner"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

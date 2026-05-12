'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type PWAContextValue = { isPWA: boolean }
const PWAContext = createContext<PWAContextValue>({ isPWA: false })

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isPWA, setIsPWA] = useState(false)

  useEffect(() => {
    const isAndroidPWA = window.matchMedia('(display-mode: standalone)').matches
    const isIOSPWA = (navigator as any).standalone === true
    setIsPWA(isAndroidPWA || isIOSPWA)
  }, [])

  return <PWAContext.Provider value={{ isPWA }}>{children}</PWAContext.Provider>
}

export const usePWA = () => useContext(PWAContext)

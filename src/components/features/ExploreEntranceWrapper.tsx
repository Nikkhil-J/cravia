'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'

// Persists across route changes within the same JS session so back-navigation
// doesn't replay the entrance animation.
let hasPlayedEntranceAnimation = false

export function ExploreEntranceWrapper({ children }: { children: ReactNode }) {
  const [initialAnimation] = useState(() =>
    hasPlayedEntranceAnimation ? false : { opacity: 0, y: 16 }
  )

  useEffect(() => {
    hasPlayedEntranceAnimation = true
  }, [])

  return (
    <motion.div
      initial={initialAnimation}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
    >
      {children}
    </motion.div>
  )
}

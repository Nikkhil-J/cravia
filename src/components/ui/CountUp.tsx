'use client'

import { useEffect, useRef } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'

interface CountUpProps {
  value: number
  duration?: number
  locale?: string
  className?: string
  formatter?: (n: number) => string
}

export function CountUp({
  value,
  duration = 1.2,
  locale = 'en-IN',
  className,
  formatter,
}: CountUpProps) {
  const nodeRef = useRef<HTMLSpanElement | null>(null)
  const inViewRef = useRef<HTMLSpanElement | null>(null)
  const isInView = useInView(inViewRef, { once: true, amount: 0.3 })
  const reduceMotion = useReducedMotion()
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    if (!isInView || hasAnimatedRef.current) return
    hasAnimatedRef.current = true

    const node = nodeRef.current
    if (!node) return

    const format = (n: number) =>
      formatter ? formatter(n) : Math.round(n).toLocaleString(locale)

    if (reduceMotion) {
      node.textContent = format(value)
      return
    }

    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        node.textContent = format(latest)
      },
    })

    return () => controls.stop()
  }, [isInView, value, duration, locale, formatter, reduceMotion])

  const initialText = formatter ? formatter(0) : (0).toLocaleString(locale)

  return (
    <span ref={inViewRef} className={className}>
      <span ref={nodeRef}>{initialText}</span>
    </span>
  )
}

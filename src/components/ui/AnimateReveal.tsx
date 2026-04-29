'use client'

import { type ReactNode, type HTMLAttributes } from 'react'
import { motion, type Variants, type Transition } from 'motion/react'
import { cn } from '@/lib/utils'

type RevealDirection = 'up' | 'left' | 'right' | 'scale'

const REVEAL_EASE: Transition['ease'] = [0.16, 1, 0.3, 1]
const REVEAL_DURATION = 0.5
const REVEAL_VIEWPORT = {
  once: true,
  amount: 0.1,
  margin: '0px 0px -40px 0px',
} as const

function hiddenStateFor(from: RevealDirection): Record<string, number> {
  switch (from) {
    case 'left':
      return { opacity: 0, x: -24 }
    case 'right':
      return { opacity: 0, x: 24 }
    case 'scale':
      return { opacity: 0, scale: 0.96 }
    case 'up':
    default:
      return { opacity: 0, y: 16 }
  }
}

function buildItemVariants(from: RevealDirection): Variants {
  return {
    hidden: hiddenStateFor(from),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: { duration: REVEAL_DURATION, ease: REVEAL_EASE },
    },
  }
}

interface RevealProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  children: ReactNode
  className?: string
  from?: RevealDirection
  delay?: number
}

export function Reveal({
  children,
  className,
  from = 'up',
  delay = 0,
  ...props
}: RevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={REVEAL_VIEWPORT}
      variants={buildItemVariants(from)}
      transition={{ duration: REVEAL_DURATION, ease: REVEAL_EASE, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface RevealGridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  children: ReactNode
  className?: string
  stagger?: number
  delayChildren?: number
}

export function RevealGrid({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0.05,
  ...props
}: RevealGridProps) {
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren,
      },
    },
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={REVEAL_VIEWPORT}
      variants={containerVariants}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface RevealItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  children: ReactNode
  className?: string
  from?: RevealDirection
}

export function RevealItem({
  children,
  className,
  from = 'up',
  ...props
}: RevealItemProps) {
  return (
    <motion.div
      variants={buildItemVariants(from)}
      transition={{ duration: REVEAL_DURATION, ease: REVEAL_EASE }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

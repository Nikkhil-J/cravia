import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const PLACEHOLDER_GRADIENTS = [
  ['#E23744', '#FF6B35'],
  ['#FF6B35', '#FFB800'],
  ['#FFB800', '#48C479'],
  ['#48C479', '#3B82F6'],
  ['#3B82F6', '#8B5CF6'],
  ['#8B5CF6', '#E23744'],
  ['#E23744', '#F59E0B'],
  ['#10B981', '#3B82F6'],
] as const

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function getPlaceholderGradient(name: string): { from: string; to: string } {
  const idx = simpleHash(name) % PLACEHOLDER_GRADIENTS.length
  return { from: PLACEHOLDER_GRADIENTS[idx][0], to: PLACEHOLDER_GRADIENTS[idx][1] }
}

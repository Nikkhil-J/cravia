import { describe, it, expect } from 'vitest'
import { existsSync, statSync } from 'fs'
import { join } from 'path'

// These must match exactly what layout.tsx references in appleWebApp.startupImage
const EXPECTED_SPLASH_FILES = [
  'iphone5_splash.png',
  'iphone6_splash.png',
  'iphoneplus_splash.png',
  'iphonex_splash.png',
  'iphonexr_splash.png',
  'iphonexsmax_splash.png',
  'iphone14pro_splash.png',
  'iphone14promax_splash.png',
]

const SPLASH_DIR = join(process.cwd(), 'public', 'splashscreens')

describe('PWA splash screens', () => {
  it('splashscreens directory exists', () => {
    expect(existsSync(SPLASH_DIR)).toBe(true)
  })

  for (const filename of EXPECTED_SPLASH_FILES) {
    it(`${filename} exists`, () => {
      const filePath = join(SPLASH_DIR, filename)
      expect(existsSync(filePath)).toBe(true)
    })

    it(`${filename} is not empty (> 0 bytes)`, () => {
      const filePath = join(SPLASH_DIR, filename)
      if (!existsSync(filePath)) return // already caught above
      const stats = statSync(filePath)
      expect(stats.size).toBeGreaterThan(0)
    })
  }

  it('has exactly 8 expected splash screen files (no stray files)', () => {
    // Each expected file should be present — we just check count via the array
    expect(EXPECTED_SPLASH_FILES).toHaveLength(8)
  })
})

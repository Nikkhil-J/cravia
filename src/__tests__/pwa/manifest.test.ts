import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const MANIFEST_PATH = join(process.cwd(), 'public', 'manifest.json')

interface ManifestIcon {
  src: string
  sizes: string
  type: string
  purpose?: string
}

interface Manifest {
  name: string
  short_name: string
  display: string
  theme_color: string
  background_color: string
  orientation: string
  categories: string[]
  icons: ManifestIcon[]
  start_url: string
}

function readManifest(): Manifest {
  const raw = readFileSync(MANIFEST_PATH, 'utf-8')
  return JSON.parse(raw) as Manifest
}

describe('manifest.json', () => {
  it('has correct name', () => {
    const m = readManifest()
    expect(m.name).toBe('Cravia')
  })

  it('has correct short_name', () => {
    const m = readManifest()
    expect(m.short_name).toBe('Cravia')
  })

  it('has display set to standalone', () => {
    const m = readManifest()
    expect(m.display).toBe('standalone')
  })

  it('has correct theme_color', () => {
    const m = readManifest()
    expect(m.theme_color).toBe('#D85A30')
  })

  it('has an icons array', () => {
    const m = readManifest()
    expect(Array.isArray(m.icons)).toBe(true)
    expect(m.icons.length).toBeGreaterThan(0)
  })

  it('has a 192x192 icon with purpose "any"', () => {
    const m = readManifest()
    const icon = m.icons.find((i) => i.sizes === '192x192' && i.purpose === 'any')
    expect(icon).toBeDefined()
  })

  it('has a 192x192 icon with purpose "maskable"', () => {
    const m = readManifest()
    const icon = m.icons.find((i) => i.sizes === '192x192' && i.purpose === 'maskable')
    expect(icon).toBeDefined()
  })

  it('has a 512x512 icon with purpose "any"', () => {
    const m = readManifest()
    const icon = m.icons.find((i) => i.sizes === '512x512' && i.purpose === 'any')
    expect(icon).toBeDefined()
  })

  it('has a 512x512 icon with purpose "maskable"', () => {
    const m = readManifest()
    const icon = m.icons.find((i) => i.sizes === '512x512' && i.purpose === 'maskable')
    expect(icon).toBeDefined()
  })

  it('has NO icons with combined "any maskable" purpose string', () => {
    const m = readManifest()
    const bad = m.icons.filter((i) => i.purpose === 'any maskable')
    expect(bad).toHaveLength(0)
  })

  it('has orientation set to portrait', () => {
    const m = readManifest()
    expect(m.orientation).toBe('portrait')
  })

  it('includes "food" in categories', () => {
    const m = readManifest()
    expect(m.categories).toContain('food')
  })

  it('has a start_url', () => {
    const m = readManifest()
    expect(m.start_url).toBeTruthy()
  })
})

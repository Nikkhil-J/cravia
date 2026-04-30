/**
 * Unit tests for search-related utility logic.
 *
 * Full SearchBar + overlay component tests require @testing-library/react
 * (not installed). Those are marked as it.todo.
 */

import { describe, it, expect } from 'vitest'
import { slugify } from '@/lib/utils/index'
import { HERO_TAGS } from '@/lib/constants'

// ── HERO_TAGS ─────────────────────────────────────────────

describe('HERO_TAGS constant', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(HERO_TAGS)).toBe(true)
    expect(HERO_TAGS.length).toBeGreaterThan(0)
  })

  it('contains only non-empty strings', () => {
    for (const tag of HERO_TAGS) {
      expect(typeof tag).toBe('string')
      expect(tag.length).toBeGreaterThan(0)
    }
  })
})

// ── Explore URL construction ──────────────────────────────

describe('Explore URL query construction', () => {
  it('encodes dish name correctly for URL', () => {
    const query = 'Butter Chicken'
    const encoded = encodeURIComponent(query)
    expect(encoded).toBe('Butter%20Chicken')
    const url = `/explore?tab=dishes&q=${encoded}`
    expect(url).toBe('/explore?tab=dishes&q=Butter%20Chicken')
  })

  it('encodes special characters in query', () => {
    const query = 'Café & Bistro'
    const encoded = encodeURIComponent(query)
    const url = `/explore?tab=dishes&q=${encoded}`
    expect(url).toContain('/explore?tab=dishes&q=')
    // Decoded should round-trip
    const decoded = decodeURIComponent(encoded)
    expect(decoded).toBe(query)
  })

  it('cuisine slug matches slugify output', () => {
    const name = 'North Indian'
    const slug = slugify(name)
    expect(slug).toBe('north-indian')
    expect(`/cuisine/${slug}`).toBe('/cuisine/north-indian')
  })
})

// ── Component tests (require @testing-library/react) ─────

describe('SearchBar component', () => {
  it.todo(
    'does not navigate on keystroke — URL stays the same while typing',
  )

  it.todo(
    'shows HERO_TAGS when query is fewer than 2 characters',
  )

  it.todo(
    'triggers API fetch when query is 2 or more characters',
  )

  it.todo(
    'navigates to /dish/[id] when a dish result is clicked',
  )

  it.todo(
    'navigates to /restaurant/[id] when a restaurant result is clicked',
  )

  it.todo(
    'navigates to /explore?q=...&tab=dishes when Enter is pressed',
  )

  it.todo(
    'closes the overlay when Escape is pressed',
  )

  it.todo(
    'closes the overlay when clicking outside',
  )
})

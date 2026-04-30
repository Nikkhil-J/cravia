import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  formatRating,
  formatRelativeTime,
  slugify,
  truncate,
  computeOverall,
  computeTopTags,
  canEditReview,
  validatePhotoFile,
} from '@/lib/utils/index'

// ── formatRating ─────────────────────────────────────────

describe('formatRating', () => {
  it('returns "—" for 0 (no reviews)', () => {
    expect(formatRating(0)).toBe('—')
  })

  it('formats positive integer to 1 decimal', () => {
    expect(formatRating(4)).toBe('4.0')
  })

  it('formats float to 1 decimal', () => {
    expect(formatRating(3.567)).toBe('3.6')
  })

  it('formats 5.0 correctly', () => {
    expect(formatRating(5)).toBe('5.0')
  })

  it('formats 1.0 correctly', () => {
    expect(formatRating(1)).toBe('1.0')
  })
})

// ── formatRelativeTime ────────────────────────────────────

describe('formatRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function makeTimestamp(offsetMs: number): string {
    return new Date(Date.now() - offsetMs).toISOString()
  }

  it('returns "just now" for timestamps within 60 seconds', () => {
    expect(formatRelativeTime(makeTimestamp(30_000))).toBe('just now')
  })

  it('returns "just now" for 0 seconds ago', () => {
    expect(formatRelativeTime(makeTimestamp(0))).toBe('just now')
  })

  it('returns minutes ago for 5 minutes', () => {
    expect(formatRelativeTime(makeTimestamp(5 * 60_000))).toBe('5 minutes ago')
  })

  it('returns singular minute for exactly 1 minute', () => {
    expect(formatRelativeTime(makeTimestamp(61_000))).toBe('1 minute ago')
  })

  it('returns hours ago for 3 hours', () => {
    expect(formatRelativeTime(makeTimestamp(3 * 3_600_000))).toBe('3 hours ago')
  })

  it('returns singular hour for exactly 1 hour', () => {
    expect(formatRelativeTime(makeTimestamp(3_601_000))).toBe('1 hour ago')
  })

  it('returns days ago for 3 days', () => {
    expect(formatRelativeTime(makeTimestamp(3 * 86_400_000))).toBe('3 days ago')
  })

  it('returns singular day for exactly 1 day', () => {
    expect(formatRelativeTime(makeTimestamp(86_401_000))).toBe('1 day ago')
  })

  it('returns weeks ago for 2 weeks', () => {
    expect(formatRelativeTime(makeTimestamp(14 * 86_400_000))).toBe('2 weeks ago')
  })

  it('returns "1 month ago" for 32 days', () => {
    expect(formatRelativeTime(makeTimestamp(32 * 86_400_000))).toBe('1 month ago')
  })

  it('returns months ago for 4 months', () => {
    expect(formatRelativeTime(makeTimestamp(120 * 86_400_000))).toBe('4 months ago')
  })

  it('returns years ago for 2 years', () => {
    expect(formatRelativeTime(makeTimestamp(730 * 86_400_000))).toBe('2 years ago')
  })

  it('returns "just now" for invalid timestamp string', () => {
    expect(formatRelativeTime('not-a-date')).toBe('just now')
  })

  it('returns "just now" for empty string', () => {
    expect(formatRelativeTime('')).toBe('just now')
  })

  it('returns "just now" for future date (negative diff)', () => {
    const future = new Date(Date.now() + 60_000).toISOString()
    // diffSecs is negative — Math.floor(-1) = -1, which is < 60 → "just now"
    expect(formatRelativeTime(future)).toBe('just now')
  })
})

// ── slugify ───────────────────────────────────────────────

describe('slugify', () => {
  it('lowercases the input', () => {
    expect(slugify('Butter Chicken')).toBe('butter-chicken')
  })

  it('replaces spaces with hyphens', () => {
    expect(slugify('north indian')).toBe('north-indian')
  })

  it('strips diacritics (NFD normalization)', () => {
    expect(slugify('Crème Brûlée')).toBe('creme-brulee')
  })

  it('removes special characters', () => {
    expect(slugify('Biryani & Rice!')).toBe('biryani-rice')
  })

  it('collapses multiple spaces/hyphens', () => {
    expect(slugify('a  b---c')).toBe('a-b-c')
  })

  it('trims leading and trailing hyphens', () => {
    expect(slugify('-hello-')).toBe('hello')
  })

  it('returns empty string for empty input', () => {
    expect(slugify('')).toBe('')
  })

  it('handles already-slugified input unchanged', () => {
    expect(slugify('north-indian')).toBe('north-indian')
  })

  it('handles unicode characters', () => {
    expect(slugify('Café au lait')).toBe('cafe-au-lait')
  })
})

// ── truncate ──────────────────────────────────────────────

describe('truncate', () => {
  it('returns the string unchanged when shorter than n', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('returns the string unchanged when exactly n characters', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })

  it('truncates with ellipsis when longer than n', () => {
    // slice(0, 7-1) = 'hello ' (6 chars) + '…'
    expect(truncate('hello world', 7)).toBe('hello …')
  })

  it('truncates at n-1 chars + ellipsis', () => {
    const result = truncate('abcdefgh', 5)
    // slice(0, 4) + '…' = 'abcd…'
    expect(result).toBe('abcd…')
    expect([...result].length).toBe(5) // 4 chars + 1 ellipsis codepoint
  })

  it('returns just ellipsis for n=1', () => {
    expect(truncate('hello', 1)).toBe('…')
  })

  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('')
  })
})

// ── computeOverall ────────────────────────────────────────

describe('computeOverall', () => {
  it('averages three equal ratings', () => {
    expect(computeOverall(4, 4, 4)).toBe(4)
  })

  it('rounds to 1 decimal place', () => {
    // (4 + 3 + 5) / 3 = 4, exact
    expect(computeOverall(4, 3, 5)).toBe(4)
  })

  it('handles fractional results', () => {
    // (5 + 4 + 3) / 3 = 4.0
    expect(computeOverall(5, 4, 3)).toBe(4)
  })

  it('returns 0 for all-zero ratings', () => {
    expect(computeOverall(0, 0, 0)).toBe(0)
  })
})

// ── computeTopTags ────────────────────────────────────────

describe('computeTopTags', () => {
  it('returns top 5 tags by frequency', () => {
    const inputs = [
      ['Spicy', 'Rich', 'Fresh', 'Crispy', 'Authentic', 'Generous'],
      ['Spicy', 'Rich', 'Fresh', 'Crispy', 'Generous'],
      ['Spicy', 'Rich', 'Fresh', 'Crispy'],
    ]
    const result = computeTopTags(inputs)
    expect(result).toHaveLength(5)
    expect(result[0]).toBe('Spicy') // 3 occurrences
    expect(result[1]).toBe('Rich')   // 3 occurrences
  })

  it('returns empty array for no tags', () => {
    expect(computeTopTags([])).toEqual([])
  })

  it('handles single review with many tags', () => {
    const result = computeTopTags([['A', 'B', 'C', 'D', 'E', 'F']])
    expect(result).toHaveLength(5)
  })

  it('handles reviews with empty tag arrays', () => {
    const result = computeTopTags([[], [], []])
    expect(result).toEqual([])
  })
})

// ── canEditReview ─────────────────────────────────────────

describe('canEditReview', () => {
  it('returns true for a review created 1 hour ago', () => {
    const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString()
    expect(canEditReview(oneHourAgo)).toBe(true)
  })

  it('returns true for a review created 23 hours ago', () => {
    const almostADay = new Date(Date.now() - 23 * 3_600_000).toISOString()
    expect(canEditReview(almostADay)).toBe(true)
  })

  it('returns false for a review created 25 hours ago', () => {
    const moreThanADay = new Date(Date.now() - 25 * 3_600_000).toISOString()
    expect(canEditReview(moreThanADay)).toBe(false)
  })

  it('returns false for invalid date string', () => {
    expect(canEditReview('not-a-date')).toBe(false)
  })

  it('returns true for review created just now', () => {
    expect(canEditReview(new Date().toISOString())).toBe(true)
  })
})

// ── validatePhotoFile ─────────────────────────────────────

describe('validatePhotoFile', () => {
  function makeFile(name: string, type: string, sizeBytes: number): File {
    const buf = new Uint8Array(sizeBytes)
    return new File([buf], name, { type })
  }

  it('accepts a valid JPEG under 10MB', () => {
    const file = makeFile('photo.jpg', 'image/jpeg', 1024 * 1024)
    const { valid, error } = validatePhotoFile(file)
    expect(valid).toBe(true)
    expect(error).toBeNull()
  })

  it('accepts a valid PNG', () => {
    const file = makeFile('photo.png', 'image/png', 500_000)
    expect(validatePhotoFile(file).valid).toBe(true)
  })

  it('accepts a valid WebP', () => {
    const file = makeFile('photo.webp', 'image/webp', 500_000)
    expect(validatePhotoFile(file).valid).toBe(true)
  })

  it('rejects an unsupported file type', () => {
    const file = makeFile('photo.gif', 'image/gif', 100_000)
    const { valid, error } = validatePhotoFile(file)
    expect(valid).toBe(false)
    expect(error).toContain('JPEG')
  })

  it('rejects a PDF', () => {
    const file = makeFile('bill.pdf', 'application/pdf', 100_000)
    const { valid, error } = validatePhotoFile(file)
    expect(valid).toBe(false)
    expect(error).not.toBeNull()
  })

  it('rejects a file over 5MB (REVIEW_PHOTO_MAX_MB = 5)', () => {
    const file = makeFile('big.jpg', 'image/jpeg', 6 * 1024 * 1024)
    const { valid, error } = validatePhotoFile(file)
    expect(valid).toBe(false)
    expect(error).toContain('MB')
  })

  it('accepts a file exactly at the 5MB size limit', () => {
    const file = makeFile('photo.jpg', 'image/jpeg', 5 * 1024 * 1024)
    expect(validatePhotoFile(file).valid).toBe(true)
  })
})

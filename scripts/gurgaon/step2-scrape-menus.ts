/**
 * Step 2 — Scrape Zomato menus for each restaurant.
 * Reads restaurants-raw.json, produces enriched-data.json.
 * Resumable: re-running skips restaurants already processed.
 * Runs Playwright in non-headless mode for CAPTCHA intervention.
 *
 * Usage: pnpm agent:step2
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import * as readline from 'readline'
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { sleep, slugify, log, logError, DATA_DIR } from './utils'

import type { DishCategory, DietaryType, PriceRange } from '../../src/lib/types'

// ── Types ────────────────────────────────────────────────────

interface RawRestaurant {
  id: string
  name: string
  city: string
  area: string
  address: string
  cuisines: string[]
  googlePlaceId: string
  coordinates: { lat: number; lng: number }
  coverImage: null
  phoneNumber: string | null
  website: string | null
  googleMapsUrl: string
  googleRating: number | null
  ownerId: null
  isVerified: boolean
  isActive: boolean
  createdAt: string
}

type ZomatoStatus = 'success' | 'not_found' | 'insufficient_menu' | 'failed'

interface ScrapedDish {
  id: string
  restaurantId: string
  restaurantName: string
  cuisines: string[]
  area: string
  name: string
  nameLower: string
  description: string | null
  category: DishCategory
  dietary: DietaryType
  priceRange: PriceRange | null
  coverImage: null
  avgTaste: number
  avgPortion: number
  avgValue: number
  avgOverall: number
  reviewCount: number
  topTags: string[]
  tagCounts: Record<string, number>
  isActive: boolean
  createdAt: string
}

interface EnrichedRestaurant extends RawRestaurant {
  zomatoUrl: string | null
  zomatoStatus: ZomatoStatus
  dishes: ScrapedDish[]
}

interface EnrichedData {
  generatedAt: string
  lastUpdated: string
  progress: {
    total: number
    completed: number
    successful: number
    notFound: number
    insufficientMenu: number
    failed: number
  }
  restaurants: EnrichedRestaurant[]
}

// ── Category mapping ─────────────────────────────────────────

const CATEGORY_MAP: Array<[RegExp, DishCategory]> = [
  [/\b(starter|appetizer|snack)\b/i, 'Starter'],
  [/\b(main\s*course|mains|entr[eé]e)\b/i, 'Main Course'],
  [/\b(bread|roti|naan|paratha|kulcha)\b/i, 'Bread'],
  [/\b(rice|biryani|pulao)\b/i, 'Rice & Biryani'],
  [/\b(dessert|sweet|mithai|ice\s*cream|gulab)\b/i, 'Dessert'],
  [/\b(beverage|drink|juice|shake|lassi|chai|coffee|tea|mocktail|cocktail)\b/i, 'Beverage'],
  [/\b(side|accompaniment|raita|papad|chutney)\b/i, 'Side Dish'],
  [/\b(breakfast|morning)\b/i, 'Breakfast'],
  [/\b(street\s*food|chaat)\b/i, 'Street Food'],
]

function mapCategory(sectionHeading: string): DishCategory {
  for (const [pattern, category] of CATEGORY_MAP) {
    if (pattern.test(sectionHeading)) return category
  }
  return 'Main Course'
}

// ── Price mapping ────────────────────────────────────────────

function mapPriceRange(price: number | null): PriceRange | null {
  if (price === null) return null
  if (price < 100) return 'under-100'
  if (price < 200) return '100-200'
  if (price < 400) return '200-400'
  if (price < 600) return '400-600'
  return 'above-600'
}

// ── Readline helper ──────────────────────────────────────────

function waitForEnter(prompt: string): Promise<void> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question(prompt, () => {
      rl.close()
      resolve()
    })
  })
}

// ── Save progress ────────────────────────────────────────────

function saveProgress(data: EnrichedData): void {
  data.lastUpdated = new Date().toISOString()

  let successful = 0
  let notFound = 0
  let insufficientMenu = 0
  let failed = 0
  let completed = 0

  for (const r of data.restaurants) {
    if (r.zomatoStatus === 'success') { successful++; completed++ }
    else if (r.zomatoStatus === 'not_found') { notFound++; completed++ }
    else if (r.zomatoStatus === 'insufficient_menu') { insufficientMenu++; completed++ }
    else if (r.zomatoStatus === 'failed') { failed++; completed++ }
  }

  data.progress = {
    total: data.restaurants.length,
    completed,
    successful,
    notFound,
    insufficientMenu,
    failed,
  }

  const outPath = path.join(DATA_DIR, 'enriched-data.json')
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2))
}

// ── Debug screenshots ────────────────────────────────────────

const DEBUG_DIR = path.join(DATA_DIR, 'debug')

function ensureDebugDir(): void {
  if (!fs.existsSync(DEBUG_DIR)) {
    fs.mkdirSync(DEBUG_DIR, { recursive: true })
  }
}

async function saveDebugScreenshot(page: Page, restaurantName: string): Promise<void> {
  try {
    ensureDebugDir()
    const safeName = slugify(restaurantName)
    const screenshotPath = path.join(DEBUG_DIR, `${safeName}.png`)
    await page.screenshot({ path: screenshotPath, fullPage: false })
    log(`Debug screenshot saved: ${screenshotPath}`)
  } catch (err) {
    logError(`Failed to save debug screenshot for "${restaurantName}"`, err)
  }
}

// ── Name helpers ─────────────────────────────────────────────

const GURUGRAM_AREAS = [
  'Sector 29', 'Cyber City', 'Golf Course Road', 'DLF Phase 1',
  'Sohna Road', 'MG Road', 'Udyog Vihar', 'Sector 14',
  'South City', 'Palam Vihar',
] as const

const GURGAON_KEYWORDS = [
  'gurgaon', 'gurugram', 'cyber city', 'cyberhub', 'cyber hub', 'dlf',
  ...GURUGRAM_AREAS.map((a) => a.toLowerCase()),
]

function shortenName(name: string): string {
  let s = name
  // Step 1: chop everything after a separator (` - `, `- `, `, `)
  s = s.replace(/\s*[-–]\s+.*$/, '').replace(/,\s+.*$/, '')
  // Step 2: strip known area/branch suffixes that remain
  s = s
    .replace(/\s+cyber\s*hub\b/i, '')
    .replace(/\s+cyberhub\b/i, '')
    .replace(/\s+gurugram\b/i, '')
    .replace(/\s+gurgaon\b/i, '')
    .replace(/\s+sector\s+\d+/i, '')
    .replace(/\s+dlf(\s+phase\s*\d+)?/i, '')
    .trim()
  return s.length >= 3 ? s : name.trim()
}

function fuzzyNameMatch(expected: string, actual: string): boolean {
  const expectedWords = expected
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
  const actualLower = actual.toLowerCase()

  if (expectedWords.length === 0) return false

  let matched = 0
  for (const word of expectedWords) {
    if (actualLower.includes(word)) matched++
  }

  return matched / expectedWords.length >= 0.6
}

function textContainsGurgaon(text: string): boolean {
  const lower = text.toLowerCase()
  return GURGAON_KEYWORDS.some((kw) => lower.includes(kw))
}

// ── Scraping logic ───────────────────────────────────────────

const SEARCH_INPUT_SELECTORS = [
  'input[placeholder*="Search"]',
  'input[placeholder*="search"]',
  'input[type="search"]',
  '.search-input input',
  'input[aria-label*="Search"]',
  'input[aria-label*="search"]',
] as const

async function findSearchInput(page: Page): Promise<ReturnType<Page['$']>> {
  for (const selector of SEARCH_INPUT_SELECTORS) {
    const el = await page.$(selector)
    if (el) return el
  }
  return null
}

/**
 * Scan the live DOM for dropdown suggestion items via page.evaluate().
 *
 * Zomato uses hashed class names (sc-xxxxx) that change between deploys,
 * so CSS-selector–based approaches fail. Instead we look for the dropdown
 * structurally:
 *   - It's a container that appeared after we started typing (high z-index
 *     or absolute/fixed positioning, overlapping the search bar area).
 *   - Each item inside it is a clickable element (a or div[role]) containing
 *     a restaurant name and often a location line with a comma.
 *
 * Returns an array of { index, name, locationText, fullText } objects that
 * the caller can score and then click by index.
 */
interface DropdownItem {
  index: number
  name: string
  locationText: string
  fullText: string
}

async function collectDropdownItems(page: Page): Promise<DropdownItem[]> {
  return page.evaluate(() => {
    const results: Array<{
      index: number
      name: string
      locationText: string
      fullText: string
    }> = []

    // Strategy 1: find all absolutely/fixed-positioned containers with
    // high z-index that sit near the top of the viewport (dropdown overlay)
    const allEls = document.querySelectorAll('div, ul, section, nav')
    let dropdownContainer: Element | null = null

    for (const el of allEls) {
      const style = window.getComputedStyle(el)
      const pos = style.position
      if (pos !== 'absolute' && pos !== 'fixed') continue

      const z = parseInt(style.zIndex, 10)
      if (isNaN(z) || z < 10) continue

      const rect = el.getBoundingClientRect()
      // Must be visible, near the top half, and reasonably sized
      if (rect.width < 200 || rect.height < 100) continue
      if (rect.top > window.innerHeight * 0.6) continue

      // Check it contains multiple child items (like a list)
      const children = el.querySelectorAll('a, [role="option"], [role="listitem"], [tabindex]')
      if (children.length >= 1) {
        dropdownContainer = el
        break
      }
    }

    if (!dropdownContainer) {
      // Strategy 2: look for role-based containers
      const listboxes = document.querySelectorAll(
        '[role="listbox"], [role="menu"], [role="list"]',
      )
      for (const lb of listboxes) {
        const rect = lb.getBoundingClientRect()
        if (rect.width > 200 && rect.height > 50) {
          dropdownContainer = lb
          break
        }
      }
    }

    if (!dropdownContainer) return results

    // Collect clickable items inside the dropdown
    const items = dropdownContainer.querySelectorAll(
      'a, [role="option"], [role="listitem"], [role="menuitem"]',
    )

    // If no role-based items, try direct child divs that look like items
    const candidates =
      items.length > 0
        ? items
        : dropdownContainer.querySelectorAll(':scope > div, :scope > li')

    let idx = 0
    for (const item of candidates) {
      const fullText = (item.textContent ?? '').trim()
      if (!fullText || fullText.length < 3) continue

      // Try to separate name from location within this item.
      // Heuristic: the first notable text node is the name, the one
      // containing a comma or city keyword is the location.
      const childTexts: string[] = []
      for (const child of item.querySelectorAll('p, span, div, h3, h4, h5')) {
        const t = (child.textContent ?? '').trim()
        if (t.length >= 2) childTexts.push(t)
      }

      let name = ''
      let locationText = ''

      for (const t of childTexts) {
        const lc = t.toLowerCase()
        const isLocation =
          lc.includes(',') ||
          lc.includes('gurgaon') ||
          lc.includes('gurugram') ||
          lc.includes('new delhi') ||
          lc.includes('noida') ||
          lc.includes('sector') ||
          lc === 'location'
        if (isLocation && !locationText) {
          locationText = t
        } else if (!name && !lc.startsWith('dining') && !lc.startsWith('delivery') && t.length > 2) {
          name = t
        }
      }

      if (!name) name = fullText.split('\n')[0].trim()

      results.push({ index: idx, name, locationText, fullText })
      idx++
    }

    return results
  })
}

/**
 * Given collected dropdown items, click the one at `targetIndex`.
 * We re-query the dropdown container and click the Nth clickable child.
 */
async function clickDropdownItem(page: Page, targetIndex: number): Promise<boolean> {
  return page.evaluate((idx) => {
    const allEls = document.querySelectorAll('div, ul, section, nav')
    let dropdownContainer: Element | null = null

    for (const el of allEls) {
      const style = window.getComputedStyle(el)
      const pos = style.position
      if (pos !== 'absolute' && pos !== 'fixed') continue
      const z = parseInt(style.zIndex, 10)
      if (isNaN(z) || z < 10) continue
      const rect = el.getBoundingClientRect()
      if (rect.width < 200 || rect.height < 100) continue
      if (rect.top > window.innerHeight * 0.6) continue
      const children = el.querySelectorAll('a, [role="option"], [role="listitem"], [tabindex]')
      if (children.length >= 1) {
        dropdownContainer = el
        break
      }
    }

    if (!dropdownContainer) {
      const listboxes = document.querySelectorAll(
        '[role="listbox"], [role="menu"], [role="list"]',
      )
      for (const lb of listboxes) {
        const rect = lb.getBoundingClientRect()
        if (rect.width > 200 && rect.height > 50) {
          dropdownContainer = lb
          break
        }
      }
    }

    if (!dropdownContainer) return false

    const items = dropdownContainer.querySelectorAll(
      'a, [role="option"], [role="listitem"], [role="menuitem"]',
    )
    const candidates =
      items.length > 0
        ? items
        : dropdownContainer.querySelectorAll(':scope > div, :scope > li')

    let currentIdx = 0
    for (const item of candidates) {
      const text = (item.textContent ?? '').trim()
      if (!text || text.length < 3) continue

      if (currentIdx === idx) {
        ;(item as HTMLElement).click()
        return true
      }
      currentIdx++
    }

    return false
  }, targetIndex)
}

/** Score and rank dropdown items — prefer Gurgaon results. */
function scoreDropdownItem(
  item: DropdownItem,
  searchName: string,
): { nameMatch: boolean; locationScore: number } {
  const nameMatch = fuzzyNameMatch(searchName, item.name) || fuzzyNameMatch(searchName, item.fullText)
  if (!nameMatch) return { nameMatch: false, locationScore: 0 }

  const combined = `${item.fullText} ${item.locationText}`.toLowerCase()

  if (
    combined.includes('gurgaon') ||
    combined.includes('gurugram') ||
    combined.includes('cyber city') ||
    combined.includes('cyberhub') ||
    combined.includes('cyber hub') ||
    combined.includes('dlf')
  ) {
    return { nameMatch: true, locationScore: 2 }
  }

  if (GURUGRAM_AREAS.some((area) => combined.includes(area.toLowerCase()))) {
    return { nameMatch: true, locationScore: 1 }
  }

  return { nameMatch: true, locationScore: 0 }
}

/** Verify the page we landed on is actually in Gurgaon. */
async function isGurgaonPage(page: Page): Promise<boolean> {
  const url = page.url().toLowerCase()
  if (url.includes('gurgaon') || url.includes('gurugram')) return true

  try {
    const pageText = await page.evaluate(() => {
      const h1 = document.querySelector('h1')?.textContent ?? ''
      const title = document.title ?? ''
      const allText = document.body.innerText.slice(0, 2000)
      return `${h1} ${title} ${allText}`
    })
    return textContainsGurgaon(pageText)
  } catch {
    return false
  }
}

/**
 * Clear the search input, type a query, wait for dropdown suggestions,
 * score them, and try clicking the best Gurgaon match.
 * Returns the final page URL or null.
 */
async function trySearchQuery(
  page: Page,
  searchInput: Awaited<ReturnType<Page['$']>>,
  query: string,
  searchName: string,
): Promise<string | null> {
  if (!searchInput) return null

  // Clear any previous text
  await searchInput.click({ clickCount: 3 })
  await page.keyboard.press('Backspace')
  await sleep(300)

  await searchInput.type(query, { delay: 100 })
  await sleep(2500)

  // Collect dropdown items from the live DOM
  const items = await collectDropdownItems(page)

  if (items.length === 0) {
    log(`No dropdown items found for query "${query}"`)
    return null
  }

  log(`Found ${items.length} dropdown items for "${query}": ${items.map((i) => `[${i.name} | ${i.locationText || 'no loc'}]`).join(', ')}`)

  // Score each item
  const scored = items
    .map((item) => ({ item, ...scoreDropdownItem(item, searchName) }))
    .filter((s) => s.nameMatch)
    .sort((a, b) => b.locationScore - a.locationScore)

  if (scored.length === 0) {
    log(`No name-matching dropdown items for "${query}"`)
    return null
  }

  // Try clicking each candidate in priority order, verify Gurgaon after landing
  for (const candidate of scored) {
    log(`Trying dropdown item: "${candidate.item.name}" (loc: "${candidate.item.locationText}", score: ${candidate.locationScore})`)

    const clicked = await clickDropdownItem(page, candidate.item.index)
    if (!clicked) continue

    await sleep(2500)
    try {
      await page.waitForLoadState('networkidle', { timeout: 8000 })
    } catch {
      // continue
    }

    const url = page.url()
    if (url.includes('/search') || url.includes('/404') || url === 'https://www.zomato.com/ncr') {
      // Didn't navigate to a restaurant page — go back and retry
      await page.goBack({ waitUntil: 'domcontentloaded', timeout: 10000 })
      await sleep(1000)
      // Re-type the query so the dropdown reappears for the next candidate
      const input = await findSearchInput(page)
      if (input) {
        await input.click({ clickCount: 3 })
        await page.keyboard.press('Backspace')
        await sleep(300)
        await input.type(query, { delay: 80 })
        await sleep(2000)
      }
      continue
    }

    if (await isGurgaonPage(page)) {
      return url
    }

    log(`Landed on non-Gurgaon page (${url}), trying next suggestion`)
    await page.goBack({ waitUntil: 'domcontentloaded', timeout: 10000 })
    await sleep(1000)
    // Re-type so dropdown reappears
    const input = await findSearchInput(page)
    if (input) {
      await input.click({ clickCount: 3 })
      await page.keyboard.press('Backspace')
      await sleep(300)
      await input.type(query, { delay: 80 })
      await sleep(2000)
    }
  }

  return null
}

/**
 * Fallback: press Enter for full search, pick the best Gurgaon result link.
 */
async function tryFullSearch(
  page: Page,
  searchName: string,
): Promise<string | null> {
  await page.keyboard.press('Enter')
  await sleep(3000)

  const resultLinks = await page.$$eval('a[href*="/ncr/"]', (links) =>
    links
      .filter((a) => {
        const href = a.getAttribute('href') ?? ''
        return (
          href.includes('/ncr/') &&
          !href.includes('/search') &&
          !href.includes('/order') &&
          a.textContent?.trim()
        )
      })
      .slice(0, 10)
      .map((a) => ({
        href: a.getAttribute('href') ?? '',
        text: a.textContent?.trim() ?? '',
      })),
  )

  // Prefer Gurgaon links
  const gurgaonLinks = resultLinks.filter(
    (l) => l.href.toLowerCase().includes('gurgaon') || l.href.toLowerCase().includes('gurugram'),
  )
  const candidates = gurgaonLinks.length > 0 ? gurgaonLinks : resultLinks

  for (const link of candidates) {
    if (!fuzzyNameMatch(searchName, link.text)) continue

    const fullUrl = link.href.startsWith('http')
      ? link.href
      : `https://www.zomato.com${link.href}`

    await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 15000 })
    await sleep(1500)

    if (await isGurgaonPage(page)) return page.url()

    await page.goBack({ waitUntil: 'domcontentloaded', timeout: 10000 })
    await sleep(500)
  }

  return null
}

async function findZomatoUrl(
  page: Page,
  restaurantName: string,
): Promise<string | null> {
  try {
    // Navigate to Zomato NCR homepage
    await page.goto('https://www.zomato.com/ncr', {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    })
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 })
    } catch {
      // continue if domcontentloaded succeeded
    }
    await sleep(1500)

    const searchInput = await findSearchInput(page)
    if (!searchInput) {
      logError(`No search input found on Zomato for "${restaurantName}"`)
      return null
    }

    const shortened = shortenName(restaurantName)
    const useShortened = shortened.toLowerCase() !== restaurantName.toLowerCase().trim()

    // Attempt 1: try shortened name (strips branch suffixes)
    if (useShortened) {
      log(`Searching shortened name: "${shortened}" (full: "${restaurantName}")`)
      const result = await trySearchQuery(page, searchInput, shortened, shortened)
      if (result) return result
    }

    // Attempt 2: try the full name
    log(`Searching full name: "${restaurantName}"`)
    const result = await trySearchQuery(page, searchInput, restaurantName, shortened || restaurantName)
    if (result) return result

    // Attempt 3: full-text search fallback (press Enter)
    log(`No autocomplete match for "${restaurantName}", falling back to full search`)
    const fallback = await tryFullSearch(page, shortened || restaurantName)
    if (fallback) return fallback

    return null
  } catch (err) {
    logError(`Zomato search failed for "${restaurantName}"`, err)
    return null
  }
}

async function scrollToLoadMenu(page: Page): Promise<void> {
  let previousHeight = 0
  let noNewContentCount = 0

  while (noNewContentCount < 2) {
    const currentHeight = await page.evaluate(() => document.body.scrollHeight)
    await page.evaluate(() => window.scrollBy(0, 400))
    await sleep(500)

    if (currentHeight === previousHeight) {
      noNewContentCount++
    } else {
      noNewContentCount = 0
    }
    previousHeight = currentHeight
  }
}

async function scrapeMenuFromPage(page: Page): Promise<Array<{
  name: string
  price: number | null
  dietary: DietaryType
  category: string
}>> {
  const items: Array<{
    name: string
    price: number | null
    dietary: DietaryType
    category: string
  }> = []

  try {
    const viewFullMenuBtn = await page.$('text=View Full Menu')
      ?? await page.$('text=view full menu')
      ?? await page.$('text=See full menu')
    if (viewFullMenuBtn) {
      await viewFullMenuBtn.click()
      await sleep(2000)
    }
  } catch {
    // no full menu button, that's fine
  }

  await scrollToLoadMenu(page)

  try {
    const scraped = await page.evaluate(() => {
      const results: Array<{
        name: string
        price: number | null
        dietary: 'veg' | 'non-veg' | 'egg'
        sectionHeading: string
      }> = []

      const dishItems = document.querySelectorAll(
        '[data-testid="normal-dish-item"], ' +
        '[class*="menu-item"], ' +
        '[class*="MenuItem"], ' +
        '[class*="dish-card"]',
      )

      let currentSection = 'Main'

      if (dishItems.length > 0) {
        for (const item of dishItems) {
          const section = item.closest('section')
          if (section) {
            const heading = section.querySelector('h2, h3, h4')
            if (heading?.textContent?.trim()) {
              currentSection = heading.textContent.trim()
            }
          }

          const nameEl =
            item.querySelector('h4, h3, [class*="itemName"], [class*="dish-name"]')
          const name = nameEl?.textContent?.trim()
          if (!name || name.length < 2) continue

          let price: number | null = null
          const priceText = item.textContent ?? ''
          const priceMatch = priceText.match(/₹\s*([\d,]+)/)
          if (priceMatch) {
            price = parseInt(priceMatch[1].replace(/,/g, ''), 10)
            if (isNaN(price)) price = null
          }

          let dietary: 'veg' | 'non-veg' | 'egg' = 'non-veg'
          const itemHtml = item.innerHTML.toLowerCase()
          if (
            itemHtml.includes('bg-green') ||
            itemHtml.includes('green-circle') ||
            itemHtml.includes('#0f8a0f') ||
            itemHtml.includes('veg-icon')
          ) {
            dietary = 'veg'
          } else if (
            itemHtml.includes('egg-icon') ||
            itemHtml.includes('#f5a623')
          ) {
            dietary = 'egg'
          }

          results.push({ name, price, dietary, sectionHeading: currentSection })
        }
      }

      if (results.length === 0) {
        const allSections = document.querySelectorAll('section, [class*="section"]')
        for (const section of allSections) {
          const heading = section.querySelector('h2, h3, h4')
          const sectionName = heading?.textContent?.trim() ?? 'Main'

          const textNodes = section.querySelectorAll('h4, h3, [role="heading"]')
          for (const node of textNodes) {
            const name = node.textContent?.trim()
            if (!name || name.length < 2) continue

            const parent = node.closest('div')
            const parentText = parent?.textContent ?? ''
            const priceMatch = parentText.match(/₹\s*([\d,]+)/)
            let price: number | null = null
            if (priceMatch) {
              price = parseInt(priceMatch[1].replace(/,/g, ''), 10)
              if (isNaN(price)) price = null
            }

            let dietary: 'veg' | 'non-veg' | 'egg' = 'non-veg'
            const parentHtml = (parent?.innerHTML ?? '').toLowerCase()
            if (
              parentHtml.includes('bg-green') ||
              parentHtml.includes('#0f8a0f')
            ) {
              dietary = 'veg'
            }

            results.push({ name, price, dietary, sectionHeading: sectionName })
          }
        }
      }

      return results
    })

    items.push(
      ...scraped.map((s) => ({
        name: s.name,
        price: s.price,
        dietary: s.dietary as DietaryType,
        category: s.sectionHeading,
      })),
    )
  } catch (err) {
    logError('Menu scraping evaluation failed', err)
  }

  return items
}

async function checkForCaptcha(page: Page): Promise<boolean> {
  try {
    const bodyText = await page.evaluate(() => document.body.innerText)
    const html = await page.evaluate(() => document.body.innerHTML.toLowerCase())
    return (
      bodyText.includes('Please verify you are a human') ||
      bodyText.includes('Access Denied') ||
      html.includes('captcha') ||
      html.includes('challenge-running') ||
      html.includes('cf-browser-verification')
    )
  } catch {
    return false
  }
}

// ── Main ─────────────────────────────────────────────────────

async function main(): Promise<void> {
  log('Step 2 — Scraping Zomato menus (Playwright)')

  const rawPath = path.join(DATA_DIR, 'restaurants-raw.json')
  if (!fs.existsSync(rawPath)) {
    console.error('restaurants-raw.json not found. Run pnpm agent:step1 first.')
    process.exit(1)
  }

  const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf-8'))
  const rawRestaurants: RawRestaurant[] = rawData.restaurants

  // Load existing progress if any
  const enrichedPath = path.join(DATA_DIR, 'enriched-data.json')
  let enrichedData: EnrichedData

  if (fs.existsSync(enrichedPath)) {
    log('Loading existing enriched-data.json for resume...')
    enrichedData = JSON.parse(fs.readFileSync(enrichedPath, 'utf-8'))

    const existingIds = new Set(enrichedData.restaurants.map((r) => r.id))
    for (const raw of rawRestaurants) {
      if (!existingIds.has(raw.id)) {
        enrichedData.restaurants.push({
          ...raw,
          zomatoUrl: null,
          zomatoStatus: 'failed' as ZomatoStatus,
          dishes: [],
        })
      }
    }
  } else {
    enrichedData = {
      generatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      progress: {
        total: rawRestaurants.length,
        completed: 0,
        successful: 0,
        notFound: 0,
        insufficientMenu: 0,
        failed: 0,
      },
      restaurants: rawRestaurants.map((r) => ({
        ...r,
        zomatoUrl: null,
        zomatoStatus: 'failed' as ZomatoStatus,
        dishes: [],
      })),
    }
  }

  const browser: Browser = await chromium.launch({
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
    ],
  })

  const context: BrowserContext = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
  })

  const page: Page = await context.newPage()

  let processedCount = 0

  for (let i = 0; i < enrichedData.restaurants.length; i++) {
    const restaurant = enrichedData.restaurants[i]

    if (restaurant.dishes.length > 0 && restaurant.zomatoStatus === 'success') {
      processedCount++
      continue
    }

    processedCount++

    // Rate limiting: 30s break every 20 restaurants
    if (processedCount > 1 && (processedCount - 1) % 20 === 0) {
      log(`Taking a 30-second break after ${processedCount - 1} restaurants...`)
      await sleep(30000)
    }

    let captchaCount = 0

    try {
      // Step A: Find Zomato URL
      const zomatoUrl = await findZomatoUrl(page, restaurant.name)

      if (!zomatoUrl) {
        restaurant.zomatoStatus = 'not_found'
        restaurant.zomatoUrl = null
        restaurant.dishes = []
        await saveDebugScreenshot(page, restaurant.name)
        saveProgress(enrichedData)
        console.log(
          `[${processedCount}/${enrichedData.restaurants.length}] ❌ ${restaurant.name} — not found on Zomato`,
        )
        await sleep(Math.random() * 4000 + 5000)
        continue
      }

      restaurant.zomatoUrl = zomatoUrl

      // Step C: Check for CAPTCHA
      while (await checkForCaptcha(page)) {
        captchaCount++
        if (captchaCount >= 3) {
          logError(`CAPTCHA limit reached for ${restaurant.name}, skipping`)
          break
        }
        await waitForEnter(
          `\n⚠️  CAPTCHA detected on ${restaurant.name}. Please solve it in the browser window, then press Enter...`,
        )
        await sleep(2000)
      }

      if (captchaCount >= 3) {
        restaurant.zomatoStatus = 'failed'
        restaurant.dishes = []
        saveProgress(enrichedData)
        console.log(
          `[${processedCount}/${enrichedData.restaurants.length}] ❌ ${restaurant.name} — CAPTCHA limit`,
        )
        await sleep(Math.random() * 4000 + 5000)
        continue
      }

      // Step B: Scrape menu
      const scrapedItems = await scrapeMenuFromPage(page)

      // Deduplicate by nameLower
      const seen = new Set<string>()
      const now = new Date().toISOString()
      const dishes: ScrapedDish[] = []

      for (const item of scrapedItems) {
        const cleanName = item.name.trim().slice(0, 100)
        const nameLower = cleanName.toLowerCase()

        if (seen.has(nameLower)) continue
        seen.add(nameLower)

        dishes.push({
          id: `${restaurant.id}-${slugify(cleanName)}`,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          cuisines: restaurant.cuisines,
          area: restaurant.area,
          name: cleanName,
          nameLower,
          description: null,
          category: mapCategory(item.category),
          dietary: item.dietary,
          priceRange: mapPriceRange(item.price),
          coverImage: null,
          avgTaste: 0,
          avgPortion: 0,
          avgValue: 0,
          avgOverall: 0,
          reviewCount: 0,
          topTags: [],
          tagCounts: {},
          isActive: true,
          createdAt: now,
        })
      }

      restaurant.dishes = dishes

      if (dishes.length < 8) {
        restaurant.zomatoStatus = 'insufficient_menu'
        console.log(
          `[${processedCount}/${enrichedData.restaurants.length}] ⚠️  ${restaurant.name} — only ${dishes.length} dishes found (flagged)`,
        )
      } else {
        restaurant.zomatoStatus = 'success'
        console.log(
          `[${processedCount}/${enrichedData.restaurants.length}] ✅ ${restaurant.name}, ${restaurant.area} — ${dishes.length} dishes scraped`,
        )
      }
    } catch (err) {
      restaurant.zomatoStatus = 'failed'
      restaurant.dishes = []
      logError(
        `[${processedCount}/${enrichedData.restaurants.length}] Failed: ${restaurant.name}`,
        err,
      )
    }

    // Step F: Save after every restaurant
    saveProgress(enrichedData)

    // Random delay between restaurants
    const delay = Math.random() * 4000 + 5000
    await sleep(delay)
  }

  await browser.close()

  // Final summary
  const { progress } = enrichedData
  const totalDishes = enrichedData.restaurants.reduce((sum, r) => sum + r.dishes.length, 0)
  const avgDishes =
    progress.successful > 0 ? (totalDishes / progress.successful).toFixed(1) : '0'

  console.log('\n══════════════════════════════════════════════════')
  console.log(`✅ Successfully scraped: ${progress.successful} restaurants`)
  console.log(`⚠️  Insufficient menu (< 8 dishes): ${progress.insufficientMenu} restaurants`)
  console.log(`❌ Not found on Zomato: ${progress.notFound} restaurants`)
  console.log(`❌ Failed: ${progress.failed} restaurants`)
  console.log(`📊 Total dishes collected: ${totalDishes}`)
  console.log(`📊 Average dishes per restaurant: ${avgDishes}`)

  const flagged = enrichedData.restaurants.filter(
    (r) => r.zomatoStatus === 'insufficient_menu' || r.zomatoStatus === 'not_found',
  )
  if (flagged.length > 0) {
    console.log('\nFlagged for manual review:')
    for (const r of flagged) {
      const reason = r.zomatoStatus === 'not_found' ? 'not found' : `${r.dishes.length} dishes`
      console.log(`  - ${r.name} (${r.area}) — ${reason}`)
    }
  }
  console.log('══════════════════════════════════════════════════\n')
}

main().catch((err) => {
  logError('Step 2 failed', err)
  process.exit(1)
})

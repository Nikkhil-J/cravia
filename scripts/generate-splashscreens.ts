/**
 * Generates Apple PWA splash screen PNGs for Cravia.
 * Run via: pnpm generate:splashscreens
 *
 * Each splash screen uses:
 *   - Background: #2C1810 (matches manifest background_color)
 *   - "CRAVIA" wordmark centred in white
 *   - Tagline below in #F0997B
 */
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'public', 'splashscreens')

interface SplashSpec {
  filename: string
  width: number
  height: number
}

const SPECS: SplashSpec[] = [
  { filename: 'iphone5_splash.png',       width: 640,   height: 1136 },
  { filename: 'iphone6_splash.png',       width: 750,   height: 1334 },
  { filename: 'iphoneplus_splash.png',    width: 1242,  height: 2208 },
  { filename: 'iphonex_splash.png',       width: 1125,  height: 2436 },
  { filename: 'iphonexr_splash.png',      width: 828,   height: 1792 },
  { filename: 'iphonexsmax_splash.png',   width: 1242,  height: 2688 },
  { filename: 'iphone14pro_splash.png',   width: 1179,  height: 2556 },
  { filename: 'iphone14promax_splash.png',width: 1290,  height: 2796 },
]

const BG_COLOR = '#2C1810'
const TEXT_COLOR = '#ffffff'
const TAGLINE_COLOR = '#F0997B'

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '')
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  }
}

function buildSvg(width: number, height: number): string {
  const bg = hexToRgb(BG_COLOR)
  const logoSize = Math.round(Math.min(width, height) * 0.14)
  const taglineSize = Math.round(logoSize * 0.38)
  const gap = Math.round(logoSize * 0.32)
  const cx = width / 2
  const cy = height / 2

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="rgb(${bg.r},${bg.g},${bg.b})"/>
  <text
    x="${cx}"
    y="${cy}"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="${logoSize}"
    font-weight="700"
    letter-spacing="${Math.round(logoSize * 0.08)}"
    fill="${TEXT_COLOR}"
    text-anchor="middle"
    dominant-baseline="middle"
  >CRAVIA</text>
  <text
    x="${cx}"
    y="${cy + Math.round(logoSize / 2) + gap}"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="${taglineSize}"
    font-weight="400"
    fill="${TAGLINE_COLOR}"
    text-anchor="middle"
    dominant-baseline="middle"
  >Know what to order.</text>
</svg>`
}

async function generate() {
  console.log(`Generating ${SPECS.length} splash screens → ${OUT_DIR}\n`)

  for (const spec of SPECS) {
    const svg = buildSvg(spec.width, spec.height)
    const outPath = path.join(OUT_DIR, spec.filename)

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outPath)

    console.log(`  ✓ ${spec.filename}  (${spec.width}×${spec.height})`)
  }

  console.log('\nDone.')
}

generate().catch((err) => {
  console.error('Failed to generate splash screens:', err)
  process.exit(1)
})

/**
 * Generates Apple PWA splash screen PNGs for Cravia.
 * Run via: pnpm generate:splashscreens
 */
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'public', 'splashscreens')

const SPECS = [
  { filename: 'iphone5_splash.png',        width: 640,   height: 1136 },
  { filename: 'iphone6_splash.png',        width: 750,   height: 1334 },
  { filename: 'iphoneplus_splash.png',     width: 1242,  height: 2208 },
  { filename: 'iphonex_splash.png',        width: 1125,  height: 2436 },
  { filename: 'iphonexr_splash.png',       width: 828,   height: 1792 },
  { filename: 'iphonexsmax_splash.png',    width: 1242,  height: 2688 },
  { filename: 'iphone14pro_splash.png',    width: 1179,  height: 2556 },
  { filename: 'iphone14promax_splash.png', width: 1290,  height: 2796 },
]

const BG_COLOR   = { r: 0x2C, g: 0x18, b: 0x10 }
const TEXT_COLOR = '#ffffff'
const TAG_COLOR  = '#F0997B'

function buildSvg(width, height) {
  const logoSize    = Math.round(Math.min(width, height) * 0.14)
  const taglineSize = Math.round(logoSize * 0.38)
  const gap         = Math.round(logoSize * 0.32)
  const cx = width / 2
  const cy = height / 2
  const letterSpacing = Math.round(logoSize * 0.08)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="rgb(${BG_COLOR.r},${BG_COLOR.g},${BG_COLOR.b})"/>
  <text
    x="${cx}" y="${cy}"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="${logoSize}"
    font-weight="700"
    letter-spacing="${letterSpacing}"
    fill="${TEXT_COLOR}"
    text-anchor="middle"
    dominant-baseline="middle"
  >CRAVIA</text>
  <text
    x="${cx}" y="${cy + Math.round(logoSize / 2) + gap}"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="${taglineSize}"
    font-weight="400"
    fill="${TAG_COLOR}"
    text-anchor="middle"
    dominant-baseline="middle"
  >Know what to order.</text>
</svg>`
}

async function generate() {
  console.log(`Generating ${SPECS.length} splash screens → ${OUT_DIR}\n`)
  for (const spec of SPECS) {
    const svg     = buildSvg(spec.width, spec.height)
    const outPath = path.join(OUT_DIR, spec.filename)
    await sharp(Buffer.from(svg)).png().toFile(outPath)
    console.log(`  ✓ ${spec.filename}  (${spec.width}×${spec.height})`)
  }
  console.log('\nDone.')
}

generate().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})

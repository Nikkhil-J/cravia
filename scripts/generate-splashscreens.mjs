/**
 * Generates Apple PWA splash screen PNGs for Cravia.
 *
 * Run manually:  node scripts/generate-splashscreens.mjs
 * Force regen:   node scripts/generate-splashscreens.mjs --force
 *
 * Background #121009 matches app-loader-bg so the iOS splash → AppLoader
 * transition is visually seamless.
 *
 * To add a new iPhone model: append one line to SPECS below with the
 * physical pixel dimensions (logical pts × dpr) and run the script.
 */
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR   = path.join(__dirname, '..', 'public', 'splashscreens')
const FORCE     = process.argv.includes('--force')

// Physical pixel dimensions (logical points × device pixel ratio).
const SPECS = [
  { filename: 'iphone5_splash.png',        width: 640,  height: 1136 }, // 320×568 @2x
  { filename: 'iphone6_splash.png',        width: 750,  height: 1334 }, // 375×667 @2x
  { filename: 'iphoneplus_splash.png',     width: 1242, height: 2208 }, // 414×736 @3x
  { filename: 'iphonex_splash.png',        width: 1125, height: 2436 }, // 375×812 @3x
  { filename: 'iphonexr_splash.png',       width: 828,  height: 1792 }, // 414×896 @2x
  { filename: 'iphonexsmax_splash.png',    width: 1242, height: 2688 }, // 414×896 @3x
  { filename: 'iphone12_splash.png',       width: 1170, height: 2532 }, // 390×844 @3x  iPhone 12/12 Pro/13/13 Pro/14
  { filename: 'iphone13promax_splash.png', width: 1284, height: 2778 }, // 428×926 @3x  iPhone 13 Pro Max/14 Plus
  { filename: 'iphone14pro_splash.png',    width: 1179, height: 2556 }, // 393×852 @3x  iPhone 14 Pro/15/15 Pro/16
  { filename: 'iphone14promax_splash.png', width: 1290, height: 2796 }, // 430×932 @3x  iPhone 14 Pro Max/15 Plus/16 Plus
  { filename: 'iphone16pro_splash.png',    width: 1206, height: 2622 }, // 402×874 @3x  iPhone 16 Pro
  { filename: 'iphone16promax_splash.png', width: 1320, height: 2868 }, // 440×956 @3x  iPhone 16 Pro Max
]

// Must match app-loader-bg in globals.css and the inline body style in layout.tsx.
const BG = '#121009'

function buildSvg(width, height) {
  const iconSize   = Math.round(Math.min(width, height) * 0.13)
  const iconH      = Math.round(iconSize * 1.1)
  const gap        = Math.round(iconSize * 0.14)
  const fontSize   = Math.round(iconSize * 0.38)
  const totalH     = iconH + gap + Math.round(fontSize * 1.4)
  const cx         = width / 2
  const logoY      = Math.round((height - totalH) / 2)
  const wmY        = logoY + iconH + gap + Math.round(fontSize * 1.05)
  const iconX      = Math.round(cx - iconSize / 2)
  const scale      = iconSize / 100

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="${BG}"/>
  <!-- Cravia mark (scaled from 100×110 viewBox) -->
  <g transform="translate(${iconX}, ${logoY}) scale(${scale.toFixed(4)})">
    <path d="M36 8 C33 2 37 -2 35 -7" fill="none" stroke="#EF9F27" stroke-width="2" stroke-linecap="round"/>
    <path d="M44 6 C46 0 42 -4 44 -9"  fill="none" stroke="#FAC775" stroke-width="2" stroke-linecap="round"/>
    <path d="M52 8 C55 2 51 -2 53 -7"  fill="none" stroke="#EF9F27" stroke-width="2" stroke-linecap="round"/>
    <circle cx="44" cy="46" r="32" fill="none" stroke="#D85A30" stroke-width="6"/>
    <circle cx="44" cy="46" r="26" fill="#3D1F14"/>
    <circle cx="44" cy="46" r="26" fill="none" stroke="#F0997B" stroke-width="2"/>
    <circle cx="44" cy="46" r="17" fill="none" stroke="#EF9F27" stroke-width="1.5" opacity="0.6"/>
    <circle cx="44" cy="46" r="10" fill="#D85A30"/>
    <circle cx="44" cy="46" r="7"  fill="#EF9F27"/>
    <circle cx="44" cy="46" r="3.5" fill="#FAC775"/>
    <ellipse cx="35" cy="37" rx="6" ry="4" fill="#FAC775" opacity="0.15" transform="rotate(-30 35 37)"/>
    <rect x="66" y="66" width="8" height="32" rx="4" fill="#D85A30" transform="rotate(45 66 66)"/>
  </g>
  <!-- CRAVIA wordmark -->
  <text
    x="${cx}" y="${wmY}"
    font-family="Arial Black, Arial, sans-serif"
    font-size="${fontSize}"
    font-weight="800"
    letter-spacing="${Math.round(fontSize * 0.14)}"
    fill="#F0997B"
    text-anchor="middle"
  >CRAVIA</text>
</svg>`
}

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  console.log(`Splash screens → ${OUT_DIR}\n`)
  for (const spec of SPECS) {
    const outPath = path.join(OUT_DIR, spec.filename)
    if (!FORCE && fs.existsSync(outPath)) {
      console.log(`  skip  ${spec.filename}`)
      continue
    }
    await sharp(Buffer.from(buildSvg(spec.width, spec.height)))
      .png({ compressionLevel: 9 })
      .toFile(outPath)
    console.log(`  gen   ${spec.filename}  (${spec.width}×${spec.height})`)
  }
  console.log('\nDone.')
}

run().catch((err) => { console.error('Failed:', err); process.exit(1) })

// Run: npx ts-node -r tsconfig-paths/register scripts/update-dish-categories.ts

import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

dotenv.config({ path: '.env.local' })

const TAXONOMY_ORDER = [
  'Starter & Appetiser',
  'Salad',
  'Main Course',
  'Biryani & Rice',
  'Noodles & Pasta',
  'Pizza',
  'Burger',
  'Sandwich & Wraps',
  'Momos & Dimsum',
  'Sushi & Asian',
  'Kebab & Grill',
  'Bread',
  'Side',
  'Snack & Street Food',
  'Thali & Meals',
  'Combos & Offers',
  'Dessert',
  'Beverage',
  'Other',
] as const

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function initAdmin() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: required('FIREBASE_PROJECT_ID'),
        clientEmail: required('FIREBASE_CLIENT_EMAIL'),
        privateKey: required('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
      }),
    })
  }
  return getFirestore()
}

interface DishEntry {
  id: string
  restaurantId?: string
  category: string
  [key: string]: unknown
}

async function main() {
  const db = initAdmin()

  const filePath = path.join(process.cwd(), 'dishes-for-categorisation.json')
  const dishes: DishEntry[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

  // ── Step 1: Update dish documents in batches of 500 ──────────────────────────
  const BATCH_SIZE = 500
  let totalUpdated = 0

  for (let i = 0; i < dishes.length; i += BATCH_SIZE) {
    const batchDishes = dishes.slice(i, i + BATCH_SIZE)
    const batch = db.batch()

    for (const dish of batchDishes) {
      const ref = db.collection('dishes').doc(dish.id)
      batch.update(ref, { category: dish.category })
    }

    await batch.commit()

    const from = i + 1
    const to = Math.min(i + BATCH_SIZE, dishes.length)
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1
    console.log(`Updated batch ${batchNumber}: dishes ${from} to ${to}`)
    totalUpdated += batchDishes.length
  }

  console.log(`\nDone. Total dishes updated: ${totalUpdated}`)

  // ── Step 2: Collect categories per restaurantId ───────────────────────────────
  const restaurantCategories = new Map<string, Set<string>>()

  for (const dish of dishes) {
    const rid = dish.restaurantId as string | undefined
    if (!rid) continue
    if (!restaurantCategories.has(rid)) {
      restaurantCategories.set(rid, new Set())
    }
    restaurantCategories.get(rid)!.add(dish.category)
  }

  // ── Step 3: Update restaurant documents ──────────────────────────────────────
  console.log('')
  for (const [restaurantId, categorySet] of restaurantCategories) {
    const sorted = TAXONOMY_ORDER.filter((cat) => categorySet.has(cat))

    const ref = db.collection('restaurants').doc(restaurantId)
    await ref.update({ categories: sorted })

    console.log(`Updated restaurant ${restaurantId} with ${sorted.length} categories`)
  }
}

main().catch((err) => {
  console.error('update-dish-categories failed:', err)
  process.exit(1)
})

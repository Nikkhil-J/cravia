/**
 * Fetches every dish from Firestore and prints a structured list
 * to the terminal. Output is intended to be copied for external
 * category assignment.
 *
 * Read-only — no data is modified.
 *
 * Run: npx tsx scripts/fetch-dishes-for-categorisation.ts
 */

import * as dotenv from 'dotenv'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

dotenv.config({ path: '.env.local' })

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

async function main() {
  const db = initAdmin()

  const snapshot = await db.collection('dishes').get()

  for (const doc of snapshot.docs) {
    const data = doc.data()
    const cuisines: string[] = Array.isArray(data.cuisines) ? data.cuisines : []

    console.log(`ID: ${doc.id}`)
    console.log(`Name: ${data.name ?? ''}`)
    console.log(`Restaurant: ${data.restaurantName ?? ''}`)
    console.log(`Cuisines: ${cuisines.join(', ')}`)
    console.log('---')
  }

  console.log(`TOTAL DISHES: ${snapshot.size}`)
}

main().catch((err) => {
  console.error('fetch-dishes-for-categorisation failed:', err)
  process.exit(1)
})

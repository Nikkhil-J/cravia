/**
 * Grants admin privileges to a user by:
 *   1. Setting a custom Firebase Auth claim: { isAdmin: true }
 *   2. Updating the Firestore users/{uid} document: { isAdmin: true }
 *
 * Both must be true for assertAdmin() to accept a request (see src/lib/auth/assert-admin.ts).
 * The user must sign out and back in after this runs for the new claim to take effect.
 *
 * Usage:
 *   npx tsx scripts/set-admin.ts <uid>
 *
 * Example:
 *   npx tsx scripts/set-admin.ts abc123def456
 */

import * as dotenv from 'dotenv'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
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
  return { auth: getAuth(), db: getFirestore() }
}

async function main() {
  const uid = process.argv[2]?.trim()
  if (!uid) {
    console.error('Usage: npx tsx scripts/set-admin.ts <uid>')
    process.exit(1)
  }

  const { auth, db } = initAdmin()

  // Verify the user exists in Firebase Auth before touching anything.
  const userRecord = await auth.getUser(uid)
  console.log(`Found user: ${userRecord.email ?? userRecord.uid}`)

  // 1. Set custom claim — required by assertAdmin() hasAdminClaim check.
  await auth.setCustomUserClaims(uid, { isAdmin: true })
  console.log(`✓ Custom claim set: { isAdmin: true }`)

  // 2. Update Firestore document — required by assertAdmin() hasAdminDoc check.
  await db.collection('users').doc(uid).update({ isAdmin: true })
  console.log(`✓ Firestore users/${uid} updated: { isAdmin: true }`)

  console.log('\nDone. The user must sign out and sign back in for the new claim to take effect.')
}

main().catch((err) => {
  console.error('set-admin failed:', err)
  process.exit(1)
})

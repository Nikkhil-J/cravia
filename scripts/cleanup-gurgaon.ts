/**
 * Cleanup script: delete all Gurgaon/Gurugram restaurants, their dishes, and reviews.
 *
 * Usage:
 *   npx tsx scripts/cleanup-gurgaon.ts --dry-run   (preview what will be deleted)
 *   npx tsx scripts/cleanup-gurgaon.ts              (actually delete)
 */

import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function initAdmin() {
  if (getApps().length > 0) return;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.error("Missing Firebase Admin credentials in .env.local");
    process.exit(1);
  }

  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const BATCH_SIZE = 400;

async function deleteDocs(
  db: FirebaseFirestore.Firestore,
  collection: string,
  ids: string[],
  label: string,
  isDryRun: boolean,
) {
  if (ids.length === 0) return;

  if (isDryRun) {
    console.log(`  Would delete ${ids.length} ${label}`);
    return;
  }

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const slice = ids.slice(i, i + BATCH_SIZE);
    for (const id of slice) {
      batch.delete(db.collection(collection).doc(id));
    }
    await batch.commit();
    console.log(
      `  Deleted ${label} batch ${Math.floor(i / BATCH_SIZE) + 1} (${slice.length} docs)`,
    );
  }
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run");

  console.log("Cravia — Gurgaon Data Cleanup");
  console.log("=================================");
  if (isDryRun) console.log("DRY RUN — nothing will be deleted\n");

  initAdmin();
  const db = getFirestore();

  // 1. Find all Gurgaon/Gurugram restaurants
  const cityVariants = ["Gurugram", "Gurgaon", "gurugram", "gurgaon"];
  const restaurantIds: string[] = [];

  for (const city of cityVariants) {
    const snap = await db
      .collection("restaurants")
      .where("city", "==", city)
      .get();
    for (const doc of snap.docs) {
      if (!restaurantIds.includes(doc.id)) {
        restaurantIds.push(doc.id);
      }
    }
  }

  console.log(`Found ${restaurantIds.length} Gurgaon restaurants`);
  if (restaurantIds.length > 0 && isDryRun) {
    const snap = await db
      .collection("restaurants")
      .where("city", "in", cityVariants)
      .get();
    for (const doc of snap.docs) {
      const data = doc.data();
      console.log(`  - ${data.name} (${data.area}, ${data.city}) [${doc.id}]`);
    }
  }

  // 2. Find all dishes for those restaurants
  const dishIds: string[] = [];
  for (let i = 0; i < restaurantIds.length; i += 10) {
    const slice = restaurantIds.slice(i, i + 10);
    const snap = await db
      .collection("dishes")
      .where("restaurantId", "in", slice)
      .get();
    for (const doc of snap.docs) {
      dishIds.push(doc.id);
    }
  }

  console.log(`Found ${dishIds.length} dishes to delete`);

  // 3. Find all reviews for those dishes
  const reviewIds: string[] = [];
  for (let i = 0; i < dishIds.length; i += 10) {
    const slice = dishIds.slice(i, i + 10);
    const snap = await db
      .collection("reviews")
      .where("dishId", "in", slice)
      .get();
    for (const doc of snap.docs) {
      reviewIds.push(doc.id);
    }
  }

  console.log(`Found ${reviewIds.length} reviews to delete`);

  // 4. Delete in order: reviews -> dishes -> restaurants
  console.log("\nDeleting...");
  await deleteDocs(db, "reviews", reviewIds, "reviews", isDryRun);
  await deleteDocs(db, "dishes", dishIds, "dishes", isDryRun);
  await deleteDocs(db, "restaurants", restaurantIds, "restaurants", isDryRun);

  console.log(`\n${isDryRun ? "DRY RUN complete. Remove --dry-run to delete." : "Cleanup complete!"}`);
  console.log(`  Restaurants: ${restaurantIds.length}`);
  console.log(`  Dishes:      ${dishIds.length}`);
  console.log(`  Reviews:     ${reviewIds.length}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});

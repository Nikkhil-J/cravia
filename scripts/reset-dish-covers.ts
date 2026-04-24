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
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

async function main(): Promise<void> {
  const isDryRun = process.argv.includes("--dry-run");
  console.log(
    isDryRun
      ? "🔍 DRY RUN — scanning dishes with cover images"
      : "🗑️  Resetting dish cover images..."
  );

  initAdmin();
  const db = getFirestore();

  const snapshot = await db
    .collection("dishes")
    .where("coverImage", "!=", null)
    .get();

  if (snapshot.empty) {
    console.log("  No dishes with cover images found.");
    return;
  }

  console.log(`  Found ${snapshot.size} dish(es) with cover images\n`);

  const batch = db.batch();
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const name = data.name ?? doc.id;
    const img = data.coverImage ?? "";
    const shortUrl = img.length > 60 ? img.slice(0, 60) + "..." : img;

    if (isDryRun) {
      console.log(`  Would reset: "${name}" (${doc.id})`);
      console.log(`    coverImage: ${shortUrl}`);
    } else {
      batch.update(doc.ref, { coverImage: null });
      console.log(`  ✅ Reset: "${name}" (${doc.id})`);
    }
  }

  if (!isDryRun) {
    await batch.commit();
    console.log(`\n  Committed ${snapshot.size} update(s)`);
  }

  console.log("\n✅ Done");
}

main().catch(console.error);

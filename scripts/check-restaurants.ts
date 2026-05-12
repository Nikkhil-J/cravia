import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import Typesense from "typesense";

function initAdmin() {
  if (getApps().length > 0) return;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const NAMES = [
  "Thalairaj Biryani",
  "Kebabs And Curries By Art Of Spices",
  "Alkauser",
  "Anardana",
  "Dhaba - Estd 1986 Delhi",
  "In The Punjab",
];

async function main() {
  initAdmin();
  const db = getFirestore();

  const client = new Typesense.Client({
    nodes: [
      {
        host: process.env.TYPESENSE_HOST!,
        port: parseInt(process.env.TYPESENSE_PORT ?? "443"),
        protocol: process.env.TYPESENSE_PROTOCOL ?? "https",
      },
    ],
    apiKey: process.env.TYPESENSE_API_KEY!,
    connectionTimeoutSeconds: 10,
  });

  console.log("=== Firestore check ===\n");
  const firestoreIds: Record<string, string> = {};

  for (const name of NAMES) {
    const snap = await db
      .collection("restaurants")
      .where("name", "==", name)
      .limit(1)
      .get();

    if (snap.empty) {
      console.log(`  ❌ NOT in Firestore: "${name}"`);
    } else {
      const doc = snap.docs[0];
      firestoreIds[name] = doc.id;
      const data = doc.data();
      console.log(`  ✅ "${name}" (${doc.id})`);
      console.log(`     coverImage: ${data.coverImage ? "✅ set" : "❌ missing"}`);
      console.log(`     cuisines: ${JSON.stringify(data.cuisines)}`);
      console.log(`     city: ${data.city}, area: ${data.area}`);
    }
  }

  console.log("\n=== Typesense check ===\n");

  for (const name of NAMES) {
    try {
      const result = await client
        .collections("restaurants")
        .documents()
        .search({ q: name, query_by: "name", per_page: 3 });

      const hits = result.hits ?? [];
      const match = hits.find(
        (h) => (h.document as { name: string }).name.toLowerCase() === name.toLowerCase()
      );

      if (!match) {
        const topHits = hits.map((h) => (h.document as { name: string }).name).join(", ");
        console.log(`  ❌ NOT in Typesense: "${name}"`);
        if (topHits) console.log(`     Top hits instead: ${topHits}`);
      } else {
        const doc = match.document as { id: string; name: string; city?: string };
        console.log(`  ✅ In Typesense: "${doc.name}" (id: ${doc.id})`);
      }
    } catch (err) {
      console.error(`  ⚠️  Typesense error for "${name}":`, err);
    }
  }

  console.log("\n=== Dish counts (Firestore) ===\n");
  for (const name of NAMES) {
    const restaurantId = firestoreIds[name];
    if (!restaurantId) continue;
    const snap = await db
      .collection("dishes")
      .where("restaurantId", "==", restaurantId)
      .count()
      .get();
    console.log(`  "${name}" → ${snap.data().count} dishes`);
  }

  console.log("\n✅ Done");
}

main().catch(console.error);

import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { v2 as cloudinary } from "cloudinary";

function initAdmin() {
  if (getApps().length > 0) return;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

function initCloudinary() {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const ASSETS_DIR = path.join(
  process.env.HOME!,
  ".cursor/projects/Users-nikhilji-Desktop-cravia/assets"
);

const COVERS: Array<{ restaurantName: string; imageFile: string }> = [
  {
    restaurantName: "Thalairaj Biryani",
    imageFile: "image-289a8de1-2290-4495-b5ba-21ec18da1b29.png",
  },
  {
    restaurantName: "Kebabs And Curries By Art Of Spices",
    imageFile: "image-a6f2f8cd-f35d-4361-bacc-e7e627f6b975.png",
  },
  {
    restaurantName: "Alkauser",
    imageFile: "image-28114bd0-c396-4632-8580-d1850a4d289d.png",
  },
  {
    restaurantName: "Anardana",
    imageFile: "image-fc5f6f86-d72b-4a5e-a386-23c828852cfb.png",
  },
  {
    restaurantName: "Dhaba - Estd 1986 Delhi",
    imageFile: "image-f287a261-cdd0-4d99-a7af-df3265b414be.png",
  },
  {
    restaurantName: "In The Punjab",
    imageFile: "image-7d594bb4-421d-4301-8c1d-855486505963.png",
  },
];

async function main() {
  const isDryRun = process.argv.includes("--dry-run");
  console.log(
    isDryRun
      ? "🔍 DRY RUN — would upload cover images to Cloudinary"
      : "📸 Uploading restaurant cover images to Cloudinary..."
  );

  initAdmin();
  initCloudinary();
  const db = getFirestore();

  for (const { restaurantName, imageFile } of COVERS) {
    const localPath = path.join(ASSETS_DIR, imageFile);

    // Find restaurant by name
    const snap = await db
      .collection("restaurants")
      .where("name", "==", restaurantName)
      .limit(1)
      .get();

    if (snap.empty) {
      console.error(`  ❌ Restaurant not found: "${restaurantName}"`);
      continue;
    }

    const doc = snap.docs[0];
    const restaurantId = doc.id;

    if (isDryRun) {
      console.log(
        `  ✅ Would upload: ${imageFile} → cravia/restaurants/${restaurantId}/cover`
      );
      console.log(`     Restaurant: "${restaurantName}" (${restaurantId})`);
      continue;
    }

    console.log(`  📤 Uploading "${restaurantName}"...`);

    const result = await cloudinary.uploader.upload(localPath, {
      folder: `cravia/restaurants/${restaurantId}`,
      public_id: "cover",
      overwrite: true,
      resource_type: "image",
    });

    const coverUrl = result.secure_url;

    await doc.ref.update({ coverImage: coverUrl });

    console.log(`  ✅ Done: "${restaurantName}"`);
    console.log(`     URL: ${coverUrl}`);
  }

  console.log("\n✅ All done!");
}

main().catch(console.error);

# Scripts

Utility scripts for Cravia. All scripts load credentials from `.env.local` in the project root.

**Buckets:**
- **A** — Admin UI (inputs needed). Also has a CLI fallback here.
- **B** — Admin UI (one-click). Also has a CLI fallback here.
- **C** — CLI only. Never exposed in the browser admin panel.

---

## Quick reference

| Script | Bucket | What it does |
|---|---|---|
| [`set-admin.ts`](#set-admints) | A | Grants admin role to a user |
| [`backfill-dish-city.ts`](#backfill-dish-cityts) | B | Normalises `city` field on all dishes |
| [`backfill-dish-denorm.ts`](#backfill-dish-denormts) | B | Copies cuisines + area from restaurant onto dishes |
| [`backfill-tag-counts.ts`](#backfill-tag-countsts) | B | Recomputes `tagCounts` + `topTags` from approved reviews |
| [`backfill-points-counters.ts`](#backfill-points-countersts) | C | Backfills `totalPointsEarned`/`Redeemed` counters on users |
| [`sync-typesense.ts`](#sync-typesensets) | B | Full Typesense reindex from Firestore |
| [`seed-from-json.ts`](#seed-from-jsonts) | C | Seeds restaurants + dishes from a JSON file |
| [`fetch-restaurants.ts`](#fetch-restaurantsts) | C | Fetches restaurants from Google Places → JSON file |
| [`ingest-google-places.ts`](#ingest-google-placests) | C | Fetches from Google Places and upserts directly to Firestore |
| [`cleanup-gurgaon.ts`](#cleanup-gurgaonts) | C | ⚠️ Deletes all Gurgaon data from Firestore |
| [`reset-dish-covers.ts`](#reset-dish-coversts) | C | ⚠️ Sets `coverImage: null` on all dishes |
| [`generate-icons.ts`](#generate-iconsts) | C | Generates PWA icon PNGs from `public/icon.svg` |
| [`generate-splashscreens.mjs`](#generate-splashscreensmjs) | C | Generates Apple PWA splash screen PNGs |
| [`gurgaon/`](#gurgaon-pipeline-step-1--5) | C | 5-step Gurgaon data ingestion pipeline |

---

## Bucket A — Admin UI (inputs needed)

### `set-admin.ts`

Grants admin privileges to a Firebase user by:
1. Setting a custom Firebase Auth claim: `{ isAdmin: true }`
2. Updating the Firestore `users/{uid}` document: `{ isAdmin: true }`

Both must be set for `assertAdmin()` to accept requests. The user must **sign out and back in** after this runs for the new claim to take effect.

**Run via the admin UI** at `/admin/maintenance` → Grant Admin Role, or as CLI:

```bash
npx tsx scripts/set-admin.ts <uid>
```

**Inputs:** Firebase UID (positional arg)

**Env vars required:** `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

---

## Bucket B — Admin UI (one-click)

These scripts are safe to trigger from the browser at `/admin/maintenance`. CLI commands are provided as a fallback.

### `backfill-dish-city.ts`

Normalises the `city` field on every dish document to lowercase `"gurugram"`. Fixes documents where the field is missing, `null`, or inconsistently cased (e.g. `"Gurugram"`).

**Idempotent** — safe to re-run; already-correct documents are skipped.

```bash
npx tsx scripts/backfill-dish-city.ts
npx tsx scripts/backfill-dish-city.ts --dry-run
```

**Env vars required:** `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

---

### `backfill-dish-denorm.ts`

Copies `cuisines` and `area` from each dish's parent restaurant document onto the dish. Required for cuisine and area filtering in search.

Handles legacy data where restaurants may have `cuisine` (string) instead of `cuisines` (string[]).

**Idempotent** — safe to re-run; overwrites with current restaurant values.

```bash
npx tsx scripts/backfill-dish-denorm.ts
npx tsx scripts/backfill-dish-denorm.ts --dry-run
```

**Env vars required:** `NEXT_PUBLIC_FIREBASE_*` vars

---

### `backfill-tag-counts.ts`

Reads all approved reviews, accumulates tag counts per dish, and writes `tagCounts` + `topTags` onto every dish document that has been reviewed.

Run this after any bulk review moderation (approvals or deletions) to keep dish tag data current.

**Idempotent** — safe to re-run; overwrites with freshly computed values.

```bash
npx tsx scripts/backfill-tag-counts.ts
npx tsx scripts/backfill-tag-counts.ts --dry-run
```

**Env vars required:** `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

---

### `sync-typesense.ts`

Upserts all dishes and restaurants from Firestore into the Typesense search index. Run after any bulk data change that needs to be reflected in search results.

This script uses `upsert` — it does **not** drop or recreate the Typesense collections. Documents removed from Firestore are not automatically removed from Typesense; use the Typesense dashboard to delete stale documents if needed.

```bash
npx tsx scripts/sync-typesense.ts
npx tsx scripts/sync-typesense.ts --dry-run
```

**Env vars required:** `TYPESENSE_HOST`, `TYPESENSE_API_KEY`, `TYPESENSE_PORT` (optional, defaults to 443), `TYPESENSE_PROTOCOL` (optional, defaults to https), `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

---

## Bucket C — CLI only

These scripts are **never** exposed in the admin UI. They are destructive, bulk, or part of a multi-step pipeline that requires local file I/O or interactive confirmation.

---

### `backfill-points-counters.ts`

Reads every user's `pointTransactions` subcollection and writes `totalPointsEarned` and `totalPointsRedeemed` counters back to the user document. Required before deploying any code that relies on these counter fields.

⚠️ **Caution** — reads and writes every user document. On a large user base this can take several minutes and consume significant Firestore read quota.

```bash
npx tsx scripts/backfill-points-counters.ts
npx tsx scripts/backfill-points-counters.ts --dry-run
```

**Env vars required:** `NEXT_PUBLIC_FIREBASE_*` vars

---

### `seed-from-json.ts`

Reads a JSON file (default: `scripts/data/restaurants-raw.json`), validates all entries, and upserts restaurants + dishes into Firestore. Skips restaurants and dishes that already exist (deduplicates by `googlePlaceId` and `nameLower`).

Used as the final step after manually filling dish data into the JSON output from `fetch-restaurants.ts`.

⚠️ **Caution** — bulk write. Use `--dry-run` first to validate.

```bash
# Dry run first
npx tsx scripts/seed-from-json.ts --dry-run

# Live run
npx tsx scripts/seed-from-json.ts

# With flags
npx tsx scripts/seed-from-json.ts --city=gurugram
npx tsx scripts/seed-from-json.ts --file=scripts/data/my-batch.json
```

**Inputs:**
- `--dry-run` — validate and print without writing
- `--city=X` — only seed restaurants for a specific city
- `--file=path` — use an alternate JSON file (default: `scripts/data/restaurants-raw.json`)

**Env vars required:** `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

---

### `fetch-restaurants.ts`

Fetches real restaurants from the Google Places Text Search API for preset Gurugram areas and writes the results to `scripts/data/restaurants-raw.json`. Outputs empty `dishes: []` arrays — you fill those in manually using Zomato/Swiggy menus before seeding.

Run this as **step 1** of the manual data ingestion workflow:
1. `fetch-restaurants.ts` → produces `restaurants-raw.json`
2. Manually fill `dishes[]` in the JSON
3. `seed-from-json.ts` → seeds into Firestore

```bash
GOOGLE_PLACES_API_KEY=AIzaSy... npx tsx scripts/fetch-restaurants.ts
```

**Inputs:** `GOOGLE_PLACES_API_KEY` (env var, set inline or in `.env.local`)

**Output:** `scripts/data/restaurants-raw.json`

---

### `ingest-google-places.ts`

Fetches restaurants from the Google Places API and upserts them **directly into Firestore** (no intermediate JSON file). Deduplicates by `googlePlaceId`.

Supersedes `seed-cities.ts` (deleted). Prefer the `gurgaon/` pipeline for large batches since it also scrapes dish data from Zomato.

```bash
npx tsx scripts/ingest-google-places.ts --city=Gurugram
npx tsx scripts/ingest-google-places.ts --city=Gurugram --cuisine="North Indian"
npx tsx scripts/ingest-google-places.ts --city=Gurugram --limit=50 --dry-run
```

**Inputs:**
- `--city=X` (**required**) — city name to fetch restaurants for
- `--cuisine=X` — filter by cuisine type
- `--limit=N` — max restaurants to fetch (default: 100)
- `--dry-run` — print without writing to Firestore

**Env vars required:** `GOOGLE_PLACES_API_KEY`, `NEXT_PUBLIC_FIREBASE_*` vars

---

### `cleanup-gurgaon.ts`

⚠️ **Destructive — run with caution**

Deletes **all** Gurgaon/Gurugram restaurants, their dishes, and their reviews from Firestore. Handles all city name variants (`"Gurugram"`, `"Gurgaon"`, `"gurugram"`, `"gurgaon"`).

Always run `--dry-run` first and review the output before executing live.

```bash
# Preview what will be deleted — always do this first
npx tsx scripts/cleanup-gurgaon.ts --dry-run

# Actually delete — irreversible
npx tsx scripts/cleanup-gurgaon.ts
```

**Env vars required:** `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

---

### `reset-dish-covers.ts`

⚠️ **Destructive — run with caution**

Sets `coverImage: null` on every dish that currently has a cover image set. This does **not** delete images from Cloudinary — it only removes the URL reference from Firestore.

```bash
# Preview
npx tsx scripts/reset-dish-covers.ts --dry-run

# Live run
npx tsx scripts/reset-dish-covers.ts
```

**Env vars required:** `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

---

### `generate-icons.ts`

Generates PWA icon PNGs at standard sizes (16, 32, 180, 192, 512) from `public/icon.svg` using `sharp`. Also generates `public/og-image.png` (1200×630).

Run whenever `public/icon.svg` changes.

```bash
npx tsx scripts/generate-icons.ts
```

**Env vars required:** None

---

### `generate-splashscreens.mjs`

Generates Apple PWA splash screen PNGs for 8 iPhone screen sizes. Output goes to `public/splashscreens/`. Run whenever the splash design changes.

```bash
node scripts/generate-splashscreens.mjs
# or via package.json script:
pnpm generate:splashscreens
```

**Env vars required:** None

---

## Gurgaon pipeline (step 1–5)

A 5-step sequential pipeline for ingesting large batches of Gurgaon restaurant data. Each step reads the output of the previous one. Run them in order.

```
step1 → step2 → step3 (review) → step4 → step5
```

⚠️ **Step 4 is destructive — run step 3 first and review the dry-run report.**

| Script | What it does | Output file |
|---|---|---|
| `gurgaon/step1-fetch-restaurants.ts` | Fetches restaurants from Google Places API | `scripts/gurgaon/data/restaurants-raw.json` |
| `gurgaon/step2-scrape-menus.ts` | Scrapes Zomato menus via Playwright (requires a display) | `scripts/gurgaon/data/enriched-data.json` |
| `gurgaon/step3-dry-run.ts` | Compares enriched data to live Firestore; produces a diff report | `scripts/gurgaon/data/dry-run-report.json` |
| `gurgaon/step4-push.ts` | Executes the push to Firestore after interactive `CONFIRM` prompt | `scripts/gurgaon/data/push-receipt.json` |
| `gurgaon/step5-fetch-photos.ts` | Fetches Google Places photos, uploads to Cloudinary, updates Firestore | `scripts/gurgaon/data/photo-receipt.json` |

```bash
# Run via package.json scripts:
pnpm agent:step1
pnpm agent:step2   # opens a visible browser window; solve CAPTCHAs manually
pnpm agent:step3   # review dry-run-report.json before continuing
pnpm agent:step4   # type CONFIRM when prompted
pnpm agent:step5
```

**Env vars required (all steps):** `GOOGLE_PLACES_API_KEY`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

**Additional (step 5):** `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

---

## Environment variables

All scripts load from `.env.local` in the project root. The full set of variables used across all scripts:

| Variable | Used by |
|---|---|
| `FIREBASE_PROJECT_ID` | All Admin SDK scripts |
| `FIREBASE_CLIENT_EMAIL` | All Admin SDK scripts |
| `FIREBASE_PRIVATE_KEY` | All Admin SDK scripts |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client SDK scripts (backfill-dish-denorm, backfill-points-counters) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Client SDK scripts |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client SDK scripts |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Client SDK scripts |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Client SDK scripts |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Client SDK scripts |
| `TYPESENSE_HOST` | sync-typesense |
| `TYPESENSE_API_KEY` | sync-typesense |
| `TYPESENSE_PORT` | sync-typesense (optional, default 443) |
| `TYPESENSE_PROTOCOL` | sync-typesense (optional, default https) |
| `GOOGLE_PLACES_API_KEY` | fetch-restaurants, ingest-google-places, gurgaon/step1, gurgaon/step5 |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | gurgaon/step5 |
| `CLOUDINARY_API_KEY` | gurgaon/step5 |
| `CLOUDINARY_API_SECRET` | gurgaon/step5 |

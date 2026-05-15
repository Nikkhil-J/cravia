---
name: add-restaurant
description: Extract restaurant details and menu items from pasted screenshots or user-provided restaurant/menu photos, create a repo-compatible restaurant seed JSON, ask for missing required or important recommended details, and validate with the Cravia Firebase seeding workflow. Use when the user wants to add a restaurant, paste menu screenshots, upload restaurant details, or seed a new restaurant into the backend.
---

# Add Restaurant

Use this skill when the user wants to add a restaurant to Cravia from screenshots, menu photos, copied menu text, Google/Zomato details, or a mix of these.

## First Response

If screenshots or images are attached, inspect them and extract all visible restaurant and menu details. If no images are attached yet, ask the user to provide:

- Restaurant details screenshot or text
- Menu screenshots/photos
- Cover image or permission to leave it unset

Do not write to Firestore until the user has explicitly approved the validated seed file and the dry run output.

## Required Inputs

Before creating or updating a seed file, confirm these fields are available:

- `name`
- `city`
- `area`
- `address`
- `coordinates.lat` and `coordinates.lng`
- `cuisines`
- At least one dish with `name`, `category`, `dietary`, and `priceRange`

If any required field is missing, stop and ask the user for it. Do not invent coordinates, address, phone, ratings, or URLs.

## Recommended Inputs

Ask for these when missing, but they may be `null` if the user wants to continue:

- `coverImage`
- `googlePlaceId`
- `googleRating`
- `googleMapsUrl`
- `website`
- `phoneNumber`
- Complete menu pages if screenshots appear partial

Explain clearly which missing values block seeding and which are optional quality improvements.

## Extraction Rules

- Preserve dish names exactly as shown, fixing only obvious OCR spacing/casing mistakes.
- Use `null` for unknown optional restaurant fields.
- If the real Google Place ID is unavailable, use a deterministic internal slug such as `gurugram-restaurant-name-area` and mention that it is not a verified Google Place ID.
- Use concise dish descriptions from the menu when visible; if not visible, use an empty string.
- Do not hallucinate dish descriptions, prices, dietary labels, ratings, URLs, or phone numbers.
- If a dish has multiple portion prices, encode the lowest and highest as `"min-max"`.
- If a dish has one price, encode it as `"price-price"`.
- Normalize rupee prices to numbers inside the string, for example `"495-495"`.
- Map vegetarian indicators to `veg`, meat/seafood/chicken/mutton/fish to `non-veg`, and egg-only dishes to `egg`.
- If dietary status is ambiguous, ask the user instead of guessing.

## Backend Format

Create a new JSON file in `scripts/data/` named with a lowercase slug, for example:

```bash
scripts/data/[restaurant-slug].json
```

Use this structure:

```json
{
  "_instructions": [
    "[Restaurant name] - [address].",
    "Menu extracted from [N] menu screenshot(s): [brief section list].",
    "Run: npx tsx scripts/seed-from-json.ts --file=scripts/data/[restaurant-slug].json --dry-run",
    "Then: npx tsx scripts/seed-from-json.ts --file=scripts/data/[restaurant-slug].json"
  ],
  "_stats": {
    "totalRestaurants": 1,
    "fetchedAt": "[ISO timestamp]"
  },
  "restaurants": [
    {
      "googlePlaceId": "[actual Google Place ID or deterministic internal slug]",
      "name": "[name]",
      "city": "[city]",
      "area": "[area]",
      "address": "[full address]",
      "coordinates": { "lat": 28.0000, "lng": 77.0000 },
      "googleRating": null,
      "googleMapsUrl": null,
      "website": null,
      "phoneNumber": null,
      "cuisines": ["[Cuisine]"],
      "priceLevel": null,
      "types": ["restaurant"],
      "dishes": [
        {
          "name": "[Dish name]",
          "description": "",
          "category": "Starter",
          "dietary": "veg",
          "priceRange": "200-200"
        }
      ]
    }
  ]
}
```

Valid seed categories are:

- `Starter`
- `Main Course`
- `Biryani`
- `Bread`
- `Dessert`
- `Beverage`
- `Snack`
- `Side Dish`
- `Salad`
- `Soup`

Valid dietary values are:

- `veg`
- `non-veg`
- `egg`

## Validation Workflow

After writing the JSON file, run:

```bash
npx tsx scripts/seed-from-json.ts --file=scripts/data/[restaurant-slug].json --dry-run
```

If validation fails, fix the JSON and rerun the dry run. If validation passes, summarize:

- Restaurant name, area, and city
- Number of dishes extracted
- Missing optional fields left as `null`
- Any screenshots/pages that appeared incomplete
- The exact command to seed for real

Only run the non-dry-run seed command if the user explicitly asks to push/seed/write to Firestore.

## Safety Rules

- Never expose or print Firebase credentials from `.env.local`.
- Never commit generated restaurant JSON unless the user explicitly asks.
- Never run production writes without a successful dry run and explicit user confirmation.
- Keep changes scoped to the restaurant seed JSON unless the user asks for importer/backend code changes.

# Cravia — Known Issues & TODOs

## Known Issues

### Search does not match restaurant names (Firebase fallback)

**Status:** Open
**Severity:** High — affects core UX

**Problem:**
When Typesense is not configured (local dev without it, or if the service goes down), search falls back to Firebase which only does prefix matching on `nameLower` (the dish name). This means:

- Searching for a restaurant name (e.g. "Malabar Coast") returns zero results.
- Mid-word queries (e.g. "chicken" for "Butter Chicken") return zero results.
- Typos return zero results — there is no fuzzy matching.

The search bar placeholder says "Search for a dish or restaurant..." but the Firebase fallback cannot deliver on the restaurant part.

**Root cause:**
`src/lib/firebase/dishes.ts` → `searchDishes()` only queries on `nameLower` using Firestore range operators (`>=` / `<=`), which limits it to prefix-only, dish-name-only matching.

**Fix:**
Run Typesense locally (or in production). The `TypesenseDishRepository` already searches across `name, restaurantName, cuisines, topTags` with typo tolerance. Setup instructions:

1. Install Typesense (`brew install typesense/tap/typesense-server` or Docker).
2. Start the server: `typesense-server --data-dir=/tmp/typesense-data --api-key=xyz_dev_key_123 --enable-cors`
3. Add to `.env.local`:
   ```
   TYPESENSE_HOST=localhost
   TYPESENSE_PORT=8108
   TYPESENSE_PROTOCOL=http
   TYPESENSE_API_KEY=xyz_dev_key_123
   ```
4. Sync Firestore to Typesense: `npx tsx scripts/sync-typesense.ts`
5. Restart dev server.

**Long-term:** Consider improving the Firebase fallback to at least support restaurant name search (add a second query on `restaurantNameLower` or a `searchTokens` array field) so the degraded experience is less broken.

---

### Rate limiter crashes request when Upstash is unreachable

**Status:** Fixed

**Problem:**
When Upstash Redis is unreachable (VPN, proxy, TLS cert issue), the `limiter.limit()` call in `src/lib/rate-limit.ts` threw an unhandled error. Since this call was outside the API route's try/catch block, Next.js returned a bare 500 with no JSON body, causing the frontend's `res.json()` to fail with "Unexpected end of JSON input".

**Fix applied:**
Wrapped the Upstash `limiter.limit()` call in a try/catch that falls back to the in-memory rate limiter on failure (fail-open pattern). See `src/lib/rate-limit.ts`.

# Constants & Single-Responsibility Audit

> Generated 2026-04-08 — read-only audit, no files changed.

---

## Section 1A — Hardcoded Route Paths

Route paths hardcoded directly in `router.push()`, `redirect()`, `href={}`, `<Link href=>`, `revalidatePath()`, middleware matchers, and email CTAs. These should live in a single `ROUTES` constants file.

> **Note:** `redirect()` and `revalidatePath()` from `next/navigation` are not used in `src/`. Middleware builds a URL object (`loginUrl.pathname = '/login'`).

### App Pages & Components

| File | Line | String | Context |
|------|------|--------|---------|
| `src/app/(admin)/layout.tsx` | 16 | `/` | `router.replace('/')` |
| `src/app/(auth)/forgot-password/page.tsx` | 37 | `/login` | `render={<Link href="/login" />}` |
| `src/app/(auth)/forgot-password/page.tsx` | 58 | `/login` | `<Link href="/login">` |
| `src/app/(auth)/login/page.tsx` | 94 | `/forgot-password` | `<Link href="/forgot-password">` |
| `src/app/(auth)/login/page.tsx` | 106 | `/signup` | `<Link href="/signup">` |
| `src/app/(auth)/signup/page.tsx` | 49 | `/onboarding` | `router.push('/onboarding')` |
| `src/app/(auth)/signup/page.tsx` | 130 | `/login` | `<Link href="/login">` |
| `src/app/(protected)/claim-restaurant/[id]/page.tsx` | 107 | `` `/restaurant/${id}` `` | `router.push(...)` |
| `src/app/(protected)/layout.tsx` | 21 | `` `/login?redirect=${...}` `` | `router.replace(...)` |
| `src/app/(protected)/my-profile/page.tsx` | 31 | `` `/write-review?${params}` `` | `router.push(...)` |
| `src/app/(protected)/my-profile/page.tsx` | 89 | `/settings` | `<Link href="/settings">` |
| `src/app/(protected)/my-profile/page.tsx` | 161 | `/explore` | `ctaHref="/explore"` |
| `src/app/(protected)/onboarding/page.tsx` | 24 | `/` | Default redirect fallback |
| `src/app/(protected)/restaurant-dashboard/[restaurantId]/dishes/page.tsx` | 32 | `` `/claim-restaurant/${id}` `` | `router.replace(...)` |
| `src/app/(protected)/restaurant-dashboard/[restaurantId]/dishes/page.tsx` | 68 | `` `/restaurant-dashboard/${id}` `` | `href={...}` |
| `src/app/(protected)/restaurant-dashboard/[restaurantId]/page.tsx` | 31 | `` `/claim-restaurant/${id}` `` | `router.replace(...)` |
| `src/app/(protected)/restaurant-dashboard/[restaurantId]/page.tsx` | 69 | `` `/restaurant-dashboard/${id}/dishes` `` | `href={...}` |
| `src/app/(protected)/review-success/page.tsx` | 40 | `/` | `router.replace('/')` |
| `src/app/(protected)/review-success/page.tsx` | 129 | `` `/dish/${dishId}` `` | `href={...}` |
| `src/app/(protected)/review-success/page.tsx` | 135 | `/explore` | `href="/explore"` |
| `src/app/(protected)/wishlist/page.tsx` | 52 | `/explore` | `ctaHref="/explore"` |
| `src/app/(protected)/wishlist/page.tsx` | 75 | `` `/dish/${dishId}` `` | `<Link href={...}>` |
| `src/app/(protected)/write-review/page.tsx` | 147 | `` `/dish/${dishId}` `` | `router.push(...)` |
| `src/app/(protected)/write-review/page.tsx` | 213 | `/review-success` | `router.push('/review-success')` |
| `src/app/(protected)/write-review/page.tsx` | 232 | `/explore` | `render={<Link href="/explore" />}` |
| `src/app/(public)/cuisine/[slug]/page.tsx` | 69 | `/explore` | `ctaHref="/explore"` |
| `src/app/(public)/dish/[id]/error.tsx` | 21 | `/explore` | `render={<Link href="/explore" />}` |
| `src/app/(public)/dish/[id]/page.tsx` | 83 | `/` | `<Link href="/">Home</Link>` |
| `src/app/(public)/dish/[id]/page.tsx` | 85 | `/explore` | `<Link href="/explore">` |
| `src/app/(public)/dish/[id]/page.tsx` | 119 | `` `/restaurant/${id}` `` | `<Link href={...}>` |
| `src/app/(public)/dish/[id]/page.tsx` | 145 | `` `/write-review?dishId=...` `` | `href={...}` |
| `src/app/(public)/dish/[id]/page.tsx` | 174 | `` `/restaurant/${id}` `` | `href={...}` |
| `src/app/(public)/page.tsx` | 79 | `/explore` | `<Link href="/explore">` |
| `src/app/(public)/page.tsx` | 101 | `` `/explore?cuisine=${...}` `` | `href={...}` |
| `src/app/(public)/restaurant/[id]/page.tsx` | 128 | `` `/write-review?dishId=...` `` | `href={...}` |
| `src/app/(public)/restaurant/[id]/page.tsx` | 176 | `` `/claim-restaurant/${id}` `` | `href={...}` |
| `src/app/error.tsx` | 36 | `/` | `render={<Link href="/" />}` |
| `src/app/not-found.tsx` | 17 | `/` | `href="/"` |
| `src/app/not-found.tsx` | 23 | `/explore` | `href="/explore"` |
| `src/components/features/DishCard.tsx` | 17 | `` `/dish/${id}` `` | `href={...}` |
| `src/components/features/DishPhotoGrid.tsx` | 105 | `` `/write-review?...` `` | CTA link |
| `src/components/features/DishSentimentCard.tsx` | 25 | `` `/dish/${dishId}` `` | `href={...}` |
| `src/components/features/HeroSearchBar.tsx` | 20 | `/explore?focus=1` | `router.push(...)` |
| `src/components/features/HeroSection.tsx` | 17 | `` `/explore?q=${tag}&focus=1` `` | `router.push(...)` |
| `src/components/features/LandingCTA.tsx` | 20 | `/explore`, `/signup` | Conditional `href` |
| `src/components/features/NotificationPopover.tsx` | 136 | `/notifications` | `href="/notifications"` |
| `src/components/features/PersonalStatsBanner.tsx` | 131 | `/my-profile` | `href="/my-profile"` |
| `src/components/features/RestaurantCard.tsx` | 13 | `` `/restaurant/${id}` `` | `href={...}` |
| `src/components/features/SearchBar.tsx` | 36–59 | `/explore`, `` `/explore?q=${...}` `` | Multiple `router.push/replace` |
| `src/components/features/WishlistButton.tsx` | 59 | `/login?redirect=` | `router.push(...)` |
| `src/components/layouts/AdminShell.tsx` | 10–15 | `/admin`, `/admin/requests`, `/admin/reviews`, `/admin/users`, `/admin/coupons`, `/admin/restaurant-claims` | Nav links array |
| `src/components/layouts/AdminShell.tsx` | 36 | `/login` | `router.push('/login')` |
| `src/components/layouts/AdminShell.tsx` | 41, 48 | `/` | `router.push('/')`, `<Link href="/">` |
| `src/components/layouts/AuthScreenDismiss.tsx` | 10–15 | `/` | Multiple `return '/'` fallbacks |
| `src/components/layouts/AuthShell.tsx` | 17, 50 | `/` | `<Link href="/">` |
| `src/components/layouts/Footer.tsx` | 8–22 | `/explore`, `/explore?tab=cuisines`, `/explore?sort=top`, `/explore?sort=new`, `/my-profile`, `/my-profile?tab=wishlist`, `/write-review`, `/login`, `/signup` | Footer link arrays |
| `src/components/layouts/MobileBottomNav.tsx` | 11–15 | `/explore`, `/write-review`, `/wishlist`, `/my-profile`, `/login` | Nav items array |
| `src/components/layouts/Navbar.tsx` | 100–226 | `/`, `/explore`, `/login`, `/signup`, `/my-profile`, `/wishlist`, `/notifications`, `/settings` | Multiple `href` and `router.push` |
| `src/components/ui/UpgradePrompt.tsx` | 29 | `/upgrade` | `href="/upgrade"` |

### Middleware

| File | Line | String | Context |
|------|------|--------|---------|
| `src/middleware.ts` | 7–19 | `/write-review`, `/my-profile`, `/settings`, `/compare`, `/upgrade`, `/wishlist`, `/notifications`, `/rewards`, `/claim-restaurant`, `/restaurant-dashboard`, `/onboarding`, `/review-success`, `/profile` | `PROTECTED_PATHS` array |
| `src/middleware.ts` | 53 | `/login` | `loginUrl.pathname = '/login'` |
| `src/middleware.ts` | 63 | `/api/` | `pathname.startsWith('/api/')` |
| `src/middleware.ts` | 73–76 | Matcher array duplicating all protected paths + `/api/:path*` | `config.matcher` |

### API Routes (instrumentation / notification links)

| File | Line | String | Context |
|------|------|--------|---------|
| `src/app/api/admin/dish-requests/[id]/route.ts` | 89 | `` `/dish/${dishId}` `` | `createServerNotification(..., linkUrl)` |
| `src/app/api/billing/verify/route.ts` | 40 | `/` | `createServerNotification(..., '/')` |
| `src/app/api/reviews/[id]/helpful/route.ts` | 30 | `` `/review/${id}` `` | `createServerNotification(...)` |
| `src/app/api/rewards/redeem/route.ts` | 31 | `/rewards` | `createServerNotification(...)` |
| `src/lib/services/rewards.ts` | 194, 204 | `/rewards` | `createServerNotification(...)` |
| `src/lib/services/email.ts` | 112, 142, 166 | `${SITE_URL}/rewards`, `${SITE_URL}/explore` | Email CTA links |

### Sitemap

| File | Line | String | Context |
|------|------|--------|---------|
| `src/app/sitemap.ts` | 22–39 | `/explore`, `/cuisine/${slug}`, `/restaurant/${id}`, `/dish/${id}` | Sitemap URL building |

---

## Section 1B — Hardcoded API Endpoint Strings

All `fetch('/api/...')` calls with hardcoded paths. These should live in a single `API_ENDPOINTS` constants file.

### Client-side fetch calls

| File | Line | Endpoint | Context |
|------|------|----------|---------|
| `src/app/(admin)/admin/coupons/page.tsx` | 54, 87 | `/api/admin/coupons` | GET/POST coupons |
| `src/app/(admin)/admin/coupons/page.tsx` | 126 | `` `/api/admin/coupons/${id}` `` | DELETE coupon |
| `src/app/(admin)/admin/requests/page.tsx` | 25, 41 | `` `/api/admin/dish-requests/${id}` `` | PATCH dish request |
| `src/app/(admin)/admin/restaurant-claims/page.tsx` | 22, 37 | `/api/admin/restaurant-claims` | GET/PATCH claims |
| `src/app/(admin)/admin/reviews/page.tsx` | 34 | `` `/api/admin/reviews/${id}` `` | PATCH review |
| `src/app/(protected)/claim-restaurant/[id]/page.tsx` | 50 | `` `/api/restaurants/${id}/claim` `` | POST claim |
| `src/app/(protected)/my-profile/page.tsx` | 41 | `` `/api/reviews/${id}?dishId=...` `` | DELETE review |
| `src/app/(protected)/notifications/page.tsx` | 28 | `/api/notifications/read-all` | POST mark all read |
| `src/app/(protected)/rewards/page.tsx` | 32–34 | `/api/rewards/balance`, `/api/rewards/coupons`, `/api/rewards/claims` | Parallel GET |
| `src/app/(protected)/rewards/page.tsx` | 61 | `/api/rewards/redeem` | POST redeem |
| `src/app/(protected)/restaurant-dashboard/[restaurantId]/page.tsx` | 26 | `` `/api/restaurants/${id}/analytics` `` | GET analytics |
| `src/app/(protected)/restaurant-dashboard/[restaurantId]/dishes/page.tsx` | 27 | `` `/api/restaurants/${id}/analytics` `` | GET analytics |
| `src/app/(protected)/upgrade/page.tsx` | 44 | `/api/billing/create-order` | POST order |
| `src/app/(protected)/upgrade/page.tsx` | 74 | `/api/billing/verify` | POST verify |
| `src/app/(protected)/wishlist/page.tsx` | 24 | `` `/api/users/${userId}/wishlist/${dishId}` `` | DELETE wishlist |
| `src/app/(protected)/write-review/page.tsx` | 124 | `` `/api/reviews/${id}` `` | PATCH review |
| `src/app/(protected)/write-review/page.tsx` | 163 | `/api/reviews` | POST review |
| `src/components/features/LoadMoreDishes.tsx` | 50 | `` `/api/dishes?${params}` `` | GET dishes |
| `src/components/features/LoadMoreReviews.tsx` | 43 | `` `/api/dishes/${id}/reviews` `` | GET reviews |
| `src/components/features/NotificationPopover.tsx` | 31 | `/api/notifications/unread-count` | GET count |
| `src/components/features/NotificationPopover.tsx` | 80 | `/api/notifications/read-all` | POST read all |
| `src/components/features/ReviewCard.tsx` | 62 | `` `/api/reviews/${id}/helpful` `` | POST helpful |
| `src/components/features/ReviewCard.tsx` | 78 | `` `/api/reviews/${id}/flag` `` | POST flag |
| `src/components/features/WishlistButton.tsx` | 44 | `` `/api/users/${userId}/wishlist/${dishId}` `` | POST/DELETE wishlist |
| `src/lib/services/admin.ts` | 28 | `` `/api/admin/users/${userId}/role` `` | PATCH role |
| `src/lib/services/admin.ts` | 32 | `` `/api/admin/users/${userId}/premium` `` | PATCH premium |
| `src/lib/services/admin.ts` | 36 | `` `/api/admin/reviews/${id}` `` | PATCH review |

### API route instrumentation (`captureError` / `logRouteDuration`)

Each API route handler hardcodes its own path in `captureError(error, { route: '...' })` calls — **35+ instances** across all route files. These should be auto-derived from the file path or pulled from a shared constant.

---

## Section 1C — Hardcoded Firestore Collection Names

`COLLECTIONS` and `SUBCOLLECTIONS` are canonically defined in `src/lib/firebase/config.ts` and used consistently across all production Firebase SDK calls. The only gaps:

| File | Line | Collection Name | Context | Uses constant? |
|------|------|-----------------|---------|----------------|
| `src/lib/services/analytics-cache.ts` | 29 | `cache` | `.collection('cache')` subcollection under `restaurants/{id}` | **No** — not in `SUBCOLLECTIONS`; add `SUBCOLLECTIONS.ANALYTICS_CACHE` |
| `src/__tests__/rules/firestore.rules.test.ts` | 54–477 | `users`, `wishlist`, `restaurants`, `dishes`, `reviews`, `dishRequests`, `notifications` | ~50 instances of `.collection('...')` in rules tests | **No** — test file uses raw strings; could import `COLLECTIONS` for sync |

**Verdict:** Production code is clean except one subcollection (`cache`). Test file uses raw strings intentionally but risks drift.

---

## Section 1D — Duplicate UI Copy Strings

User-facing strings that appear identically in 2+ different files. Sorted by occurrence count.

| String | Count | Files |
|--------|------:|-------|
| `Something went wrong` | 4 | `src/app/error.tsx`, `src/app/(public)/dish/[id]/error.tsx`, `src/app/(protected)/restaurant-dashboard/[restaurantId]/page.tsx`, `src/app/(protected)/upgrade/page.tsx` |
| `Explore dishes` | 4 | `src/app/(protected)/my-profile/page.tsx`, `src/components/features/LandingCTA.tsx`, `src/app/(public)/dish/[id]/error.tsx`, `src/app/not-found.tsx` |
| `Sign in` | 4 | `src/components/layouts/Navbar.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx`, `src/components/layouts/MobileBottomNav.tsx` |
| `Taste` | 4 | `src/app/(protected)/compare/page.tsx`, `src/app/(protected)/write-review/page.tsx`, `src/app/(public)/dish/[id]/page.tsx`, `src/components/features/DishSentimentCard.tsx` |
| `Portion` | 4 | `src/app/(protected)/compare/page.tsx`, `src/app/(protected)/write-review/page.tsx`, `src/app/(public)/dish/[id]/page.tsx`, `src/components/features/DishSentimentCard.tsx` |
| `Value` | 4 | `src/app/(protected)/compare/page.tsx`, `src/app/(protected)/write-review/page.tsx`, `src/app/(public)/dish/[id]/page.tsx`, `src/components/features/DishSentimentCard.tsx` |
| `Email` | 4 | `src/app/(auth)/forgot-password/page.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx`, `src/app/(protected)/settings/page.tsx` |
| `No reviews yet` | 3 | `src/app/(protected)/my-profile/page.tsx`, `src/app/(protected)/profile/[userId]/page.tsx`, `src/components/features/DishPhotoGrid.tsx` |
| `Badges` | 3 | `src/app/(protected)/my-profile/page.tsx`, `src/app/(protected)/profile/[userId]/page.tsx`, `src/components/features/PersonalStatsBanner.tsx` |
| `Reviews` | 3 | `src/app/(admin)/admin/page.tsx`, `src/app/(protected)/my-profile/page.tsx`, `src/app/(protected)/profile/[userId]/page.tsx` |
| `Cravia` | 3 | `src/components/ui/Logo.tsx`, `src/components/layouts/AdminShell.tsx`, `src/app/(protected)/upgrade/page.tsx` |
| `Users` | 3 | `src/app/(admin)/admin/page.tsx`, `src/app/(admin)/admin/users/page.tsx`, `src/components/layouts/AdminShell.tsx` |
| `Try again` | 2 | `src/app/error.tsx`, `src/app/(public)/dish/[id]/error.tsx` |
| `Upgrade to Premium` | 2 | `src/app/(protected)/upgrade/page.tsx`, `src/components/ui/UpgradePrompt.tsx` |
| `Something went wrong. Please try again.` | 2 | `src/app/(protected)/claim-restaurant/[id]/page.tsx`, `src/app/(protected)/rewards/page.tsx` |
| `Failed to load analytics` | 2 | `src/app/(protected)/restaurant-dashboard/[restaurantId]/dishes/page.tsx`, `src/app/(protected)/restaurant-dashboard/[restaurantId]/page.tsx` |
| `No notifications yet` | 2 | `src/app/(protected)/notifications/page.tsx`, `src/components/features/NotificationPopover.tsx` |
| `No dishes yet` | 2 | `src/app/(protected)/restaurant-dashboard/[restaurantId]/dishes/page.tsx`, `src/app/(public)/restaurant/[id]/page.tsx` |
| `Be the first to review this dish` | 2 | `src/app/(public)/dish/[id]/page.tsx`, `src/components/features/DishPhotoGrid.tsx` |
| `Approve` / `Reject` | 2 each | `src/app/(admin)/admin/requests/page.tsx`, `src/app/(admin)/admin/restaurant-claims/page.tsx` |
| `Display name` | 2 | `src/app/(auth)/signup/page.tsx`, `src/app/(protected)/settings/page.tsx` |
| `Password` | 2 | `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx` |
| `Search for a dish or restaurant...` | 1 (source) | `src/components/features/SearchBar.tsx` — but duplicated in 3 E2E test files |

---

## Section 1E — Magic Numbers and Values

Hardcoded numbers representing business rules or configuration. Sorted by impact.

### Pagination & Limits

| File | Line | Value | Meaning |
|------|------|-------|---------|
| `src/lib/constants/index.ts` | 106–107 | `10`, `20` | `REVIEWS_PER_PAGE`, `DISHES_PER_PAGE` (defined, but raw numbers used elsewhere) |
| `src/lib/repositories/typesense/typesenseDishRepository.ts` | 8 | `20` | `DEFAULT_PAGE_SIZE` (separate from `DISHES_PER_PAGE`) |
| `src/lib/services/catalog.ts` | 21 | `100`, `200` | Restaurant list default/max limit |
| `src/lib/firebase/notifications.ts` | 33 | `50` | Default notifications inbox cap |
| `src/lib/firebase/admin.ts` | 42, 85 | `100`, `50` | Admin user list / flagged reviews caps |
| `src/lib/firebase/dishes.ts` | 79 | `4` | Default related dishes count |
| `src/lib/firebase/dishes.ts` | 193 | `20` | Top dishes default cap |
| `src/lib/firebase/restaurants.ts` | 29 | `100` | Default restaurant list cap |
| `src/lib/services/google-places.ts` | 216, 255 | `20`, `100` | Places API page size / total max |
| `src/app/api/rewards/transactions/route.ts` | 11 | `20`, `50` | Default/max page size for points history |
| `src/app/api/admin/restaurant-claims/route.ts` | 17 | `100` | Admin claims page size |
| `src/components/features/NotificationPopover.tsx` | 16 | `5` | Preview limit |
| `src/components/features/ReviewCard.tsx` | 96, 100 | `2`, `60` | Max photo thumbnails; collapsed text length |
| `src/components/features/DishPhotoGrid.tsx` | 72 | `3` | Max photos in compact grid |
| `src/components/features/DishSentimentCard.tsx` | 16 | `8` | Max tags shown |

### Rating Scale

| File | Line | Value | Meaning |
|------|------|-------|---------|
| `src/lib/validation/review.schema.ts` | 4 | `1`, `5` | Sub-rating allowed range |
| `src/components/ui/StarRating.tsx` | 23, 70 | `[1,2,3,4,5]`, `5` | Five-star control + aria-label |
| `src/components/ui/SubRatingBar.tsx` | 14 | `5` | Bar denominator assumes 5-point scale |
| `src/lib/utils/index.ts` | 24 | `3` | Number of sub-ratings averaged |
| `src/app/(public)/dish/[id]/page.tsx` | 30, 69 | `5` | SEO "/5" and JSON-LD `bestRating` |

### ISR / Caching / Polling

| File | Line | Value | Meaning |
|------|------|-------|---------|
| `src/app/(public)/page.tsx` | 19 | `3600` | ISR revalidation (1 hour) |
| `src/app/(public)/dish/[id]/page.tsx` | 19 | `3600` | ISR revalidation (1 hour) |
| `src/app/(public)/restaurant/[id]/page.tsx` | 10 | `3600` | ISR revalidation (1 hour) |
| `src/app/(public)/cuisine/[slug]/page.tsx` | 8 | `3600` | ISR revalidation (1 hour) |
| `src/lib/services/analytics-cache.ts` | 6 | `60 * 60 * 1000` | Server analytics cache TTL (1 hour) |
| `src/components/features/NotificationPopover.tsx` | 43–44 | `120_000` | Poll unread count every 2 min |
| `src/app/providers.tsx` | 30–31 | `2 * 60 * 1000`, `1` | React Query `staleTime` (2 min), `retry: 1` |

### Upload / Content Limits

| File | Line | Value | Meaning |
|------|------|-------|---------|
| `src/lib/constants/index.ts` | 108–109 | `30`, `5` | `REVIEW_TEXT_MIN_CHARS`, `REVIEW_PHOTO_MAX_MB` |
| `src/lib/services/cloudinary.ts` | 5 | `30_000` | Upload timeout (ms) |

### Business Rules

| File | Line | Value | Meaning |
|------|------|-------|---------|
| `src/lib/constants/index.ts` | 99–102 | `19900`, `199900` | Plan prices in paise |
| `src/lib/constants/index.ts` | 105 | `86_400_000` | Review edit window (24h) |
| `src/lib/types/rewards.ts` | 64–69 | `10`, `25`, `2`, `7`, `30`, `500` | DishPoints config |
| `src/lib/services/rewards.ts` | 16–17, 27 | `250`, `450`, `5` | Milestone thresholds, min distinct words |
| `src/lib/rate-limit.ts` | 15–18 | `5/3600`, `10/60`, `3/60` | Rate limit tiers |
| `src/lib/gamification.ts` | 6–21 | `1`, `5`, `10`, `20`, `25`, `50` | Level/badge thresholds |
| `src/lib/auth/firebase-provider.ts` | 56, 88 | `300`, `128` | JWKS cache default max-age; JWT sub max length |
| `src/lib/hooks/useAuth.ts` | 12 | `604800` | Session cookie max-age (7 days) |
| `src/middleware.ts` | 4 | `2000` | Slow-request threshold (ms) |
| `src/lib/services/restaurant-analytics.ts` | 91 | `30` days | Review recency window |

### UI Display

| File | Line | Value | Meaning |
|------|------|-------|---------|
| `src/app/(public)/page.tsx` | 38–39 | `6`, `4` | Landing: top dishes, featured restaurants |
| `src/app/(public)/page.tsx` | 98 | `10` | Cuisine types shown on landing |
| `src/app/(public)/explore/page.tsx` | 121 | `12` | Cuisine picker count |
| `src/app/(public)/explore/explore-filters.tsx` | 263 | `6` | Area chips before "show all" |
| `src/app/(protected)/compare/page.tsx` | 61 | `5` | Max autocomplete results |
| `src/app/(auth)/signup/page.tsx` | 17–43 | `8` | Min password length |
| `src/app/(protected)/settings/page.tsx` | 92, 252 | `3000`, `8` | "Saved" toast timeout; password min |

---

## Section 1F — Hardcoded Error Messages

### Most-repeated API errors

| Error String | Occurrences | Files |
|-------------|------------|-------|
| `Unauthorized` | 20 | Every authenticated API route + `assert-admin.ts` + `assert-restaurant-owner.ts` |
| `Forbidden` | 4 | `notifications/[id]/read`, `users/[userId]/wishlist/[dishId]`, `users/[userId]/wishlist`, `assert-admin.ts` |
| `Failed to fetch data` | 3 | `restaurants/[id]/route.ts`, `restaurants/route.ts`, `dishes/route.ts` |
| `Restaurant not found` | 3 | `restaurants/[id]/route.ts`, `restaurants/[id]/analytics/route.ts`, `restaurants/[id]/claim/route.ts` |

### All unique API route error strings

| File | Line | Error String |
|------|------|-------------|
| `src/app/api/reviews/route.ts` | 30 | `User not found` |
| `src/app/api/reviews/route.ts` | 35 | `You have already reviewed this dish` |
| `src/app/api/reviews/route.ts` | 56, 132 | `Failed to create review` |
| `src/app/api/reviews/[id]/route.ts` | 25 | `Failed to update review or unauthorized` |
| `src/app/api/reviews/[id]/route.ts` | 38 | `dishId is required` |
| `src/app/api/reviews/[id]/route.ts` | 42 | `Failed to delete review or unauthorized` |
| `src/app/api/reviews/[id]/flag/route.ts` | 20 | `You have already flagged this review` |
| `src/app/api/reviews/[id]/flag/route.ts` | 22 | `Failed to flag review` |
| `src/app/api/reviews/[id]/helpful/route.ts` | 22 | `Failed to vote helpful` |
| `src/app/api/billing/verify/route.ts` | 29 | `Payment verification failed` |
| `src/app/api/billing/verify/route.ts` | 50 | `Failed to activate premium` |
| `src/app/api/billing/webhook/route.ts` | 44 | `Missing signature` |
| `src/app/api/billing/webhook/route.ts` | 50 | `Invalid signature` |
| `src/app/api/billing/webhook/route.ts` | 57 | `Invalid JSON` |
| `src/app/api/billing/webhook/route.ts` | 96 | `Webhook processing failed` |
| `src/app/api/notifications/[id]/read/route.ts` | 18 | `Notification not found` |
| `src/app/api/notifications/[id]/read/route.ts` | 26 | `Failed to mark notification as read` |
| `src/app/api/notifications/read-all/route.ts` | 13 | `Failed to mark notifications as read` |
| `src/app/api/admin/restaurant-claims/route.ts` | 43 | `claimId is required` |
| `src/app/api/admin/restaurant-claims/route.ts` | 53 | `Claim not found` |
| `src/app/api/admin/restaurant-claims/route.ts` | 58 | `Claim has already been reviewed` |
| `src/app/api/admin/restaurant-claims/route.ts` | 74 | `Restaurant already has an owner` |
| `src/app/api/admin/reviews/[id]/route.ts` | 113 | `Review not found` |
| `src/app/api/admin/reviews/[id]/route.ts` | 117 | `Dish not found` |
| `src/app/api/admin/reviews/[id]/route.ts` | 121 | `Review data is invalid` |
| `src/app/api/admin/dish-requests/[id]/route.ts` | 125 | `Dish request not found` |
| `src/app/api/admin/dish-requests/[id]/route.ts` | 129 | `Parent restaurant not found` |
| `src/app/api/admin/dish-requests/[id]/route.ts` | 133 | `Dish request data is invalid` |
| `src/app/api/admin/sync-typesense/route.ts` | 20 | `Typesense is not configured` |
| `src/app/api/restaurants/[id]/claim/route.ts` | 37 | `This restaurant already has a verified owner` |
| `src/app/api/restaurants/[id]/claim/route.ts` | 51 | `A pending claim already exists for this restaurant` |
| `src/app/api/rewards/redeem/route.ts` | 56 | `Coupon no longer available` |
| `src/app/api/rewards/redeem/route.ts` | 59 | `Insufficient DishPoints` |
| `src/lib/rate-limit.ts` | 137 | `Too many requests` |
| `src/lib/validation/index.ts` | 14 | `Validation failed` |

### Service / Firebase layer error strings

| File | Line | Error String |
|------|------|-------------|
| `src/lib/services/coupon.ts` | 24–28 | `Coupon not found`, `Coupon is no longer available`, `Coupon stock exhausted`, `Insufficient DishPoints`, `User not found` |
| `src/lib/services/cloudinary.ts` | 9, 12 | Missing env var errors |
| `src/lib/services/billing.ts` | 28 | `Razorpay credentials not configured` |
| `src/lib/auth/assert-admin.ts` | 16, 21 | `Missing authorization token`, `Invalid authorization header` |
| `src/lib/auth/firebase-provider.ts` | 51 | `Failed to fetch Firebase certs` |
| `src/lib/auth/firebase-provider.ts` | 119 | `Invalid token` |
| `src/lib/firebase/auth.ts` | 31, 53, 64 | `Sign in failed`, `Sign up failed`, `Failed to send reset email` |
| `src/lib/firebase/reviews.ts` | 132+ | `You have already reviewed…`, `Dish not found`, `User not found`, `Not found`, `Not authorized`, `Review not found` |

### Client-side toast/alert strings

| File | Line | Error String |
|------|------|-------------|
| `src/components/features/WishlistButton.tsx` | 51 | `Could not update wishlist` |
| `src/components/features/ReviewCard.tsx` | 69, 84 | `Could not mark as helpful`, `Could not report review` |
| `src/app/(protected)/wishlist/page.tsx` | 28 | `Could not remove dish from wishlist` |
| `src/app/(protected)/my-profile/page.tsx` | 45 | `Delete failed` |

---

## Section 1G — Inline Regex Patterns

Regex literals defined inline rather than as named constants.

### Production code

| File | Line | Pattern | Purpose |
|------|------|---------|---------|
| `src/lib/auth/firebase-provider.ts` | 41, 81 | `/-/g`, `/_/g` | Base64url normalization |
| `src/lib/auth/firebase-provider.ts` | 55 | `/max-age=(\d+)/` | Parse Cache-Control |
| `src/lib/auth/firebase-auth-provider.ts` | 20, 32, 55 | Same three as above | Duplicate JWT verify path |
| `src/lib/firebase/admin-server.ts` | 10 | `/\\n/g` | Env private key newline fix |
| `src/lib/services/rewards.ts` | 32 | `/\s+/` | Split text into words |
| `src/lib/utils/index.ts` | 124 | `/[\u0300-\u036f]/g` | Strip combining marks (slugify) |
| `src/lib/utils/index.ts` | 127 | `/[^\w\s-]/g` | Remove non-slug chars |
| `src/lib/utils/index.ts` | 128 | `/[\s_-]+/g` | Collapse separators |
| `src/lib/utils/index.ts` | 129 | `/^-+\|-+$/g` | Trim leading/trailing hyphens |
| `src/app/(auth)/signup/page.tsx` | 18–20 | `/[A-Z]/`, `/[0-9]/`, `/[^A-Za-z0-9]/` | Password strength checks |
| `src/app/(public)/cuisine/[slug]/page.tsx` | 16 | `/\s+/g` | Whitespace collapse for slug |
| `src/app/sitemap.ts` | 26 | `/\s+/g` | Same (duplicate) |
| `src/components/layouts/AuthScreenDismiss.tsx` | 14 | `/^[a-zA-Z][a-zA-Z0-9+.-]*:/` | Absolute URL scheme detection |
| `src/components/layouts/AuthScreenDismiss.tsx` | 15 | `/[\r\n<>]/` | Reject suspicious chars |

### Priority extractions

- **Slugify regex set** (4 patterns in `utils/index.ts`) → `SLUG_PATTERNS` constant
- **Base64url pair** (`/-/g`, `/_/g`) → used in 2 files with identical logic → shared helper
- **Password strength** (3 patterns) → `PASSWORD_RULES` constant

---

## Section 2 — Files With More Than One Responsibility

| File | Lines | Primary | Secondary Responsibilities | Suggested Split |
|------|------:|---------|---------------------------|-----------------|
| `src/app/(protected)/write-review/page.tsx` | 513 | Multi-step review UI | Data fetching, submit/update via fetch, Cloudinary upload, gamification, sessionStorage, navigation guards | `useWriteReviewFlow` hook, step components (`ReviewPhotoStep`, `ReviewRatingsStep`, `ReviewTextStep`), API client |
| `src/lib/firebase/reviews.ts` | 415 | Firestore review access | Cross-entity writes (dishes, users — aggregates, levels, badges), helpful votes, topTags recompute | `reviewSideEffects.ts` for cross-entity updates; keep thin CRUD in `reviews.ts` |
| `src/lib/firebase/reviews-admin.ts` | 320 | Admin SDK review ops | Same cross-entity orchestration as `reviews.ts` | Mirror split; shared "recompute dish averages" pure helpers |
| `src/components/features/DishPhotoGrid.tsx` | 308 | Photo grid + lightbox | Inline SVG illustration, empty state, sort logic, keyboard handling, CTA link building | `DishPhotoLightbox`, `DishPhotoEmptyState`, `usePhotoLightbox` hook |
| `src/app/(admin)/admin/coupons/page.tsx` | 292 | Admin coupons screen | Token + fetch load/create/delete, inline form types, stock/code validation | `useAdminCoupons` hook, `AdminCouponForm` component |
| `src/lib/services/google-places.ts` | 281 | Places API client | Inline response types, `extractArea`/`extractCity`/`inferCuisines` mappers | `google-places/types.ts`, `google-places/mappers.ts`, slim `client.ts` |
| `src/app/(protected)/rewards/page.tsx` | 287 | Rewards UI | Parallel fetch, redeem POST, tab state, toast orchestration | `useRewardsData` + `useRedeemCoupon` hooks; presentational subcomponents |
| `src/app/(protected)/settings/page.tsx` | 270 | Settings layout | Profile save, Cloudinary avatar upload, Firebase password change, city context sync | `ProfileForm`, `PasswordChangeSection`, `useAvatarUpload` |
| `src/components/features/ReviewCard.tsx` | 267 | Review presentation | Optimistic helpful/flag fetch, lightbox/expand | `useReviewActions` hook, `ReviewPhotoLightbox` |
| `src/lib/repositories/firebase/firebaseCouponRepository.ts` | 249 | Coupon repository | Doc-to-model mappers, CRUD + transactional claims under user subcollection | `couponMappers.ts`; optional `CouponClaimRepository` |
| `src/components/features/NotificationPopover.tsx` | 235 | Popover shell | Unread polling, REST, mark-all-read, embedded row/skeleton/empty SVG | `useNotificationPreview` + `useUnreadCount` hooks; separate row/skeleton files |
| `src/app/(public)/dish/[id]/page.tsx` | 233 | Dish detail route | `generateMetadata`, parallel server loads, JSON-LD, review-to-photo mapping | `buildDishJsonLd`, `getDishPageData` server helper |
| `src/lib/services/rewards.ts` | 232 | DishPoints awarding | Point rules, text quality, streak math, notifications, emails | `reviewPointsRules.ts`, `streak.ts`; keep `rewardPointsForReview` as orchestrator |
| `src/lib/services/restaurant-analytics.ts` | 209 | Restaurant analytics | Firestore reads, aggregation, cache, exported types | `analyticsTypes.ts`, `aggregateRestaurantReviews.ts` |
| `src/app/(protected)/upgrade/page.tsx` | 209 | Premium marketing UI | Razorpay order/verify fetch, global Window typing, payment flow | `useRazorpayCheckout` hook; `PricingCard` component |
| `src/app/(protected)/onboarding/page.tsx` | 218 | Onboarding wizard | `updateUser` persistence, cuisine/city/area state machine | Step components + `useOnboardingSave` |

### Borderline (~200 lines, mixed concerns)

| File | Lines | Note |
|------|------:|------|
| `src/lib/services/email.ts` | 174 | Resend transport + HTML templates + multiple senders — split transport vs templates |
| `src/app/(protected)/compare/page.tsx` | 192 | Inline `DishPicker` + debounced search — extract picker + `useCompareSearch` |
| `src/app/(protected)/my-profile/page.tsx` | 180 | Delete fetch, level progress math, badge lists — extract `useReviewMutations` |

---

## Section 3 — Constants File Audit

### What `src/lib/constants/index.ts` already defines (~192 lines)

| Category | Constants |
|----------|----------|
| Review tags | `TAG_LIST`, `TAG_GROUPS` |
| Ratings | `RATING_LABELS` |
| Gamification | `BADGE_DEFINITIONS`, `LEVEL_THRESHOLDS` |
| Taxonomies | `CUISINE_TYPES`, `SUPPORTED_CITIES`, `CITY_AREAS` |
| Commerce | `PLAN_PRICES` (paise) |
| Review/dish limits | `REVIEW_EDIT_WINDOW_MS`, `REVIEWS_PER_PAGE`, `DISHES_PER_PAGE`, `REVIEW_TEXT_MIN_CHARS`, `REVIEW_PHOTO_MAX_MB`, `REVIEW_PHOTO_MAX_COUNT`, `FIRESTORE_BATCH_LIMIT` |
| Dish taxonomy | `DISH_CATEGORIES` |
| Display maps | `PRICE_LABEL`, `DIETARY_BADGE`, `DIETARY_ICON`, `LEVEL_COLORS`, `CUISINE_EMOJI` |

### What is missing (based on Section 1 findings)

| Missing Category | What to add | Priority |
|-----------------|-------------|----------|
| **Route paths** | `ROUTES` object with all app paths | High — `/explore` alone appears in 21 files |
| **API endpoints** | `API_ENDPOINTS` object with all fetch paths | High — 30+ client fetch sites |
| **Error messages** | `ERROR_MESSAGES` / `API_ERRORS` object | Medium — `Unauthorized` in 20 files |
| **ISR / polling config** | `REVALIDATE_SECONDS`, `POLL_INTERVAL_MS` | Medium — `3600` in 4 pages |
| **Rating scale** | `MAX_RATING = 5`, `SUB_RATING_LABELS = ['Taste', 'Portion', 'Value']` | Medium — hardcoded in 4+ files each |
| **UI display limits** | `LANDING_TOP_DISHES`, `LANDING_FEATURED_RESTAURANTS`, `CUISINE_PREVIEW_COUNT`, etc. | Low |
| **Password rules** | `MIN_PASSWORD_LENGTH`, password regex constants | Low |
| **Regex patterns** | `SLUG_PATTERNS`, `BASE64URL_PATTERNS`, `PASSWORD_PATTERNS` | Low |

### Should it be split?

At 192 lines with section grouping, the file is manageable. However, as constants grow from this audit, splitting by domain would reduce merge noise:

| Proposed file | Contents |
|---------------|----------|
| `constants/routes.ts` | `ROUTES`, `PROTECTED_PATHS` |
| `constants/api.ts` | `API_ENDPOINTS` |
| `constants/errors.ts` | `ERROR_MESSAGES`, `API_ERRORS` |
| `constants/config.ts` | ISR times, polling intervals, limits, password rules |
| `constants/index.ts` | Re-export barrel + existing tags/gamification/taxonomy |

**Note:** `COLLECTIONS` / `SUBCOLLECTIONS` already live in `src/lib/firebase/config.ts` (correct location per `.cursorrules`). The missing `cache` subcollection should be added there, not in constants.

---

## Section 4 — Duplicate String Literals (3+ files)

Strings appearing in 3+ distinct files — highest-priority extraction candidates.

### Route paths

| String | Files | Priority |
|--------|------:|----------|
| `/explore` | 21 | **Critical** |
| `/login` | 9 | **High** |
| `/my-profile` | 7 | **High** |
| `/notifications` | 5 | High |
| `/rewards` | 5 | High |
| `/settings` | 5 | High |
| `/signup` | 5 | High |
| `/wishlist` | 5 | High |
| `/home` | 4 | Medium |
| `/write-review` | 4 | Medium |

### Error / auth strings

| String | Files | Priority |
|--------|------:|----------|
| `Unauthorized` | 20 | **Critical** |
| `highest-rated` | 12 | **High** — sort key used across all layers |
| `most-helpful` | 7 | **High** |
| `newest` | 6 | **High** |
| `already_flagged` | 6 | High |
| `Forbidden` | 4 | Medium |

### HTTP headers

| String | Files | Priority |
|--------|------:|----------|
| `application/json` | 11 | **High** — extract as `CONTENT_TYPE_JSON` |
| `content-type` | 10 | **High** — extract as `HEADER_CONTENT_TYPE` |

### Firestore collection names (in tests)

| String | Files | Note |
|--------|------:|------|
| `dishes` | 10 | 1 in `config.ts` (definition), rest in tests |
| `Bengaluru` | 10 | Default city — used in tests, components, context |
| `wishlist` | 9 | 1 in `config.ts`, rest in tests |
| `users` | 7 | 1 in `config.ts`, rest in tests |
| `reviews` | 8 | 1 in `config.ts`, rest in tests |
| `notifications` | 7 | 1 in `config.ts`, rest in tests |
| `restaurants` | 7 | 1 in `config.ts`, rest in tests |
| `dishRequests` | 7 | 1 in `config.ts`, rest in tests |
| `couponClaims` | 5 | 1 in `config.ts`, rest in tests |
| `pointTransactions` | 5 | 1 in `config.ts`, rest in tests |

### Domain enum values

| String | Files | Priority |
|--------|------:|----------|
| `approve` / `reject` | 6 / 4 | Medium — action strings |
| `pending` / `approved` / `rejected` | 6 / 4 / 3 | Medium — status strings |
| `veg` / `non-veg` | 6 / 5 | Medium — dietary enum |
| `flat` | 7 | Medium — coupon type |
| `GENERAL` | 6 | Medium — rate limit tier |
| `monthly` | 3 | Low — billing plan |

### Gamification labels

| String | Files | Priority |
|--------|------:|----------|
| `Foodie` / `Critic` / `Legend` / `Newbie` | 6 / 4 / 5 / 5 | Medium — level names (partially in constants but also in types + gamification + UI) |
| Badge IDs: `first-bite`, `dish-explorer`, `food-critic`, `helpful`, `legend`, `regular`, `trusted` | 3 each | Low — already in `BADGE_DEFINITIONS` |

### UI copy

| String | Files | Priority |
|--------|------:|----------|
| `Taste` / `Portion` / `Value` | 4 / 4 / 5 | **High** — sub-rating labels, extract as `SUB_RATING_LABELS` |
| `Something went wrong` | 4 | Medium |
| `Explore dishes` | 4 | Medium |
| `Sign in` | 3+ | Low |
| `Reviews` / `Badges` / `Users` | 3 each | Low |
| `Search for a dish or restaurant...` | 4 (incl. tests) | Low |

### Price range values

| String | Files | Priority |
|--------|------:|----------|
| `under-100`, `100-200`, `200-400`, `400-600`, `above-600` | 4 each | Medium — already in constants but also in types + validation + UI |

---

## Summary — Top 10 Highest-ROI Extractions

| Rank | What | Files Affected | Suggested Constant |
|------|------|---------------:|-------------------|
| 1 | `/explore` and other route paths | 21+ | `ROUTES.EXPLORE`, `ROUTES.LOGIN`, etc. |
| 2 | `Unauthorized` and common API errors | 20+ | `API_ERRORS.UNAUTHORIZED`, `.FORBIDDEN`, etc. |
| 3 | `highest-rated`, `newest`, `most-helpful` sort keys | 12/7/6 | `SORT_OPTIONS` enum |
| 4 | `application/json` / `content-type` headers | 11/10 | `HTTP_HEADERS` constants |
| 5 | Collection names in tests | 7–10 each | Import `COLLECTIONS` / `SUBCOLLECTIONS` from config |
| 6 | ISR `revalidate = 3600` | 4 pages | `CONFIG.ISR_REVALIDATE_SECONDS` |
| 7 | `Taste`, `Portion`, `Value` sub-rating labels | 4–5 | `SUB_RATING_LABELS` tuple |
| 8 | Rating scale `5` | 6+ files | `MAX_RATING = 5` |
| 9 | `approve` / `reject` / `pending` status strings | 4–6 | `CLAIM_STATUS` / `REQUEST_ACTION` enums |
| 10 | `captureError` route strings in API handlers | 35+ | Auto-derive from `import.meta.url` or file path |

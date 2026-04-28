# Cravia (DishCheck) — Engineering Documentation

**Last updated:** April 2026
**Audience:** Senior engineers onboarding to the team

---

## 1. System Overview

### High-Level Architecture

```
┌───────────────────────────────────────────────────────────────────────────┐
│                            Vercel (Edge + Serverless)                      │
│                                                                           │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────────────┐  │
│  │  Next.js 16  │   │  API Routes  │   │  Edge Middleware             │  │
│  │  Pages (SSR/ │   │  /api/*      │   │  (auth guard, timing)        │  │
│  │  ISR/CSR)    │   │  (serverless │   └──────────────────────────────┘  │
│  └──────┬───────┘   │   functions) │                                     │
│         │           └──────┬───────┘                                     │
│         │ reads            │ reads + writes                               │
│         ▼                  ▼                                              │
│  ┌───────────────────────────────────────────────────┐                   │
│  │              Repository Layer                      │                   │
│  │         (src/lib/repositories/)                    │                   │
│  └────────────┬──────────────────────┬───────────────┘                   │
│               │                      │                                    │
│       ┌───────┘                      └────────┐                           │
│       ▼                                       ▼                           │
│  ┌───────────┐   ┌────────────┐   ┌─────────────────┐                   │
│  │ Firebase  │   │ Firebase   │   │   Typesense     │                   │
│  │ Client SDK│   │ Admin SDK  │   │ (full-text      │                   │
│  │ (reads)   │   │ (writes)   │   │  search)        │                   │
│  └─────┬─────┘   └─────┬──────┘   └────────┬────────┘                   │
└────────┼────────────────┼───────────────────┼────────────────────────────┘
         │                │                   │
         ▼                ▼                   ▼
┌─────────────────────────────────────┐  ┌──────────────┐
│        Cloud Firestore              │  │  Typesense   │
│  restaurants · dishes · reviews     │  │  Cloud/Self- │
│  users · notifications · coupons    │  │  hosted      │
│  billingEvents · restaurantClaims   │  └──────────────┘
└─────────────────────────────────────┘

External Services:
  Cloudinary       ← photo uploads (reviews, avatars)
  Razorpay         ← premium subscription payments
  Resend           ← transactional email (milestones, coupons)
  Sentry           ← error tracking + performance monitoring
  Upstash Redis    ← rate limiting + analytics cache
  Google Places    ← restaurant data ingestion (scripts)
```

### Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16.2.1 (App Router) | Server Components for catalog SEO, API routes co-located, ISR for performance, edge middleware |
| Language | TypeScript (strict) | Type safety across full stack, shared types between client/server |
| Database | Cloud Firestore | Serverless-native, real-time listeners, zero-ops scaling, generous free tier |
| Auth | Firebase Auth (Google + email) | Tight Firestore integration, handles OAuth flows, free tier covers early scale |
| Search | Typesense | Open-source, typo-tolerant, fast (<50ms), cheaper than Algolia, self-hostable |
| Client state | Zustand | Minimal boilerplate, no providers needed, tiny bundle (~1KB) |
| Server state | TanStack Query v5 | Cache invalidation, background refetch, optimistic updates, stale-while-revalidate |
| Styling | Tailwind CSS v4 | CSS-first config, zero-runtime, design tokens via CSS vars |
| UI primitives | shadcn/ui (base-nova) | Copy-paste ownership, tree-shakeable, accessible by default |
| Image uploads | Cloudinary | Unsigned presets, CDN delivery, auto-optimization |
| Payments | Razorpay | India-focused, UPI support, webhook-based flow |
| Email | Resend | Developer-friendly API, reliable delivery, affordable |
| Rate limiting | Upstash Redis | Serverless Redis, sliding window algorithm, global edge |
| Error tracking | Sentry | Sourcemaps, replay, performance traces, Next.js plugin |
| Deployment | Vercel | Zero-config Next.js, preview deploys, instant rollbacks |
| Package manager | pnpm 10.33.0 | Faster installs, strict dependency resolution, disk efficient |

### Key Architectural Decisions

1. **Server-mediated writes**: All mutations (reviews, votes, rewards, billing) go through `/api/*` routes. Client SDK is restricted to reads and two sanctioned self-writes (user creation, profile update). This ensures validation, rate limiting, and side effects (notifications, Typesense sync, rewards) are centralized.

2. **Repository pattern as abstraction boundary**: Firestore access is behind interfaces. Typesense is injected as an alternative `search()` implementation when configured. This allows swapping data sources without touching business logic.

3. **Graceful degradation over hard dependencies**: Every optional service (Typesense, Upstash, Razorpay, Resend, Sentry, Cloudinary) has a fallback or disabled state when env vars are absent. The app boots and runs with only Firebase.

4. **ISR for catalog pages, CSR for interactive pages**: Public pages (dish detail, restaurant, explore) use ISR with 1-hour revalidation for SEO and performance. Protected pages (write-review, settings, admin) are client components for real-time auth state.

### Request Lifecycle (Write Example: Create Review)

```
1. Client: User submits review form
2. Client: Upload photo to Cloudinary (direct, unsigned preset)
3. Client: fetch('/api/reviews', { method: 'POST', headers: { Authorization: 'Bearer <idToken>' }, body: JSON })
4. Middleware: Checks path matches, passes through (timing logged)
5. API Route (src/app/api/reviews/route.ts):
   a. getRequestAuth(req) → verify Firebase ID token via Admin SDK → { userId, isAdmin, userCity }
   b. checkRateLimit(userId, 'REVIEW_CREATE') → Upstash sliding window (5/hour)
   c. parseBody(createReviewSchema, body) → Zod validation
   d. reviewRepository.create(data) → Firestore transaction (review + dish stats update)
   e. rewardPointsForReview(userId, reviewId, ...) → point transaction + milestone notifications
   f. syncRestaurantToTypesense(restaurantId) → upsert search index
   g. invalidateAnalyticsCache(restaurantId) → delete Redis + Firestore cache
6. Response: 201 { review, transactions, totalPointsAwarded }
```

---

## 2. Repository Structure

### Full Folder Structure

```
cravia/
├── .cursor/rules/              # Cursor IDE rules (v2-backlog auto-append)
├── .github/workflows/ci.yml    # GitHub Actions: lint, typecheck, test, sentry release
├── docs/
│   ├── ENGINEERING.md          # This document
│   ├── REWARDS_SYSTEM.md       # DishPoints spec
│   ├── RUNBOOK.md              # Operational procedures
│   ├── TODO.md                 # Known issues
│   ├── V2.md                   # Deferred backlog
│   ├── state-audit.md          # State management analysis
│   ├── constants-audit.md      # Constants duplication analysis
│   └── app-flows.json          # Machine-readable page flow map
├── prototypes/                 # Static HTML UI explorations (not shipped)
├── public/                     # Static assets, PWA manifest, robots.txt, og-image
├── scripts/                    # Data operations (seed, sync, ingest, backfill)
│   ├── data/                   # JSON seed data
│   ├── ingest-google-places.ts # Import from Google Places API
│   ├── sync-typesense.ts       # Full Typesense re-sync
│   ├── seed-cities.ts          # City data seeding
│   └── backfill-*.ts           # Schema migration scripts
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/           # Unauthenticated pages
│   │   ├── (protected)/        # Authenticated user pages
│   │   ├── (auth)/             # Login, signup, forgot-password
│   │   ├── (admin)/            # Admin dashboard
│   │   ├── api/                # 33 API route handlers
│   │   ├── layout.tsx          # Root layout (fonts, metadata, Providers)
│   │   ├── providers.tsx       # Client provider tree
│   │   ├── globals.css         # Tailwind v4 + design tokens + animations
│   │   └── sw.ts               # Service worker (Serwist)
│   ├── components/
│   │   ├── ui/                 # 22 reusable UI primitives
│   │   ├── features/           # 22 feature-specific components
│   │   └── layouts/            # Navbar, Footer, PageShell, AdminShell
│   ├── lib/
│   │   ├── auth/               # Token verification (firebase-auth-provider, assert-admin, assert-restaurant-owner)
│   │   ├── constants/          # Routes, API endpoints, errors, tags, badges, cities
│   │   ├── context/            # (reserved for future use)
│   │   ├── firebase/           # Low-level Firestore CRUD (client SDK)
│   │   ├── hooks/              # 7 custom hooks (useAuth, useWishlist, useMyReviews, etc.)
│   │   ├── monitoring/         # Sentry wrapper (captureError, addBreadcrumb)
│   │   ├── repositories/       # Repository interfaces + Firebase/Typesense implementations
│   │   ├── services/           # Business logic (rewards, billing, email, cloudinary, google-places)
│   │   ├── store/              # Zustand stores (auth, wishlist, reviewForm)
│   │   ├── types/              # All TypeScript interfaces (index.ts, rewards.ts)
│   │   ├── utils/              # Pure utilities (cn, formatters)
│   │   └── validation/         # Zod schemas per domain (review, billing, admin, etc.)
│   ├── middleware.ts           # Edge middleware (auth guard, timing)
│   ├── instrumentation.ts     # Sentry server/edge init
│   ├── instrumentation-client.ts # Sentry client init
│   └── __tests__/             # Vitest unit + Playwright e2e
├── firestore.rules             # Security rules (human-authored)
├── firestore.indexes.json      # 16 composite indexes
├── firebase.json               # Firebase project config + emulator ports
├── next.config.ts              # Next.js + Sentry + Serwist config
├── vitest.config.ts            # Unit test config
├── playwright.config.ts        # E2E test config
└── package.json                # Dependencies + scripts
```

### Naming Conventions

| Category | Convention | Example |
|----------|-----------|---------|
| Pages | `page.tsx` (Next.js convention) | `src/app/(public)/dish/[id]/page.tsx` |
| Components | PascalCase | `DishCard.tsx`, `StarRating.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts`, `useWishlist.ts` |
| Stores | camelCase with `Store` suffix | `authStore.ts`, `wishlistStore.ts` |
| Services | camelCase, domain-named | `billing.ts`, `rewards.ts`, `email.ts` |
| Schemas | camelCase with `.schema.ts` suffix | `review.schema.ts`, `billing.schema.ts` |
| Types | PascalCase interfaces, `type` for unions | `Restaurant`, `DishCategory` |
| Constants | UPPER_SNAKE_CASE for values, camelCase for objects | `POINTS_REVIEW_BASIC`, `ROUTES` |
| API routes | kebab-case folders | `/api/admin/sync-typesense/route.ts` |

### Key Entry Points

- **App shell**: `src/app/layout.tsx` → `src/app/providers.tsx`
- **Middleware**: `src/middleware.ts`
- **API auth**: `src/lib/services/request-auth.ts` → `src/lib/auth/firebase-auth-provider.ts`
- **Repositories**: `src/lib/repositories/index.ts` (client), `src/lib/repositories/server.ts` (server-only)
- **Constants**: `src/lib/constants/index.ts` (re-exports all)
- **Types**: `src/lib/types/index.ts` + `src/lib/types/rewards.ts`
- **Environment**: `src/lib/env.ts` (Zod-validated)

### Layer Separation

| Concern | Location |
|---------|----------|
| UI (primitives) | `src/components/ui/` |
| UI (features) | `src/components/features/` |
| UI (layouts) | `src/components/layouts/` |
| Page routing | `src/app/(public\|protected\|auth\|admin)/` |
| Business logic | `src/lib/services/` |
| Data access | `src/lib/repositories/` → `src/lib/firebase/` |
| Request handling | `src/app/api/` |
| Validation | `src/lib/validation/` |
| State | `src/lib/store/` + `src/lib/hooks/` |

---

## 3. Frontend Architecture

### Routing Strategy

The App Router uses **route groups** for layout and auth boundaries:

| Route Group | Purpose | Layout Behavior |
|-------------|---------|-----------------|
| `(public)` | SEO-optimized catalog | `PageShell` (Navbar + Footer) |
| `(auth)` | Login/signup flows | Minimal wrapper (no nav) |
| `(protected)` | Authenticated user features | `AuthGate` + `PageShell`, `noindex` meta |
| `(admin)` | Admin dashboard | `AdminShell` with admin nav, isAdmin gate |

### Rendering Strategy Per Page

| Page | Route | Strategy | Rationale |
|------|-------|----------|-----------|
| Landing | `/` | ISR (1h) | SEO + catalog stats, stale acceptable |
| Explore | `/explore` | Dynamic RSC | searchParams-driven, real-time results |
| Restaurant detail | `/restaurant/[id]` | ISR (1h) | SEO, rarely changes |
| Dish detail | `/dish/[id]` | ISR (1h) | SEO, reviews cached |
| Cuisine listing | `/cuisine/[slug]` | ISR (1h) | SEO, curated content |
| Review detail | `/review/[id]` | Dynamic RSC | No static generation list |
| Login/Signup | `/login`, `/signup` | CSR | Interactive auth forms |
| Write Review | `/write-review` | CSR | Multi-step form with uploads |
| My Profile | `/my-profile` | CSR | User-specific data |
| Settings | `/settings` | CSR | Form interactions |
| Wishlist | `/wishlist` | CSR | User-specific, TanStack Query |
| Rewards | `/rewards` | CSR | User-specific, real-time balance |
| Upgrade | `/upgrade` | CSR | Razorpay checkout integration |
| Compare | `/compare` | CSR | Premium feature, search-driven |
| Notifications | `/notifications` | CSR | Real-time updates |
| Admin (all) | `/admin/*` | CSR | Admin-gated, data-heavy |
| Restaurant Dashboard | `/restaurant-dashboard/[id]` | CSR | Owner analytics |

### State Management

| Type | Technology | Scope | Files |
|------|-----------|-------|-------|
| Auth state | Zustand (`useAuthStore`) | Global, persists across pages | `src/lib/store/authStore.ts` |
| Wishlist IDs | Zustand (`useWishlistStore`) | Optimistic UI tracking | `src/lib/store/wishlistStore.ts` |
| Review form | Zustand (`useReviewFormStore`) | Single form session | `src/lib/store/reviewFormStore.ts` |
| Server data | TanStack Query v5 | Cached async, auto-refetch | `useWishlist`, `useMyReviews`, `useRestaurantAnalytics` |
| City | Hardcoded constant | Single-city (Gurugram) | `src/lib/services/city.ts` |
| URL state | `searchParams` | Page-scoped, shareable | Explore filters, search query |
| Local state | `useState` | Component-scoped | Forms, toggles, modals |

**TanStack Query configuration** (from `providers.tsx`):
- `staleTime`: configurable via `CONFIG.REACT_QUERY_STALE_TIME_MS`
- `retry: 1`
- `refetchOnWindowFocus: false`

### Component Hierarchy

```
<html> (Root Layout - Server)
└── <Providers> (Client)
    ├── ThemeProvider (next-themes)
    ├── QueryClientProvider (TanStack)
    └── AuthProvider (Firebase auth subscription)
        └── <body>
            ├── PageShell / AdminShell (Layout)
            │   ├── Navbar (SearchBar, NotificationPopover, avatar)
            │   ├── {children} (Page content)
            │   └── Footer
            └── Toaster (sonner)
```

### Styling Architecture

**Tailwind CSS v4** with CSS-first configuration (no `tailwind.config.ts`):

- **Theme tokens** defined in `src/app/globals.css` via `@theme inline { ... }`
- **CSS custom properties** in `:root` / `.dark` for colors
- **Design token classes**: `text-heading`, `text-text-primary`, `bg-card`, `bg-surface-2`, `text-primary`, `border-border`, etc.
- **shadcn component variants** via `class-variance-authority` (cva)
- **Utility composition** via `tailwind-merge` + `clsx` (exported as `cn()` from `src/lib/utils.ts`)

**Strict color rule**: No hardcoded hex/rgb values anywhere. All colors reference CSS variables from `globals.css`.

### Design System (UI Components)

| Component | File | Purpose |
|-----------|------|---------|
| Button | `button.tsx` | Primary action element (variants: default, destructive, outline, secondary, ghost, link) |
| Input | `input.tsx` | Text input field |
| Label | `label.tsx` | Form label |
| Badge | `badge.tsx` | Status/tag indicator |
| Select | `select.tsx` | Dropdown selection |
| Sheet | `sheet.tsx` | Slide-over panel |
| DropdownMenu | `dropdown-menu.tsx` | Action menu |
| Popover | `popover.tsx` | Floating content |
| Card | `Card.tsx` | Content container (Header, Title, Content, Footer) |
| Avatar | `Avatar.tsx` | User image with fallback, group support |
| Logo | `Logo.tsx` | Brand mark + wordmark |
| EmptyState | `EmptyState.tsx` | Zero-data placeholder |
| LoadingSpinner | `LoadingSpinner.tsx` | Loading indicator |
| SkeletonCard | `SkeletonCard.tsx` | Content placeholder |
| StarRating | `StarRating.tsx` | 1-5 star display/input |
| SubRatingBar | `SubRatingBar.tsx` | Horizontal rating bar (taste/portion/value) |
| TagPill | `TagPill.tsx` | Selectable tag chip |
| TagCloud | `TagCloud.tsx` | Collection of TagPills |
| AnimateReveal | `AnimateReveal.tsx` | Scroll-triggered entrance animations |
| MobileBackButton | `MobileBackButton.tsx` | Navigation back action |
| ThemeToggle | `ThemeToggle.tsx` | Light/dark mode switch |
| UpgradePrompt | `UpgradePrompt.tsx` | Premium upsell card |

### Frontend Authentication

1. `AuthProvider` subscribes to Firebase `onAuthStateChanged`
2. On sign-in: fetch/create user doc via `userRepository`, populate `useAuthStore`
3. Set `__session` cookie (HTTP-only not possible from client — used as UX signal only)
4. Sync city cookie from user profile
5. Middleware reads `__session` cookie presence for redirect decisions (UX guard only, not security)
6. API calls include `Authorization: Bearer <idToken>` header
7. On sign-out: clear store, clear cookies

---

## 4. Backend Architecture

### API Route Structure

33 route handlers organized by domain:

```
src/app/api/
├── reviews/
│   ├── route.ts              POST (create)
│   └── [id]/
│       ├── route.ts          PATCH (edit), DELETE
│       ├── helpful/route.ts  POST (vote)
│       └── flag/route.ts     POST (flag)
├── restaurants/
│   ├── route.ts              GET (search)
│   └── [id]/
│       ├── route.ts          GET (detail)
│       ├── dishes/route.ts   GET (menu)
│       ├── claim/route.ts    POST (ownership claim)
│       └── analytics/route.ts GET (owner dashboard)
├── dishes/
│   ├── route.ts              GET (search/list)
│   └── [id]/reviews/route.ts GET (dish reviews)
├── cities/route.ts           GET (supported cities)
├── users/[userId]/wishlist/
│   ├── route.ts              GET
│   └── [dishId]/route.ts     POST, DELETE
├── notifications/
│   ├── unread-count/route.ts GET
│   ├── read-all/route.ts     POST
│   └── [id]/read/route.ts    POST
├── rewards/
│   ├── balance/route.ts      GET
│   ├── coupons/route.ts      GET (catalog)
│   ├── claims/route.ts       GET (user claims)
│   ├── redeem/route.ts       POST
│   └── transactions/route.ts GET (history)
├── billing/
│   ├── create-order/route.ts POST
│   ├── verify/route.ts       POST
│   └── webhook/route.ts      POST (Razorpay callback)
└── admin/
    ├── sync-typesense/route.ts       POST
    ├── users/[userId]/role/route.ts  PATCH
    ├── users/[userId]/premium/route.ts PATCH
    ├── reviews/[id]/route.ts         PATCH, DELETE
    ├── restaurants/[id]/invalidate-cache/route.ts POST
    ├── restaurant-claims/route.ts    GET, PATCH
    ├── dish-requests/[id]/route.ts   PATCH
    └── coupons/
        ├── route.ts                  GET, POST
        └── [id]/route.ts            DELETE
```

### Authentication/Authorization Model

Three auth functions, layered by access level:

| Function | File | Returns | Usage |
|----------|------|---------|-------|
| `getRequestAuth(req)` | `src/lib/services/request-auth.ts` | `{ userId, isAdmin, userCity } \| null` | All authenticated routes |
| `assertAdmin(req)` | `src/lib/auth/assert-admin.ts` | `{ userId }` or throws `AdminAuthError` | Admin-only routes |
| `assertRestaurantOwner(req, restaurantId)` | `src/lib/auth/assert-restaurant-owner.ts` | `{ userId, restaurantId }` or throws | Owner dashboard |

**Token verification flow** (`getRequestAuth`):
1. Extract Bearer token from `Authorization` header
2. `FirebaseAuthProvider.verifyToken(token)` — RS256 signature check against Google x509 certs, validates `aud`, `iss`, `exp`
3. `userRepository.getById(userId)` (React `cache()` deduped per request)
4. Return `{ userId, isAdmin: user.isAdmin, userCity: user.city }`

**`assertAdmin` additionally**: Checks Firebase custom claims `isAdmin === true` AND Firestore `users/{uid}.isAdmin === true` (defense-in-depth).

### Input Validation

All request bodies validated with Zod via `parseBody<T>(schema, data)`:

```typescript
// src/lib/validation/index.ts
export function parseBody<T>(schema: ZodSchema<T>, data: unknown):
  | { success: true; data: T }
  | { success: false; response: NextResponse }
```

Returns 400 with `{ message: API_ERRORS.VALIDATION_FAILED, fieldErrors: [...] }` on failure.

**Schemas per domain:**
- `review.schema.ts` — `createReviewSchema`, `updateReviewSchema`
- `billing.schema.ts` — `createOrderSchema`, `verifyPaymentSchema`
- `restaurant-claim.schema.ts` — `submitClaimSchema`, `reviewClaimSchema`
- `dish.schema.ts` — `dishSearchParamsSchema`
- `coupon.schema.ts` — `redeemCouponSchema`, `createCouponSchema`
- `admin.schema.ts` — `toggleAdminSchema`, `togglePremiumSchema`, `dishRequestActionSchema`
- `user.schema.ts` — `userProfileUpdateSchema`

### Error Handling

Consistent JSON error responses using centralized constants:

```typescript
// Pattern in every API route:
try {
  // ... business logic
} catch (error) {
  if (error instanceof AdminAuthError) {
    return NextResponse.json({ message: error.message }, { status: error.status })
  }
  captureError(error, { route: '...', extra: { ... } })
  return NextResponse.json({ message: API_ERRORS.INTERNAL_ERROR }, { status: 500 })
}
```

**Error codes (from `src/lib/constants/errors.ts`):**
- 400: `VALIDATION_FAILED`, `MISSING_FIELDS`
- 401: `UNAUTHORIZED`
- 403: `FORBIDDEN`, `NOT_PREMIUM`
- 404: `NOT_FOUND`
- 409: `ALREADY_REVIEWED`, `COUPON_EXHAUSTED`
- 429: `TOO_MANY_REQUESTS` (with `Retry-After` header)
- 500: `INTERNAL_ERROR`

### Rate Limiting

**File:** `src/lib/rate-limit.ts`

| Tier | Limit | Window | Used By |
|------|-------|--------|---------|
| `REVIEW_CREATE` | 5 requests | 1 hour | POST /api/reviews |
| `REVIEW_EDIT` | 10 requests | 1 hour | PATCH /api/reviews/[id] |
| `REDEEM` | 3 requests | 1 hour | POST /api/rewards/redeem |
| `GENERAL` | 60 requests | 1 minute | Most other write endpoints |

**Implementation:** Upstash `Ratelimit.slidingWindow` with prefix `ratelimit:${tier}`. Falls back to in-memory `Map` if Upstash unavailable (logs warning in production).

### Middleware

**File:** `src/middleware.ts`

- **UX auth guard**: Redirects unauthenticated users to `/login?redirect=...` for protected paths. Checks cookie/header **presence** only (not verification — edge has no Firebase Admin access).
- **Request timing**: Sets `x-request-duration` header, logs slow API passes exceeding `CONFIG.SLOW_REQUEST_THRESHOLD_MS`.
- **Matcher**: `/api/:path*` and all protected/admin routes.

---

## 5. Data Layer

### Full Firestore Schema

#### `restaurants` collection

| Field | Type | Description |
|-------|------|-------------|
| id | string | Auto-generated or `gp-*` prefix for Places-ingested |
| name | string | Restaurant name |
| city | string | City identifier |
| area | string | Area/neighborhood |
| address | string | Full address |
| cuisines | string[] | Cuisine tags |
| googlePlaceId | string \| null | Google Places reference |
| coordinates | { lat, lng } | Geo coordinates |
| coverImage | string \| null | Cloudinary URL |
| phoneNumber | string \| null | Contact |
| website | string \| null | Website URL |
| googleMapsUrl | string \| null | Maps link |
| googleRating | number \| null | Google rating at ingestion time |
| ownerId | string \| null | Firebase UID of verified owner |
| isVerified | boolean | Owner verification status |
| isActive | boolean | Visibility flag |
| createdAt | Timestamp | Creation time |

**Subcollection:** `restaurants/{id}/cache/analytics` — cached analytics JSON (TTL managed by Upstash + code).

#### `dishes` collection

| Field | Type | Description |
|-------|------|-------------|
| id | string | Auto-generated |
| restaurantId | string | FK to restaurants |
| restaurantName | string | Denormalized |
| cuisines | string[] | Inherited from restaurant |
| area | string | Denormalized |
| city | string | Denormalized |
| name | string | Dish name |
| nameLower | string | `name.toLowerCase()` for prefix search |
| description | string \| null | Optional description |
| category | DishCategory | e.g., "Main Course", "Dessert" |
| dietary | DietaryType | "veg", "non-veg", "egg" |
| priceRange | PriceRange \| null | Price bucket |
| coverImage | string \| null | Best review photo |
| avgTaste | number | Rolling average (0-5) |
| avgPortion | number | Rolling average (0-5) |
| avgValue | number | Rolling average (0-5) |
| avgOverall | number | (taste + portion + value) / 3 |
| reviewCount | number | Total approved reviews |
| topTags | string[] | Top 5 tags by frequency |
| tagCounts | Record<string, number> | Tag frequency map |
| isActive | boolean | Visibility flag |
| createdAt | Timestamp | Creation time |

#### `reviews` collection

| Field | Type | Description |
|-------|------|-------------|
| id | string | Auto-generated |
| dishId | string | FK to dishes |
| restaurantId | string | FK to restaurants |
| userId | string | FK to users |
| userName | string | Denormalized |
| userLevel | UserLevel | Denormalized at write time |
| userAvatarUrl | string \| null | Denormalized |
| photoUrl | string \| null | Cloudinary URL |
| tasteRating | number | 1-5 |
| portionRating | number | 1-5 |
| valueRating | number | 1-5 |
| tags | string[] | Selected tags |
| text | string \| null | Review text |
| billUrl | string \| null | Bill photo URL |
| isVerified | boolean | Bill-verified flag |
| helpfulVotes | number | Vote count |
| helpfulVotedBy | string[] | UIDs who voted |
| isFlagged | boolean | Moderation flag |
| isApproved | boolean | Admin approval |
| editedAt | Timestamp \| null | Last edit time |
| createdAt | Timestamp | Creation time |

#### `users` collection

| Field | Type | Description |
|-------|------|-------------|
| id | string | Firebase Auth UID |
| displayName | string | Display name |
| email | string | Email |
| avatarUrl | string \| null | Profile photo |
| city | string | Preferred city |
| level | UserLevel | Computed from reviewCount |
| reviewCount | number | Server-maintained counter |
| helpfulVotesReceived | number | Server-maintained counter |
| badges | BadgeId[] | Earned badges |
| isAdmin | boolean | Admin flag (server-write only) |
| isPremium | boolean | Premium subscription |
| premiumSince | Timestamp \| null | Subscription start |
| dishPointsBalance | number | Current spendable balance |
| totalPointsEarned | number | Lifetime earned |
| totalPointsRedeemed | number | Lifetime spent |
| createdAt | Timestamp | Registration time |

**Subcollections:**
- `users/{uid}/wishlist/{dishId}` — saved dish (WishlistItem fields)
- `users/{uid}/pointTransactions/{id}` — DishPointTransaction ledger
- `users/{uid}/couponClaims/{id}` — redeemed coupons

#### Other Collections

| Collection | Key Fields | Access |
|-----------|-----------|--------|
| `dishRequests` | restaurantId, dishName, requestedBy, status, adminId, adminNote | Client create (own), server manage |
| `notifications` | userId, type, title, message, linkUrl, isRead | Server create, client read (own) |
| `coupons` | title, restaurantId, discountValue, discountType, pointsCost, totalStock, claimedCount, isActive, expiresAt | Server-only |
| `restaurantClaims` | restaurantId, userId, phone, role, proofDocumentUrl, status, adminId, adminNote | Client create (own), server manage |
| `billingEvents` | userId, type, razorpayEventKey (dedup), metadata | Server-only, fully locked |

### Repository Pattern

```
Interface (src/lib/repositories/*.ts)
    ↓ implemented by
Firebase Implementation (src/lib/repositories/firebase/*.ts)
    ↓ optionally decorated by
Typesense Adapter (src/lib/repositories/typesense/*.ts)
    ↓ wired in
Factory (src/lib/repositories/index.ts — client, server.ts — server-only)
```

**Client-accessible repositories** (`index.ts`): `userRepository`, `dishRepository`, `reviewRepository` (read methods), `restaurantRepository`, `restaurantSearchRepository`, `wishlistRepository`, `notificationRepository`, `dishRequestRepository`, `adminRepository`.

**Server-only repositories** (`server.ts`): `pointsRepository`, `couponRepository`, `reviewRepository` (write methods via Admin SDK).

### Typesense Alongside Firestore

- **Typesense** provides full-text search with typo tolerance across `name`, `restaurantName`, `cuisines`, `topTags` (dishes) and `name`, `cuisines`, `dishNames` (restaurants).
- **Firestore** provides the authoritative data store, relationships, and prefix-only fallback search.
- **Sync**: After review create/edit/delete, `syncRestaurantToTypesense` upserts the restaurant document. Admin route `/api/admin/sync-typesense` performs full batch re-import.
- **Fallback**: If Typesense env vars are absent, repositories use `FirebaseDishRepository.search()` (prefix on `nameLower` only).

### Firestore Security Rules Strategy

The rules follow a **principle of least privilege**:
- Public collections (`restaurants`, `dishes`, `reviews`): anyone can read, no one can write from client
- User data (`users/{uid}`): owner reads/writes only whitelisted fields
- Subcollections (`wishlist`): owner full access; `pointTransactions`, `couponClaims`: owner read-only
- Everything else: server-only via Admin SDK (bypasses rules entirely)
- Catch-all: deny everything not explicitly matched

### Composite Indexes (16 total)

| Collection | Fields | Purpose |
|-----------|--------|---------|
| dishes | restaurantId + isActive + avgOverall DESC | Restaurant dish listing sorted by rating |
| dishes | isActive + avgOverall DESC | Global top dishes |
| dishes | isActive + nameLower ASC | Prefix search |
| dishes | city + isActive + avgOverall DESC | City-filtered top dishes |
| dishes | city + isActive + createdAt DESC | City-filtered newest dishes |
| dishes | restaurantId + isActive | Related dishes |
| reviews | userId + dishId | Duplicate review check |
| reviews | dishId + isApproved + createdAt DESC | Dish reviews feed |
| reviews | userId + createdAt DESC | User's review history |
| reviews | isFlagged + createdAt DESC | Admin: flagged reviews |
| reviews | restaurantId + isApproved | Restaurant analytics |
| reviews | restaurantId + isApproved + createdAt ASC | Restaurant analytics (time-filtered) |
| dishRequests | status + createdAt DESC | Admin: pending requests |
| notifications | userId + createdAt DESC | User notifications feed |
| coupons | isActive + createdAt DESC | Coupon catalog |
| restaurantClaims | status + createdAt ASC | Admin: pending claims |

### Known Schema Gaps

1. **`dishName` / `restaurantName` on Review**: Optional fields (`dishName?: string`) populated inconsistently — some reviews lack them, requiring joins on read.
2. **No `city` field on `reviews`**: City-filtered review queries require joining through `dishes` or `restaurants`.
3. **`tagCounts` on Dish is optional** (`tagCounts?: Record<string, number>`): Older dishes may lack it; `topTags` is the source of truth.
4. **`priceRange` on Dish is nullable**: Many ingested dishes have no price data.

---

## 6. External Services & Integrations

### Firebase (Auth + Firestore)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Authentication (Google + email/password), primary database |
| **Files** | `src/lib/firebase/config.ts`, `admin-server.ts`, `auth.ts`, `dishes.ts`, `restaurants.ts`, `reviews.ts`, `reviews-admin.ts`, `users.ts`, `wishlist.ts`, `notifications.ts`, `dishRequests.ts` |
| **Env vars** | `NEXT_PUBLIC_FIREBASE_*` (6, required), `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (server) |
| **If down** | Hard fail — app cannot render or authenticate |
| **Known issues** | Prefix-only search without Typesense; cold start latency on first Admin SDK call |

### Cloudinary

| Aspect | Detail |
|--------|--------|
| **Purpose** | Image uploads for review photos, bill photos, user avatars |
| **Files** | `src/lib/services/cloudinary.ts` |
| **Env vars** | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` |
| **If down** | Graceful — upload returns null, review can still submit without photo |
| **Known issues** | Using raw fetch to REST API (not the `next-cloudinary` React component); 30s timeout may fail on slow connections |

### Razorpay

| Aspect | Detail |
|--------|--------|
| **Purpose** | Premium subscription payments (UPI, cards, netbanking) |
| **Files** | `src/lib/services/billing.ts`, `src/app/api/billing/*`, `src/app/(protected)/upgrade/page.tsx` |
| **Env vars** | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` |
| **If down** | Graceful — upgrade page shows error, existing premium users unaffected |
| **Known issues** | `verify` route hardcodes plan as `'monthly'` regardless of actual plan selected; webhook only handles `subscription.cancelled`/`expired` |

### Resend

| Aspect | Detail |
|--------|--------|
| **Purpose** | Transactional email (welcome, points milestone, coupon claimed) |
| **Files** | `src/lib/services/email.ts` |
| **Env vars** | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` |
| **If down** | Graceful — emails silently fail, core functionality unaffected |
| **Known issues** | Email templates use inline HTML with some hardcoded colors (not design-token-compliant) |

### Typesense

| Aspect | Detail |
|--------|--------|
| **Purpose** | Full-text search with typo tolerance for dishes and restaurants |
| **Files** | `src/lib/repositories/typesense/typesenseClient.ts`, `typesenseDishRepository.ts`, `typesenseRestaurantRepository.ts`, `src/lib/services/typesense-restaurant-sync.ts`, `scripts/sync-typesense.ts` |
| **Env vars** | `TYPESENSE_HOST`, `TYPESENSE_PORT`, `TYPESENSE_PROTOCOL`, `TYPESENSE_API_KEY`, `TYPESENSE_SEARCH_API_KEY` |
| **If down** | Graceful — falls back to Firestore prefix search (degraded: no fuzzy, no restaurant name search) |
| **Known issues** | Full sync script drops/recreates collection (downtime); restaurant sync after review may fail silently |

### Upstash Redis

| Aspect | Detail |
|--------|--------|
| **Purpose** | Rate limiting (sliding window), restaurant analytics caching (1h TTL) |
| **Files** | `src/lib/rate-limit.ts`, `src/lib/services/analytics-cache.ts` |
| **Env vars** | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| **If down** | Graceful — rate limiter falls back to in-memory Map; analytics cache falls through to Firestore |
| **Known issues** | In-memory fallback resets on cold start (effectively no rate limiting in serverless without Upstash) |

### Sentry

| Aspect | Detail |
|--------|--------|
| **Purpose** | Error tracking, performance monitoring, session replay |
| **Files** | `next.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `src/instrumentation.ts`, `src/instrumentation-client.ts`, `src/lib/monitoring/sentry.ts` |
| **Env vars** | `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` |
| **If down** | Graceful — errors logged to console, app unaffected |
| **Config** | `tracesSampleRate: 0.1` (prod), replay `0.1` session / `1.0` on error, tunnel via `/monitoring` |

### Google Places API

| Aspect | Detail |
|--------|--------|
| **Purpose** | Restaurant data ingestion (name, address, coordinates, cuisine, rating) |
| **Files** | `src/lib/services/google-places.ts`, `scripts/ingest-google-places.ts` |
| **Env vars** | `GOOGLE_PLACES_API_KEY` |
| **If down** | No runtime impact — only used in scripts |
| **Known issues** | Places API (New) costs are per-field; pagination uses 200ms delay between pages |

---

## 7. Authentication & Security

### Full Auth Flow

```
1. User clicks "Sign in with Google" or submits email/password form
2. Firebase Client SDK authenticates → returns Firebase ID token (JWT, RS256)
3. AuthProvider's onAuthStateChanged fires:
   a. Fetch/create user doc in Firestore
   b. Populate Zustand authStore
   c. Set __session cookie (document.cookie) with token value
   d. Sync city preference cookie
4. Subsequent API requests:
   a. Client reads token from Firebase SDK (getIdToken)
   b. Attaches as Authorization: Bearer <token>
   c. Server verifies via Firebase Admin SDK or custom RSA verification
5. Token refresh: Firebase SDK auto-refreshes tokens every ~55 minutes
6. Sign out: Clear Zustand store + cookies + Firebase signOut()
```

### Token Storage Strategy

| Token | Storage | Security |
|-------|---------|----------|
| Firebase ID token | In-memory (Firebase SDK manages) | Short-lived (~1h), auto-refreshed |
| `__session` cookie | document.cookie | UX guard only, not HttpOnly (client-set), SameSite=Lax |
| City preference | Cookie + localStorage | Non-sensitive user preference |

### Cookie Security

- `__session` is set from client JS — it **cannot** be HttpOnly since Firebase SDK lives in browser
- Middleware only checks cookie **presence**, never trusts its value for authorization
- All actual auth verification happens server-side in API routes via `adminAuth.verifyIdToken()`
- No sensitive data stored in cookies

### CORS Configuration

- No explicit CORS headers on API routes (default: same-origin only, enforced by Next.js)
- Razorpay checkout loads from `checkout.razorpay.com` (script tag, not fetch)
- Cloudinary uploads go to `api.cloudinary.com` (unsigned, no CORS issue)

### Security Layers

1. **Edge middleware**: UX redirect (not security boundary)
2. **API routes**: Firebase Admin token verification (actual security)
3. **Firestore rules**: Defense-in-depth for client SDK access
4. **Rate limiting**: Prevents abuse (5 reviews/hour, 60 requests/minute general)
5. **Input validation**: Zod schemas on all request bodies
6. **HMAC verification**: Razorpay webhooks validated with timing-safe comparison

---

## 8. Performance Architecture

### Caching Strategy

| Layer | Mechanism | TTL | Scope |
|-------|-----------|-----|-------|
| CDN/ISR | Next.js ISR | 1 hour | Public catalog pages |
| HTTP headers | `Cache-Control` | 24h + 7d SWR | `/api/cities` |
| React `cache()` | Request dedup | Per-request | `userRepository.getById` in auth |
| Upstash Redis | Key-value | 1 hour | Restaurant analytics |
| Firestore subcollection | Document | Indefinite (code-managed) | Analytics fallback cache |
| TanStack Query | In-memory | Configurable `staleTime` | Client-side data |

### Optimizations Applied

- **Image optimization**: Cloudinary CDN + Next.js `<Image>` with AVIF/WebP, remote patterns
- **Bundle optimization**: `optimizePackageImports` for `lucide-react` and `motion/react` (tree-shaking)
- **Font optimization**: Google Fonts loaded via Next.js font system (self-hosted, no CLS)
- **Code splitting**: Route-based (App Router default), client components lazy-loaded
- **View transitions**: Experimental `viewTransition: true` enabled
- **PWA**: Service worker via Serwist for offline shell and asset caching
- **Compression**: `compress: true` in next.config (gzip/brotli)
- **Package optimization**: pnpm with strict hoisting, `onlyBuiltDependencies` restricted

### Known Performance Bottlenecks

| Issue | Status | Impact |
|-------|--------|--------|
| Restaurant analytics cold compute | Mitigated (Redis cache) | First load after cache expiry can take 2-3s |
| Firestore cold starts (Admin SDK) | Open | First request after idle ~500ms penalty |
| Typesense sync after review create | Open | Adds ~200ms to review submission response |
| `helpfulVotedBy` array in reviews | Open | Grows unbounded; will affect read performance at scale |
| In-memory rate limit on serverless | Mitigated (Upstash) | Without Upstash, each cold start resets counters |

---

## 9. Testing Strategy

### Test Infrastructure

| Type | Framework | Config | Location |
|------|-----------|--------|----------|
| Unit/Integration | Vitest 4.x | `vitest.config.ts` | `src/__tests__/api/`, `src/__tests__/lib/` |
| Firestore rules | Vitest + `@firebase/rules-unit-testing` | Same config, separate script | `src/__tests__/rules/` |
| E2E | Playwright 1.59 | `playwright.config.ts` | `src/__tests__/e2e/` |

### Test Scripts

```bash
pnpm test          # All vitest tests (excludes rules)
pnpm test:unit     # Unit tests only (excludes rules)
pnpm test:rules    # Firestore rules tests only
pnpm test:e2e      # Playwright (requires .env.e2e + dev server)
pnpm test:e2e:ui   # Playwright with UI mode
pnpm test:e2e:debug # Playwright debug mode
```

### What's Tested

- **API routes**: Review CRUD, notifications (mocked Firebase + Typesense)
- **Business logic**: Rewards/points computation, coupon redemption
- **Firestore rules**: All collections, all access patterns, edge cases
- **E2E flows**: Public pages, navigation, search, auth flows, error states (8 spec files)

### What's NOT Tested (Gaps)

- Component rendering (no React Testing Library / component tests)
- Zustand store logic in isolation
- TanStack Query cache behavior
- Cloudinary upload service
- Razorpay payment flow (manual testing only)
- Rate limiting edge cases
- Typesense search accuracy
- Admin dashboard workflows

### CI Pipeline

```yaml
# .github/workflows/ci.yml
Jobs (parallel):
  1. lint (eslint)
  2. typecheck (tsc --noEmit)
  3. test (vitest unit)

Post-merge (main only):
  4. sentry-release (build + sourcemap upload)
```

E2E tests are **not** in CI (require running app + env vars).

---

## 10. Development Workflow

### Running Locally

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment
cp .env.local.example .env.local  # NOTE: .env.local.example is missing from repo
# Fill in Firebase vars (required) + optional service vars

# 3. Start dev server
pnpm dev

# 4. (Optional) Start Firestore emulator
pnpm emulator

# 5. (Optional) Start Typesense locally
typesense-server --data-dir=/tmp/typesense-data --api-key=xyz_dev_key_123 --enable-cors
pnpm seed        # Seed cities
npx tsx scripts/sync-typesense.ts  # Sync search index
```

### Required Environment Variables

**Minimum viable (app boots):**
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

**For API routes (writes):**
```
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

**Optional (degrade gracefully):**
```
TYPESENSE_HOST, TYPESENSE_PORT, TYPESENSE_PROTOCOL, TYPESENSE_API_KEY
UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
RESEND_API_KEY, RESEND_FROM_EMAIL
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
NEXT_PUBLIC_SENTRY_DSN, SENTRY_DSN, SENTRY_AUTH_TOKEN
GOOGLE_PLACES_API_KEY
NEXT_PUBLIC_SITE_URL
```

### package.json Scripts

| Script | Purpose |
|--------|---------|
| `dev` | Start Next.js dev server |
| `build` | Production build |
| `start` | Start production server |
| `lint` | ESLint check |
| `typecheck` | TypeScript type check |
| `test` | Run all vitest tests |
| `test:unit` | Unit tests (excludes rules) |
| `test:rules` | Firestore security rules tests |
| `test:e2e` | Playwright end-to-end tests |
| `seed` | Seed city data to Firestore |
| `ingest` | Import restaurants from Google Places API |
| `emulator` | Start Firestore emulator (port 8080) |

### Deployment

- **Vercel**: Auto-deploys from `main` branch, preview deploys on PRs
- **Firebase**: `firebase deploy --only firestore:rules` and `firebase deploy --only firestore:indexes` for rules/index changes
- **Sentry**: CI job uploads sourcemaps on merge to main

### Branching Strategy

- `main` — production (Vercel auto-deploy)
- Feature branches — PR against main
- CI runs lint + typecheck + unit tests on all PRs
- No staging environment currently

### Known "Works on My Machine" Issues

- `.env.local.example` file is missing from repo — new developers must reference `src/lib/env.ts` for required vars
- Firestore emulator doesn't support all composite indexes — some queries fail locally
- `FIREBASE_PRIVATE_KEY` requires `\n` literal in `.env.local` (not actual newlines)
- Image optimization disabled in dev (`unoptimized: true`) — layout may differ from prod

---

## 11. Known Technical Debt

| File/Area | Issue | Severity | Recommended Fix |
|-----------|-------|----------|-----------------|
| `src/app/api/billing/verify/route.ts` | Hardcodes plan as `'monthly'` regardless of selection | Medium | Pass plan from `createOrderSchema` notes or store on order |
| `src/lib/firebase/dishes.ts` | `searchDishes()` only does prefix match on `nameLower` | High | Improve Firebase fallback with `searchTokens` array or mandate Typesense |
| `reviews` collection | `helpfulVotedBy: string[]` grows unbounded | Medium | Move to subcollection or use counter-only with server-side dedup |
| Email templates | Inline HTML with hardcoded colors | Low | Extract to template system with design tokens |
| `.env.local.example` | File referenced but doesn't exist | Low | Create it from `env.ts` schema |
| `src/app/(protected)/upgrade/page.tsx` | Razorpay checkout script loaded via raw `<script>` | Low | Use Next.js `Script` component with `strategy="lazyOnload"` |
| `scripts/sync-typesense.ts` | Drops and recreates collection (causes downtime) | Medium | Use alias swap pattern for zero-downtime reindex |
| No `generateStaticParams` | ISR pages not pre-rendered at build time | Low | Add for top dishes/restaurants to speed first load |
| Denormalized user data on reviews | `userName`, `userLevel`, `userAvatarUrl` become stale | Low | Accept staleness or add background sync |
| Rate limit in-memory fallback | Resets on every serverless cold start | High (prod) | Ensure Upstash is always configured in production |

### Intentionally Deferred

- **Receipt-verified reviews (V2)**: OCR/AI verification of order receipts — deferred until review volume is healthy
- **Optional photo in review flow (V2)**: Currently required step; will incentivize with bonus points instead

---

## 12. Engineering Decisions Log

### Why Firebase over PostgreSQL?

**Decision**: Cloud Firestore as primary database.

**Rationale**:
- Zero-ops: no connection pooling, no schema migrations, no server provisioning
- Serverless-native: scales to zero cost when idle, scales up automatically
- Real-time listeners: enables live notification counts and wishlist sync
- Security rules: defense-in-depth without a separate API layer for reads
- Generous free tier: 50K reads/day, 20K writes/day covers early stage

**Tradeoffs**:
- No JOIN operations — requires denormalization and data duplication
- Limited query expressiveness — no full-text search (hence Typesense)
- Vendor lock-in to Google Cloud ecosystem
- Composite indexes must be explicitly defined for compound queries

**Alternatives considered**: Supabase (PostgreSQL) — more powerful queries but requires connection management in serverless; PlanetScale — great but adds complexity for a team of one.

### Why Next.js App Router?

**Decision**: Next.js 16 with App Router (not Pages Router).

**Rationale**:
- Server Components reduce client bundle for catalog pages
- ISR enables SEO + fast loads without full SSR on every request
- Co-located API routes (no separate backend)
- Streaming and Suspense for progressive rendering
- Vercel-optimized deployment

**Tradeoffs**:
- Steeper learning curve (server vs client component boundaries)
- Ecosystem still maturing (some libraries don't support RSC)
- Debugging hydration mismatches

### Why Typesense over Algolia/Elasticsearch?

**Decision**: Typesense for full-text search.

**Rationale**:
- Open-source with generous managed hosting
- Sub-50ms query latency (comparable to Algolia)
- Built-in typo tolerance without configuration
- Simple REST API, lightweight client SDK
- Can self-host for development (single binary)
- Significantly cheaper than Algolia at scale

**Tradeoffs**:
- Smaller community than Algolia/Elasticsearch
- No built-in analytics/A-B testing (Algolia has these)
- Must manage sync from Firestore manually

### Why Upstash for Rate Limiting?

**Decision**: Upstash Redis with `@upstash/ratelimit`.

**Rationale**:
- Serverless-native: HTTP-based Redis (no persistent connections)
- Built-in sliding window algorithm
- Global edge deployment (low latency from India)
- Pay-per-request pricing matches serverless economics
- Works in Vercel edge and serverless functions

**Alternatives considered**: Vercel KV (built on Upstash anyway), in-memory only (doesn't work in serverless), Firestore-based counters (too expensive at rate-limit volumes).

### Why Zustand over Redux?

**Decision**: Zustand for client state management.

**Rationale**:
- ~1KB bundle (vs Redux Toolkit ~11KB)
- No providers, no action types, no reducers boilerplate
- Works seamlessly with React 19 concurrent features
- Supports middleware (persist, devtools) when needed
- Simple mental model: `create((set) => ({ ... }))`

**Only 3 stores needed**: Auth, wishlist (optimistic), review form. Redux's power is unnecessary at this scale.

### Why TanStack Query for Some Data and Direct Firestore for Others?

**Decision**: TanStack Query for user-specific async data; direct Firestore reads for catalog data in RSC.

**Rationale**:
- **TanStack Query** (client): Wishlist, my-reviews, restaurant analytics — needs cache invalidation, loading states, background refetch
- **Direct Firestore in RSC** (server): Dish details, restaurant details, explore results — rendered on server, cached by ISR, no client-side fetch needed
- **Direct Firestore in client hooks**: Some read operations where TanStack overhead isn't justified

**Pattern**: If data is user-specific and changes frequently → TanStack Query. If data is public catalog and changes rarely → server fetch + ISR.

---

## 13. Scalability Assessment

### What Breaks First Under Load?

1. **Firestore read quotas** (50K/day free tier) — hit first with traffic spikes
2. **`helpfulVotedBy` array** — reviews with 1000+ votes become expensive to read/write
3. **Review creation side effects** — Typesense sync + analytics invalidation + rewards computation serialized in one request
4. **Cold starts** — first request after idle takes 500-1000ms (Firebase Admin SDK init)
5. **Denormalized data staleness** — userName/avatarUrl on reviews never updates

### Estimated Current Capacity

- **Concurrent users**: ~500 (limited by serverless function concurrency)
- **Reviews/day**: ~5000 (rate limits + Firestore write quotas)
- **Search queries/sec**: ~100 (Typesense handles this easily)
- **Monthly cost at current usage**: ~$0-50 (well within free tiers)

### Before 10K Users

- [ ] Move to Firestore Blaze plan (pay-as-you-go)
- [ ] Ensure Upstash is configured in production (rate limiting critical)
- [ ] Add `generateStaticParams` for top 100 dishes/restaurants (reduce Firestore reads)
- [ ] Monitor `helpfulVotedBy` array sizes
- [ ] Add connection pooling awareness (verify no leaked listeners)

### Before 100K Users

- [ ] Extract review side effects into async queue (Cloud Tasks or Inngest)
- [ ] Replace `helpfulVotedBy` array with subcollection
- [ ] Add CDN caching layer for API responses (Vercel Edge Config or Redis)
- [ ] Consider read replicas or Firestore Data Connect
- [ ] Implement proper search analytics (popular queries, zero-results)
- [ ] Add horizontal scaling for Typesense (cluster mode)
- [ ] Implement user session management (concurrent device limits)

### Serverless-Specific Concerns

- **No persistent connections**: Every request cold-starts Firebase Admin SDK (mitigated by module-level init)
- **No background processing**: Side effects must complete within request timeout (~10s on Vercel)
- **No shared memory**: In-memory rate limit cache resets per invocation
- **Function size limits**: Bundle must stay under 50MB (currently ~15MB)

---

## 14. Pre-Launch Engineering Checklist

### Must-Do Before Going Live

- [ ] Set all production env vars in Vercel (see full list in section 10)
- [ ] Deploy Firestore security rules: `firebase deploy --only firestore:rules`
- [ ] Deploy Firestore indexes: `firebase deploy --only firestore:indexes` (wait for build completion)
- [ ] Run Typesense full sync: `POST /api/admin/sync-typesense` with admin token
- [ ] Verify Razorpay webhook URL points to production domain
- [ ] Verify Sentry DSN is configured and receiving test events
- [ ] Set up Upstash Redis (rate limiting is critical in production)
- [ ] Run points counter backfill script if migrating existing users
- [ ] Create `.env.local.example` for developer onboarding
- [ ] Set `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Configure Resend sender domain (DNS records)
- [ ] Test payment flow end-to-end in Razorpay test mode
- [ ] Verify Firebase Auth providers enabled (Google, email/password)
- [ ] Set up Firebase App Check (optional, prevents API abuse)

### Production Environment Variables

```bash
# Required (app won't function without these)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Critical for production (app works without but with degraded UX)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
TYPESENSE_HOST=
TYPESENSE_PORT=
TYPESENSE_PROTOCOL=
TYPESENSE_API_KEY=
TYPESENSE_SEARCH_API_KEY=

# Payments
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=

# Communications
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Media
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

# Site
NEXT_PUBLIC_SITE_URL=https://cravia.app
```

### Monitoring in Place

| System | What It Monitors |
|--------|-----------------|
| Sentry | Runtime errors, performance traces, session replays |
| Vercel Analytics | Core Web Vitals, page load times |
| Middleware logging | Slow API passes (> threshold) |
| Sentry breadcrumbs | Review creation flow, rewards computation |

### Incident Response Plan

1. **Detection**: Sentry alert (>5 errors/hour or slow route >2s)
2. **Triage**: Check Sentry issue → identify if transient, code bug, or infrastructure
3. **Immediate mitigation**: Vercel instant rollback to last known good deploy
4. **Communication**: No user-facing status page yet (V2 consideration)
5. **Resolution**: Fix on branch, deploy, verify Sentry resolves
6. **Post-mortem**: Document in `docs/RUNBOOK.md` if new failure mode

**Escalation path for specific failures:**
- Firestore outage → check `status.firebase.google.com`, wait it out
- Payment failures → check Razorpay dashboard, manual premium activation if confirmed
- Search down → Typesense fallback to Firestore prefix (degraded but functional)
- Rate limiter down → Upstash fallback to in-memory (reduced protection but app works)

---

## Appendix: Quick Reference

### Common Development Tasks

```bash
# Type check the project
pnpm typecheck

# Run linter
pnpm lint

# Run unit tests
pnpm test

# Seed restaurant data from Google Places
GOOGLE_PLACES_API_KEY=xxx npx tsx scripts/ingest-google-places.ts

# Sync Firestore → Typesense
npx tsx scripts/sync-typesense.ts

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Make a user admin (via Firebase Console)
# Set users/{uid}.isAdmin = true
# Set custom claim: firebase auth:claims:set <uid> '{"isAdmin": true}'
```

### Architecture Invariants (Never Violate)

1. Never import Firebase SDK directly in components — always go through `lib/firebase/`
2. Never define types inline — always use `lib/types/`
3. Never hardcode collection names — always use `COLLECTIONS` / `SUBCOLLECTIONS`
4. Never hardcode colors — always use CSS custom properties
5. Never use `any` — TypeScript strict mode enforced
6. Never write to Firestore from client (except user self-write) — always use API routes
7. Never let Firebase errors propagate — always try/catch, return null/[]

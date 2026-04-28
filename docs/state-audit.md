# Cravia — State Management & Caching Audit

> Generated: 2026-04-08 | Read-only audit — no changes made.

---

## Table of Contents

1. [State Management Inventory](#1-state-management-inventory)
2. [Server State & Data Fetching](#2-server-state--data-fetching)
3. [Caching Audit](#3-caching-audit)
4. [Duplicate API Calls](#4-duplicate-api-calls)
5. [Auth State](#5-auth-state)
6. [Missing Optimistic Updates](#6-missing-optimistic-updates)
7. [Recommendations](#7-recommendations)

---

## 1. State Management Inventory

### 1.1 Zustand Stores (3 stores)

| Store | File | State shape | Actions | Subscribers |
|-------|------|-------------|---------|-------------|
| `useAuthStore` | `src/lib/store/authStore.ts` | `user: User \| null`, `authUser: AuthSessionUser \| null`, `isLoading: boolean` | `setUser`, `clearUser`, `setLoading` | `useAuth.ts` (L62, L91, L97), `Navbar.tsx` (L32, L104), `onboarding/page.tsx` (L26–27), `settings/page.tsx` (L34–35) |
| `useWishlistStore` | `src/lib/store/wishlistStore.ts` | `savedIds: Set<string>`, `items: WishlistItem[]` | `addId`, `removeId`, `setAll` | `WishlistButton.tsx` (L20) — **`setAll` is never called anywhere** |
| `useReviewFormStore` | `src/lib/store/reviewFormStore.ts` | `data: ReviewFormData`, `currentStep: 1 \| 2 \| 3` | `setStep`, `updateField`, `reset` | `write-review/page.tsx` (L34) |

### 1.2 React Context (1 context)

| Context | File | Data | Provider mount | Consumers |
|---------|------|------|---------------|-----------|
| _(CityContext removed — single city: Gurugram)_ | — | — | — | — |

Third-party contexts (not app-defined): `ThemeProvider` from `next-themes` (providers.tsx L39), `QueryClientProvider` from TanStack (providers.tsx L54).

**Note:** `AuthProvider` in `useAuth.ts` is NOT a React Context — it is a wrapper component that syncs Firebase auth into Zustand and renders `children` directly.

### 1.3 useReducer

**None** — no `useReducer` usage in `src/`.

### 1.4 useState — Full Inventory

#### Pages

| File | Variables | What they store |
|------|-----------|-----------------|
| `src/app/(protected)/write-review/page.tsx` | `dish`, `submitting`, `submitError`, `photoError`, `isEditMode`, `existingPhotoUrl` | Loaded dish, form submission state, edit mode flag |
| `src/app/(protected)/compare/page.tsx` | `query1`, `query2`, `results1`, `results2`, `dish1`, `dish2`, `loading` | Two dish picker searches + selected dishes + comparison loading |
| `src/app/(protected)/my-profile/page.tsx` | _(none — uses React Query via `useMyReviews`)_ | — |
| `src/app/(protected)/profile/[userId]/page.tsx` | `profile`, `reviews`, `loading` | Fetched user + reviews + loading flag |
| `src/app/(protected)/notifications/page.tsx` | `notifications`, `loading` | Notification list + loading |
| `src/app/(protected)/rewards/page.tsx` | `balance`, `coupons`, `claims`, `loading`, `redeeming`, `redeemError`, `redeemSuccess`, `tab` | Rewards data, redemption state, active tab |
| `src/app/(protected)/wishlist/page.tsx` | _(none — uses React Query via `useWishlist`)_ | — |
| `src/app/(protected)/settings/page.tsx` | `displayName`, `city`, `area`, `saving`, `saved`, `error`, `currentPassword`, `newPassword`, `passwordLoading`, `avatarFile`, `avatarPreview` | Form fields + save/error state |
| `src/app/(protected)/onboarding/page.tsx` | `step`, `selectedCuisines`, `selectedCity`, `selectedArea`, `saving` | Multi-step wizard state |
| `src/app/(protected)/upgrade/page.tsx` | `selectedPlan`, `loading`, `error`, `success` | Checkout state |
| `src/app/(protected)/claim-restaurant/[id]/page.tsx` | `restaurant`, `loading`, `submitting`, `submitted`, `error`, `phone`, `role`, `proofUrl` | Restaurant data + claim form |
| `src/app/(protected)/review-success/page.tsx` | `data` | One-shot read from `sessionStorage` |
| `src/app/(protected)/restaurant-dashboard/[restaurantId]/page.tsx` | `analytics`, `loading`, `error` | Restaurant analytics |
| `src/app/(protected)/restaurant-dashboard/[restaurantId]/dishes/page.tsx` | `analytics`, `loading`, `sortBy` | Same analytics + sort control |
| `src/app/(auth)/login/page.tsx` | `email`, `password`, `error`, `loading`, `googleLoading` | Login form |
| `src/app/(auth)/signup/page.tsx` | `name`, `email`, `password`, `confirm`, `error`, `loading`, `googleLoading` | Signup form |
| `src/app/(auth)/forgot-password/page.tsx` | `email`, `sent`, `error`, `loading` | Reset form |
| `src/app/(admin)/admin/page.tsx` | `stats`, `loading` | Admin stats |
| `src/app/(admin)/admin/users/page.tsx` | `users`, `loading` | User list |
| `src/app/(admin)/admin/reviews/page.tsx` | `reviews`, `loading` | Flagged reviews |
| `src/app/(admin)/admin/requests/page.tsx` | `requests`, `loading`, `rejectNote` | Dish requests |
| `src/app/(admin)/admin/coupons/page.tsx` | `coupons`, `loading`, `showForm`, `form`, `submitting`, `formError` | Coupon CRUD |
| `src/app/(admin)/admin/restaurant-claims/page.tsx` | `claims`, `loading`, `rejectNotes` | Claims list |

#### Components

| File | Variables | What they store |
|------|-----------|-----------------|
| `src/components/features/ReviewCard.tsx` | `expanded`, `photoOpen`, `hasVoted`, `helpfulCount`, `flagged` | Card UI + optimistic vote/flag |
| `src/components/features/LoadMoreReviews.tsx` | `reviews`, `hasMore`, `nextCursorId` | Paginated reviews |
| `src/components/features/LoadMoreDishes.tsx` | `dishes`, `hasMore`, `nextCursorId` | Paginated dishes |
| `src/components/features/DishPhotoGrid.tsx` | `lightboxOpen`, `lightboxIndex` | Photo lightbox |
| `src/components/features/SearchBar.tsx` | `query`, `lastUrlQuery` | Search input sync with URL |
| `src/components/features/HeroSection.tsx` | `heroExiting` | Exit animation flag |
| `src/components/features/HeroSearchBar.tsx` | `isExiting` | Exit animation |
| `src/components/features/PersonalStatsBanner.tsx` | `animate` | Entrance animation flag |
| `src/components/features/WishlistButton.tsx` | `isSaved` | Synced from Zustand `savedIds` |
| `src/components/layouts/Navbar.tsx` | `scrolled`, `unreadCount` (Navbar) | Scroll state, notification count |
| `src/components/ui/StarRating.tsx` | `hoverValue` | Hovered star index |
| `src/components/ui/TagCloud.tsx` | `expanded` | Show all / collapse tags |
| `src/app/(public)/explore/explore-filters.tsx` | `optimisticCuisine`, `optimisticArea`, `optimisticDietary`, `optimisticPriceRange`, `optimisticSort`, `lastServerKey`, `showAllAreas` (FiltersInner); `pill` (SortSegmented) | Optimistic filter state before URL catches up |

#### Hooks

| File | Variables | What they store |
|------|-----------|-----------------|
| `src/lib/hooks/useReviewDishContexts.ts` | `map` | `Record<dishId, { dishName, restaurantName }>` |
| `src/lib/hooks/useDebounce.ts` | `debouncedValue` | Debounced copy of input |
| _(CityContext removed)_ | — | — |

### 1.5 useRef (non-DOM, mutable state)

| File | Line | Name | What it holds | Why ref vs state |
|------|------|------|---------------|------------------|
| `src/app/(protected)/write-review/page.tsx` | 60 | `prevDishIdRef` | Previous `dishId` from search params | Compare on render without extra re-render |
| Same | 61 | `mountResetRef` | Boolean — one-time Zustand `reset()` guard | Imperative; avoids double-reset loops |
| Same | 80–81 | `resetRef` | Latest `reset` from store | Stable ref so unmount `useEffect` calls current `reset` |
| `src/app/(protected)/compare/page.tsx` | 27 | `debounceRef` | `setTimeout` timer ID | Holds timer across renders without re-rendering |

### 1.6 URL State

#### Client-side (`useSearchParams`)

| File | Params | Role |
|------|--------|------|
| `write-review/page.tsx` (L26–31) | `dishId`, `restaurantId`, `editReviewId`, `dishName`, `restaurantName` | Pre-fill review form |
| `explore/explore-filters.tsx` (L170+) | `cuisine`, `area`, `dietary`, `priceRange`, `sortBy` | Filter state read/written via `router.push` |
| `login/page.tsx` (L15–16) | `redirect` | Post-login redirect |
| `signup/page.tsx` (L28–29) | `redirect` | Post-signup redirect |
| `onboarding/page.tsx` (L23–24) | `redirect` | Post-onboarding redirect |
| `SearchBar.tsx` (L18, L47–52) | `q`, `focus` | Search query sync to `/explore?q=...` |

#### Client-side (`useParams`)

| File | Param |
|------|-------|
| `restaurant-dashboard/[restaurantId]/page.tsx` (L12) | `restaurantId` |
| `restaurant-dashboard/[restaurantId]/dishes/page.tsx` (L13) | `restaurantId` |
| `profile/[userId]/page.tsx` (L17) | `userId` |
| `claim-restaurant/[id]/page.tsx` (L21) | `id` |

#### Server-side (page props)

| File | Params |
|------|--------|
| `explore/page.tsx` (L95–109) | `q`, `cuisine`, `area`, `dietary`, `priceRange`, `sortBy` + city from cookie |
| `dish/[id]/page.tsx` (L22, L42) | `id` |
| `restaurant/[id]/page.tsx` (L13, L27) | `id` |
| `review/[id]/page.tsx` (L8, L22) | `id` |
| `cuisine/[slug]/page.tsx` (L11, L31) | `slug` |

---

## 2. Server State & Data Fetching

### 2.1 Server Components (async data loading at request time)

| Route | File | What is fetched | Trigger |
|-------|------|-----------------|---------|
| `/` | `src/app/(public)/page.tsx` L37–43 | `getTopDishes`, `listRestaurants`, `getDishCount`, `getRestaurantCount`, `getReviewCount` — 5 parallel calls | Navigation / ISR revalidation (3600s) |
| `/explore` | `src/app/(public)/explore/page.tsx` | `listDishes` (hardcoded Gurugram) | Navigation + filter changes (server re-render) |
| `/dish/[id]` | `src/app/(public)/dish/[id]/page.tsx` L27, L44, L47–49, L213 | `getDish` (×2 — metadata + page), `getRelatedDishes`, `listDishReviews` (×2 — photos + reviews section) | Navigation / ISR (3600s) |
| `/restaurant/[id]` | `src/app/(public)/restaurant/[id]/page.tsx` L18, L28–30 | `getRestaurantDetails` (×2 — metadata + page), `listRestaurantDishes` | Navigation / ISR (3600s) |
| `/review/[id]` | `src/app/(public)/review/[id]/page.tsx` L13–15, L23–26 | `getReview` (×2), `getDish` (×2) — metadata + page | Navigation |
| `/cuisine/[slug]` | `src/app/(public)/cuisine/[slug]/page.tsx` L37–44 | `searchDishes` | Navigation / ISR (3600s) |

### 2.2 Client Components (useEffect / event handler fetches)

| Route / Component | File | What is fetched | Trigger | Dedup mechanism |
|-------------------|------|-----------------|---------|-----------------|
| `/my-profile` | `my-profile/page.tsx` L20 | `useMyReviews` → `getReviewsByUser` | Mount (React Query) | **React Query** `['my-reviews', userId]` |
| `/my-profile` | `my-profile/page.tsx` L21 | `useReviewDishContexts` → N × `getDish` | `dishIdsKey` change | **None** — raw `Promise.all` |
| `/profile/[userId]` | `profile/[userId]/page.tsx` L26 | `getUser` + `getReviewsByUser` | `useEffect` on `userId` | **None** |
| `/profile/[userId]` | Same L22 | `useReviewDishContexts` → N × `getDish` | `dishIdsKey` change | **None** |
| `/notifications` | `notifications/page.tsx` L20 | `getNotifications(user.id)` | `useEffect` on `user` | **None** |
| `/rewards` | `rewards/page.tsx` L31–35 | 3 × `fetch` (balance, coupons, claims) | `useEffect` on mount | **None** |
| `/wishlist` | `wishlist/page.tsx` L17 | `useWishlist` → `wishlistRepository.getByUser` | Mount (React Query) | **React Query** `['wishlist', userId]` |
| `/compare` | `compare/page.tsx` L98–104 | `searchDishes` debounced | User typing (300ms debounce) | **None** |
| `/write-review` | `write-review/page.tsx` L67–77 | `getDish(dishId)` | `useEffect` on `dishId` | **None** |
| `/write-review` (edit) | Same L86–101 | `getReview(editReviewId)` | `useEffect` on `editReviewId` | **None** |
| `/restaurant-dashboard/[id]` | `restaurant-dashboard/[restaurantId]/page.tsx` L25–26 | `fetch` `/api/restaurants/:id/analytics` | `useEffect` on mount | **None** |
| `/restaurant-dashboard/[id]/dishes` | `.../dishes/page.tsx` L26–27 | `fetch` `/api/restaurants/:id/analytics` (same endpoint) | `useEffect` on mount | **None** |
| `/claim-restaurant/[id]` | `claim-restaurant/[id]/page.tsx` L35–39 | `getRestaurantDetails(id)` | `useEffect` on mount | **None** |
| Navbar | `Navbar.tsx` L110–115 | `fetch` `/api/notifications/unread-count` | Mount + 120s interval + visibility change | **None** |
| Admin pages | `admin/*.tsx` | Various `useEffect` fetches | Mount | **None** |

### 2.3 Deduplication Summary

| Mechanism | Queries using it |
|-----------|-----------------|
| React Query | `['wishlist', userId]`, `['my-reviews', userId]` — **only 2 queries** |
| SWR | Not used |
| `onSnapshot` (Firestore realtime) | Not used |
| Next.js `cache()` | Not used |
| Manual dedup | None |

---

## 3. Caching Audit

### 3.1 Next.js Built-in Caching

| Mechanism | Usage |
|-----------|-------|
| `cache()` from `react` or `next/cache` | **Not used** |
| `revalidatePath()` / `revalidateTag()` | **Not used** |
| `unstable_cache` | **Not used** |
| `export const revalidate` (ISR) | 4 routes — see below |

**ISR routes:**

| Route | File | `revalidate` value |
|-------|------|-------------------|
| `/` (landing) | `src/app/(public)/page.tsx` L19 | `3600` (1 hour) |
| `/dish/[id]` | `src/app/(public)/dish/[id]/page.tsx` L19 | `3600` |
| `/restaurant/[id]` | `src/app/(public)/restaurant/[id]/page.tsx` L10 | `3600` |
| `/cuisine/[slug]` | `src/app/(public)/cuisine/[slug]/page.tsx` L8 | `3600` |

### 3.2 TanStack React Query

**QueryClient config** (`src/app/providers.tsx` L25–36):
- `staleTime`: 120,000ms (2 minutes)
- `retry`: 1
- `refetchOnWindowFocus`: false
- `gcTime`: not set (default ~5 minutes)

**Queries:**

| Hook | Query key | File |
|------|-----------|------|
| `useWishlist` | `['wishlist', userId]` | `src/lib/hooks/useWishlist.ts` |
| `useMyReviews` | `['my-reviews', userId]` | `src/lib/hooks/useMyReviews.ts` |

**Invalidations:**

| File | Line | Key invalidated | Trigger |
|------|------|----------------|---------|
| `my-profile/page.tsx` | L46 | `['my-reviews']` | After review delete |
| `wishlist/page.tsx` | L26, L28 | `['wishlist']` | After wishlist remove (called twice — redundant) |

**Not used:** `useMutation`, `prefetchQuery`, `setQueryData`, `useInfiniteQuery`.

### 3.3 `fetch()` Cache Options

| File | Option | What |
|------|--------|------|
| `LoadMoreReviews.tsx` L43 | `cache: 'no-store'` | Pagination fetch |
| `LoadMoreDishes.tsx` L50–51 | `cache: 'no-store'` | Pagination fetch |
| `firebase-provider.ts` L50 | `cache: 'no-store'` | Google certs |
| `firebase-auth-provider.ts` L28 | `cache: 'no-store'` | Google certs |

All other `fetch()` calls in client components omit the `cache` option (browser default applies).

### 3.4 Application-Level Caches

| Cache | File | Mechanism | TTL | Invalidation |
|-------|------|-----------|-----|-------------|
| Restaurant analytics | `src/lib/services/analytics-cache.ts` | Tier 1: in-process `Map`; Tier 2: Firestore `restaurants/{id}/cache/analytics` | 1 hour | `invalidateAnalyticsCache()` called from `POST /api/reviews` and admin endpoint |
| Google x509 certs | `src/lib/auth/firebase-provider.ts` L29–30 | Module-level `certCache` + `certsExpireAtMs` | `max-age` from response headers (~300s default) | TTL expiry |
| Google x509 certs | `src/lib/auth/firebase-auth-provider.ts` L16–17 | Same pattern | Same | Same |

### 3.5 Memoization

| Mechanism | Usage |
|-----------|-------|
| `useMemo` | **Not used anywhere** in `src/` |
| `React.memo` | **Not used anywhere** in `src/` |
| `useCallback` | 6 files — stable handler references only (not data caching) |

### 3.6 Firebase Realtime Listeners

| Listener | Usage |
|----------|-------|
| `onSnapshot` (Firestore) | **Not used** — all reads are one-shot (`getDoc`, `getDocs`) |
| `onIdTokenChanged` (Auth) | `src/lib/auth/firebase-provider.ts` L123–125 — subscribed in `AuthProvider`, cleanup via `return unsub` |

---

## 4. Duplicate API Calls

> **This is the most important section.** Every duplicate found below represents wasted Firestore reads.

### 4.1 `/dish/[id]` — `getDish` called twice per request

| Call | File | Line | When |
|------|------|------|------|
| 1 | `src/app/(public)/dish/[id]/page.tsx` | L27 | `generateMetadata` |
| 2 | Same | L44 | Page component body |

**What:** Same `getDish(id)` — 1 Firestore `getDoc` on `dishes` collection.

**Why it duplicates:** `generateMetadata` and the default export are separate async functions. Next.js does NOT auto-deduplicate non-`fetch` calls (only native `fetch()` is deduped). Since `getDish` uses the Firebase SDK directly, not `fetch()`, no deduplication occurs.

**Estimated cost:** **1 extra Firestore read per dish page load.**

### 4.2 `/dish/[id]` — `listDishReviews` called twice per request

| Call | File | Line | When |
|------|------|------|------|
| 1 | `src/app/(public)/dish/[id]/page.tsx` | L49 | Main page body — extracts photo URLs from reviews |
| 2 | Same | L213 | `DishReviewsSection` async component |

**What:** Same `listDishReviews(dishId)` — queries `reviews` collection with filters.

**Why it duplicates:** The first call (L49) fetches reviews to extract `photoUrl` fields for `DishPhotoGrid`. The second call (L213) fetches the exact same first page of reviews for `LoadMoreReviews`. Both are server-side in the same request.

**Estimated cost:** **1 extra Firestore query (~10–20 reads) per dish page load.** This is the single largest waste.

### 4.3 `/restaurant/[id]` — `getRestaurantDetails` called twice per request

| Call | File | Line | When |
|------|------|------|------|
| 1 | `src/app/(public)/restaurant/[id]/page.tsx` | L18 | `generateMetadata` |
| 2 | Same | L29 | Page component body |

**What:** Same `getRestaurantDetails(id)` — Firestore `getDoc` on `restaurants` collection.

**Estimated cost:** **1 extra Firestore read per restaurant page load.**

### 4.4 `/review/[id]` — `getReview` + `getDish` each called twice

| Call | File | Line | What |
|------|------|------|------|
| 1 | `src/app/(public)/review/[id]/page.tsx` | L13 | `getReview(id)` in metadata |
| 2 | Same | L23 | `getReview(id)` in page |
| 3 | Same | L15 | `getDish(review.dishId)` in metadata |
| 4 | Same | L26 | `getDish(review.dishId)` in page |

**Estimated cost:** **2 extra Firestore reads per review page load** (1 for `getReview`, 1 for `getDish`).

### 4.5 Restaurant dashboard — same analytics endpoint fetched in parent and child pages

| Call | File | Line | Route |
|------|------|------|-------|
| 1 | `restaurant-dashboard/[restaurantId]/page.tsx` | L25–26 | `/restaurant-dashboard/:id` |
| 2 | `restaurant-dashboard/[restaurantId]/dishes/page.tsx` | L26–27 | `/restaurant-dashboard/:id/dishes` |

**What:** Both pages `fetch` `/api/restaurants/:id/analytics` independently on mount. If a user navigates from overview → dishes, the analytics payload (which queries `restaurants`, `dishes`, and `reviews` collections) is fetched again from scratch.

**Why it duplicates:** No shared state or caching between these two client pages. No React Query. Each mounts independently with its own `useEffect`.

**Estimated cost:** **Full analytics computation (~5–15 Firestore reads) duplicated per navigation between the two pages.** The server-side analytics cache (1h TTL) mitigates this somewhat, but the HTTP round-trip and JSON parsing still happen twice.

### 4.6 `useReviewDishContexts` — N × `getDish` calls without dedup

| Consumer | File | Line |
|----------|------|------|
| 1 | `my-profile/page.tsx` | L21 |
| 2 | `profile/[userId]/page.tsx` | L22 |

**What:** For each unique `dishId` in a user's reviews, `useReviewDishContexts` calls `getDish(id)` individually. If a user has 10 reviews across 8 unique dishes, that is 8 Firestore reads.

**Problems:**
1. No caching between navigations — if you visit `/my-profile`, leave, and come back, all N `getDish` calls fire again.
2. If the same dish appears in multiple reviews, it IS deduped within one call (`[...new Set(ids)]`), but not across pages or re-renders.
3. These dish reads are redundant — the review documents themselves could carry `dishName` and `restaurantName` as denormalized fields.

**Estimated cost:** **N Firestore reads per profile page load** (where N = number of unique dishes in the user's reviews, typically 5–20).

### 4.7 Wishlist store never hydrated — `WishlistButton` always starts empty

The `useWishlistStore` has a `setAll` action to hydrate `savedIds`, but **it is never called anywhere in the codebase**. The `useWishlist` hook (React Query) fetches the full wishlist on the `/wishlist` page but never syncs results into the Zustand store.

**Result:** `WishlistButton` (used on `/dish/[id]` and elsewhere) always initializes with `isSaved = false`, regardless of whether the user has saved the dish. The button only reflects the correct state after the user toggles it in the current session.

**This is a functional bug**, not just a performance issue.

### 4.8 Notifications — two independent channels for related data

| What | Where | Mechanism |
|------|-------|-----------|
| Unread count | `Navbar.tsx` L110–115 | `fetch` `/api/notifications/unread-count` (poll every 120s + visibility change) |
| Full notification list | `notifications/page.tsx` L20 | `getNotifications(user.id)` via client Firestore |

When the user is on `/notifications`, both the Navbar poll AND the page's own fetch are running. The Navbar polls via an API route (server-side Firestore), while the page fetches directly from client Firestore. They don't share state.

### 4.9 Auth user fetched from Firestore on every API request

Every authenticated API route calls `getRequestAuth(req)` → `userRepository.getById(verified.userId)` (`src/lib/services/request-auth.ts` L31). This is a Firestore read per API call, even for rapid successive calls from the same user session.

**Estimated cost:** **1 Firestore read per authenticated API call.** On a page like `/rewards` that makes 3 parallel API calls, that's 3 redundant user reads.

### 4.10 Summary of Duplicate Fetches

| Route | Duplicated call | Times called | Extra Firestore reads |
|-------|----------------|--------------|----------------------|
| `/dish/[id]` | `getDish(id)` | 2 (metadata + page) | 1 |
| `/dish/[id]` | `listDishReviews(dishId)` | 2 (photos + section) | ~10–20 |
| `/restaurant/[id]` | `getRestaurantDetails(id)` | 2 (metadata + page) | 1 |
| `/review/[id]` | `getReview(id)` + `getDish(dishId)` | 2 each | 2 |
| `/my-profile` | N × `getDish` (dish contexts) | N (per unique dish) | 5–20 |
| `/profile/[userId]` | N × `getDish` (dish contexts) | N (per unique dish) | 5–20 |
| Dashboard → Dishes nav | Full analytics computation | 2 | 5–15 |
| Any authenticated API | `userRepository.getById` | 1 per API call | 1 per call |

**Conservative estimate per session:** A user who views 3 dish pages, their profile, and navigates the dashboard wastes **~50–80 Firestore reads** that could be avoided.

---

## 5. Auth State

### 5.1 Architecture

```
Firebase Auth (onIdTokenChanged)
        ↓
  AuthProvider (useEffect in src/lib/hooks/useAuth.ts L64–85)
        ↓
  userRepository.getById(authUser.id) → Firestore 'users' doc
        ↓
  useAuthStore.setUser(user, authUser)  ← Zustand
        ↓
  useAuth() hook reads from Zustand (32 call sites)
```

- **No React Context** for auth — purely Zustand.
- `AuthProvider` is mounted once at app root (`src/app/providers.tsx` L56).
- `useAuth()` is a thin wrapper: `{ user, authUser, isLoading, isAuthenticated: !!user }`.

### 5.2 Firestore User — Per Navigation or Cached?

**Client-side:** The user profile is loaded ONCE in the `AuthProvider` subscription and stored in Zustand. It persists across client navigations without refetching. **However**, on each `onIdTokenChanged` event (including token refresh, ~every 1 hour), `userRepository.getById` runs again.

**Server-side (API routes):** Every authenticated API call runs `getRequestAuth` → `userRepository.getById(userId)` — a fresh Firestore read per request. No caching.

### 5.3 `useAuth()` Call Sites (32 total)

<details>
<summary>Full list of 32 files calling useAuth()</summary>

| File | Line |
|------|------|
| `src/app/(protected)/write-review/page.tsx` | 33 |
| `src/app/(protected)/my-profile/page.tsx` | 17 |
| `src/app/(protected)/profile/[userId]/page.tsx` | 18 |
| `src/app/(protected)/compare/page.tsx` | 81 |
| `src/app/(protected)/notifications/page.tsx` | 14 |
| `src/app/(protected)/rewards/page.tsx` | 16 |
| `src/app/(protected)/wishlist/page.tsx` | 15 |
| `src/app/(protected)/settings/page.tsx` | 33 |
| `src/app/(protected)/onboarding/page.tsx` | 25 |
| `src/app/(protected)/upgrade/page.tsx` | 31 |
| `src/app/(protected)/claim-restaurant/[id]/page.tsx` | 23 |
| `src/app/(protected)/restaurant-dashboard/[restaurantId]/page.tsx` | 14 |
| `src/app/(protected)/restaurant-dashboard/[restaurantId]/dishes/page.tsx` | 15 |
| `src/app/(protected)/layout.tsx` | 11 |
| `src/app/(admin)/layout.tsx` | 11 |
| `src/app/(admin)/admin/page.tsx` | — (via service) |
| `src/app/(admin)/admin/users/page.tsx` | 12 |
| `src/app/(admin)/admin/reviews/page.tsx` | 12 |
| `src/app/(admin)/admin/requests/page.tsx` | 13 |
| `src/app/(admin)/admin/coupons/page.tsx` | 37 |
| `src/app/(admin)/admin/restaurant-claims/page.tsx` | 13 |
| `src/components/layouts/Navbar.tsx` | 103 |
| `src/components/layouts/AdminShell.tsx` | 25 |
| `src/components/layouts/Footer.tsx` | 59 |
| `src/components/layouts/MobileBottomNav.tsx` | 20 |
| `src/components/features/ReviewCard.tsx` | 34 |
| `src/components/features/LandingCTA.tsx` | 7 |
| `src/components/features/LoadMoreReviews.tsx` | 31 |
| `src/components/features/LoadMoreDishes.tsx` | 31 |
| `src/components/features/PersonalStatsBanner.tsx` | 17 |
| `src/components/features/WishlistButton.tsx` | 19 |
| `src/lib/hooks/useWishlist.ts` | 10 |
| `src/lib/hooks/useMyReviews.ts` | 6 |

</details>

This is fine because `useAuth()` reads from Zustand (no network call). Each call is a cheap store subscription.

### 5.4 Race Conditions

| Risk | Location | Status |
|------|----------|--------|
| Data fetch before auth resolves | `(protected)/layout.tsx` L10–40 | **Mitigated** — `AuthGate` waits on `isLoading`, shows spinner |
| React Query runs before user | `useWishlist` L15, `useMyReviews` L10 | **Mitigated** — `enabled: !!userId` / `enabled: !!user` |
| `onIdTokenChanged` callback race | `useAuth.ts` L65–83 | **Risk** — async callback is not cancelled if a second event fires before `getById` resolves. Late responses could overwrite newer state. |
| Failed profile create → inconsistent state | `useAuth.ts` L72–80 | **Risk** — if both `getById` and `createFromAuthUser` return `null`, `setUser(null, authUser)` runs: `isAuthenticated` is `false` but Firebase still considers user signed in. |
| `setLoading` action never called | `authStore.ts` L20 | **Unused** — `isLoading` transitions only via `setUser`/`clearUser`. |

### 5.5 Session Management

| Mechanism | Details |
|-----------|---------|
| Firebase Auth persistence | Browser default (`indexedDB`); no explicit `setPersistence` call |
| `__session` cookie | Set to `"1"` (not JWT) on sign-in/sign-up; 7-day max-age; `SameSite=Lax` |
| Middleware (`src/middleware.ts`) | Checks for `__session` cookie OR `Authorization: Bearer` header. Does NOT verify the JWT — just checks presence. |
| API route auth | `getRequestAuth` verifies JWT via Google certs, then loads user from Firestore |
| Admin protection | Client-only (`(admin)/layout.tsx` checks `user.isAdmin`). **Middleware does not gate `/admin` paths.** API routes behind admin check `isAdmin` from Firestore user. |

---

## 6. Missing Optimistic Updates

### Already Optimistic (well done)

| Action | File | How |
|--------|------|-----|
| Toggle wishlist (from button) | `WishlistButton.tsx` L32–52 | Zustand `addId`/`removeId` before `fetch`; rollback on `!res.ok` |
| Helpful vote | `ReviewCard.tsx` L56–71 | `setHasVoted(true)` + bump count before `fetch`; rollback on error |
| Flag review | `ReviewCard.tsx` L73–88 | `setFlagged(true)` before `fetch`; rollback on error |

### Missing Optimistic Updates — Safe to Add

| Action | File | Lines | Current behavior | Safe? | Expected impact |
|--------|------|-------|-----------------|-------|-----------------|
| Mark all notifications read | `notifications/page.tsx` | L25–34 | Waits for `res.ok` before mapping `isRead: true` | **Yes** — low risk, easy rollback | Instant UI feedback |
| Remove from wishlist (list page) | `wishlist/page.tsx` | L19–30 | Waits for DELETE then `invalidateQueries` | **Yes** — already optimistic in `WishlistButton`; list page should match | Remove card immediately |
| Delete own review | `my-profile/page.tsx` | L34–50 | Waits for DELETE then `invalidateQueries` (full refetch) | **Yes** — use `setQueryData` to filter locally | Instant card removal |
| Explore filter changes | `explore-filters.tsx` | L172–186 | Already partially optimistic (optimistic local state + pending UI) | **Done** | — |

### Missing Optimistic Updates — Possible but Needs Care

| Action | File | Lines | Notes |
|--------|------|-------|-------|
| Admin deactivate coupon | `admin/coupons/page.tsx` | L123–136 | Could remove from list optimistically; rollback if server rejects |
| Admin approve/reject claims | `admin/restaurant-claims/page.tsx` | L34–52 | Low volume; optimistic is nice but not critical |
| Admin approve/reject dish requests | `admin/requests/page.tsx` | L22–52 | Same as above |

### Not Safe for Optimistic Updates

| Action | File | Why |
|--------|------|-----|
| Submit/edit review | `write-review/page.tsx` | Complex validation, photo upload, points calculation — must confirm server success |
| Sign in / Sign up / Password reset | Auth pages | Auth state must match server |
| Redeem coupon | `rewards/page.tsx` | Points balance must be verified server-side |
| Payment/billing | `upgrade/page.tsx` | Money involved |
| Onboarding complete | `onboarding/page.tsx` | `updateUser` result not checked (see bug below) |

**Bug found:** `onboarding/page.tsx` L47–50 calls `await updateUser(...)` but does not check the return value. If the write fails, `setUser(updatedUser, authUser)` still runs with locally-constructed data, and the user is navigated away. The Firestore doc may not reflect the onboarding choices.

---

## 7. Recommendations

### P0 — Critical (duplicate fetches / wasted Firestore reads)

| # | What to change | File(s) | Expected impact |
|---|---------------|---------|-----------------|
| P0-1 | **Deduplicate `getDish` in `/dish/[id]`**: Fetch once in page component, pass to metadata via a shared variable or use React `cache()` wrapper. | `src/app/(public)/dish/[id]/page.tsx` | Saves **1 Firestore read per dish page load** |
| P0-2 | **Deduplicate `listDishReviews` in `/dish/[id]`**: Fetch reviews once in the page body (L47–49), pass as prop to `DishReviewsSection` instead of fetching again in L213. | `src/app/(public)/dish/[id]/page.tsx` | Saves **~10–20 Firestore reads per dish page load** (this is the biggest win) |
| P0-3 | **Deduplicate `getRestaurantDetails` in `/restaurant/[id]`**: Same pattern as P0-1. | `src/app/(public)/restaurant/[id]/page.tsx` | Saves **1 Firestore read per restaurant page load** |
| P0-4 | **Deduplicate `getReview` + `getDish` in `/review/[id]`**: Fetch once, share between metadata and page. | `src/app/(public)/review/[id]/page.tsx` | Saves **2 Firestore reads per review page load** |
| P0-5 | **Fix `WishlistButton` hydration bug**: After `useWishlist` (React Query) loads, call `useWishlistStore.getState().setAll(items)` to hydrate `savedIds`. Alternatively, derive `isSaved` from the React Query cache instead of the Zustand store. | `src/lib/hooks/useWishlist.ts`, `src/components/features/WishlistButton.tsx` | Fixes incorrect "Save" state on all dish pages for logged-in users |
| P0-6 | **Cache `getRequestAuth` user lookup per request**: Use a request-scoped `Map` or `AsyncLocalStorage` to avoid re-reading the same user doc on every API call within a single request cycle. | `src/lib/services/request-auth.ts` | Saves **1 Firestore read per redundant API call** (e.g., 2 saved on `/rewards` which makes 3 parallel calls) |

### P1 — Important (state that should be lifted or shared)

| # | What to change | File(s) | Expected impact |
|---|---------------|---------|-----------------|
| P1-1 | **Denormalize `dishName` and `restaurantName` onto review documents**: Eliminates the need for `useReviewDishContexts` to make N × `getDish` calls on profile pages. | `src/lib/hooks/useReviewDishContexts.ts`, review write logic | Saves **5–20 Firestore reads per profile page load** |
| P1-2 | **Share analytics state between restaurant dashboard pages**: Use React Query or a shared Zustand store for `/restaurant-dashboard/:id` and `.../dishes`. | `restaurant-dashboard/[restaurantId]/page.tsx`, `.../dishes/page.tsx` | Saves **5–15 Firestore reads** when navigating between dashboard pages |
| P1-3 | **Wrap core Firestore service functions with React `cache()`**: For server components, wrapping `getDish`, `getRestaurantDetails`, `getReview`, `listDishReviews` with `cache()` would auto-deduplicate within a single request. | `src/lib/services/dishes.ts`, `src/lib/services/catalog.ts`, `src/lib/services/reviews.ts` | Automatically fixes P0-1, P0-2, P0-3, P0-4 without restructuring page code |
| P1-4 | **Move all admin page fetches from `useEffect` to React Query**: Consistent caching, prevents refetch on re-mount, enables background refresh. | All `src/app/(admin)/admin/*.tsx` pages | Better UX + prevents unnecessary fetches on navigation |
| P1-5 | **Move `/notifications` and `/rewards` fetches to React Query**: Consistent with wishlist/reviews pattern. Share notification count between Navbar and notifications page. | `notifications/page.tsx`, `rewards/page.tsx`, `Navbar.tsx` | Deduplication + stale data reuse across navigations |
| P1-6 | **Fix onboarding `updateUser` unchecked return**: Check the return value and show an error if the write fails. | `src/app/(protected)/onboarding/page.tsx` L47–50 | Prevents silent data loss |
| P1-7 | **Fix `onIdTokenChanged` async callback race**: Use an abort flag or version counter to discard stale `getById` responses when a newer auth event has fired. | `src/lib/hooks/useAuth.ts` L65–83 | Prevents stale user data from overwriting current state during rapid auth changes |

### P2 — Nice to Have (optimistic updates, better memoization)

| # | What to change | File(s) | Expected impact |
|---|---------------|---------|-----------------|
| P2-1 | **Optimistic delete on my-profile**: Use `queryClient.setQueryData` to remove the review from the list immediately, before the API call completes. | `src/app/(protected)/my-profile/page.tsx` L34–50 | Instant card removal instead of waiting for refetch |
| P2-2 | **Optimistic mark-all-read on notifications**: Set all `isRead: true` immediately, revert on failure. | `src/app/(protected)/notifications/page.tsx` L25–34 | Instant visual feedback |
| P2-3 | **Optimistic remove on wishlist page**: Remove card from list immediately (matches `WishlistButton` behavior). | `src/app/(protected)/wishlist/page.tsx` L19–30 | Consistent with `WishlistButton` optimism |
| P2-4 | **Fix redundant `invalidateQueries` in wishlist page**: L26 and L28 both invalidate `['wishlist']`. Remove the duplicate. | `src/app/(protected)/wishlist/page.tsx` L26–28 | Cleaner code, one less unnecessary refetch on error path |
| P2-5 | **Add `React.memo` to `ReviewCard` and `DishCard`**: These render in lists and would benefit from memoization to prevent re-renders when parent state changes. | `src/components/features/ReviewCard.tsx`, `DishCard.tsx` | Fewer re-renders on list pages |
| P2-6 | **Add `useMemo` for computed values**: Profile pages compute `earnedBadges`, `allBadges`, `progress` etc. on every render. Memoize with `useMemo`. | `my-profile/page.tsx`, `profile/[userId]/page.tsx` | Minor perf improvement |
| P2-7 | **Move Navbar unread count to React Query**: Replace manual `setInterval` + `fetch` with `useQuery` + `refetchInterval`. Enables sharing with notifications page. | `src/components/layouts/Navbar.tsx` L106–135 | Cleaner code, automatic dedup with notifications |

---

## Appendix: Files Referenced

<details>
<summary>All files examined in this audit</summary>

**Stores:**
- `src/lib/store/authStore.ts`
- `src/lib/store/wishlistStore.ts`
- `src/lib/store/reviewFormStore.ts`

**Context:**
- _(CityContext removed — single city mode)_

**Hooks:**
- `src/lib/hooks/useAuth.ts`
- `src/lib/hooks/useWishlist.ts`
- `src/lib/hooks/useMyReviews.ts`
- `src/lib/hooks/useReviewDishContexts.ts`
- `src/lib/hooks/useDebounce.ts`

**Auth:**
- `src/lib/auth/firebase-provider.ts`
- `src/lib/auth/firebase-auth-provider.ts`
- `src/lib/auth/provider.ts`
- `src/lib/services/request-auth.ts`
- `src/middleware.ts`

**Services / Caching:**
- `src/lib/services/analytics-cache.ts`
- `src/lib/services/restaurant-analytics.ts`
- `src/lib/services/reviews.ts`
- `src/lib/services/dishes.ts`
- `src/lib/services/catalog.ts`
- `src/lib/services/users.ts`
- `src/lib/services/notifications.ts`
- `src/lib/services/billing.ts`
- `src/lib/services/coupon.ts`
- `src/lib/services/rewards.ts`

**Pages (public):**
- `src/app/(public)/page.tsx`
- `src/app/(public)/dish/[id]/page.tsx`
- `src/app/(public)/restaurant/[id]/page.tsx`
- `src/app/(public)/review/[id]/page.tsx`
- `src/app/(public)/cuisine/[slug]/page.tsx`
- `src/app/(public)/explore/page.tsx`
- `src/app/(public)/explore/explore-filters.tsx`

**Pages (protected):**
- `src/app/(protected)/write-review/page.tsx`
- `src/app/(protected)/my-profile/page.tsx`
- `src/app/(protected)/profile/[userId]/page.tsx`
- `src/app/(protected)/notifications/page.tsx`
- `src/app/(protected)/rewards/page.tsx`
- `src/app/(protected)/wishlist/page.tsx`
- `src/app/(protected)/settings/page.tsx`
- `src/app/(protected)/onboarding/page.tsx`
- `src/app/(protected)/upgrade/page.tsx`
- `src/app/(protected)/compare/page.tsx`
- `src/app/(protected)/claim-restaurant/[id]/page.tsx`
- `src/app/(protected)/restaurant-dashboard/[restaurantId]/page.tsx`
- `src/app/(protected)/restaurant-dashboard/[restaurantId]/dishes/page.tsx`
- `src/app/(protected)/review-success/page.tsx`

**Pages (admin):**
- `src/app/(admin)/admin/page.tsx`
- `src/app/(admin)/admin/users/page.tsx`
- `src/app/(admin)/admin/reviews/page.tsx`
- `src/app/(admin)/admin/requests/page.tsx`
- `src/app/(admin)/admin/coupons/page.tsx`
- `src/app/(admin)/admin/restaurant-claims/page.tsx`

**Pages (auth):**
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`

**Layouts / Providers:**
- `src/app/providers.tsx`
- `src/app/layout.tsx`
- `src/app/(protected)/layout.tsx`
- `src/app/(admin)/layout.tsx`

**Components:**
- `src/components/layouts/Navbar.tsx`
- `src/components/layouts/AdminShell.tsx`
- `src/components/layouts/MobileBottomNav.tsx`
- `src/components/layouts/Footer.tsx`
- `src/components/features/ReviewCard.tsx`
- `src/components/features/WishlistButton.tsx`
- `src/components/features/LoadMoreReviews.tsx`
- `src/components/features/LoadMoreDishes.tsx`
- `src/components/features/DishPhotoGrid.tsx`
- `src/components/features/SearchBar.tsx`
- `src/components/features/HeroSection.tsx`
- `src/components/features/PersonalStatsBanner.tsx`
- `src/components/features/ExploreResultsWrapper.tsx`
- `src/components/ui/StarRating.tsx`
- `src/components/ui/TagCloud.tsx`
- `src/components/ui/ThemeToggle.tsx`

**Config:**
- `next.config.ts`

</details>

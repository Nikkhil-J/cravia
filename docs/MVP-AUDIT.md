# Cravia — MVP Readiness Audit

**Date:** April 27, 2026
**Methodology:** Code-level analysis of every page, component, API route, and validation schema. No assumptions — every claim verified against implementation.

---

## 1. Feature Status Audit

### 1. Landing Page (Value Prop + CTA)

**Status: ⚠️ Partially implemented**

What works:
- Hero with clear headline: "Find the best dishes at restaurants near you"
- Quick-tag buttons (Biryani, Pizza, etc.) that link to explore
- StatsBar with live restaurant count, review count, city count
- "Browse by cuisine" grid (10 cuisines from constants)
- "How it works" 4-step explainer
- Bottom CTA band (sign up or explore)
- PersonalStatsBanner for returning users with 1+ reviews

What's missing or broken:
- **No sample reviews or featured dishes on the landing page.** A food review platform shows zero actual reviews on its front door. No social proof beyond aggregate numbers.
- **StatsBar "Growing fast" badge is hardcoded** — always shows regardless of growth rate. Feels artificial.
- **"Restaurants near you" section silently disappears when there are zero restaurants.** No empty state, no messaging — the section just isn't rendered.
- **Hero search bar is decorative.** It's a static `<div>` with placeholder text, not an actual input. Users can't type into it — clicking navigates to `/explore`. This is deceptive UX.
- **No dish content on landing.** For a "dish-level review platform," the landing page never shows a single dish. Only restaurant cards and cuisine categories.
- **CTA never pushes toward writing reviews.** Both CTAs (hero and bottom) push toward explore or signup. "Write a review" is buried in the footer for auth users only.

### 2. Search (Dish + Restaurant)

**Status: ⚠️ Partially implemented**

What works:
- Navbar search bar (desktop) debounces input and navigates to `/explore?q=`
- Typesense (when configured) searches restaurants across name, cuisines, dishNames with typo tolerance
- Typesense dish search works across name, restaurantName, cuisines, topTags

What's missing or broken:
- **Explore page only shows restaurant results, never dishes.** The placeholder says "Search restaurants or dishes..." but `DishCard` / `LoadMoreDishes` are never rendered on the explore page. Dish search exists as an API (`/api/dishes`) but has no user-facing surface except the compare page (premium only).
- **Without Typesense, search is severely degraded.** Firestore fallback does prefix-only matching on `nameLower`. No typo tolerance, no restaurant name search from the dish query, no mid-word matching. Searching "chicken" for "Butter Chicken" returns nothing.
- **Firestore restaurant fallback filters city/cuisine in memory** after fetching a page of docs. This can return fewer results than expected or empty pages even when matching restaurants exist.
- **No search results page for dishes.** A user searching for "Biryani" sees restaurants, not the biryani dishes they want to review.
- **Mobile explore has a local SearchBar; desktop relies solely on the navbar search.** Desktop explore page has no visible search input on the page itself (`md:hidden` on the local SearchBar).

### 3. Explore / Browse Page

**Status: ⚠️ Partially implemented**

What works:
- Restaurant grid with pagination ("Load more restaurants")
- Cuisine filter chips
- Area filter (city-dependent)
- Sort options (most-reviewed, newest, alphabetical)
- Skeleton loading state
- Empty state with "Clear filters" CTA

What's missing or broken:
- **No dish browsing.** Only restaurants. For a dish-level platform this is a critical gap.
- **RestaurantCard shows no ratings or review counts.** Users can't gauge which restaurants are worth clicking. The card only shows name, area, city, and cuisines.
- **"Clear all" in filters only clears cuisine and area**, not the search query or sort. Inconsistent with the EmptyState "Clear filters" link which resets everything.
- **`ExploreResultsWrapper` has a logic bug.** `useEffect(() => { setPendingFlag(false) })` runs every render and immediately clears the pending overlay — the loading overlay likely never shows as intended.
- **Load more fails silently.** If the fetch returns non-200, the button does nothing. No error toast, no retry indication.

### 4. Restaurant Page

**Status: ✅ Fully functional**

What works:
- Server-rendered with ISR (1h revalidation)
- Restaurant info: name, area, cuisines, Google Maps link, phone, website
- Menu listing with local text search filter (`RestaurantMenu`)
- Each dish links to its detail page
- Cover image with fallback
- "Claim this restaurant" CTA for authenticated users
- "Write a review" button per dish (links to `/write-review` with params)
- `generateMetadata` for SEO

Minor issues:
- If restaurant has zero dishes, user sees an empty menu with no guidance on how to request a dish.

### 5. Dish Detail Page

**Status: ✅ Fully functional**

What works:
- Server-rendered with ISR (1h revalidation)
- Full rating breakdown (overall, taste, portion, value with sub-rating bars)
- Tag cloud from `topTags`
- Photo grid from reviews
- Paginated reviews with "Load more"
- JSON-LD structured data for SEO
- Related dishes from same restaurant
- Wishlist button
- "Write a review" CTA
- `generateMetadata` with dish name + restaurant

Minor issues:
- Photo grid with 0 photos just shows the CTA "Be the first to add a photo!" — acceptable.
- If dish has 0 reviews, all ratings show 0.0 with empty bars — looks dead but is technically correct.

### 6. Review Submission Flow

**Status: ⚠️ Partially implemented — critical validation gaps**

What works:
- Multi-section form: photo (optional), ratings (taste/portion/value), tags, text
- Cloudinary upload for dish photo and bill photo
- Duplicate review prevention (same user + same dish → 409)
- Rate limiting (5 reviews/hour)
- DishPoints awarded on submission
- Review success page with points breakdown and badge notifications
- Edit mode within 24-hour window
- Delete from profile

What's missing or broken:
- **Photo is optional.** For a platform whose core promise is "photo-backed dish reviews," the photo upload says "Optional — but photos make reviews way more helpful." The server accepts reviews with no photo.
- **Server allows 0 tags.** Client requires ≥1 tag, but `createReviewSchema` defaults `tags` to `[]`. A crafted API request bypasses the tag requirement entirely.
- **Edit schema has no minimum text length.** `updateReviewSchema` makes `text` optional with no `min(30)`. A user can edit their 200-character review down to "x" via API.
- **Edit schema allows empty tags.** Tags can be set to `[]` on edit.
- **No `restaurantId` ↔ dish validation.** API doesn't verify that the `restaurantId` matches the dish document. A malicious or buggy client can submit inconsistent data.
- **Bill upload claims PDF support but rejects it.** File input accepts `application/pdf` but `validatePhotoFile` only accepts images. PDFs fail client-side. The Cloudinary endpoint is `image/upload` anyway.
- **`isVerified` is always `false`.** Despite UI copy suggesting bill verification adds trust, new reviews always store `isVerified: false`. No verification logic exists.
- **Cannot change or remove photo on edit.** PATCH body doesn't include `photoUrl` or `billUrl`.
- **No dishId param → dead page.** If user navigates to `/write-review` without `dishId` query param, they see "Which dish are you reviewing?" with only an "Explore Dishes" link. No search, no picker.
- **`validateReviewForm` utility is inconsistent.** Still requires photo as mandatory, contradicting the page and API. Not used by the write-review page.

### 7. Review Edit/Delete

**Status: ✅ Fully functional (with caveats)**

What works:
- Edit within 24-hour window from profile
- Delete with confirmation from profile
- Server validates ownership (or admin)
- Dish averages and tag counts recalculated on delete

Caveats:
- Edit validation gaps noted above (no min text length, empty tags allowed)
- Cannot edit photo or bill

### 8. Wishlist

**Status: ✅ Fully functional**

What works:
- Add/remove from dish page via WishlistButton
- Wishlist page lists saved dishes with remove
- Optimistic UI via Zustand store
- React Query for data fetching + invalidation
- Empty state when no dishes saved

### 9. User Profile (Stats, Badges, Reviews)

**Status: ✅ Fully functional**

What works:
- My profile: level, progress bar, stats (reviews, helpful, badges, DishPoints), full badge grid (earned + locked), member since, review list with edit/delete
- Public profile: review count, helpful votes, badges, member since, review list
- Premium upsell for non-premium users

Minor issues:
- `if (!user) return null` — no explicit loading-to-empty transition; could flash blank

### 10. Authentication (Google + Email)

**Status: ✅ Fully functional**

What works:
- Google popup sign-in (login + signup)
- Email/password with validation
- Password strength meter on signup
- Forgot password flow
- Onboarding after signup (3 steps: cuisines, city/area, start exploring)
- Session cookie for middleware UX guard
- Server-side token verification via Firebase Admin

Minor issues:
- Onboarding `setUser` after save only merges `city`, not `favoriteCuisines` or `area` into client store (stale until page refresh)

### 11. Notifications

**Status: ⚠️ Partially implemented**

What works:
- Notification page lists all notifications for user
- Popover in navbar shows recent + unread count
- Mark as read (single + all)
- Server creates notifications on: helpful vote, review approval (admin), points milestones, coupon claims, dish request decisions

What's missing:
- **Polling only, not real-time.** Unread count polls on an interval + visibility change. No push notifications, no real-time Firestore listener.
- Notification popover empty state references "when your reviews are approved" — implies moderation queue, but reviews auto-approve (`isApproved: true` on create). Misleading copy.

### 12. Admin Panel

**Status: ⚠️ Partially implemented**

What works:
- Dashboard with aggregate stats
- Flagged reviews: unflag or delete
- User management: toggle admin/premium
- Restaurant claims: approve/reject with notes
- Dish requests: approve (creates dish) / reject
- Coupons: create, list, deactivate

What's missing:
- **No general moderation queue.** Admin only sees flagged reviews, not all reviews. Cannot proactively moderate.
- **No content review before publication.** Reviews go live immediately (`isApproved: true`) — admin moderation is reactive only.
- **Admin coupons page uses raw HTML `<select>`, `<textarea>`, `<option>`** — violates the project's own shadcn rules.
- No bulk operations on any admin page.

---

## 2. End-to-End User Journey Test

### Simulating: New user arrives, searches for a dish, reads reviews, writes one

**Step 1: Lands on site**
- Sees hero with "Find the best dishes at restaurants near you" — good.
- StatsBar shows counts — but if this is early-stage (say 3 restaurants, 5 reviews, 2 cities), the numbers look unimpressive. "3+" restaurants with "Growing fast" badge feels dishonest.
- **No actual dish content visible.** User sees restaurant cards and cuisine categories, but zero dishes. For a dish review platform, this is an identity crisis on the homepage.

**Step 2: Searches for a dish**
- User clicks the hero search bar. It animates away and navigates to `/explore?focus=1`.
- On explore, they type "Butter Chicken" into the search bar.
- **Results show restaurants, not dishes.** User searched for a dish but sees restaurant cards with no ratings. They have to guess which restaurant might have Butter Chicken reviews.
- Without Typesense: searching "Butter Chicken" returns nothing (prefix search on restaurant `nameLower` doesn't match dish names).
- **Trust lost here.** User's core intent was "tell me about Butter Chicken" and the platform can't answer that directly.

**Step 3: Opens a restaurant, finds the dish**
- User clicks a restaurant card, sees the menu, finds Butter Chicken.
- Clicks through to the dish page.

**Step 4: Evaluates if it's useful**
- **If the dish has 3+ reviews with photos:** Great experience. Ratings breakdown, photos, tags, review text — this is the value prop working.
- **If the dish has 0-1 reviews:** All ratings show 0.0 or one person's opinion. Photo grid is empty or has one photo. Tag cloud is sparse. **The page looks dead.** No indication of how many people have viewed this, no community activity signals.
- **This is the make-or-break moment.** Early-stage Cravia will have mostly 0-1 review dishes. The dish page doesn't handle this well — no "Be among the first to review!" urgency, no explanation of what ratings mean when based on 1 data point.

**Step 5: Attempts to write a review**
- Clicks "Write a review" on the dish page → navigates to `/write-review?dishId=...&restaurantId=...`
- Must be logged in → redirected to login if not.
- **Form friction:** Photo section appears first but is optional. Ratings are star-based (works). Tags require selection (works). Text requires 30 chars (works).
- **Upload friction:** Photo upload goes to Cloudinary. On slow connections, 30-second timeout may feel like the app is broken.
- **Would a real user complete this?** Depends. The form is well-structured, but there's no clear incentive visible during the flow. DishPoints are mentioned only AFTER submission on the success page. A first-time user doesn't know about points until they've already done the work.

### Where the experience breaks:
1. **Search → results disconnect.** Searching for a dish shows restaurants.
2. **No dish browsing surface.** Cannot browse dishes without going through restaurants first.
3. **Sparse content on dish pages.** Early-stage dishes look dead.

### Where trust is lost:
1. **"Growing fast" badge on an empty database.**
2. **Search placeholder says "Search restaurants or dishes..." but only restaurants appear.**
3. **Review auto-approves** but notification copy implies a moderation queue.

### Where friction is too high:
1. **Two clicks to reach a dish from search** (search → restaurant → dish).
2. **No incentive visibility before review submission.**
3. **Write-review with no dishId shows a dead end** instead of a dish search.

---

## 3. Review Quality Assessment

### Are tags enforced properly?
**No.** Client requires ≥1 tag, but `createReviewSchema` uses `.default([])` which normalizes an omitted `tags` field to an empty array. Server accepts 0 tags. On edit, tags are fully optional. A direct API call can create or edit a review with zero tags.

### Is text meaningful or optional fluff?
**Partially enforced.** Create requires ≥30 characters on both client and server. However:
- 30 characters is very low ("This was really good I liked it" = 31 chars). Easy to write meaningless text.
- **Edit has no minimum text length at all.** `updateReviewSchema` makes `text` optional with no `.min()`. A user can edit their review to "." via API.
- No content quality checks beyond length (no profanity filter, no gibberish detection beyond the 5-distinct-words check for full review points).

### Is photo requirement working?
**Photo is not required.** UI says "Optional." Server accepts reviews without photos. For a platform whose positioning is "photo-backed dish reviews," this undermines the core value prop. The only incentive is: photo = 25 points (full review) vs no photo = 10 points (basic). That's too subtle.

### Can low-quality reviews slip through?
**Yes, easily.** A minimum-viable spam review:
- 3 star ratings (1-5 each) ✓
- 0 tags (via API, bypassing client) ✓
- 30 characters of text ("This was okay nothing special really") ✓
- No photo ✓
- Auto-approved immediately (`isApproved: true`) ✓

There is no pre-publication review queue. The `passesTextQualityCheck` in rewards only affects point classification (full vs basic), not whether the review is published. Duplicate text from same user causes point downgrade but the review still publishes.

### Consistency across reviews
**Mixed.** The structured format (ratings + tags + text) enforces some consistency. But:
- Tag usage is inconsistent (0 tags possible via API)
- No standardization of what ratings mean (no rubric shown to users)
- Photo presence varies
- Review text quality varies enormously at the 30-char minimum

---

## 4. "Why Would I Use This?" Test

### Is the value immediately obvious?
**Partially.** The hero says "Find the best dishes at restaurants near you" — clear. The 4-step "How it works" is informative. But:
- No actual dish reviews visible on the landing page
- No before/after comparison ("Before Cravia you guess. With Cravia you know.")
- No user testimonials or reviewer quotes
- The transition from "this sounds useful" to "let me try it" is weak — the first interaction (search) returns restaurants not dishes

### Is there enough content to trust decisions?
**In early stage: No.** A dish with 0-1 reviews provides no statistical confidence. The platform doesn't communicate sample size limitations ("Based on 1 review — add yours!"). Dish pages show sub-ratings with decimal precision (e.g., "4.3 taste") that implies statistical validity from potentially one review.

### Pages that feel dead (low data density):
- **Explore page with no query:** Restaurant cards with no ratings, no review counts. Just names and locations.
- **Dish pages with 0-1 reviews:** Empty photo grids, zero or one-sample ratings, sparse tag clouds.
- **Landing page "Restaurants near you":** If database is sparse, this section disappears entirely. Landing becomes hero + stats + cuisines + "how it works" — feels like a template.

### Missing social proof:
- No "X people found this review helpful" prominence
- No "Trending dishes" or "Most reviewed this week"
- No reviewer leaderboard or "Top reviewers" on landing
- No specific review quotes on the landing page
- StatsBar numbers may be low and unimpressive early on

### Weak value messaging:
- "Read honest dish-level reviews from real food lovers" — generic. Could be any food platform.
- No differentiation messaging ("Unlike Google reviews, we focus on individual dishes")
- No explanation of the rating system (taste + portion + value) on the landing page
- The unique value prop (structured dish-level reviews) isn't demonstrated — only described

---

## 5. Contribution Motivation Analysis

### Why would a user submit a review RIGHT NOW?

**Gamification (DishPoints, badges, levels):**
- Points exist: 10 basic, 25 full (photo + tags + 30 chars).
- Badges exist: first-bite (1 review), regular (5), dish-explorer (10), etc.
- Levels exist: Newbie → Foodie → Critic → Legend.
- Coupon redemption at 500 points.
- **Problem:** None of this is visible BEFORE the first review. The success page reveals points after submission. A new user has zero awareness of the rewards system when deciding whether to write a review. The rewards page is buried in the nav — it's a discovery problem.

**Emotional reward (recognition, visibility):**
- Review shows user name and avatar on the dish page — good.
- Helpful votes provide social validation.
- Badges displayed on profile.
- **Problem:** In early stage, dishes have few views, so reviews get few helpful votes. The feedback loop is too slow to be motivating.

**Product feedback (does user feel their input matters?):**
- "Be the first to add a photo!" on empty dishes — weak but present.
- Review success page says "Your review helps other diners decide" — buried after the effort.
- **Problem:** No in-flow messaging about impact. No "This dish has been viewed 47 times — your review will help real people." No notifications when someone views your reviewed dish.

### Honest assessment: Motivation is weak for new users.

The rewards system is solid in design but invisible at the moment of decision. A user on a dish page sees "Write a review" button and has to intrinsically want to contribute. The extrinsic motivation (points, badges, coupons) is only revealed after they've already done the work.

**The cold-start problem is severe:** Few reviews → few views → few helpful votes → low motivation → few reviews.

---

## 6. Critical MVP Gaps

These are the only items that would cause the MVP to fail if launched today:

### Gap 1: No dish search results anywhere
**Impact:** Core value (find info about a specific dish) is unreachable through search. Users searching for "Biryani" see restaurant names, not biryani dishes. The platform's entire positioning — "dish-level reviews" — is contradicted by its search experience.

### Gap 2: Photo is optional on a "photo-backed review" platform
**Impact:** Reviews without photos provide significantly less value. A dish page full of text-only reviews looks like Google Reviews, not the premium photo-backed experience Cravia promises. Undermines differentiation.

### Gap 3: Server-side validation gaps allow low-quality reviews
**Impact:** Reviews with 0 tags and no photo can be created via API. Edit can strip text to any length and remove all tags. Once these exist in the database, they dilute the quality signal that Cravia depends on for trust.

### Gap 4: Sparse content looks dead, not "early"
**Impact:** Dish pages with 0-1 reviews show empty photo grids, zero-value ratings, and no calls to action beyond a generic "Write a review." There's no framing for "we're new, your review matters" — it just looks abandoned.

### Gap 5: Rewards invisible before first contribution
**Impact:** The entire gamification system (points, badges, coupons) is invisible on dish pages, restaurant pages, and the review form. Users discover points only AFTER reviewing. This fails to convert browsers into contributors — the single most important conversion for a review platform.

### Gap 6: No dish browsing surface
**Impact:** Explore only shows restaurants. There's no way for a user to browse dishes by cuisine, rating, tags, or dietary preference — even though the API supports all these filters. A user wanting "best veg dishes in Gurugram" has no path to that answer.

---

## 7. Prioritized Fix List

### P0 — Must Fix Before Launch (Non-Negotiable)

**P0-1: Add dish results to explore page (or create a dish search tab)**
- **Problem:** Search only returns restaurants. Core promise of "find dish reviews" is broken.
- **Why it matters:** Users searching for "Butter Chicken" expect to see Butter Chicken, not a list of restaurants that might serve it.
- **Fix:** Add a "Dishes" tab or section to the explore page using `LoadMoreDishes` + the existing `/api/dishes` endpoint. The infrastructure already exists — it just needs a UI surface.

**P0-2: Fix server-side tag validation**
- **Problem:** `createReviewSchema` allows 0 tags via `.default([])`. `updateReviewSchema` allows empty tags and has no text minimum.
- **Why it matters:** Low-quality reviews degrade platform trust.
- **Fix:** Change `createReviewSchema` tags to `z.array(z.enum(TAG_LIST)).min(1)`. Add `.min(30)` to `updateReviewSchema` text. Add `.min(1)` to update tags when provided.

**P0-3: Show rewards/points on the dish page and review form**
- **Problem:** Users have zero awareness of DishPoints when deciding to review.
- **Why it matters:** Without visible incentives, review submission rates will be critically low.
- **Fix:** Add a small "Earn up to 25 DishPoints" badge near the "Write a review" CTA on dish pages. Show a points preview ("Full review with photo = 25 pts") at the top of the review form.

**P0-4: Design empty/sparse state for dish pages**
- **Problem:** Dishes with 0-1 reviews look dead.
- **Why it matters:** First impression of the product for most users will be a sparse dish page. This needs to feel intentional, not broken.
- **Fix:** When `reviewCount < 3`, show a banner: "This dish needs more reviews — be among the first! Earn X DishPoints." Show the review count explicitly: "Based on 1 review." Replace the decimal ratings with a simpler display when sample size is 1.

---

### P1 — Strongly Recommended for Launch

**P1-1: Make photo strongly encouraged (not "optional")**
- **Problem:** Photo is labeled optional. Reviews without photos undermine positioning.
- **Why it matters:** "Photo-backed reviews" is the differentiation. Optional photos = generic text reviews.
- **Fix:** Don't hard-block, but make photo the default path. Change copy to "Add a photo of the dish" (not "Optional"). Show a "Reviews with photos get 2.5x more helpful votes" nudge. Award significantly more points for photo reviews (already 25 vs 10, but make this visible in the form).

**P1-2: Add ratings/review counts to RestaurantCard**
- **Problem:** Restaurant cards on explore and landing show no quality signals.
- **Why it matters:** Users can't decide which restaurant to click. Every card looks equal.
- **Fix:** Add average rating and review count to `RestaurantCard`. Typesense already has `totalReviews` — map it through.

**P1-3: Add sample reviews or featured dishes to landing page**
- **Problem:** Landing page has zero actual review content.
- **Why it matters:** First-time visitors need to see the product before signing up.
- **Fix:** Add a "Recent reviews" or "Top-rated dishes" section to the landing page. Show 3-4 real review cards with photos, ratings, and text snippets.

**P1-4: Fix hero search bar to be a real input**
- **Problem:** Hero search looks like an input but is a clickable div. Users will try to type.
- **Why it matters:** Failed affordance — looks interactive but isn't. Adds unnecessary friction.
- **Fix:** Either make the hero a real search input (type and submit from the landing page) or visually differentiate it as a CTA button, not an input.

**P1-5: Show review CTA more prominently throughout the flow**
- **Problem:** "Write a review" is a secondary action on dish pages. No review CTAs on restaurant cards, search results, or the landing page.
- **Why it matters:** The platform needs content contributors, not just consumers.
- **Fix:** Add "Review this dish" CTAs on dish cards. Add a floating "Write a review" button on restaurant pages. Consider a post-visit nudge ("Ate somewhere recently? Share your experience").

**P1-6: Fix notification copy inconsistency**
- **Problem:** Notification empty state says "when your reviews are approved" but reviews auto-approve (`isApproved: true` on creation).
- **Why it matters:** Sets false expectations about a moderation process that doesn't exist.
- **Fix:** Change copy to "when someone finds your review helpful" or "when you earn badges."

---

### P2 — Can Wait (Post-Launch)

**P2-1: Add real-time notification delivery**
- Problem: Notifications are polling-based. Users won't notice new notifications for minutes.
- Fix: Add Firestore `onSnapshot` listener for the notifications collection.

**P2-2: Add pre-publication moderation queue**
- Problem: Reviews auto-approve. Low-quality or offensive content goes live instantly.
- Fix: Add `isApproved: false` default, with auto-approve for trusted users (level ≥ Foodie) and manual queue for Newbies.

**P2-3: Implement bill verification**
- Problem: `isVerified` is always `false`. "Verified" badge infrastructure exists but does nothing.
- Fix: Either implement OCR/AI verification or remove the verified badge UI to avoid confusion.

**P2-4: Fix `restaurantId` ↔ dish consistency check**
- Problem: API doesn't validate that `restaurantId` matches the dish document.
- Fix: In `POST /api/reviews`, fetch the dish and verify `dish.restaurantId === body.restaurantId`.

**P2-5: Fix edit validation parity with create**
- Problem: `updateReviewSchema` has weaker validation than create (no min text, optional tags).
- Fix: Apply same constraints on edit as create when those fields are provided.

**P2-6: Admin coupons page uses raw HTML elements**
- Problem: Raw `<select>`, `<textarea>`, `<option>` instead of shadcn components.
- Fix: Replace with `Select`, `Textarea` from shadcn/ui.

**P2-7: Create `.env.local.example` file**
- Problem: Referenced in README and env.ts error messages but doesn't exist.
- Fix: Generate from the Zod schema in `env.ts`.

**P2-8: Improve Firestore fallback search**
- Problem: Without Typesense, search is prefix-only and can't find restaurants by dish name.
- Fix: Add `searchTokens` array field to documents or consider Firestore full-text search extensions.

---

## Summary Verdict

**Cravia is not MVP-ready today.** The core product loop — search for a dish → read reviews → write a review — has a critical break at step one (search returns restaurants, not dishes). The platform positions itself as "dish-level reviews" but has no dish-level search or browse surface.

The review submission system works mechanically but has validation gaps that allow low-quality content, and the motivation system (points, badges) is invisible at the moment of decision.

**Fix the 4 P0 items and Cravia is launchable.** The architecture is solid, the data model is right, the auth/payments/admin stack works. This is a UX/product gap, not an engineering gap. The fixes are mostly wiring existing infrastructure to the right surfaces.

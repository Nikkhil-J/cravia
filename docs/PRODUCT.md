# Cravia — Product Document

**Version:** 1.0
**Last updated:** April 2026
**Status:** Pre-launch / Active development

---

## 1. Executive Summary

Cravia is a dish-level food review platform for India. Instead of reviewing restaurants as a whole — where a five-star review might describe the ambiance while a one-star review complains about parking — Cravia lets users review individual dishes at specific restaurants. A user can look up "Butter Chicken at Punjab Grill, Koramangala" and see exactly how other diners rated that particular dish on taste, portion size, and value for money, complete with photos and descriptive tags. The platform combines structured micro-reviews with a gamification engine (DishPoints, badges, user levels) and a rewards marketplace where earned points convert into real restaurant coupons. Cravia also provides restaurant owners with analytics dashboards showing per-dish sentiment, giving them actionable insight that no other review platform offers.

**The problem it solves:** Existing food discovery platforms (Zomato, Swiggy, Google Maps) operate at the restaurant level. Their reviews are noisy, subjective, and rarely help a diner answer the question they actually care about: "What should I order here?" Cravia solves this by making the dish — not the restaurant — the atomic unit of review.

**Who it's for:** Urban Indian food enthusiasts aged 20–35 who eat out frequently, photograph their food, and actively seek recommendations from peers rather than trusting aggregated restaurant ratings.

**What makes it different:** Cravia is the only platform where every review is tied to a specific dish, includes structured sub-ratings (taste, portion, value), and generates aggregated dish-level scores. This creates a fundamentally different data asset — a scored menu for every restaurant — that neither Zomato nor Google Maps can replicate without rebuilding their review model from scratch.

**Core value proposition:** Cravia tells you what to order, not just where to eat.

---

## 2. The Problem

### What is broken about food discovery today

Every major food platform in India — Zomato, Swiggy, Google Maps — asks the same question: "How was your experience at this restaurant?" The resulting reviews are a grab bag of opinions about service, ambiance, wait times, pricing, and occasionally the food itself. A restaurant with 4.2 stars might have a legendary biryani and a terrible dessert menu, but the rating tells you nothing about either.

### Why restaurant-level reviews are insufficient

Restaurant-level ratings are averages of averages. They conflate the diner who visited for a birthday dinner with the one who grabbed a quick lunch. They mix reviews of dishes that have since been removed from the menu with ones that were added last week. They offer no way to distinguish between a restaurant that does one thing brilliantly and one that does everything adequately. For a diner standing outside a restaurant, wondering what to order, the restaurant's star rating provides essentially zero signal.

### The behavior Cravia taps into

People already review dishes — they just do it on Instagram Stories, WhatsApp groups, and word of mouth. "You HAVE to try the mutton sukka at XYZ" is the most common form of food recommendation in India. This behavior is dish-specific, photo-forward, and inherently social. Cravia captures this existing behavior and structures it into a searchable, comparable, trustworthy database.

### The insight behind dish-level reviews

A dish at a specific restaurant is a repeatable product. Unlike a "restaurant experience," which varies by table, waiter, and time of day, a dish is made from the same recipe, by the same kitchen, at roughly the same price point. This makes dish-level reviews far more reliable and actionable than restaurant-level ones. When 47 people say the butter chicken at a particular restaurant scores 4.6 on taste and 3.2 on portion size, that is genuinely useful information.

---

## 3. Target Users

### Primary user: The Urban Foodie

Demographics: 22–35 years old, living in Tier 1 or Tier 2 Indian cities (currently Gurugram only). Works in tech, consulting, media, or creative industries. Household income above ₹8 LPA. Eats out 3–6 times per week. Owns a smartphone with a good camera.

Behavior: Photographs meals before eating. Shares food recommendations in WhatsApp groups and Instagram Stories. Uses Zomato or Swiggy primarily for ordering, not for discovery. Trusts friend recommendations over platform ratings. Is willing to travel across the city for a specific dish they've heard about.

Mindset: Food is identity. They consider themselves "food people." They take pride in knowing where to find the best version of a particular dish. They are frustrated by the lack of reliable, dish-specific information online.

What they want from Cravia: A definitive answer to "What's good here?" for any restaurant. The ability to search for the best version of a dish (e.g., "best rasam in Koramangala"). Social validation for their food knowledge through badges and levels. A way to save dishes they want to try (wishlist) and track what they've reviewed.

### Secondary user: The Restaurant Owner

Demographics: Owner or manager of an independent or small-chain restaurant. May or may not be tech-savvy. Cares deeply about what customers think of specific dishes.

What they want from Cravia: Visibility into which dishes are performing well and which need attention. Structured feedback that goes beyond vague comments. A channel to attract food enthusiasts to their best offerings.

Cravia provides restaurant owners with a claim flow (verified via FSSAI license or business registration), an analytics dashboard showing 30-day review volume, average ratings, top and bottom performing dishes, and per-dish sentiment breakdowns including tag distribution.

### Tertiary user: Admin / Content Moderator

Internal team members who manage content quality, moderate flagged reviews, approve dish requests and restaurant claims, and manage the coupon catalogue.

---

## 4. Core User Journeys

### Discovery journey

A user hears about a restaurant from a friend or sees it on their commute. They open Cravia, search for the restaurant name, and land on the restaurant page. The page shows the restaurant's info, cuisines, and a complete menu of reviewed dishes organized by category (Starter, Main Course, etc.). Each dish card shows its average overall rating, review count, dietary type (veg/non-veg/egg), and cover image. The user taps a dish that looks interesting and lands on the dish detail page, where they see a photo grid from real reviews, the three sub-ratings (taste, portion, value), top community tags ("Spicy," "Generous portion," "Great value"), and individual reviews sorted by newest, highest-rated, or most helpful. They can save the dish to their wishlist to try later, or they can search directly — typing "biryani" in the search bar surfaces all reviewed biryanis across restaurants in their city, filterable by cuisine, area, dietary preference, and price range.

### Review journey

A user has just eaten something memorable. They open Cravia, tap the "Review" button in the mobile bottom nav, and are taken to the write-review flow. If they navigated from a dish page, the dish and restaurant are pre-filled. Otherwise, they search for the dish. The review form asks for: a photo of the dish (supported formats: JPEG, PNG, WebP; max 5 MB), three star ratings out of 5 for taste, portion, and value, a selection of descriptive tags from a curated list organized by Flavour, Portion & Sharing, Value, and Quality & Vibe (20 tags total), and an optional text review (minimum 30 characters if provided). They can also upload a bill photo for verification. On submission, the review goes through server-side validation. The dish's aggregate ratings and tag counts are updated in a single Firestore transaction. The user earns DishPoints (10 for a basic review, 25 for a full review with photo, tags, and quality text) and is redirected to a success celebration screen. If the review pushed them past a badge or level threshold, they receive a notification.

### Restaurant owner journey

A restaurant owner visits a restaurant page on Cravia and sees a "Claim this restaurant" prompt (visible only if the restaurant has no verified owner). They click it, fill in their phone number, select their role (owner or manager), and optionally provide a link to a proof document (FSSAI license, business registration, or utility bill). The claim is submitted for admin review. Once approved, the owner gains access to a restaurant analytics dashboard showing total reviews in the last 30 days, average overall rating, total dishes, a ranked list of top-performing and bottom-performing dishes, and a per-dish sentiment breakdown with tag distribution and sub-rating bars. This dashboard is unique to Cravia — no other Indian food platform offers dish-level analytics to restaurant owners.

### Rewards journey

Every review earns DishPoints. A basic review (photo + ratings + tags) earns 10 points. A "full" review — one that also includes quality text (30+ characters, 5+ distinct words, not a duplicate of recent reviews) — earns 25 points. Users who review on 7 consecutive calendar days trigger a streak bonus, which doubles the points for that review. At 14 days, another bonus fires. The pattern continues every 7 days. Milestone notifications fire at 250 total points earned ("You're halfway to your first coupon!") and at 450 points ("Almost there — 50 more points for your first coupon!"). Points accumulate in a balance that users can spend on coupons in the rewards marketplace. Coupons are created by admins and represent real discounts at partner restaurants (flat ₹ off or percentage off). Each coupon has a stock of unique codes. Redemption is atomic — the coupon claim and point deduction happen in a single Firestore transaction. Users see their code immediately and can view all claimed coupons in a "My Coupons" tab.

### Admin journey

Admins access a dedicated admin panel (`/admin`) with a sidebar navigation. The dashboard shows live counts: total restaurants, dishes, reviews, users, pending dish requests, and flagged reviews. From here, admins can moderate flagged reviews (approve by unflagging, or delete — both operations recompute the author's level and badges), approve or reject dish requests submitted by users, approve or reject restaurant ownership claims, manage the coupon catalogue (create coupons with title, restaurant, discount type/value, points cost, stock of unique codes, and expiry), and toggle admin or premium status for any user.

---

## 5. Feature Inventory

### Discovery & Browsing

| Feature | Description | Users | Status |
|---------|-------------|-------|--------|
| **Landing page** | Hero with search bar, social-proof stats, cuisine grid with emoji icons, nearby restaurants, how-it-works section, CTA | All | Fully built |
| **Explore / search** | Restaurant search with filters for cuisine, area, and sort order (most reviewed, newest, alphabetical). Cursor-paginated results | All | Fully built |
| **Dish search** | Prefix-based dish name search with city, cuisine, area, dietary, price range, and minimum rating filters. Paginated | All | Fully built (Firebase fallback; Typesense integration exists but requires running instance) |
| **Restaurant page** | Hero, info (address, phone, website, Google Maps link), cuisine tags, dish menu organized by category with search, claim CTA, JSON-LD structured data | All | Fully built |
| **Dish detail page** | Photo grid with lightbox, sub-ratings (taste/portion/value), overall rating, top tags, wishlist toggle, write-review CTA, paginated reviews, related dishes, JSON-LD | All | Fully built |
| **Cuisine landing** | `/cuisine/[slug]` — filtered dish grid for a specific cuisine | All | Fully built |
| **Review permalink** | `/review/[id]` — single review view with dish context | All | Fully built |
| **Area filtering** | Per-city area lists (10 areas in Gurugram) used in explore and search | All | Fully built |

### Reviews & Content Creation

| Feature | Description | Users | Status |
|---------|-------------|-------|--------|
| **Write review** | Full review form: dish photo upload (Cloudinary), taste/portion/value star ratings, tag selection from curated list (20 tags in 4 groups), text review (min 30 chars), optional bill upload | Authenticated | Fully built |
| **Edit review** | Edit within 24-hour window; same form pre-filled | Authenticated | Fully built |
| **Delete review** | With level/badge recomputation | Authenticated | Fully built |
| **Helpful vote** | Toggle "helpful" on reviews; author's helpful vote count tracked; triggers badge unlocks | Authenticated | Fully built |
| **Flag review** | Report inappropriate reviews; creates flagged state for admin review | Authenticated | Fully built |
| **Dish request** | Users can request a new dish be added to a restaurant | Authenticated | Fully built |
| **Review success** | Post-submission celebration screen showing points earned | Authenticated | Fully built |

### User Features

| Feature | Description | Users | Status |
|---------|-------------|-------|--------|
| **Authentication** | Email/password + Google sign-in via Firebase Auth. Password reset flow | All | Fully built |
| **Onboarding** | 3-step flow: cuisine preferences, city/area selection, completion | New users | Fully built |
| **Profile (`/my-profile`)** | Stats dashboard, level display, badge showcase, review history with edit/delete, premium upsell | Authenticated | Fully built |
| **Public profile** | `/profile/[userId]` — public view of another user's stats, badges, and reviews | All | Fully built |
| **Settings** | Profile editing (name, avatar, city, area), password change for email users | Authenticated | Fully built |
| **Wishlist** | Save/unsave dishes; dedicated wishlist page with grid view | Authenticated | Fully built |
| **Notifications** | Badge earned, helpful vote, review approved, system notifications. Bell popover in navbar with unread count polling (2-min interval). Mark all read | Authenticated | Fully built |

### Gamification & Rewards

| Feature | Description | Users | Status |
|---------|-------------|-------|--------|
| **DishPoints** | Points ledger with earn/redeem transactions. Balance displayed in navbar and rewards page | Authenticated | Fully built |
| **User levels** | Newbie → Foodie → Critic → Legend based on review count thresholds | Authenticated | Fully built |
| **Badges** | 7 badges unlocked by review count and helpful vote milestones | Authenticated | Fully built |
| **Streak bonus** | Consecutive-day review streak (7-day window) doubles points | Authenticated | Fully built |
| **Rewards marketplace** | Browse available coupons, see points cost, redeem atomically | Authenticated | Fully built |
| **My coupons** | View claimed coupons with unique codes, status (active/used), expiry | Authenticated | Fully built |
| **Progress bar** | Visual progress toward next coupon (default 500-point threshold) | Authenticated | Fully built |

### Premium / Monetization

| Feature | Description | Users | Status |
|---------|-------------|-------|--------|
| **Premium upgrade** | Razorpay checkout with monthly (₹199) and yearly (₹1,999) plans | Authenticated | Fully built |
| **Dish comparison** | Side-by-side comparison of two dishes on all sub-ratings. Premium-gated | Premium | Fully built |
| **Premium badge** | Mentioned in upgrade copy; display implementation TBD | Premium | Partial |
| **Advanced stats** | Mentioned in upgrade copy; not yet implemented in profile | Premium | Stubbed |
| **Early access** | Mentioned as a premium perk in upgrade page copy | Premium | Marketing only |

### Restaurant Owner Features

| Feature | Description | Users | Status |
|---------|-------------|-------|--------|
| **Claim restaurant** | Ownership verification form (phone, role, proof document) | Authenticated | Fully built |
| **Analytics dashboard** | 30-day review count, average rating, total dishes, top/bottom dishes | Verified owner | Fully built |
| **Per-dish sentiment** | Tag distribution and sub-rating breakdown per dish, sortable by rating or review count | Verified owner | Fully built |

### Admin

| Feature | Description | Users | Status |
|---------|-------------|-------|--------|
| **Admin dashboard** | Live stats: restaurants, dishes, reviews, users, pending requests, flagged reviews | Admin | Fully built |
| **Review moderation** | Approve (unflag) or delete flagged reviews with gamification recomputation | Admin | Fully built |
| **Dish request management** | Approve or reject user-submitted dish requests | Admin | Fully built |
| **Restaurant claim management** | Approve or reject ownership claims | Admin | Fully built |
| **Coupon management** | Create and deactivate coupons with codes, stock, points cost, discount, expiry | Admin | Fully built |
| **User management** | Toggle admin and premium roles | Admin | Fully built |
| **Typesense sync** | Manual trigger to sync Firestore data to Typesense search index | Admin | Fully built |

### Infrastructure & Platform

| Feature | Description | Status |
|---------|-------------|--------|
| **PWA / Service Worker** | Serwist-based service worker for offline capability and install prompt | Fully built |
| **SEO** | Sitemap generation, JSON-LD structured data for dishes and restaurants, noindex on protected pages | Fully built |
| **Dark mode** | Theme toggle with next-themes, full dark palette in design system | Fully built |
| **Rate limiting** | Upstash Redis rate limiter with in-memory fallback | Fully built |
| **Error monitoring** | Sentry integration with source maps, tunnel route for ad-blocker bypass | Fully built |
| **Image optimization** | Cloudinary for user uploads, Next.js Image with AVIF/WebP formats | Fully built |
| **Email** | Resend integration (milestone notifications, claim updates) | Fully built |
| **CI/CD** | GitHub Actions workflow; Vercel deployment | Fully built |
| **Testing** | Vitest unit tests, Playwright E2E tests, Firebase rules unit tests | Partial |

---

## 6. Gamification & Rewards System

### Points system

Every review earns DishPoints. The system distinguishes between basic and full reviews:

- **Basic review (10 points):** The user submitted a review with photo, ratings, and tags, but either did not include text, or the text failed the quality check.
- **Full review (25 points):** The review includes a photo, tags, ratings, and text that passes quality validation — at least 30 characters, at least 5 distinct words, and not a near-duplicate of the user's last 3 reviews.

**Streak bonus:** The system tracks consecutive calendar days on which the user submitted a review (using UTC dates from the pointTransactions subcollection). When the streak length is a multiple of 7 (7, 14, 21, ...), the user earns a streak bonus equal to their base points for that review. With a multiplier of 2x, a full review on day 7 earns 25 (base) + 25 (streak) = 50 points.

**Milestone notifications:** When a user's total earned points cross 250, they receive a notification: "You're halfway to your first coupon!" When they cross 450: "Almost there — just 50 more points until your first coupon!"

### User levels

Levels are determined by review count:

| Level | Review count | Badge color |
|-------|-------------|-------------|
| Newbie | 0–4 | Gray |
| Foodie | 5–19 | Red (primary) |
| Critic | 20–49 | Gold |
| Legend | 50+ | Purple |

Levels are recomputed on every review create, delete, and admin action. The user's current level is displayed on their profile, in review cards, and in the personal stats banner on the home page.

### Badges

Seven badges exist, each unlocked at a specific threshold:

| Badge | ID | Trigger | Icon |
|-------|----|---------|------|
| First Bite | `first-bite` | 1 review | 🍽️ |
| Regular | `regular` | 5 reviews | ⭐ |
| Dish Explorer | `dish-explorer` | 10 reviews | 🧭 |
| Food Critic | `food-critic` | 25 reviews | 📝 |
| Legend | `legend` | 50 reviews | 👑 |
| Helpful | `helpful` | 10 helpful votes received | 👍 |
| Trusted | `trusted` | 50 helpful votes received | 🏅 |

Badges are computed deterministically from review count and helpful vote count. When new badges are earned, the system generates a `badge_earned` notification.

### Coupons

Coupons are created by admins and represent real discounts at partner restaurants. Each coupon has:

- Title and restaurant name
- Discount type (`flat` or `percentage`) and value
- Points cost (default: 500 DishPoints)
- Total stock (a fixed set of unique codes)
- Optional expiry date
- Claimed count tracking

Redemption is atomic: within a single Firestore transaction, the system verifies the coupon is active, has remaining stock, and the user has sufficient balance. It then creates a coupon claim record (with a unique code from the pre-loaded list), deducts points from the user's balance, and records a `REDEMPTION` transaction in the points ledger. The user immediately sees their unique coupon code and can access it anytime from the "My Coupons" tab on the rewards page.

### Purpose of gamification

Gamification serves three strategic purposes in Cravia's growth model:

1. **Content flywheel:** Points incentivize review creation, which builds the content corpus that makes Cravia useful, which attracts more users.
2. **Quality enforcement:** The 2.5x point differential between basic and full reviews pushes users toward higher-quality content (photos, detailed text, thoughtful tags).
3. **Retention loop:** Streaks, badges, and levels create ongoing motivation to return and review. The rewards marketplace gives points tangible value, closing the loop between effort and reward.

---

## 7. Premium / Monetization

### What is Cravia Premium

Cravia Premium is a subscription tier that unlocks advanced features. It is currently offered at two price points:

- **Monthly:** ₹199/month (19,900 paise)
- **Yearly:** ₹1,999/year (199,900 paise) — a 16% discount

### Features gated behind premium

Currently, one feature is actively gated:

- **Dish comparison:** The `/compare` page allows premium users to search for and select two dishes, then view a side-by-side comparison of their overall rating, taste, portion, value sub-ratings, and review counts. Non-premium users see an upgrade prompt.

The upgrade page also advertises:

- **Priority badge display:** A premium badge on reviews (partially implemented — mentioned in copy, display logic TBD)
- **Advanced stats:** Reviewing trends and streaks over time (stubbed — mentioned in copy, not yet built)
- **Early access:** First access to new features (marketing positioning, no implementation)

### How the upgrade flow works

The user navigates to `/upgrade`, selects a plan (monthly or yearly), and clicks "Subscribe." The client calls the `/api/billing/create-order` endpoint, which creates a Razorpay order with the plan amount. The Razorpay checkout modal opens. Upon successful payment, the client calls `/api/billing/verify`, which verifies the payment signature using HMAC-SHA256 with constant-time comparison, sets `isPremium: true` and `premiumSince` on the user document, and logs a billing event. Razorpay webhooks handle subscription cancellation and expiry by stripping premium status.

### Long-term monetization vision

Based on what's been built, Cravia's monetization has three pillars:

1. **Subscriptions:** Premium tier with expanding feature set
2. **Coupon marketplace:** Commission or partnership fees from restaurants whose coupons are offered in the rewards marketplace
3. **Restaurant analytics:** The owner dashboard infrastructure is built and could evolve into a paid SaaS product for restaurant owners wanting detailed dish-level feedback

---

## 8. Content & Data Model (Product View)

### Types of content

- **Restaurants:** Name, city, area, address, cuisines, Google Place ID, coordinates, cover image, contact info, Google rating, owner association, verification status
- **Dishes:** Tied to a restaurant. Name, category (10 categories from Starter to Breakfast), dietary type (veg/non-veg/egg), price range (5 tiers from under ₹100 to above ₹600), description, cover image, and aggregate metrics (average taste/portion/value/overall, review count, top tags, tag counts)
- **Reviews:** Tied to a dish and restaurant. Photo, three sub-ratings (1–5), tags from the curated list, optional text, optional bill photo, verification status, helpful vote count, flag status
- **Photos:** Embedded in reviews; displayed in dish photo grids. Hosted on Cloudinary
- **Wishlists:** Per-user subcollection of saved dishes with denormalized dish info
- **Notifications:** System-generated alerts for badge unlocks, helpful votes, review approvals
- **Coupons:** Admin-created discount offers with unique code pools
- **Restaurant claims:** Ownership verification requests with proof documents
- **Dish requests:** User-submitted requests to add dishes to restaurants

### How content is created

Restaurant and dish data is seeded via admin scripts. The `ingest-google-places.ts` script pulls restaurant data from Google Places API. The `seed-cities.ts` script uses OpenStreetMap Overpass API to populate geographic data. Once seeded, dishes are added by admins (via dish request approval flow) and restaurants are ingested in batches.

Reviews are entirely user-generated. Every review must include a photo, three sub-ratings, and at least one tag. Text is optional but incentivized through the points system.

### How content is moderated

Moderation follows a flag-and-review model. Any authenticated user can flag a review. Flagged reviews appear in the admin panel, where moderators can approve (unflag) or delete them. Deletion triggers recomputation of the affected dish's aggregate ratings and the review author's level and badges. Reviews are initially marked as approved (`isApproved: true`) on creation — there is no pre-publication review queue. The system includes duplicate detection (a user cannot review the same dish twice) and the quality check in the points system acts as a soft quality gate by rewarding better content.

### Quality bar

The minimum bar for a review is a photo, three star ratings, and at least one tag. The 30-character minimum for text reviews (when text is provided) prevents low-effort text. The quality check for full points (5+ distinct words, not a duplicate of recent reviews) pushes toward meaningful contributions. The bill upload option and "verified" review concept (deferred to V2) represent the aspirational quality bar.

---

## 9. Geographic Strategy

### Currently supported cities

Cravia currently supports two cities:

- **Gurugram** — 10 defined areas (Sector 29, Cyber City, Golf Course Road, DLF Phase 1, Sohna Road, MG Road, Udyog Vihar, Sector 14, South City, Palam Vihar)

### How city-based filtering works

Currently single-city (Gurugram only). All restaurant and dish queries filter by city. Areas within the city are used for more granular filtering in explore and search.

### Expansion strategy

The architecture supports straightforward city expansion in the future. Adding a new city requires adding an entry to the `SUPPORTED_CITIES` array and `CITY_AREAS` record in constants, then running the ingestion scripts for that city. The data model stores city and area at the restaurant level, and these values are denormalized into dishes for efficient querying.

---

## 10. Growth & Traction Loops

### Content flywheel

The primary growth loop is: more reviews → more useful data → more users searching → more users reviewing. Every review enriches the database with structured, searchable dish-level data. This data is the product's core value, and it compounds — each new review makes every existing review more useful by improving aggregates and coverage.

### Points-driven content creation

The rewards system creates a direct economic incentive for reviews. The tiered point system (10 basic / 25 full) pushes users toward high-quality content. The streak bonus (2x every 7 days) drives daily engagement. The coupon marketplace converts points into tangible value, making the effort of reviewing feel worthwhile. The milestone notifications at 250 and 450 points create urgency as users approach their first coupon.

### Wishlist as retention

The wishlist creates a "save for later" behavior that generates return visits. When a user saves 5 dishes they want to try, they have 5 reasons to return to Cravia — both to check details before visiting the restaurant and to write a review afterward.

### Social and profile mechanics

Public user profiles with levels, badges, and review history create social motivation. Seeing another user as a "Legend" with 50+ reviews and a "Trusted" badge creates aspirational behavior. The helpful vote system creates positive feedback loops — reviewers whose content is marked helpful earn badges and visibility, encouraging more quality content.

### What's missing from a growth perspective

- **Social sharing:** No built-in mechanism to share a dish or review to WhatsApp, Instagram, or Twitter. Given how food recommendations travel in India (WhatsApp groups, Instagram Stories), this is the single most impactful missing growth feature.
- **Referral system:** No user-to-user referral flow with incentives.
- **Restaurant-driven distribution:** Restaurant owners who claim their profiles have no tools to drive their customers to review on Cravia (e.g., QR codes, table cards, review links).
- **Notifications for wishlist activity:** Users are not notified when a wishlisted dish gets new reviews or when a nearby restaurant adds a new dish.
- **SEO content pages:** Cuisine landing pages exist, but there are no city-specific or area-specific content pages ("Best biryanis in Koramangala") that could capture long-tail search traffic.

---

## 11. Competitive Landscape

### Comparison matrix

| Dimension | Zomato | Swiggy | Google Maps | Yelp | Cravia |
|-----------|--------|--------|-------------|------|--------|
| Review unit | Restaurant | Restaurant | Restaurant | Restaurant | **Dish** |
| Sub-ratings | No | No | No | No | **Taste, Portion, Value** |
| Photo per review | Optional | Rare | Optional | Optional | **Required** |
| Dish-level aggregates | No | No | No | No | **Yes** |
| Tag system | No | No | No | No | **20 curated tags** |
| Gamification | Basic (foodie level) | None | Local Guide points | Elite | **Points + badges + levels + coupons** |
| Restaurant analytics | Basic (Zomato for Business) | None | Google Business | Yelp for Business | **Per-dish sentiment** |
| Monetization | Ads, delivery commission, Pro | Delivery commission | Ads | Ads, Yelp Connect | **Premium subscription + coupon marketplace** |

### Cravia's unique defensible position

Cravia's defensibility comes from its data asset. Every review creates structured, dish-level data that does not exist anywhere else. Over time, this becomes a comprehensive scored menu for every restaurant in covered cities — a database that is expensive to replicate and becomes more valuable with scale. The network effect is content-driven: more reviews make the platform more useful, which attracts more users, which generates more reviews.

### What it would take for a competitor to replicate

A competitor would need to (1) redesign their review model from restaurant-level to dish-level, which would break their existing UX and data, (2) rebuild their submission flow to require structured sub-ratings and photos, (3) build a gamification system that incentivizes dish-level content creation, and (4) seed enough initial data to be useful. For Zomato or Swiggy, this would mean cannibalizing their existing review ecosystem. For a new entrant, Cravia's head start in content volume in its launch cities would be the barrier.

---

## 12. Product Roadmap (Inferred)

### Clearly planned but not yet built

Based on V2 backlog, TODOs, stubs, and partially built features:

1. **Receipt-verified reviews (V2):** OCR/AI verification of uploaded order receipts, with a "Verified" badge on the review. The bill upload field already exists in the review form; the verification layer is deferred.

2. **Optional photo in review flow (V2):** Currently photo is required. The plan is to make it optional but incentivize it with bonus DishPoints, revisiting once review volume is healthy.

3. **Photo likes / most-helpful photo sort:** A TODO in `DishPhotoGrid.tsx` references replacing date-based sort with most-helpful sort "once photo likes are implemented."

4. **Advanced premium stats:** Advertised on the upgrade page but not built. Would show reviewing trends and streaks over time.

5. **Premium badge display:** Mentioned in upgrade copy. A visual badge on premium users' reviews to distinguish them.

6. **Design system tokens:** TODOs for `--color-legend` / `--color-legend-light` and `--color-accent-dark` indicate design system refinement is ongoing.

### Most logical next features

Based on the architecture and growth gaps identified:

1. **Social sharing:** Share dish/review to WhatsApp, Instagram, Twitter — the highest-leverage growth feature for the Indian market.
2. **Typesense search deployment:** Firebase prefix search is limited. The Typesense integration exists in code (sync endpoint, client) but requires a running Typesense instance for full-text, typo-tolerant search.
3. **Referral program:** User invites with point incentives for both referrer and invitee.
4. **Restaurant QR codes:** Allow claimed restaurants to generate QR codes/links that prompt diners to review specific dishes.
5. **Push notifications:** The service worker is in place; web push for wishlist activity, new reviews on followed restaurants, and streak reminders would drive retention.

### Missing for launch readiness

- Typesense search must be operational (Firebase-only search misses restaurant names, mid-word matches, and typos)
- Social sharing is table stakes for Indian consumer apps
- Footer links to `/explore?tab=cuisines` and `/explore?sort=top` are not wired to actual explore page parameters (cosmetic issue, but affects navigation)
- The `/my-profile?tab=wishlist` footer link doesn't work (wishlist is a separate route)
- A native `<select>` in the restaurant dishes dashboard page should use the shadcn Select component for consistency
- Email templates for claim approval/rejection and milestone notifications should be tested end-to-end

---

## 13. Known Product Gaps & Risks

### Incomplete or broken user flows

- **Search limitations:** Without Typesense, search only prefix-matches on dish `nameLower`. Restaurant name search, mid-word matching, and typo tolerance all fail. This is documented in `docs/TODO.md` as a high-priority issue.
- **Footer navigation mismatches:** Several footer links (`?tab=cuisines`, `?sort=top`, `?sort=new`, `?tab=wishlist`) point to query parameters that the target pages don't handle.
- **Billing plan hardcoding:** The verify endpoint passes `'monthly'` as a fixed plan type regardless of what the user selected. Yearly subscriptions may not be recorded correctly in billing events.
- **Premium feature thinness:** Only one feature (dish comparison) is actively gated behind premium. The upgrade page advertises four features, but three are not yet implemented. Users who pay may feel the value proposition is thin.

### Unvalidated assumptions

- **Users will photograph every meal:** The current requirement for a photo with every review may be a significant friction point, especially for casual diners. The V2 plan to make photos optional acknowledges this risk.
- **Points have perceived value:** The rewards system assumes users will be motivated by DishPoints and restaurant coupons. If the coupon catalogue is thin or the restaurants aren't desirable, the incentive loop breaks.
- **Restaurant owners will claim profiles:** The analytics dashboard is valuable, but restaurant owners need to be aware of Cravia and motivated to claim. Without a sales or outreach strategy, the claim flow may see low adoption.
- **Dish-level granularity matters enough:** The core bet is that users care about dish-specific data more than restaurant-level data. If it turns out that restaurant ambiance, service, and overall vibe matter more to the Indian diner than specific dish quality, the product thesis weakens.

### Biggest risks to product-market fit

1. **Content cold start:** The product's value is entirely dependent on having enough reviews to be useful. In a new city or for a new restaurant, the platform is empty and provides no value, creating a chicken-and-egg problem.

2. **Review fatigue:** Requiring a photo, three ratings, tags, and optionally text for every review is a high-effort ask. If the rewards don't feel proportional, users will churn after the novelty wears off.

3. **Coupon supply:** The rewards marketplace only works if there are desirable coupons to redeem. This requires restaurant partnerships, which requires business development effort outside the product itself.

4. **Zomato's potential response:** If Cravia gains traction, Zomato could add dish-level reviews as a feature within their existing app, leveraging their massive user base and restaurant relationships. Cravia's defense would need to be the depth and quality of its dish-level data, which takes time to build.

5. **India-specific distribution challenge:** WhatsApp is the primary channel for food recommendations in India. Without deep WhatsApp integration (share links, mini-app, or bot), Cravia may struggle to insert itself into existing recommendation behavior.

---

## Appendix: Technical Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Database | Cloud Firestore |
| Authentication | Firebase Auth (email/password + Google) |
| State management | Zustand (client), TanStack Query (server state) |
| Styling | Tailwind CSS v4 with custom design system tokens |
| UI components | shadcn/ui primitives (Button, Input, Select, Sheet, etc.) |
| Image hosting | Cloudinary (via next-cloudinary) |
| Search | Typesense (with Firebase fallback) |
| Payments | Razorpay (orders + checkout + webhooks) |
| Email | Resend |
| Rate limiting | Upstash Redis (with in-memory fallback) |
| Error monitoring | Sentry |
| PWA | Serwist (service worker) |
| Animation | Motion (Framer Motion successor) |
| Hosting | Vercel |
| CI/CD | GitHub Actions |
| Testing | Vitest (unit), Playwright (E2E), Firebase Rules testing |

---

*This document reflects the state of the Cravia codebase as of April 2026. It is intended for internal use by product, engineering, design, and business stakeholders.*

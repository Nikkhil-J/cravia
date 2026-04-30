import type { UserLevel, DishCategory, PriceRange, DietaryType, BadgeDefinition } from '../types'

export * from './routes'
export * from './api'
export * from './errors'

// ── Review tags ───────────────────────────────────────────
export const TAG_LIST = [
  'Spicy',
  'Mild',
  'Very sweet',
  'Savoury',
  'Authentic',
  'Overcooked',
  'Undercooked',
  'Generous portion',
  'Small portion',
  'Good for sharing',
  'Solo serving',
  'Great value',
  'Fair price',
  'Overpriced',
  'Fresh ingredients',
  'Oily',
  'Dry',
  'Recommended',
  'Skip it',
  'Comfort food',
] as const

export const TAG_GROUPS: { label: string; tags: (typeof TAG_LIST)[number][] }[] = [
  { label: 'Flavour', tags: ['Spicy', 'Mild', 'Very sweet', 'Savoury', 'Authentic'] },
  { label: 'Portion & Sharing', tags: ['Generous portion', 'Small portion', 'Good for sharing', 'Solo serving'] },
  { label: 'Value', tags: ['Great value', 'Fair price', 'Overpriced'] },
  { label: 'Quality & Vibe', tags: ['Fresh ingredients', 'Oily', 'Dry', 'Overcooked', 'Undercooked', 'Comfort food', 'Recommended', 'Skip it'] },
]

export const RATING_LABELS: Record<number, string> = {
  0: 'Not rated',
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Amazing',
}

// ── Badge definitions ─────────────────────────────────────
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: 'first-bite',     label: 'First Bite',     description: 'Wrote your first review',          icon: '🍽️' },
  { id: 'regular',        label: 'Regular',         description: 'Wrote 5 reviews',                  icon: '⭐' },
  { id: 'dish-explorer',  label: 'Dish Explorer',   description: 'Wrote 10 reviews',                 icon: '🧭' },
  { id: 'food-critic',    label: 'Food Critic',     description: 'Wrote 25 reviews',                 icon: '📝' },
  { id: 'legend',         label: 'Legend',          description: 'Wrote 50 reviews',                 icon: '👑' },
  { id: 'helpful',        label: 'Helpful',         description: 'Received 10 helpful votes',        icon: '👍' },
  { id: 'trusted',        label: 'Trusted',         description: 'Received 50 helpful votes',        icon: '🏅' },
]

// ── Level thresholds ──────────────────────────────────────
export const LEVEL_THRESHOLDS: Record<UserLevel, { min: number; max: number | null }> = {
  Newbie:  { min: 0,  max: 4  },
  Foodie:  { min: 5,  max: 19 },
  Critic:  { min: 20, max: 49 },
  Legend:  { min: 50, max: null },
}

// ── Cuisine types ─────────────────────────────────────────
export const CUISINE_TYPES = [
  // Indian
  'North Indian', 'South Indian', 'Bengali', 'Punjabi',
  'Rajasthani', 'Gujarati', 'Maharashtrian', 'Kerala',
  'Hyderabadi', 'Mughlai', 'Chettinad', 'Kashmiri',
  'Biryani', 'Street Food', 'Andhra', 'Karnataka',
  'Goan', 'Awadhi', 'Sindhi', 'Bihari', 'Odia',
  // International
  'Chinese', 'Japanese', 'Korean', 'Thai', 'Vietnamese',
  'Italian', 'Continental', 'American', 'Mexican',
  'Mediterranean', 'Middle Eastern', 'Lebanese',
  // Other
  'Cafe', 'Bakery', 'Desserts', 'Fast Food', 'Beverages',
  'Fusion', 'Pan-Indian',
] as const

export const FEATURED_CUISINES = [
  'North Indian', 'South Indian', 'Mughlai', 'Biryani',
  'Chinese', 'Italian', 'Continental', 'Cafe',
  'Street Food', 'Bakery', 'Desserts', 'Beverages',
] as const satisfies ReadonlyArray<(typeof CUISINE_TYPES)[number]>

// ── City (single source of truth) ────────────────────────
export const SUPPORTED_CITIES = ['gurugram'] as const
export type City = (typeof SUPPORTED_CITIES)[number]

export const GURUGRAM: City = 'gurugram'

export const CITY_DISPLAY_NAME: Record<City, string> = {
  gurugram: 'Gurugram',
}

export const CITY_AREAS: Record<City, readonly string[]> = {
  gurugram: [
    'Sector 29', 'Cyber City', 'Golf Course Road', 'DLF Phase 1',
    'Sohna Road', 'MG Road', 'Udyog Vihar', 'Sector 14',
    'South City', 'Palam Vihar',
  ],
}

// ── Plan pricing (paise) ─────────────────────────────────
export const PLAN_PRICES = {
  monthly: 19900,
  yearly: 199900,
} as const

// ── Review constraints ────────────────────────────────────
export const REVIEW_EDIT_WINDOW_MS     = 86_400_000 // 24 hours
export const REVIEWS_PER_PAGE          = 10
export const DISHES_PER_PAGE           = 20
export const REVIEW_TEXT_MIN_CHARS     = 30
export const REVIEW_PHOTO_MAX_MB       = 5
export const REVIEW_PHOTO_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const FIRESTORE_BATCH_LIMIT     = 500

// ── Dish categories ──────────────────────────────────────
export const DISH_CATEGORIES: DishCategory[] = [
  'Starter', 'Main Course', 'Bread', 'Rice & Biryani',
  'Dessert', 'Beverage', 'Side Dish', 'Snack',
  'Street Food', 'Breakfast',
]

// ── Display constants ────────────────────────────────────

export const PRICE_LABEL: Record<PriceRange, string> = {
  'under-100': '< ₹100',
  '100-200': '₹100–200',
  '200-400': '₹200–400',
  '400-600': '₹400–600',
  'above-600': '> ₹600',
}

export const DIETARY_BADGE: Record<DietaryType, { label: string; className: string }> = {
  veg: { label: '🟢 Vegetarian', className: 'bg-success/10 text-success border-success/30' },
  'non-veg': { label: '🔴 Non-vegetarian', className: 'bg-primary-light text-primary border-primary/30' },
  egg: { label: '🟡 Contains egg', className: 'bg-brand-gold-light text-brand-gold border-brand-gold/30' },
}

export const DIETARY_ICON: Record<DietaryType, string> = {
  veg: '🟢 Veg',
  'non-veg': '🔴 Non-veg',
  egg: '🟡 Egg',
}

export const LEVEL_COLORS: Record<UserLevel, string> = {
  Newbie: 'bg-border text-text-secondary',
  Foodie: 'bg-primary-light text-primary-dark',
  Critic: 'bg-brand-gold-light text-brand-gold',
  /* TODO: add --color-legend / --color-legend-light to design system */
  Legend: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
}

export const CUISINE_GRADIENT: Record<string, [string, string]> = {
  'North Indian': ['#E23744', '#FF6B35'],
  'South Indian': ['#FF6B35', '#FFB800'],
  Bengali: ['#3B82F6', '#06B6D4'],
  Punjabi: ['#FFB800', '#F59E0B'],
  Rajasthani: ['#D97706', '#E23744'],
  Gujarati: ['#10B981', '#059669'],
  Maharashtrian: ['#8B5CF6', '#6366F1'],
  Kerala: ['#059669', '#10B981'],
  Hyderabadi: ['#E23744', '#BE185D'],
  Mughlai: ['#92400E', '#D97706'],
  Chinese: ['#EF4444', '#F59E0B'],
  Japanese: ['#F43F5E', '#EC4899'],
  Italian: ['#16A34A', '#EF4444'],
  Cafe: ['#92400E', '#D97706'],
  Bakery: ['#F59E0B', '#D97706'],
}

export const CUISINE_EMOJI: Record<string, string> = {
  'North Indian': '🍛',
  'South Indian': '🫓',
  Bengali: '🐟',
  Punjabi: '🧈',
  Rajasthani: '🏜️',
  Gujarati: '🥘',
  Maharashtrian: '🍲',
  Kerala: '🥥',
  Hyderabadi: '🍗',
  Mughlai: '🥘',
  Chettinad: '🌶️',
  Kashmiri: '🍖',
  Biryani: '🍚',
  'Street Food': '🌯',
  Andhra: '🌶️',
  Karnataka: '🫓',
  Goan: '🦐',
  Awadhi: '🍢',
  Sindhi: '🫕',
  Bihari: '🍚',
  Odia: '🥣',
  Chinese: '🥡',
  Japanese: '🍣',
  Korean: '🥘',
  Thai: '🍜',
  Vietnamese: '🍲',
  Italian: '🍕',
  Continental: '🍽️',
  American: '🍔',
  Mexican: '🌮',
  Mediterranean: '🫒',
  'Middle Eastern': '🧆',
  Lebanese: '🥙',
  Cafe: '☕',
  Bakery: '🥐',
  Desserts: '🍰',
  'Fast Food': '🍟',
  Beverages: '🥤',
  Fusion: '🍱',
  'Pan-Indian': '🇮🇳',
}

// ── Sub-rating labels ────────────────────────────────────
export const SUB_RATING_LABELS = ['Taste', 'Portion', 'Value'] as const
export type SubRating = (typeof SUB_RATING_LABELS)[number]

export const MAX_RATING = 5

// ── App config ──────────────────────────────────────────
export const CONFIG = {
  ISR_REVALIDATE_SECONDS: 3600,
  NOTIFICATION_POLL_INTERVAL_MS: 120_000,
  REACT_QUERY_STALE_TIME_MS: 2 * 60 * 1000,
  NOTIFICATION_PREVIEW_LIMIT: 5,
  PHOTO_GRID_MAX: 3,
  REVIEW_CARD_PREVIEW_LENGTH: 60,
  RELATED_DISHES_COUNT: 4,
  LANDING_TOP_DISHES: 6,
  LANDING_FEATURED_RESTAURANTS: 4,
  SESSION_COOKIE_MAX_AGE: 604800,
  SLOW_REQUEST_THRESHOLD_MS: 2000,
} as const

// ── Hero tags (shared between landing hero + empty state) ──
export const HERO_TAGS = ['Biryani', 'Butter Chicken', 'Pizza', 'Dosa', 'Momos', 'Ramen'] as const

// ── Sort options ────────────────────────────────────────
export const SORT_OPTIONS = {
  HIGHEST_RATED: 'highest-rated',
  NEWEST: 'newest',
  MOST_HELPFUL: 'most-helpful',
} as const

// ── HTTP helpers ────────────────────────────────────────
export const HTTP_HEADERS = {
  CONTENT_TYPE: 'content-type',
  CONTENT_TYPE_JSON: 'application/json',
} as const

// ── Status enums ────────────────────────────────────────
export const CLAIM_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const

export const REQUEST_ACTION = {
  APPROVE: 'approve',
  REJECT: 'reject',
} as const

// ── Dietary types ───────────────────────────────────────
export const DIETARY = {
  VEG: 'veg',
  NON_VEG: 'non-veg',
} as const

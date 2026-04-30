"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { setExploreQuery } from "@/lib/stores/explore-search";
import { CITY_DISPLAY_NAME, type City } from "@/lib/constants";
import type { Dish } from "@/lib/types";

// ── V2 "Bold Split" Design Tokens ────────────────────────
// Values mirror the global CSS tokens in globals.css so both stay in sync.
const DARK_C = {
  bg:          "var(--color-surface-dark)",   // #121009
  surface:     "var(--dc-surface)",           // #1e1a17
  card:        "var(--card)",                 // #252018
  border:      "var(--dc-border)",            // #302820
  orange:      "var(--color-primary)",        // #e8571a
  orangeDim:   "rgba(232,87,26,0.15)",
  white:       "var(--dc-text-primary)",      // #f5f0eb
  gray:        "var(--dc-text-secondary)",    // #9a9080
  grayDim:     "var(--dc-text-muted)",        // #5a5248
  scoreBg:     "rgba(255,255,255,0.08)",
  cardShadow:  "0 8px 32px rgba(0,0,0,0.5)",
  mCardShadow: "0 6px 24px rgba(0,0,0,0.45)",
  stack1Bg:    "rgba(30,26,23,0.63)",
  stack2Bg:    "rgba(30,26,23,0.41)",
} as const;

const LIGHT_C = {
  bg:          "var(--background)",           // #faf7f4
  surface:     "var(--dc-surface-2)",         // #f0ebe5
  card:        "var(--card)",                 // #f0ebe5
  border:      "var(--dc-border)",            // #e0d6ce
  orange:      "var(--color-primary)",        // #e8571a
  orangeDim:   "rgba(232,87,26,0.12)",
  white:       "var(--dc-text-primary)",      // #1a1008
  gray:        "var(--dc-text-secondary)",    // #6b5d52
  grayDim:     "var(--dc-text-muted)",        // #9a8880
  scoreBg:     "rgba(0,0,0,0.08)",
  cardShadow:  "0 8px 32px rgba(0,0,0,0.12)",
  mCardShadow: "0 6px 24px rgba(0,0,0,0.10)",
  stack1Bg:    "rgba(240,235,229,0.80)",
  stack2Bg:    "rgba(240,235,229,0.55)",
} as const;

type HeroColors = {
  bg: string; surface: string; card: string; border: string;
  orange: string; orangeDim: string; white: string; gray: string; grayDim: string;
  scoreBg: string; cardShadow: string; mCardShadow: string;
  stack1Bg: string; stack2Bg: string;
};

const CAROUSEL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ── Carousel dish type (normalised to 0-100 scores) ──────
interface CarouselDish {
  id: string;
  name: string;
  restaurant: string;
  taste: number;
  portion: number;
  value: number;
  tags: readonly string[];
}

const FALLBACK_DISHES: CarouselDish[] = [
  { id: "f1", name: "Butter Chicken",     restaurant: "Punjab Grill · Cyber Hub",       taste: 91, portion: 78, value: 82, tags: ["Rich & creamy", "Worth it"] },
  { id: "f2", name: "Dosa Masala",        restaurant: "Saravana Bhavan · DLF Phase 4",  taste: 88, portion: 85, value: 94, tags: ["Crispy", "Best value"] },
  { id: "f3", name: "Thai Basil Chicken", restaurant: "SOCA – Brewery · Sector 29",     taste: 72, portion: 48, value: 38, tags: ["Very sweet", "Overpriced"] },
  { id: "f4", name: "Momos (Steamed)",    restaurant: "Local Street · Sector 14",       taste: 87, portion: 92, value: 96, tags: ["Generous", "Great value"] },
  { id: "f5", name: "Paneer Tikka",       restaurant: "Dhaba By Claridges · NH8",       taste: 89, portion: 80, value: 77, tags: ["Smoky", "Generous"] },
];

// Dish.avgTaste etc. are on a 0-5 scale; multiply × 20 → 0-100
function mapDishesToCarousel(dishes: Dish[]): CarouselDish[] {
  return dishes.map((d) => ({
    id: d.id,
    name: d.name,
    restaurant: d.restaurantName + (d.area ? ` · ${d.area}` : ""),
    taste:   Math.round(d.avgTaste   * 20),
    portion: Math.round(d.avgPortion * 20),
    value:   Math.round(d.avgValue   * 20),
    tags: (d.topTags ?? []).slice(0, 2),
  }));
}

// ── Category chips ────────────────────────────────────────
const HERO_CHIPS = ["Biryani", "Butter Chicken", "Dosa", "Momos", "Pizza", "Rolls", "Pasta"] as const;

// ── Props ─────────────────────────────────────────────────
interface LandingHeroProps {
  topDishes: Dish[];
  city: City;
  dishCount?: number;
}

function formatDishCount(n: number): string {
  if (n <= 0) return "12,400+";
  const step = n >= 10_000 ? 1_000 : n >= 1_000 ? 100 : 10;
  const rounded = Math.floor(n / step) * step;
  return `${rounded.toLocaleString("en-IN")}+`;
}

// ── Sub-components ────────────────────────────────────────

function ScoreBar({
  label, value, fill, grayDim, trackBg,
}: {
  label: string; value: number; fill: string; grayDim: string; trackBg: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: grayDim,
          marginBottom: 4,
          fontFamily: "var(--font-body)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          width: 70,
          height: 3,
          background: trackBg,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
            height: "100%",
            background: fill,
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
}

function CardContent({ dish, C }: { dish: CarouselDish; C: HeroColors }) {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: C.white,
              fontFamily: "var(--font-body)",
              marginBottom: 3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {dish.name}
          </div>
          <div
            style={{
              fontSize: 10,
              color: C.gray,
              fontFamily: "var(--font-body)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {dish.restaurant}
          </div>
        </div>
        <span style={{ fontSize: 18, opacity: 0.6, flexShrink: 0, marginLeft: 8 }}>
          🍽️
        </span>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <ScoreBar label="Taste"   value={dish.taste}   fill="#e8571a" grayDim={C.grayDim} trackBg={C.scoreBg} />
        <ScoreBar label="Portion" value={dish.portion} fill="#c94e14" grayDim={C.grayDim} trackBg={C.scoreBg} />
        <ScoreBar label="Value"   value={dish.value}   fill="#a03a0e" grayDim={C.grayDim} trackBg={C.scoreBg} />
      </div>

      {dish.tags.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {dish.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 9,
                padding: "3px 8px",
                borderRadius: 20,
                background: C.orangeDim,
                color: C.orange,
                border: "1px solid rgba(232,87,26,0.25)",
                fontFamily: "var(--font-body)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

// ── Main component ────────────────────────────────────────

export function LandingHero({ topDishes, city, dishCount = 0 }: LandingHeroProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const C: HeroColors = resolvedTheme === "light" ? LIGHT_C : DARK_C;
  const [exiting, setExiting] = useState(false);
  const [desktopIdx, setDesktopIdx] = useState(0);
  const [mobileIdx, setMobileIdx] = useState(0);

  // Use API dishes when there are at least 2 reviewed results; fall back to sample data
  const reviewedDishes = topDishes.filter((d) => d.reviewCount > 0).slice(0, 5);
  const dishes: CarouselDish[] =
    reviewedDishes.length >= 2 ? mapDishesToCarousel(reviewedDishes) : FALLBACK_DISHES;
  const n = dishes.length;

  // Desktop: advance every 2.6s
  useEffect(() => {
    const id = setInterval(() => setDesktopIdx((i) => (i + 1) % n), 2600);
    return () => clearInterval(id);
  }, [n]);

  // Mobile: advance every 2.8s
  useEffect(() => {
    const id = setInterval(() => setMobileIdx((i) => (i + 1) % n), 2800);
    return () => clearInterval(id);
  }, [n]);

  // ── Navigation helpers ──────────────────────────────────
  function navigateWithQuery(query: string) {
    if (exiting) return;
    setExiting(true);
    setExploreQuery(query);
    setTimeout(
      () =>
        router.push(
          `${"/explore"}?tab=dishes${query ? `&q=${encodeURIComponent(query)}` : ""}`,
        ),
      120,
    );
  }

  function handleSearchClick() {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => router.push(`/explore?tab=dishes&focus=1`), 120);
  }

  function handleSearchKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSearchClick();
    }
  }

  const cityName = CITY_DISPLAY_NAME[city];
  const dishCountDisplay = formatDishCount(dishCount);

  // Desktop: 3 visible slots
  const slot0 = desktopIdx % n;
  const slot1 = (desktopIdx + 1) % n;
  const slot2 = (desktopIdx + 2) % n;
  const slotDishes = [dishes[slot0], dishes[slot1], dishes[slot2]] as const;

  // ── Desktop card stack visual config (theme-aware) ───
  const STACK = [
    { tx: 0,  scale: 1.000, opacity: 1.00, bg: C.card,     border: "rgba(232,87,26,0.35)", shadow: C.cardShadow },
    { tx: 6,  scale: 0.975, opacity: 0.72, bg: C.stack1Bg, border: C.border,               shadow: "none" },
    { tx: 12, scale: 0.950, opacity: 0.44, bg: C.stack2Bg, border: C.border,               shadow: "none" },
  ];

  // ── Shared left-column content ────────────────────────
  const LivePill = (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 28,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: C.orange,
          flexShrink: 0,
          boxShadow: `0 0 0 0 ${C.orange}`,
          animation: "v2-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite",
        }}
        aria-hidden="true"
      />
      <span
        style={{
          fontSize: 10,
          color: C.orange,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          fontFamily: "var(--font-body)",
        }}
      >
        Now live in {cityName}
      </span>
    </div>
  );

  const QuoteBlock = (
    <div
      style={{
        background: C.surface,
        borderRadius: 6,
        padding: "14px 18px",
        borderLeft: `3px solid ${C.orange}`,
        marginBottom: 30,
      }}
    >
      <div
        style={{
          fontSize: 8.5,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: C.orange,
          fontFamily: "var(--font-body)",
          marginBottom: 8,
        }}
      >
        Sound familiar?
      </div>
      <p
        style={{
          fontSize: 13,
          fontStyle: "italic",
          color: C.gray,
          lineHeight: 1.7,
          fontFamily: "var(--font-body)",
          margin: 0,
        }}
      >
        &ldquo;You&rsquo;re at a restaurant. Everything on the menu looks good.
        You ask the waiter. He says everything is good. You guess. You regret
        it.&rdquo;
      </p>
    </div>
  );

  const Headlines = (
    <>
      <h1
        style={{
          fontFamily: "var(--font-headline)",
          fontWeight: 900,
          fontSize: "clamp(52px, 6.4vw, 82px)",
          color: C.white,
          lineHeight: 0.9,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          margin: 0,
          marginBottom: 4,
        }}
      >
        That moment ends here.
      </h1>
      <h2
        style={{
          fontFamily: "var(--font-headline)",
          fontWeight: 800,
          fontSize: "clamp(52px, 6.4vw, 82px)",
          color: C.orange,
          lineHeight: 0.9,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          margin: 0,
          marginBottom: 28,
        }}
      >
        Know what to order.
      </h2>
    </>
  );

  const BodyCopy = (
    <p
      style={{
        fontSize: 13.5,
        color: C.gray,
        lineHeight: 1.65,
        maxWidth: 620,
        marginBottom: 28,
        fontFamily: "var(--font-body)",
      }}
    >
      Cravia rates every dish — not just the restaurant. Taste, portion, and
      value scores from real diners.
    </p>
  );

  const SearchBar = (
    <div
      role="button"
      tabIndex={0}
      aria-label="Search a dish"
      onClick={handleSearchClick}
      onKeyDown={handleSearchKey}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: "10px 14px",
        maxWidth: 600,
        cursor: "pointer",
        marginBottom: 12,
        transition: "border-color 0.15s ease",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.borderColor = C.orange)
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.borderColor = C.border)
      }
    >
      <Search
        style={{ width: 14, height: 14, color: C.grayDim, flexShrink: 0 }}
        strokeWidth={1.5}
      />
      <span
        style={{
          fontSize: 13,
          color: C.grayDim,
          fontFamily: "var(--font-body)",
        }}
      >
        Try &ldquo;Butter Chicken&rdquo;...
      </span>
    </div>
  );

  const Chips = (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
      {HERO_CHIPS.map((chip) => (
        <button
          key={chip}
          type="button"
          onClick={() => navigateWithQuery(chip)}
          style={{
            fontSize: 11,
            color: C.grayDim,
            padding: "4px 11px",
            borderRadius: 20,
            border: `1px solid ${C.border}`,
            background: "transparent",
            fontFamily: "var(--font-body)",
            cursor: "pointer",
            transition: "border-color 0.15s ease, color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.borderColor = C.orange;
            el.style.color = C.orange;
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.borderColor = C.border;
            el.style.color = C.grayDim;
          }}
        >
          {chip}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* Keyframe styles injected once */}
      <style>{`
        @keyframes v2-ping {
          75%, 100% { box-shadow: 0 0 0 6px rgba(232,87,26,0); }
        }
      `}</style>

      <section
        style={{
          background: C.bg,
          position: "relative",
          width: "100%",
          opacity: exiting ? 0 : 1,
          transition: "opacity 150ms ease-in",
        }}
      >
        {/* Orange left edge strip */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 3,
            height: "100%",
            background:
              "linear-gradient(to bottom, transparent, #e8571a, transparent)",
            zIndex: 10,
          }}
        />

        {/* ── Desktop layout (md+) ── */}
        <div
          className="hidden md:flex"
          style={{
            minHeight: "calc(100vh - 52px)",
            paddingLeft: 60,
            paddingRight: 60,
            paddingTop: 44,
            paddingBottom: 44,
          }}
        >
          {/* Left column — 68% */}
          <div
            style={{
              flex: "0 0 68%",
              paddingRight: 48,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {LivePill}
            {QuoteBlock}
            {Headlines}
            {BodyCopy}
            {SearchBar}
            {Chips}
          </div>

          {/* Vertical divider */}
          <div
            aria-hidden="true"
            style={{
              width: 1,
              background: C.border,
              opacity: 0.5,
              flexShrink: 0,
              alignSelf: "stretch",
            }}
          />

          {/* Right column — ~32% */}
          <div
            style={{
              flex: 1,
              paddingLeft: 40,
              paddingRight: 24,
              paddingTop: 40,
              paddingBottom: 40,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              background:
                `radial-gradient(ellipse 48% 38% at 62% 42%, rgba(232,87,26,0.05) 0%, transparent 100%),
                 radial-gradient(ellipse 24% 18% at 36% 72%, rgba(232,87,26,0.025) 0%, transparent 100%)`,
            }}
          >
            {/* Section label */}
            <div
              style={{
                fontSize: 10,
                color: C.grayDim,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: "var(--font-body)",
                marginBottom: 16,
              }}
            >
              Top rated right now
            </div>

            {/* Card stack — all 3 visible simultaneously in a flex column */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
              aria-live="polite"
              aria-atomic="true"
            >
              {([0, 1, 2] as const).map((slotIdx) => {
                const s = STACK[slotIdx];
                const dish = slotDishes[slotIdx];
                return (
                  <div
                    key={slotIdx}
                    style={{
                      background: s.bg,
                      border: `1px solid ${s.border}`,
                      borderRadius: 10,
                      padding: "13px 16px",
                      width: "100%",
                      opacity: s.opacity,
                      transform: `translateX(${s.tx}px) scale(${s.scale})`,
                      transformOrigin: "left center",
                      boxShadow: s.shadow === "none" ? undefined : s.shadow,
                      transition: slotIdx > 0 ? "all 0.45s cubic-bezier(0.22, 1, 0.36, 1)" : undefined,
                    }}
                  >
                    {slotIdx === 0 ? (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={dish.id}
                          initial={{ y: 18, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.45, ease: CAROUSEL_EASE }}
                        >
                          <CardContent dish={dish} C={C} />
                        </motion.div>
                      </AnimatePresence>
                    ) : (
                      /* Peeking cards — name + restaurant only, no score bars */
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.white, marginBottom: 2, fontFamily: "var(--font-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {dish.name}
                          </div>
                          <div style={{ fontSize: 10, color: C.gray, fontFamily: "var(--font-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {dish.restaurant}
                          </div>
                        </div>
                        <span style={{ fontSize: 18, opacity: 0.6, flexShrink: 0, marginLeft: 8 }}>🍽️</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer stat */}
            <div
              style={{
                marginTop: 20,
                fontSize: 10,
                fontFamily: "var(--font-body)",
              }}
            >
              <span style={{ color: C.orange, fontWeight: 600 }}>{dishCountDisplay}</span>
              <span style={{ color: C.grayDim }}> dishes rated in {cityName}</span>
            </div>
          </div>
        </div>

        {/* ── Mobile layout (< md) ── */}
        <div
          className="md:hidden"
          style={{ padding: "22px 20px", position: "relative" }}
        >
          {/* Left edge indent for content */}
          <div style={{ paddingLeft: 16 }}>
            {/* 1. Live pill */}
            {LivePill}

            {/* 2. Quote block (above headline on mobile) */}
            <div style={{ marginLeft: 0, marginBottom: 18 }}>
              <div
                style={{
                  background: C.surface,
                  borderLeft: `2px solid ${C.orange}`,
                  borderRadius: "0 6px 6px 0",
                  padding: "12px 16px",
                }}
              >
                <div
                  style={{
                    fontSize: 8.5,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: C.orange,
                    fontFamily: "var(--font-body)",
                    marginBottom: 6,
                  }}
                >
                  Sound familiar?
                </div>
                <p
                  style={{
                    fontSize: 12,
                    fontStyle: "italic",
                    color: C.gray,
                    lineHeight: 1.7,
                    fontFamily: "var(--font-body)",
                    margin: 0,
                  }}
                >
                  &ldquo;You&rsquo;re at a restaurant. Everything on the menu
                  looks good. You ask the waiter. He says everything is good.
                  You guess. You regret it.&rdquo;
                </p>
              </div>
            </div>

            {/* 3. H1 */}
            <h1
              style={{
                fontFamily: "var(--font-headline)",
                fontWeight: 900,
                fontSize: 52,
                color: C.white,
                lineHeight: 0.9,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                margin: 0,
                marginBottom: 4,
              }}
            >
              That moment ends here.
            </h1>

            {/* 4. H2 */}
            <h2
              style={{
                fontFamily: "var(--font-headline)",
                fontWeight: 800,
                fontSize: 52,
                color: C.orange,
                lineHeight: 0.9,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                margin: 0,
                marginBottom: 18,
              }}
            >
              Know what to order.
            </h2>

            {/* 5. Search bar */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Search a dish"
              onClick={handleSearchClick}
              onKeyDown={handleSearchKey}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: "10px 14px",
                cursor: "pointer",
                marginBottom: 8,
              }}
            >
              <Search
                style={{ width: 14, height: 14, color: C.grayDim, flexShrink: 0 }}
                strokeWidth={1.5}
              />
              <span
                style={{
                  fontSize: 13,
                  color: C.grayDim,
                  fontFamily: "var(--font-body)",
                }}
              >
                Try &ldquo;Butter Chicken&rdquo;...
              </span>
            </div>

            {/* 6. Chips */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 24,
              }}
            >
              {HERO_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => navigateWithQuery(chip)}
                  style={{
                    fontSize: 9,
                    color: C.grayDim,
                    padding: "3px 8px",
                    borderRadius: 20,
                    border: `1px solid ${C.border}`,
                    background: "transparent",
                    fontFamily: "var(--font-body)",
                    cursor: "pointer",
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* 7. Horizontal card carousel */}
          <div>
            <div
              style={{
                fontSize: 9,
                color: C.grayDim,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: "var(--font-body)",
                marginBottom: 10,
                paddingLeft: 16,
              }}
            >
              Top rated right now
            </div>

            <div
              style={{ position: "relative", height: 148, overflow: "hidden" }}
              aria-live="polite"
              aria-atomic="true"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mobileIdx}
                  initial={{ x: 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -60, opacity: 0 }}
                  transition={{ duration: 0.35, ease: CAROUSEL_EASE }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: C.card,
                    border: `1px solid rgba(232,87,26,0.35)`,
                    borderRadius: 10,
                    padding: "16px 18px",
                    boxShadow: C.mCardShadow,
                  }}
                >
                  <CardContent dish={dishes[mobileIdx]} C={C} />
                </motion.div>
              </AnimatePresence>
            </div>

            <div
              style={{
                marginTop: 14,
                fontSize: 10,
                fontFamily: "var(--font-body)",
                paddingLeft: 16,
              }}
            >
              <span style={{ color: C.orange, fontWeight: 600 }}>{dishCountDisplay}</span>
              <span style={{ color: C.grayDim }}> dishes rated in {cityName}</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

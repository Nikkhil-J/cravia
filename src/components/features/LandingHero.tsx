"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ArrowRight, Check, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useExploreSearchStore } from "@/lib/store/exploreSearchStore";
import { CITY_DISPLAY_NAME, type City } from "@/lib/constants";
import type { Dish } from "@/lib/types";

// ── V2 "Bold Split" Design Tokens ────────────────────────
// Values mirror the global CSS tokens in globals.css so both stay in sync.
const DARK_C = {
  bg: "var(--color-surface-dark)", // #121009
  surface: "var(--dc-surface)", // #1e1a17
  card: "var(--card)", // #252018
  border: "var(--dc-border)", // #302820
  orange: "var(--color-primary)", // #e8571a
  orangeDim: "rgba(232,87,26,0.15)",
  white: "var(--dc-text-primary)", // #f5f0eb
  gray: "var(--dc-text-secondary)", // #9a9080
  grayDim: "var(--dc-text-muted)", // #5a5248
  scoreBg: "rgba(255,255,255,0.08)",
  cardShadow: "0 8px 32px rgba(0,0,0,0.5)",
  mCardShadow: "0 6px 24px rgba(0,0,0,0.45)",
  stack1Bg: "rgba(30,26,23,0.63)",
  stack2Bg: "rgba(30,26,23,0.41)",
} as const;

const LIGHT_C = {
  bg: "var(--background)", // #faf7f4
  surface: "var(--dc-surface-2)", // #f0ebe5
  card: "var(--card)", // #f0ebe5
  border: "var(--dc-border)", // #e0d6ce
  orange: "var(--color-primary)", // #e8571a
  orangeDim: "rgba(232,87,26,0.12)",
  white: "var(--dc-text-primary)", // #1a1008
  gray: "var(--dc-text-secondary)", // #6b5d52
  grayDim: "var(--dc-text-muted)", // #9a8880
  scoreBg: "rgba(0,0,0,0.08)",
  cardShadow: "0 8px 32px rgba(0,0,0,0.12)",
  mCardShadow: "0 6px 24px rgba(0,0,0,0.10)",
  stack1Bg: "rgba(240,235,229,0.80)",
  stack2Bg: "rgba(240,235,229,0.55)",
} as const;

type HeroColors = {
  bg: string;
  surface: string;
  card: string;
  border: string;
  orange: string;
  orangeDim: string;
  white: string;
  gray: string;
  grayDim: string;
  scoreBg: string;
  cardShadow: string;
  mCardShadow: string;
  stack1Bg: string;
  stack2Bg: string;
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
  {
    id: "f1",
    name: "Butter Chicken",
    restaurant: "Punjab Grill · Cyber Hub",
    taste: 91,
    portion: 78,
    value: 82,
    tags: ["Rich & creamy", "Worth it"],
  },
  {
    id: "f2",
    name: "Dosa Masala",
    restaurant: "Saravana Bhavan · DLF Phase 4",
    taste: 88,
    portion: 85,
    value: 94,
    tags: ["Crispy", "Best value"],
  },
  {
    id: "f3",
    name: "Thai Basil Chicken",
    restaurant: "SOCA – Brewery · Sector 29",
    taste: 72,
    portion: 48,
    value: 38,
    tags: ["Very sweet", "Overpriced"],
  },
  {
    id: "f4",
    name: "Momos (Steamed)",
    restaurant: "Local Street · Sector 14",
    taste: 87,
    portion: 92,
    value: 96,
    tags: ["Generous", "Great value"],
  },
  {
    id: "f5",
    name: "Paneer Tikka",
    restaurant: "Dhaba By Claridges · NH8",
    taste: 89,
    portion: 80,
    value: 77,
    tags: ["Smoky", "Generous"],
  },
];

// Dish.avgTaste etc. are on a 0-5 scale; multiply × 20 → 0-100
function mapDishesToCarousel(dishes: Dish[]): CarouselDish[] {
  return dishes.map((d) => ({
    id: d.id,
    name: d.name,
    restaurant: d.restaurantName + (d.area ? ` · ${d.area}` : ""),
    taste: Math.round(d.avgTaste * 20),
    portion: Math.round(d.avgPortion * 20),
    value: Math.round(d.avgValue * 20),
    tags: (d.topTags ?? []).slice(0, 2),
  }));
}

// ── Search bar placeholder pool (one picked at random per load) ──────────
const SEARCH_PLACEHOLDERS = [
  "Butter Chicken at Punjab Grill...",
  "Best biryani near me...",
  "Dosa worth ordering...",
  "Momos that aren't soggy...",
  "Pizza with a good crust...",
  "Paneer tikka, but actually smoky...",
  "Something worth the money...",
] as const;

// ── Category chips ────────────────────────────────────────
const HERO_CHIPS = [
  "Biryani",
  "Butter Chicken",
  "Dosa",
  "Momos",
  "Pizza",
  "Rolls",
  "Pasta",
] as const;

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
  label,
  value,
  fill,
  grayDim,
  trackBg,
}: {
  label: string;
  value: number;
  fill: string;
  grayDim: string;
  trackBg: string;
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
        <span
          style={{ fontSize: 18, opacity: 0.6, flexShrink: 0, marginLeft: 8 }}
        >
          🍽️
        </span>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <ScoreBar
          label="Taste"
          value={dish.taste}
          fill="#e8571a"
          grayDim={C.grayDim}
          trackBg={C.scoreBg}
        />
        <ScoreBar
          label="Portion"
          value={dish.portion}
          fill="#c94e14"
          grayDim={C.grayDim}
          trackBg={C.scoreBg}
        />
        <ScoreBar
          label="Value"
          value={dish.value}
          fill="#a03a0e"
          grayDim={C.grayDim}
          trackBg={C.scoreBg}
        />
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

// ── Cycling problems → solutions block ───────────────────

const PROBLEMS = [
  `Asking the waiter. "Sir, everything is good, sir."`,
  `4.3 stars. 1,200 reviews. Zero about the food.`,
  `Ordering paneer tikka. Again. Like always.`,
] as const;

const SOLUTIONS = [
  `Cravia tells you exactly what to order.`,
  `Real dish ratings. Not just the restaurant.`,
  `Discover what's actually good here.`,
] as const;

type ItemPhase = "problem" | "striking" | "solved";

function CyclingProblems({
  C,
  fontSize = 20,
  gap = 16,
}: {
  C: HeroColors;
  fontSize?: number;
  gap?: number;
}) {
  const [phases, setPhases] = useState<ItemPhase[]>([
    "problem",
    "problem",
    "problem",
  ]);
  const [cycle, setCycle] = useState(0);
  const isResettingRef = useRef(false);

  useEffect(() => {
    isResettingRef.current = false;
    const t: ReturnType<typeof setTimeout>[] = [];
    const READ_PAUSE = 2400;
    const STRIKE_INTERVAL = 1400;
    const STRIKE_HOLD = 1200;
    const RESET_PAUSE = 1000;

    // Strike → solve each item
    [0, 1, 2].forEach((i) => {
      t.push(
        setTimeout(
          () =>
            setPhases((p) => p.map((v, idx) => (idx === i ? "striking" : v))),
          READ_PAUSE + i * STRIKE_INTERVAL,
        ),
      );
      t.push(
        setTimeout(
          () => setPhases((p) => p.map((v, idx) => (idx === i ? "solved" : v))),
          READ_PAUSE + i * STRIKE_INTERVAL + STRIKE_HOLD,
        ),
      );
    });

    const lastSolvedAt = READ_PAUSE + 2 * STRIKE_INTERVAL + STRIKE_HOLD;

    // Reset all at once instantly, then start next cycle
    t.push(
      setTimeout(() => {
        isResettingRef.current = true;
        setPhases(["problem", "problem", "problem"]);
        setCycle((c) => c + 1);
      }, lastSolvedAt + RESET_PAUSE),
    );

    return () => t.forEach(clearTimeout);
  }, [cycle]);

  const iconSize = Math.round(fontSize * 1.3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {/* eslint-disable-next-line react-hooks/refs */}
      {PROBLEMS.map((problem, i) => {
        const solved = phases[i] === "solved";
        const striking = phases[i] === "striking";
        const svgSize = Math.round(fontSize * 0.72);
        const instant = isResettingRef.current;
        return (
          <div
            key={i}
            style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
          >
            {/* Icon — both glyphs always in DOM, opacity crossfade only */}
            <motion.span
              animate={{
                background: solved ? "transparent" : C.orange,
                borderColor: solved ? C.orange : "transparent",
              }}
              transition={{ duration: instant ? 0.15 : 0.25 }}
              style={{
                width: iconSize,
                height: iconSize,
                borderRadius: 6,
                border: "1px solid transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                position: "relative",
              }}
            >
              <motion.span
                animate={{ opacity: solved ? 0 : 1 }}
                transition={{ duration: instant ? 0.15 : 0.2 }}
                style={{
                  position: "absolute",
                  display: "flex",
                  color: "#fff",
                }}
              >
                <X size={svgSize} strokeWidth={2.5} />
              </motion.span>
              <motion.span
                animate={{ opacity: solved ? 1 : 0 }}
                transition={{ duration: instant ? 0.15 : 0.2 }}
                style={{
                  position: "absolute",
                  display: "flex",
                  color: C.orange,
                }}
              >
                <Check size={svgSize} strokeWidth={2.5} />
              </motion.span>
            </motion.span>

            {/* Text — problem always in flow (reserves height), solution overlaid */}
            <div style={{ position: "relative", flex: 1 }}>
              {/* Problem text: always in flow; visibility:hidden when solved keeps height */}
              <span
                style={{
                  display: "block",
                  width: "fit-content",
                  position: "relative",
                  visibility: solved ? "hidden" : "visible",
                  fontSize,
                  fontWeight: 500,
                  color: C.gray,
                  fontFamily: "var(--font-body)",
                  lineHeight: 1.4,
                }}
              >
                {problem}
                {/* Strike line — always in DOM, scaleX 0→1 */}
                <motion.span
                  animate={{ scaleX: striking ? 1 : 0 }}
                  transition={{ duration: instant ? 0 : 0.8, ease: [0.77, 0, 0.18, 1] }}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "52%",
                    width: "100%",
                    height: 1.5,
                    background: C.orange,
                    transformOrigin: "left center",
                    display: "block",
                    scaleX: 0,
                  }}
                />
              </span>

              {/* Solution text — absolutely on top, fades in when solved */}
              <motion.span
                animate={{ opacity: solved ? 1 : 0 }}
                transition={{ duration: instant ? 0.15 : 0.28, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  display: "block",
                  fontSize,
                  fontWeight: 600,
                  color: C.white,
                  fontFamily: "var(--font-body)",
                  lineHeight: 1.4,
                  pointerEvents: "none",
                }}
              >
                {SOLUTIONS[i]}
              </motion.span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── HangingTags ───────────────────────────────────────────

const HANGING_TAGS = [
  {
    text: "yaar kya\norder\nkarein?",
    stringHeight: "calc(30.4vh + 80px)",
    delay: "0s",
    swayDuration: "5.2s",
    swayFrom: "-2deg",
    swayTo: "1.5deg",
    animName: "swayTag0",
  },
  {
    text: "unki dish\nbetter\nlag rahi",
    stringHeight: "calc(30.4vh + 120px)",
    delay: "0.5s",
    swayDuration: "6.8s",
    swayFrom: "1.5deg",
    swayTo: "-2deg",
    animName: "swayTag1",
  },
  {
    text: "kash\nreview\ndekha hota",
    stringHeight: "calc(30.4vh + 64px)",
    delay: "1s",
    swayDuration: "4.8s",
    swayFrom: "-1.5deg",
    swayTo: "2deg",
    animName: "swayTag2",
  },
] as const

function HangingTags() {
  const [litIdx, setLitIdx] = useState(1)
  const { resolvedTheme } = useTheme()
  const isLight = resolvedTheme === "light"

  useEffect(() => {
    const id = setInterval(() => setLitIdx((p) => (p + 1) % 3), 2400)
    return () => clearInterval(id)
  }, [])

  const cardBgActive   = isLight ? "#f5ede5"             : "#1a1210"
  const cardBgInactive = isLight ? LIGHT_C.surface       : "#131313"
  const borderActive   = "rgba(232,69,10,0.35)"
  const borderInactive = isLight ? "rgba(0,0,0,0.10)"   : "rgba(255,255,255,0.06)"
  const textActive     = isLight ? LIGHT_C.white         : "rgba(255,255,255,0.85)"
  const textInactive   = isLight ? LIGHT_C.grayDim       : "rgba(255,255,255,0.28)"
  const stringGrad     = isLight
    ? "linear-gradient(to bottom, rgba(0,0,0,0.18), rgba(0,0,0,0.04))"
    : "linear-gradient(to bottom, rgba(255,255,255,0.10), rgba(255,255,255,0.02))"
  const pinInactive    = isLight ? "rgba(0,0,0,0.12)"   : "rgba(255,255,255,0.08)"

  return (
    <div
      style={{
        position: "absolute",
        top: -44,
        left: "50%",
        transform: "translateX(-68%)",
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 28,
        pointerEvents: "none",
        zIndex: 41,
      }}
    >
        {HANGING_TAGS.map((tag, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transformOrigin: "top center",
              animation: `${tag.animName} ${tag.swayDuration} ease-in-out infinite`,
              animationDelay: tag.delay,
            }}
          >
            {/* String */}
            <div
              style={{
                width: 1.5,
                height: tag.stringHeight,
                background: stringGrad,
              }}
            />
            {/* Tag card */}
            <div
              style={{
                position: "relative",
                background: litIdx === i ? cardBgActive : cardBgInactive,
                border: `1px solid ${litIdx === i ? borderActive : borderInactive}`,
                borderRadius: 10,
                padding: "14px 12px",
                fontSize: 14,
                width: 96,
                minHeight: 96,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: litIdx === i ? textActive : textInactive,
                whiteSpace: "pre-line",
                textAlign: "center",
                lineHeight: 1.65,
                transition:
                  "border-color 0.5s ease, color 0.5s ease, background 0.5s ease",
                fontFamily: "var(--font-body)",
              }}
            >
              {/* Pin dot */}
              <div
                style={{
                  position: "absolute",
                  top: -4,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: litIdx === i ? "#E8450A" : pinInactive,
                  transition: "background 0.5s ease",
                }}
              />
              {tag.text}
            </div>
          </div>
        ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────

export function LandingHero({
  topDishes,
  city,
  dishCount = 0,
}: LandingHeroProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const C: HeroColors = resolvedTheme === "light" ? LIGHT_C : DARK_C;
  const [exiting, setExiting] = useState(false);
  const [desktopIdx, setDesktopIdx] = useState(0);
  const [mobileIdx, setMobileIdx] = useState(0);
  const [searchPlaceholder] = useState(
    () =>
      SEARCH_PLACEHOLDERS[
        Math.floor(Math.random() * SEARCH_PLACEHOLDERS.length)
      ],
  );

  // Use API dishes when there are at least 2 reviewed results; fall back to sample data
  const reviewedDishes = topDishes.filter((d) => d.reviewCount > 0).slice(0, 5);
  const dishes: CarouselDish[] =
    reviewedDishes.length >= 2
      ? mapDishesToCarousel(reviewedDishes)
      : FALLBACK_DISHES;
  const n = dishes.length;

  // Desktop: advance every 4s
  useEffect(() => {
    const id = setInterval(() => setDesktopIdx((i) => (i + 1) % n), 4000);
    return () => clearInterval(id);
  }, [n]);

  // Mobile: advance every 4.5s
  useEffect(() => {
    const id = setInterval(() => setMobileIdx((i) => (i + 1) % n), 4500);
    return () => clearInterval(id);
  }, [n]);

  // ── Navigation helpers ──────────────────────────────────
  function navigateWithQuery(query: string) {
    if (exiting) return;
    setExiting(true);
    useExploreSearchStore.getState().setQuery(query);
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
    {
      tx: 0,
      scale: 1.0,
      opacity: 1.0,
      bg: C.card,
      border: "rgba(232,87,26,0.35)",
      shadow: C.cardShadow,
    },
    {
      tx: 6,
      scale: 0.975,
      opacity: 0.72,
      bg: C.stack1Bg,
      border: C.border,
      shadow: "none",
    },
    {
      tx: 12,
      scale: 0.95,
      opacity: 0.44,
      bg: C.stack2Bg,
      border: C.border,
      shadow: "none",
    },
  ];

  // ── Shared left-column content ────────────────────────
  const LivePill = (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 36,
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
    <div style={{ marginBottom: 36 }}>
      <CyclingProblems C={C} fontSize={15} gap={12} />
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
        Stop guessing.
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
          marginBottom: 36,
        }}
      >
        Order right.
      </h2>
    </>
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
        gap: 12,
        background: C.surface,
        border: `1px solid rgba(232,87,26,0.22)`,
        borderRadius: 10,
        padding: "13px 16px",
        maxWidth: 600,
        cursor: "pointer",
        marginBottom: 20,
        transition: "border-color 0.15s ease",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(232,87,26,0.55)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(232,87,26,0.22)")
      }
    >
      <Search
        style={{ width: 15, height: 15, color: C.gray, flexShrink: 0 }}
        strokeWidth={1.5}
      />
      <span
        style={{
          fontSize: 14,
          color: C.gray,
          fontFamily: "var(--font-body)",
          flex: 1,
        }}
      >
        {searchPlaceholder}
      </span>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          fontSize: 12,
          fontWeight: 500,
          color: C.orange,
          opacity: 0.8,
          fontFamily: "var(--font-body)",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Explore
        <ArrowRight size={12} strokeWidth={2} />
      </span>
    </div>
  );

  const AVATAR_COLORS = [
    "#7c5f3a",
    "#3a5f5f",
    "#5f3a7c",
    "#5f5f3a",
    "#3a4f7c",
  ] as const;
  const AVATAR_INITIALS = ["A", "M", "R", "S", "K"] as const;

  const SocialProof = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 20,
      }}
    >
      <div style={{ display: "flex" }}>
        {AVATAR_INITIALS.map((initial, i) => (
          <div
            key={initial}
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: AVATAR_COLORS[i],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
              color: "#fff",
              fontFamily: "var(--font-body)",
              marginLeft: i === 0 ? 0 : -6,
              border: `2px solid ${C.bg}`,
              position: "relative",
              zIndex: AVATAR_INITIALS.length - i,
            }}
          >
            {initial}
          </div>
        ))}
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 12 }}>
        <span style={{ color: C.white, fontWeight: 600 }}>Real diners</span>
        <span style={{ color: C.grayDim }}> rating dishes in {cityName}</span>
      </div>
    </div>
  );

  const Chips = (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 20 }}>
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
          {/* Left column — 68% on md, 52% on xl+ */}
          <div
            className="flex-[0_0_68%] xl:flex-[0_0_52%]"
            style={{
              paddingRight: 48,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {LivePill}
            {Headlines}
            {QuoteBlock}
            {SearchBar}
            {SocialProof}
            {Chips}
          </div>

          {/* Divider — visible md→xl only (when HangingTags is hidden) */}
          <div
            className="block xl:hidden"
            style={{
              width: 1,
              alignSelf: "stretch",
              opacity: 0.5,
              background: C.border,
            }}
          />

          {/* HangingTags anchor column — 300px, xl+ only, in-flow so never overlaps left panel */}
          <div
            aria-hidden="true"
            className="hidden xl:block"
            style={{
              width: 300,
              flexShrink: 0,
              position: "relative",
              alignSelf: "stretch",
              overflow: "visible",
            }}
          >
            <HangingTags />
          </div>

          {/* Right column — ~32% (flex:1) */}
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
              background: `radial-gradient(ellipse 48% 38% at 62% 42%, rgba(232,87,26,0.05) 0%, transparent 100%),
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
              Live dish scores
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
                      transition:
                        slotIdx > 0
                          ? "all 0.45s cubic-bezier(0.22, 1, 0.36, 1)"
                          : undefined,
                    }}
                  >
                    {slotIdx === 0 ? (
                      /* Active card — overlapping pass: both in/out visible simultaneously */
                      <div style={{ position: "relative", minHeight: 128, overflow: "hidden" }}>
                        <AnimatePresence mode="sync">
                          <motion.div
                            key={dish.id}
                            initial={{ y: 28, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -22, opacity: 0 }}
                            transition={{ duration: 0.42, ease: CAROUSEL_EASE }}
                            style={{ position: "absolute", inset: 0 }}
                          >
                            <CardContent dish={dish} C={C} />
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    ) : (
                      /* Peeking cards — name + restaurant only, no score bars */
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: C.white,
                              marginBottom: 2,
                              fontFamily: "var(--font-body)",
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
                        <span
                          style={{
                            fontSize: 18,
                            opacity: 0.6,
                            flexShrink: 0,
                            marginLeft: 8,
                          }}
                        >
                          🍽️
                        </span>
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
              <span style={{ color: C.orange, fontWeight: 600 }}>
                {dishCountDisplay}
              </span>
              <span style={{ color: C.grayDim }}>
                {" "}
                dishes rated in {cityName}
              </span>
            </div>
          </div>
        </div>

        {/* ── Mobile layout (< md) ── */}
        <div
          className="md:hidden"
          style={{ padding: "32px 20px", position: "relative" }}
        >
          {/* Left edge indent for content */}
          <div style={{ paddingLeft: 16 }}>
            {/* 1. Live pill */}
            {LivePill}

            {/* 2. H1 */}
            <h1
              style={{
                fontFamily: "var(--font-headline)",
                fontWeight: 900,
                fontSize: "clamp(38px, 10vw, 48px)",
                color: C.white,
                lineHeight: 0.9,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                margin: 0,
                marginBottom: 4,
              }}
            >
              Stop guessing.
            </h1>

            {/* 3. H2 */}
            <h2
              style={{
                fontFamily: "var(--font-headline)",
                fontWeight: 800,
                fontSize: "clamp(38px, 10vw, 48px)",
                color: C.orange,
                lineHeight: 0.9,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                margin: 0,
                marginBottom: 28,
              }}
            >
              Order right.
            </h2>

            {/* 4. Cycling problems block (below headline on mobile) */}
            <div style={{ marginBottom: 28 }}>
              <CyclingProblems C={C} fontSize={13} gap={12} />
            </div>

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
                gap: 12,
                background: C.surface,
                border: `1px solid rgba(232,87,26,0.22)`,
                borderRadius: 10,
                padding: "13px 16px",
                cursor: "pointer",
                marginBottom: 16,
              }}
            >
              <Search
                style={{
                  width: 15,
                  height: 15,
                  color: C.gray,
                  flexShrink: 0,
                }}
                strokeWidth={1.5}
              />
              <span
                style={{
                  fontSize: 14,
                  color: C.gray,
                  fontFamily: "var(--font-body)",
                  flex: 1,
                }}
              >
                {searchPlaceholder}
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 12,
                  fontWeight: 500,
                  color: C.orange,
                  opacity: 0.8,
                  fontFamily: "var(--font-body)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                Explore
                <ArrowRight size={12} strokeWidth={2} />
              </span>
            </div>

            {/* 5b. Social proof */}
            {SocialProof}

            {/* 6. Chips */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 32,
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
                marginBottom: 14,
                paddingLeft: 16,
              }}
            >
              Live dish scores
            </div>

            <div
              style={{ position: "relative", height: 148, overflow: "hidden" }}
              aria-live="polite"
              aria-atomic="true"
            >
              <AnimatePresence mode="sync">
                <motion.div
                  key={mobileIdx}
                  initial={{ y: 28, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -22, opacity: 0 }}
                  transition={{ duration: 0.42, ease: CAROUSEL_EASE }}
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
                marginTop: 20,
                fontSize: 10,
                fontFamily: "var(--font-body)",
                paddingLeft: 16,
              }}
            >
              <span style={{ color: C.orange, fontWeight: 600 }}>
                {dishCountDisplay}
              </span>
              <span style={{ color: C.grayDim }}>
                {" "}
                dishes rated in {cityName}
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

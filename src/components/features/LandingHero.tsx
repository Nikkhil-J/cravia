"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Star } from "lucide-react";
import { Reveal } from "@/components/ui/AnimateReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants/routes";
import { CITY_DISPLAY_NAME, type City } from "@/lib/constants";
import { getCuisineEmoji } from "@/lib/utils/dish-display";
import { getOptimizedImageUrl } from "@/lib/utils/image";
import { cn } from "@/lib/utils";
import type { Dish } from "@/lib/types";

interface LandingHeroProps {
  topDishes: Dish[];
  city: City;
  dishCount?: number;
}

const SEARCH_PLACEHOLDERS = [
  'Try "Butter Chicken" or "Dosa"...',
  "Best biryani near you...",
  "Pizza with a good crust...",
  "Momos that aren't soggy...",
  "Something actually worth the money...",
] as const;

const HERO_CHIPS = [
  { emoji: "🍛", label: "Biryani" },
  { emoji: "🍕", label: "Pizza" },
  { emoji: "🥘", label: "Butter Chicken" },
  { emoji: "🍜", label: "Ramen" },
  { emoji: "🫓", label: "Dosa" },
  { emoji: "🍰", label: "Desserts" },
] as const;

// Token-based avatar tints (no hardcoded colors).
const AVATAR_TINTS = [
  "bg-coral",
  "bg-coral-mid",
  "bg-brand-orange",
  "bg-coral-deep",
  "bg-success",
] as const;
const AVATAR_INITIALS = ["A", "M", "R", "S", "K"] as const;

const PHOTO_LABELS = [
  "🔥 Trending",
  "⭐ Top rated",
  "📸 Most photos",
  "❤️ Most saved",
] as const;

export function LandingHero({ topDishes, city, dishCount = 0 }: LandingHeroProps) {
  const router = useRouter();
  const cityName = CITY_DISPLAY_NAME[city];
  const [exiting, setExiting] = useState(false);
  // Default to a stable placeholder for SSR, then randomise after mount to
  // avoid a server/client hydration mismatch.
  const [placeholder, setPlaceholder] = useState<string>(
    SEARCH_PLACEHOLDERS[0],
  );

  useEffect(() => {
    setPlaceholder(
      SEARCH_PLACEHOLDERS[
        Math.floor(Math.random() * SEARCH_PLACEHOLDERS.length)
      ],
    );
  }, []);

  // The landing search bar is a gateway: any interaction opens the Explore
  // page with its search focused.
  function goToExplore() {
    if (exiting) return;
    setExiting(true);
    setTimeout(
      () => router.push(`${ROUTES.EXPLORE}?tab=dishes&focus=1`),
      120,
    );
  }

  const reviewedDishes = topDishes.filter((d) => d.reviewCount > 0);
  const photoDishes = reviewedDishes.slice(0, 4);
  const floatA = reviewedDishes[0] ?? null;
  const floatB = reviewedDishes[1] ?? null;

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden transition-opacity duration-150",
        exiting ? "opacity-0" : "opacity-100",
      )}
    >
      <style>{`
        @keyframes dc-hero-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes dc-hero-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(1.4); }
        }
      `}</style>

      {/* Decorative warm radial blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-48 h-[600px] w-[600px] rounded-full bg-coral/[0.06] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-36 h-[450px] w-[450px] rounded-full bg-brand-gold/[0.08] blur-2xl"
      />

      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-6 pb-16 pt-24 sm:px-8 lg:grid-cols-2 lg:pt-28">
        {/* ── Left: content ── */}
        <div className="relative z-10">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-pill bg-brand-gold-light px-3.5 py-1.5 text-[13px] font-semibold text-brand-gold-dark">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-brand-gold animate-[dc-hero-pulse_2s_ease_infinite]"
              />
              Now live in {cityName}
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mb-5 font-headline text-[clamp(48px,6.4vw,82px)] font-extrabold uppercase leading-[0.9] tracking-[-0.02em]">
              <span className="block text-heading">Stop guessing.</span>
              <span className="block text-primary">Order right.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mb-8 max-w-[480px] text-lg leading-relaxed text-text-secondary">
              Real reviews for real dishes. Know exactly what to order before you
              get there.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                goToExplore();
              }}
              onClick={goToExplore}
              className="flex w-full max-w-[540px] cursor-pointer items-center gap-2 rounded-2xl border border-border bg-card p-2 pl-4 shadow-md transition-all focus-within:border-coral focus-within:shadow-lg"
            >
              <Search
                className="pointer-events-none size-5 shrink-0 text-text-muted"
                strokeWidth={2}
                aria-hidden="true"
              />
              <Input
                type="text"
                readOnly
                onFocus={goToExplore}
                placeholder={placeholder}
                aria-label="Search a dish"
                className="h-11 min-h-0 flex-1 cursor-pointer rounded-none border-0 bg-transparent! px-0 text-base shadow-none focus-visible:ring-0 disabled:bg-transparent! dark:bg-transparent! md:text-base"
              />
              <Button
                type="submit"
                className="h-11 shrink-0 rounded-xl px-7 text-[15px] text-white"
              >
                Search
              </Button>
            </form>
          </Reveal>

          {/* ── Real diners social proof (new-design block, below search) ── */}
          <Reveal delay={0.2}>
            <div className="mt-5 flex items-center gap-2.5">
              <div className="flex">
                {AVATAR_INITIALS.map((initial, i) => (
                  <span
                    key={initial}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border-2 border-background text-[11px] font-bold text-white",
                      AVATAR_TINTS[i],
                      i > 0 && "-ml-2",
                    )}
                    aria-hidden="true"
                  >
                    {initial}
                  </span>
                ))}
              </div>
              <p className="text-[13px] text-text-secondary">
                <span className="font-semibold text-text-primary">
                  Real diners
                </span>{" "}
                rating dishes in {cityName}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="mt-6 flex flex-wrap gap-2">
              {HERO_CHIPS.map((chip) => (
                <Link
                  key={chip.label}
                  href={`${ROUTES.EXPLORE}?tab=dishes&q=${encodeURIComponent(chip.label)}`}
                  className="rounded-pill border border-border bg-background px-4 py-1.5 text-[13px] font-medium text-text-secondary transition-all hover:-translate-y-0.5 hover:border-coral hover:bg-coral-bg hover:text-coral-deep"
                >
                  <span aria-hidden="true">{chip.emoji}</span> {chip.label}
                </Link>
              ))}
            </div>
          </Reveal>

          {dishCount > 0 && (
            <Reveal delay={0.3}>
              <p className="mt-6 text-[13px] text-text-muted">
                <span className="font-semibold text-coral">
                  {dishCount.toLocaleString("en-IN")}+
                </span>{" "}
                dishes rated and counting
              </p>
            </Reveal>
          )}
        </div>

        {/* ── Right: photo grid + floating cards (lg+ only) ── */}
        <div className="relative hidden lg:block">
          <div className="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => {
              const dish = photoDishes[i];
              return (
                <div
                  key={i}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-2xl bg-coral-bg",
                    i === 1 && "mt-8",
                    i === 2 && "-mt-8",
                  )}
                >
                  {dish?.coverImage ? (
                    <Image
                      src={getOptimizedImageUrl(dish.coverImage, "card") ?? ""}
                      alt={dish.name}
                      fill
                      sizes="(max-width: 1024px) 0px, 25vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl">
                      <span aria-hidden="true">
                        {getCuisineEmoji(dish?.cuisines?.[0])}
                      </span>
                    </div>
                  )}
                  <span className="absolute bottom-3 left-3 rounded-md bg-card/90 px-3 py-1 text-[13px] font-semibold text-text-primary backdrop-blur">
                    {PHOTO_LABELS[i]}
                  </span>
                </div>
              );
            })}
          </div>

          {floatA && (
            <div className="absolute -right-4 top-5 z-20 flex items-center gap-2.5 rounded-xl bg-card p-3 shadow-lg animate-[dc-hero-float_4s_ease-in-out_infinite]">
              <Star
                className="size-4 fill-brand-gold text-brand-gold"
                aria-hidden="true"
              />
              <div>
                <div className="text-[13px] font-semibold text-text-primary">
                  {floatA.name}
                </div>
                <div className="text-[11px] text-text-muted">
                  {floatA.restaurantName}
                  {floatA.area ? ` · ${floatA.area}` : ""}
                </div>
              </div>
            </div>
          )}

          {floatB && (
            <div className="absolute -left-4 bottom-12 z-20 flex items-center gap-2.5 rounded-xl bg-card p-3 shadow-lg animate-[dc-hero-float_4s_ease-in-out_infinite_2s]">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-success text-[13px] font-bold text-white">
                {floatB.avgOverall.toFixed(1)}
              </span>
              <div>
                <div className="text-[13px] font-semibold text-text-primary">
                  {floatB.name}
                </div>
                <div className="text-[11px] text-text-muted">
                  {floatB.restaurantName}
                  {floatB.area ? ` · ${floatB.area}` : ""}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { motion, type Variants } from "motion/react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { setExploreQuery } from "@/lib/stores/explore-search";
import { CITY_DISPLAY_NAME, type City } from "@/lib/constants";
import type { Dish } from "@/lib/types";
import { cn } from "@/lib/utils";

const HERO_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const heroLeftContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const heroLeftItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: HERO_EASE },
  },
};

const heroRightContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const heroRightItem: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: HERO_EASE },
  },
};

interface LandingHeroProps {
  topDishes: Dish[];
  city: City;
}

const HERO_CHIPS = [
  "Biryani",
  "Butter Chicken",
  "Dosa",
  "Momos",
  "Pizza",
  "Rolls",
  "Pasta",
  "Burger",
  "Idli",
] as const;

const PLACEHOLDER_TINTS = [
  "bg-placeholder-warm",
  "bg-placeholder-sage",
  "bg-placeholder-sky",
] as const;

const RATING_BAR_TOTAL = 5;

function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(RATING_BAR_TOTAL, Math.round(value)));
}

function RatingBars({
  filled,
  fillClass,
}: {
  filled: number;
  fillClass: string;
}) {
  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: RATING_BAR_TOTAL }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1 w-[18px] rounded-[2px]",
            i < filled ? fillClass : "bg-border",
          )}
        />
      ))}
    </div>
  );
}

interface DishRowProps {
  dish: Dish;
  variant: "featured" | "secondary" | "tertiary";
  tint: (typeof PLACEHOLDER_TINTS)[number];
}

function DishRow({ dish, variant, tint }: DishRowProps) {
  const isFeatured = variant === "featured";

  const tasteFilled = clampScore(dish.avgTaste);
  const portionFilled = clampScore(dish.avgPortion);
  const valueFilled = clampScore(dish.avgValue);

  const containerClass = cn(
    "flex items-start gap-3.5 rounded-2xl p-[18px]",
    isFeatured
      ? "border border-coral bg-card"
      : "border-[0.5px] border-border bg-surface-2",
    variant === "secondary" && "opacity-75",
    variant === "tertiary" && "opacity-50",
  );

  const tags = (dish.topTags ?? []).slice(0, 3);

  return (
    <div className={containerClass}>
      <div
        className={cn(
          "relative flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-[10px]",
          tint,
        )}
      >
        {dish.coverImage ? (
          <Image
            src={dish.coverImage}
            alt={dish.name}
            width={60}
            height={60}
            sizes="60px"
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-medium text-text-primary">{dish.name}</h3>
        <p className="mb-[9px] text-xs text-text-secondary">
          {dish.restaurantName}
          {dish.area ? ` · ${dish.area}` : ""}
        </p>

        <div className="flex gap-3">
          <div>
            <div className="mb-[3px] text-[9px] font-medium uppercase tracking-[0.06em] text-text-secondary">
              Taste
            </div>
            <RatingBars filled={tasteFilled} fillClass="bg-rating-taste" />
          </div>
          <div>
            <div className="mb-[3px] text-[9px] font-medium uppercase tracking-[0.06em] text-text-secondary">
              Portion
            </div>
            <RatingBars filled={portionFilled} fillClass="bg-rating-portion" />
          </div>
          <div>
            <div className="mb-[3px] text-[9px] font-medium uppercase tracking-[0.06em] text-text-secondary">
              Value
            </div>
            <RatingBars filled={valueFilled} fillClass="bg-rating-value" />
          </div>
        </div>

        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  "rounded-full px-2 py-[2px] text-[11px] font-medium",
                  isFeatured
                    ? "bg-coral-bg text-coral-deep"
                    : "bg-surface-3 text-text-secondary",
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="mt-[6px] text-[11px] text-text-secondary">
          Based on {dish.reviewCount} review{dish.reviewCount === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}

const CYCLING_DISHES = [
  "Butter Chicken",
  "Biryani",
  "Dosa",
  "Paneer Tikka",
  "Momos",
  "Chole Bhature",
  "Pizza",
  "Kebab",
] as const;

function CyclingDishName() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % CYCLING_DISHES.length);
        setVisible(true);
      }, 300);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="font-medium text-text-primary transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {CYCLING_DISHES[index]}
    </span>
  );
}

export function LandingHero({ topDishes, city }: LandingHeroProps) {
  const router = useRouter();
  const [exiting, setExiting] = useState(false);

  function navigateWithQuery(query: string) {
    if (exiting) return;
    setExiting(true);
    setExploreQuery(query);
    setTimeout(
      () =>
        router.push(
          `${ROUTES.EXPLORE}?tab=dishes${query ? `&q=${encodeURIComponent(query)}` : ""}`,
        ),
      120,
    );
  }

  function handleSearchClick() {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => router.push(`${ROUTES.EXPLORE}?tab=dishes&focus=1`), 120);
  }

  function handleSearchKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSearchClick();
    }
  }

  const cityName = CITY_DISPLAY_NAME[city];

  const reviewedDishes = topDishes.filter((d) => d.reviewCount > 0);
  const hasDishes = reviewedDishes.length > 0;
  const cardVariants = ["featured", "secondary", "tertiary"] as const;

  return (
    <section
      className={cn(
        "mx-auto max-w-[960px] px-4 sm:px-8",
        hasDishes
          ? "grid grid-cols-1 items-start gap-6 pt-10 sm:pt-14 md:grid-cols-2 md:gap-[52px]"
          : "pb-12 pt-12 md:pt-[72px]",
      )}
      style={{ opacity: exiting ? 0 : 1, transition: "opacity 150ms ease-in" }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={heroLeftContainer}
      >
        <motion.div
          variants={heroLeftItem}
          className="mb-7 inline-flex items-center gap-1.5 rounded-full bg-coral-bg px-4 py-1.5"
        >
          <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-coral" />
          </span>
          <span className="text-[13px] font-medium text-coral-deep">
            Now live in {cityName}
          </span>
        </motion.div>

        <motion.div variants={heroLeftItem} className="mb-6 max-w-[600px]">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-coral">
            Sound familiar?
          </p>
          <blockquote className="rounded-r-[10px] border-l-[3px] border-coral bg-coral-bg px-[18px] py-[14px]">
            <p className="text-base italic leading-[1.75] text-coral-deeper">
              &ldquo;You&rsquo;re at a restaurant. Everything on the menu looks
              good. You ask the waiter. He says everything is good. You guess.
              You regret it.&rdquo;
            </p>
          </blockquote>
        </motion.div>

        <motion.h1
          variants={heroLeftItem}
          className="max-w-[640px] text-[38px] font-medium leading-[1.1] tracking-[-1.5px] text-text-primary md:text-[56px]"
        >
          That moment
          <br />
          ends here.
          <br />
          <span className="text-coral">Know what to order.</span>
        </motion.h1>

        <motion.div
          variants={heroLeftItem}
          aria-hidden="true"
          className="my-[18px] h-[3px] w-12 rounded-[2px] bg-coral"
        />

        <motion.p
          variants={heroLeftItem}
          className="mb-8 max-w-[640px] text-base leading-[1.7] text-text-primary/70"
        >
          Cravia rates every dish — not just the restaurant. Taste, portion, and
          value scores from real diners, for every dish across {cityName}.
        </motion.p>

        <motion.div
          variants={heroLeftItem}
          role="button"
          tabIndex={0}
          aria-label="Search a dish"
          onClick={handleSearchClick}
          onKeyDown={handleSearchKey}
          className="mb-3 flex max-w-[640px] cursor-pointer items-center gap-2 rounded-[10px] border border-border bg-surface-2 px-[18px] py-[14px] transition-colors hover:border-coral focus-within:border-coral"
        >
          <Search
            className="h-4 w-4 shrink-0 text-text-secondary"
            strokeWidth={1.5}
          />
          <span className="flex items-center gap-1 text-[15px] text-text-secondary">
            Try
            <CyclingDishName />
          </span>
        </motion.div>

        <motion.div
          variants={heroLeftItem}
          className="flex max-w-[640px] flex-wrap gap-1.5"
        >
          {HERO_CHIPS.map((chip) => (
            <Button
              key={chip}
              type="button"
              variant="outline"
              size="xs"
              onClick={() => navigateWithQuery(chip)}
              className="!min-h-0 h-7 rounded-full border-[0.5px] border-border bg-card px-[11px] text-xs font-normal text-text-secondary hover:border-coral hover:bg-coral-bg hover:text-coral-deep"
            >
              {chip}
            </Button>
          ))}
        </motion.div>
      </motion.div>

      {hasDishes && (
        <motion.div
          className="space-y-3 pt-1"
          initial="hidden"
          animate="visible"
          variants={heroRightContainer}
        >
          {reviewedDishes.slice(0, 3).map((dish, i) => (
            <motion.div key={dish.id} variants={heroRightItem}>
              <DishRow
                dish={dish}
                variant={cardVariants[i]}
                tint={PLACEHOLDER_TINTS[i]}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}

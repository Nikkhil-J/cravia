"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Dish, PriceRange } from "@/lib/types";
import { cn } from "@/lib/utils/index";
import { getCuisineEmoji } from "@/lib/utils/dish-display";
import { getOptimizedImageUrl } from "@/lib/utils/image";
import { ROUTES } from "@/lib/constants/routes";
import { WishlistButton } from "@/components/features/WishlistButton";

interface DishCardProps {
  dish: Dish;
  index?: number;
  showRestaurantContext?: boolean;
  /** "grid" = vertical image-header card (default); "list" = horizontal row. */
  layout?: "grid" | "list";
}

const PRICE_TIER: Record<PriceRange, string> = {
  "under-100": "₹",
  "100-200": "₹₹",
  "200-400": "₹₹",
  "400-600": "₹₹₹",
  "above-600": "₹₹₹₹",
};

function dietaryMeta(dietary: string | null | undefined) {
  if (dietary === "veg") return { emoji: "🥬", label: "Veg", tone: "veg" as const };
  if (dietary === "non-veg")
    return { emoji: "🍖", label: "Non-Veg", tone: "non-veg" as const };
  if (dietary === "egg") return { emoji: "🥚", label: "Egg", tone: null };
  return null;
}

export function DishCard({
  dish,
  index = 0,
  showRestaurantContext = false,
  layout = "grid",
}: DishCardProps) {
  const diet = dietaryMeta(dish.dietary);
  const price = dish.priceRange?.match(/\d+/)?.[0];
  const priceTier = dish.priceRange ? PRICE_TIER[dish.priceRange] : null;
  const totalReviews = dish.totalReviews ?? dish.reviewCount ?? 0;
  const rating = dish.avgOverall > 0 ? dish.avgOverall.toFixed(1) : null;
  const topBadge =
    diet?.tone === "veg"
      ? "🌱 Veg"
      : dish.avgOverall >= 4.5 && totalReviews >= 3
        ? "⭐ Top Rated"
        : null;

  const imageBlock = (
    <>
      {dish.coverImage ? (
        <Image
          src={getOptimizedImageUrl(dish.coverImage, "card") ?? ""}
          alt={dish.name}
          fill
          sizes={
            layout === "list"
              ? "128px"
              : "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 360px"
          }
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-bg-cream">
          <span className="text-5xl opacity-90" aria-hidden="true">
            {getCuisineEmoji(dish.cuisines?.[0])}
          </span>
        </div>
      )}

      {rating && (
        <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-md bg-success px-2 py-1 text-[13px] font-bold text-white shadow-sm">
          <Star className="h-3 w-3 fill-current" aria-hidden="true" />
          {rating}
        </span>
      )}

      {topBadge && (
        <span className="absolute left-3 top-3 z-10 rounded-pill bg-card/90 px-3 py-1 text-[11px] font-semibold text-primary shadow-sm backdrop-blur-sm">
          {topBadge}
        </span>
      )}

      <div className="pointer-events-auto absolute bottom-3 right-3 z-20">
        <WishlistButton dishId={dish.id} variant="icon" />
      </div>
    </>
  );

  const bodyBlock = (
    <>
      <h3 className="line-clamp-1 font-display text-[17px] font-semibold leading-snug text-heading">
        {dish.name}
      </h3>
      {showRestaurantContext && dish.restaurantName && (
        <p className="mt-1 line-clamp-1 text-[13px] text-text-secondary">
          {dish.restaurantName}
          {dish.area ? ` • ${dish.area}` : ""}
        </p>
      )}

      <div className="mt-2 flex items-center gap-3 text-xs text-text-muted">
        {diet && (
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true">{diet.emoji}</span>
            {diet.label}
          </span>
        )}
        {priceTier && (
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true">💰</span>
            {priceTier}
          </span>
        )}
      </div>

      {dish.topTags && dish.topTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {dish.topTags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-pill bg-bg-cream px-2.5 py-0.5 text-[11px] font-medium text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-text-muted">
          {totalReviews > 0
            ? `${totalReviews} review${totalReviews !== 1 ? "s" : ""}`
            : "No reviews yet"}
        </span>
        {price && (
          <span className="text-[15px] font-bold text-text-primary">₹{price}</span>
        )}
      </div>
    </>
  );

  if (layout === "list") {
    return (
      <article
        className="group relative flex animate-pop-in items-stretch gap-4 overflow-hidden rounded-lg border-[0.5px] border-border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
        style={{
          animationDelay: `${Math.min(index, 8) * 60}ms`,
          animationFillMode: "both",
        }}
      >
        <Link
          href={ROUTES.dish(dish.id)}
          prefetch
          className="absolute inset-0 z-0"
          aria-label={`View ${dish.name}`}
        />
        <div className="pointer-events-none relative h-32 w-32 shrink-0 overflow-hidden rounded-md bg-background-tertiary">
          {imageBlock}
        </div>
        <div className="pointer-events-none relative flex min-w-0 flex-1 flex-col">
          {bodyBlock}
        </div>
      </article>
    );
  }

  return (
    <article
      className="group relative flex h-full animate-pop-in flex-col overflow-hidden rounded-lg border-[0.5px] border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg"
      style={{
        animationDelay: `${Math.min(index, 8) * 60}ms`,
        animationFillMode: "both",
      }}
    >
      <Link
        href={ROUTES.dish(dish.id)}
        prefetch
        className="absolute inset-0 z-0"
        aria-label={`View ${dish.name}`}
      />
      <div className="pointer-events-none relative aspect-[4/3] w-full overflow-hidden bg-background-tertiary">
        {imageBlock}
      </div>
      <div className="pointer-events-none relative flex flex-1 flex-col p-4">
        {bodyBlock}
      </div>
    </article>
  );
}

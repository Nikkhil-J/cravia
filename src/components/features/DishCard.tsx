"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Dish } from "@/lib/types";
import { cn } from "@/lib/utils/index";
import { getCuisineEmoji } from "@/lib/utils/dish-display";
import { getOptimizedImageUrl } from "@/lib/utils/image";
import { ROUTES } from "@/lib/constants/routes";

interface DishCardProps {
  dish: Dish;
  index?: number;
  showRestaurantContext?: boolean;
}

export function DishCard({
  dish,
  index = 0,
  showRestaurantContext = false,
}: DishCardProps) {
  const router = useRouter();
  const dietary = dish.dietary as string | null | undefined;
  const dietaryTone =
    dietary === "veg" || dietary === "vegan"
      ? "veg"
      : dietary === "non-veg"
        ? "non-veg"
        : null;
  const price = dish.priceRange?.match(/\d+/)?.[0];
  const totalReviews = dish.totalReviews ?? dish.reviewCount ?? 0;

  return (
    <div
      className="group relative flex w-full animate-pop-in border-b-[0.5px] border-border-tertiary bg-transparent py-4 md:h-full md:overflow-hidden md:rounded-lg md:border-[0.5px] md:bg-background-elevated md:p-0 md:shadow-sm"
      style={{
        animationDelay: `${Math.min(index, 8) * 60}ms`,
        animationFillMode: "both",
      }}
    >
      <Link
        href={ROUTES.dish(dish.id)}
        prefetch={true}
        className="absolute inset-0 z-0"
        aria-label={`View ${dish.name}`}
      />
      <div className="pointer-events-none relative z-10 flex min-w-0 flex-1 items-start gap-4 md:h-full md:flex-col-reverse md:gap-0">
        <div className="min-w-0 flex-1 pt-3 md:w-full md:p-4">
          {dietaryTone && <DietaryIndicator tone={dietaryTone} />}
          <h3 className="mt-2 line-clamp-2 text-[17px] font-semibold leading-snug text-text-primary">
            {dish.name}
          </h3>
          {showRestaurantContext && dish.restaurantName && (
            <p className="mt-1 line-clamp-1 text-[13px] font-medium text-text-secondary">
              {dish.restaurantName}{dish.area ? ` · ${dish.area}` : ""}
            </p>
          )}
          {price && (
            <p className="mt-2 text-sm font-semibold text-text-primary">
              ₹{price} (approx)
            </p>
          )}
          <div
            className={cn(
              "flex items-center gap-2 md:mt-2 md:min-h-5",
              totalReviews > 0 && "mt-2 min-h-5",
            )}
          >
            {totalReviews > 0 && (
              <>
                <span className="h-1.5 w-10 rounded-pill bg-success" />
                <span className="text-[13px] text-text-secondary">
                  Reviewed by diners
                </span>
              </>
            )}
          </div>
          <p className="mt-2 text-[13px] text-text-tertiary">
            {totalReviews > 0 ? `${totalReviews} reviews` : "No reviews yet"}
          </p>
        </div>

        <div className="relative w-[120px] shrink-0 sm:w-[128px] md:w-full">
          <div className="relative aspect-square w-[120px] overflow-hidden rounded-lg bg-background-tertiary sm:w-[128px] md:aspect-[4/3] md:w-full md:rounded-none">
            {dish.coverImage ? (
              <Image
                src={getOptimizedImageUrl(dish.coverImage, 'card') ?? ''}
                alt={dish.name}
                fill
                sizes="(max-width: 767px) 120px, (max-width: 1023px) 128px, 400px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-bg-cream">
                <span className="text-4xl opacity-90" aria-hidden="true">
                  {getCuisineEmoji(dish.cuisines?.[0])}
                </span>
              </div>
            )}
          </div>
          <div
            onClick={(e) => {
              e.preventDefault();
              router.push(
                `${ROUTES.WRITE_REVIEW}?dishId=${encodeURIComponent(dish.id)}`,
              );
            }}
            className="pointer-events-auto absolute -bottom-3 left-1/2 z-20 flex h-10 w-[88px] -translate-x-1/2 cursor-pointer items-center justify-center rounded-sm border border-border-tertiary bg-background-elevated/95 pl-4 pr-5 shadow-lg transition-colors hover:bg-background-tertiary md:hidden"
          >
            <span className="text-sm font-extrabold tracking-wide text-success">
              REVIEW
            </span>
            <span className="absolute right-1 top-0.5 text-sm font-medium leading-none text-success">
              +
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DietaryIndicator({ tone }: { tone: "veg" | "non-veg" }) {
  return (
    <span
      aria-label={tone === "veg" ? "Vegetarian" : "Non-vegetarian"}
      className={cn(
        "flex h-3.5 w-3.5 items-center justify-center border",
        tone === "veg" ? "border-success" : "border-destructive",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "veg" ? "bg-success" : "bg-destructive",
        )}
      />
    </span>
  );
}

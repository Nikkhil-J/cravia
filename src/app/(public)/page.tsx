import { LandingHero } from "@/components/features/LandingHero";
import { TopRatedStrip } from "@/components/features/TopRatedStrip";
import { WhyCravia } from "@/components/features/WhyCravia";
import { LandingStatsRow } from "@/components/features/LandingStatsRow";
import { BrowseCuisines } from "@/components/features/BrowseCuisines";
import { NearbyRestaurants } from "@/components/features/NearbyRestaurants";
import { LandingHowItWorks } from "@/components/features/LandingHowItWorks";
import { LandingCTABlock } from "@/components/features/LandingCTABlock";
import { PersonalStatsBanner } from "@/components/features/PersonalStatsBanner";
import { PWAInstallBanner } from "@/components/features/PWAInstallBanner";
import { GURUGRAM } from "@/lib/constants";
import { getRestaurantCount } from "@/lib/services/restaurants";
import { searchRestaurants } from "@/lib/services/catalog";
import { getTopDishes, getDishCount } from "@/lib/services/dishes";
import { captureError } from "@/lib/monitoring/sentry";
import type { Dish, Restaurant } from "@/lib/types";

export const revalidate = 3600;

export default async function LandingPage() {
  const city = GURUGRAM;

  let topDishes: Dish[] = [];
  let dishCount = 0;
  let restaurantCount = 0;
  let restaurants: Restaurant[] = [];

  try {
    const [topDishesResult, dCount, rCount, restResult] = await Promise.all([
      getTopDishes(8, city, { minReviewCount: 1 }),
      getDishCount(city),
      getRestaurantCount(city),
      searchRestaurants({ city, limit: 8, sortBy: "most-reviewed" }),
    ]);
    topDishes = topDishesResult;
    dishCount = dCount;
    restaurantCount = rCount;
    restaurants = restResult.items;
  } catch (error) {
    captureError(error, {
      route: "LandingPage",
      extra: { context: "data fetching" },
    });
  }

  const heroDishes = topDishes.slice(0, 5);
  const stripDishes = topDishes.slice(5, 8);

  return (
    <>
      <LandingHero
        topDishes={heroDishes}
        city={city}
        dishCount={dishCount}
      />

      <div className="mt-8">
        <PersonalStatsBanner />
      </div>

      {stripDishes.length > 0 && (
        <TopRatedStrip dishes={stripDishes} city={city} />
      )}

      <LandingStatsRow
        dishCount={dishCount}
        restaurantCount={restaurantCount}
        city={city}
      />

      <WhyCravia />

      <BrowseCuisines />

      <LandingHowItWorks />

      <NearbyRestaurants restaurants={restaurants} city={city} />

      <LandingCTABlock />
      <PWAInstallBanner />
    </>
  );
}

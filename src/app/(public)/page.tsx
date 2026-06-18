import { LandingHero } from "@/components/features/LandingHero";
import { LandingStatsRow } from "@/components/features/LandingStatsRow";
import { WhyCravia } from "@/components/features/WhyCravia";
import { TopRatedStrip } from "@/components/features/TopRatedStrip";
import { BrowseCuisines } from "@/components/features/BrowseCuisines";
import { LandingHowItWorks } from "@/components/features/LandingHowItWorks";
import { NearbyRestaurants } from "@/components/features/NearbyRestaurants";
import { Testimonials } from "@/components/features/Testimonials";
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
      searchRestaurants({ city, limit: 8 }),
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
  const trendingDishes = topDishes.slice(0, 8);
  const featuredRestaurants = restaurants.slice(0, 3);

  return (
    <>
      <LandingHero topDishes={heroDishes} city={city} dishCount={dishCount} />

      <PersonalStatsBanner />

      <LandingStatsRow
        dishCount={dishCount}
        restaurantCount={restaurantCount}
        city={city}
      />

      <WhyCravia />

      {trendingDishes.length > 0 && (
        <TopRatedStrip dishes={trendingDishes} city={city} />
      )}

      <BrowseCuisines />

      <LandingHowItWorks />

      <NearbyRestaurants restaurants={featuredRestaurants} city={city} />

      <Testimonials />

      <LandingCTABlock />
      <PWAInstallBanner />
    </>
  );
}

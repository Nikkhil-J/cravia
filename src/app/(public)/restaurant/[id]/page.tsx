import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Building2, MapPin, Phone, Globe } from "lucide-react";
import {
  getRestaurantDetails,
  listRestaurantDishes,
} from "@/lib/services/catalog";
import { RecommendedDishesRow, RestaurantMenu } from "@/components/features/RestaurantMenu";
import { ReviewDishPicker } from "@/components/features/ReviewDishPicker";
import { EmptyState } from "@/components/ui/EmptyState";
import { MobileBackButton } from "@/components/ui/MobileBackButton";
import { ROUTES } from "@/lib/constants/routes";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const restaurant = await getRestaurantDetails(id);
  if (!restaurant) return { title: "Not found — Cravia" };
  const title = `${restaurant.name} — Cravia`;
  const description = `Dish reviews for ${restaurant.name} in ${restaurant.area}, ${restaurant.city}.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: restaurant.coverImage
        ? [{ url: restaurant.coverImage, width: 1200, height: 630, alt: restaurant.name }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: restaurant.coverImage ? [restaurant.coverImage] : [],
    },
  };
}

export default async function RestaurantPage({ params }: PageProps) {
  const { id } = await params;
  const [restaurant, dishes] = await Promise.all([
    getRestaurantDetails(id),
    listRestaurantDishes(id),
  ]);

  if (!restaurant) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    address: {
      "@type": "PostalAddress",
      addressLocality: restaurant.city,
      addressRegion: restaurant.area,
    },
    servesCuisine: restaurant.cuisines,
    ...(restaurant.coverImage ? { image: restaurant.coverImage } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div>
        {/* Mobile context bar: back follows history, title identifies the current page. */}
        <nav className="sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-40 flex min-w-0 items-center gap-2 border-b border-border bg-background/95 px-4 py-2 backdrop-blur-xl sm:top-[calc(4.25rem+env(safe-area-inset-top,0px))] sm:px-6 md:hidden">
          <MobileBackButton parentHref={ROUTES.EXPLORE} />
          <span className="min-w-0 truncate text-sm font-semibold text-text-primary">
            {restaurant.name}
          </span>
        </nav>

        {/* Hero */}
        <section className="relative min-h-[320px] w-full overflow-hidden bg-gradient-to-r from-bg-cream via-coral-light to-primary-light sm:min-h-[380px]">
          {restaurant.coverImage && (
            <Image
              src={restaurant.coverImage}
              alt={restaurant.name}
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-[1000px] px-4 pb-3 pt-24 sm:px-6 sm:pb-10">
              <nav className="mb-3 hidden min-w-0 items-center gap-1.5 text-xs text-text-muted sm:gap-2 sm:text-sm md:flex">
                <Link
                  href={ROUTES.EXPLORE}
                  className="shrink-0 transition-colors hover:text-primary"
                >
                  Restaurants
                </Link>
                <span className="shrink-0">/</span>
                <span className="min-w-0 truncate text-text-primary">
                  {restaurant.name}
                </span>
              </nav>

              <h1 className="font-display text-3xl font-bold text-heading sm:text-4xl">
                {restaurant.name}
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                {restaurant.cuisines.join(" · ")}
              </p>

              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <MapPin size={14} />
                  {restaurant.area}, {restaurant.city}
                </span>
                {restaurant.phoneNumber && (
                  <a
                    href={`tel:${restaurant.phoneNumber}`}
                    className="flex items-center gap-1.5 text-text-muted transition-colors hover:text-primary"
                  >
                    <Phone size={14} />
                    {restaurant.phoneNumber}
                  </a>
                )}
                {restaurant.googleMapsUrl && (
                  <a
                    href={restaurant.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-text-muted transition-colors hover:text-primary"
                  >
                    <MapPin size={14} />
                    View map
                  </a>
                )}
                {restaurant.website && (
                  <a
                    href={restaurant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-text-muted transition-colors hover:text-primary"
                  >
                    <Globe size={14} />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="bg-background">
          <div className="mx-auto max-w-[1000px] px-4 pb-6 pt-3 sm:px-6 sm:py-8">

            {restaurant.cuisines.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {restaurant.cuisines.map((c) => (
                  <span
                    key={c}
                    className="rounded-pill bg-primary-light px-3 py-1 text-xs font-semibold text-primary-dark"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}

            {dishes.length > 0 && (
              <div className="mt-5 flex gap-3">
                <ReviewDishPicker
                  dishes={dishes}
                  categories={restaurant.categories}
                  restaurantId={restaurant.id}
                  restaurantName={restaurant.name}
                />
              </div>
            )}

            {/* Stats */}
            <div className="mt-8 flex gap-0 overflow-hidden rounded-lg border border-glass-border bg-glass-surface backdrop-blur-sm">
              {[
                {
                  num: dishes.filter((d) => d.reviewCount > 0).length,
                  label: "Dishes reviewed",
                },
                {
                  num: dishes.reduce((sum, d) => sum + d.reviewCount, 0),
                  label: "Total reviews",
                },
              ].map((s) => (
                <div key={s.label} className="flex-1 py-4 text-center">
                  <div className="font-display text-xl font-bold text-heading">
                    {s.num}
                  </div>
                  <div className="text-xs text-text-muted">{s.label}</div>
                </div>
              ))}
            </div>

            {dishes.length > 0 && <RecommendedDishesRow dishes={dishes} />}

            {/* Menu */}
            <div className="mt-8 pb-12 sm:mt-10">
              <h2 className="font-display text-lg font-bold text-heading sm:text-xl">
                Menu ({dishes.length} dish{dishes.length !== 1 ? "es" : ""})
              </h2>
              {dishes.length === 0 ? (
                <EmptyState
                  icon="🍽️"
                  title="No dishes yet"
                  description="Be the first to add a dish review for this restaurant."
                />
              ) : (
                <div className="mt-4 sm:mt-6">
                  <RestaurantMenu dishes={dishes} categories={restaurant.categories} />
                </div>
              )}
            </div>

            {!restaurant.ownerId && (
              <div className="mt-6 mb-8 flex flex-col items-center gap-3 py-6">
                <p className="text-sm text-text-muted">Is this your restaurant?</p>
                <Link
                  href={ROUTES.claimRestaurant(restaurant.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary transition-all hover:border-primary/60 hover:bg-primary/20"
                >
                  <Building2 size={15} />
                  Claim this restaurant
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

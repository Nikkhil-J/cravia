import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/AnimateReveal";

const BEFORE_ITEMS = [
  "Restaurant is 4.2 stars — but which dish is actually good?",
  "Reviews talk about service, decor, parking — not the food",
  "No way to compare the same dish across restaurants",
  "You guess. Sometimes you regret it.",
] as const;

const AFTER_ITEMS = [
  "Butter Chicken: 4.6 taste, 3.8 portion, 4.2 value — 24 people rated this exact dish",
  "Every review is tied to a specific dish — no noise about parking",
  'Search "Biryani" and compare it across every restaurant in your area',
  "You order with confidence. Every single time.",
] as const;

function CrossIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 8 8"
      aria-hidden="true"
      className="text-text-muted"
    >
      <path
        d="M1.5 1.5l5 5M6.5 1.5l-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 8 8"
      aria-hidden="true"
      className="text-white"
    >
      <path
        d="M1.5 4l2 2L6.5 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface ColumnProps {
  variant: "before" | "after";
  icon: string;
  title: string;
  subtitle: string;
  items: readonly string[];
}

function Column({ variant, icon, title, subtitle, items }: ColumnProps) {
  const isAfter = variant === "after";
  return (
    <div
      className={cn(
        "h-full rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        isAfter
          ? "border border-coral bg-coral-bg"
          : "border-[0.5px] border-border bg-card",
      )}
    >
      {/* Friendly header — pastel icon circle + Fredoka title (prototype motif) */}
      <div className="mb-6 flex items-center gap-3.5">
        <span
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full text-[28px]",
            isAfter ? "bg-coral/15" : "bg-surface-3",
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
        <div>
          <h3
            className={cn(
              "font-display text-xl font-semibold leading-tight",
              isAfter ? "text-coral-deep" : "text-heading",
            )}
          >
            {title}
          </h3>
          <p className="text-[13px] text-text-secondary">{subtitle}</p>
        </div>
      </div>

      <ul className="space-y-3.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                isAfter ? "bg-coral" : "bg-surface-3",
              )}
            >
              {isAfter ? <CheckIcon /> : <CrossIcon />}
            </span>
            <span
              className={cn(
                "text-sm leading-[1.55]",
                isAfter
                  ? "font-medium text-coral-deeper"
                  : "text-text-secondary",
              )}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WhyCravia() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 pt-20 sm:px-8">
      <Reveal className="mb-12 text-center">
        <div className="mb-3 text-[13px] font-bold uppercase tracking-[0.12em] text-coral">
          Why Cravia
        </div>
        <h2 className="mb-3 font-display text-[clamp(28px,3.5vw,42px)] font-bold leading-tight text-heading">
          Every other app rates the restaurant.
          <br className="hidden sm:block" /> We rate the dish.
        </h2>
        <p className="mx-auto max-w-[560px] text-base leading-relaxed text-text-secondary">
          A restaurant with 4.2 stars could have a legendary biryani and a
          terrible dessert. You&rsquo;d never know. Until now.
        </p>
      </Reveal>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Reveal from="left" className="flex flex-col">
          <Column
            variant="before"
            icon="🏪"
            title="Restaurant ratings"
            subtitle="What every other app shows you"
            items={BEFORE_ITEMS}
          />
        </Reveal>
        <Reveal from="right" delay={0.12} className="flex flex-col">
          <Column
            variant="after"
            icon="🍽️"
            title="Dish ratings"
            subtitle="What Cravia shows you"
            items={AFTER_ITEMS}
          />
        </Reveal>
      </div>
    </section>
  );
}

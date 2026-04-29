import { cn } from "@/lib/utils";
import { Reveal, RevealGrid, RevealItem } from "@/components/ui/AnimateReveal";

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
      width="8"
      height="8"
      viewBox="0 0 8 8"
      aria-hidden="true"
      className="text-destructive"
    >
      <path
        d="M1.5 1.5l5 5M6.5 1.5l-5 5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      aria-hidden="true"
      className="text-white"
    >
      <path
        d="M1.5 4l2 2L6.5 2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface ColumnProps {
  variant: "before" | "after";
  label: string;
  items: readonly string[];
}

function Column({ variant, label, items }: ColumnProps) {
  const isAfter = variant === "after";
  return (
    <div
      className={cn(
        "h-full rounded-2xl p-[22px]",
        isAfter
          ? "border border-coral-mid bg-coral-bg"
          : "border-[0.5px] border-border bg-surface-2",
      )}
    >
      <span
        className={cn(
          "mb-3.5 inline-block rounded-full px-2.5 py-[3px] text-[11px] font-medium uppercase tracking-[0.08em]",
          isAfter
            ? "bg-coral text-white"
            : "border-[0.5px] border-border bg-card text-text-secondary",
        )}
      >
        {label}
      </span>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <span
              className={cn(
                "mt-[1px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full",
                isAfter ? "bg-coral" : "bg-destructive/10",
              )}
            >
              {isAfter ? <CheckIcon /> : <CrossIcon />}
            </span>
            <span
              className={cn(
                "text-[13px] leading-[1.55]",
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
    <section className="mx-auto max-w-[1120px] px-4 pt-10 sm:px-8">
      <Reveal className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-coral">
        Why Cravia
      </Reveal>
      <Reveal>
        <h2 className="mb-1.5 text-2xl font-medium leading-[1.2] text-text-primary">
          Every other app rates the restaurant. We rate the dish.
        </h2>
      </Reveal>
      <Reveal delay={0.05}>
        <p className="mb-6 text-sm leading-[1.6] text-text-secondary">
          A restaurant with 4.2 stars could have a legendary biryani and a
          terrible dessert. You&rsquo;d never know. Until now.
        </p>
      </Reveal>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Reveal from="left" className="flex flex-col">
          <Column variant="before" label="Every platforms" items={BEFORE_ITEMS} />
        </Reveal>
        <Reveal from="right" delay={0.12} className="flex flex-col">
          <Column variant="after" label="Cravia" items={AFTER_ITEMS} />
        </Reveal>
      </div>
    </section>
  );
}

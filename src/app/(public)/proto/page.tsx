import Link from 'next/link'

export const metadata = {
  title: 'Cravia · Landing Prototypes',
  robots: { index: false, follow: false },
}

const PROTOTYPES = [
  {
    slug: 'cinematic',
    label: 'A · Cinematic',
    headline: 'Know what to order.',
    inspiration: 'apple.com/iphone',
    pitch:
      'Imagery first. A single, gorgeous full-bleed dish photo carries the page; the search becomes secondary. The rating system is whispered, not explained.',
    pros: [
      'Maximum visual punch — emotional pull on first scroll',
      'Communicates premium / editorial brand positioning',
      'Lets the food do the talking',
    ],
    cons: [
      'Less obvious that this is a search/utility product',
      'Heavily dependent on hero photo quality',
    ],
    bestFor:
      'A brand-led launch positioning Cravia as the most thoughtful food product in the city.',
    badge: 'Editorial',
    accentClass: 'from-heading via-text-primary to-surface-dark',
  },
  {
    slug: 'social',
    label: 'B · Live & Social',
    headline: 'Find the best [Biryani] in Gurgaon, tonight.',
    inspiration: 'Spotify Wrapped × Twitter',
    pitch:
      'Energy, motion, and community. Animated headline word, live activity ticker, floating polaroid review cards. The page feels alive because the city is alive.',
    pros: [
      'Strongest "this is fresh / busy / real" signal',
      'Shows the social/community moat instantly',
      'Showcases real user content above the fold',
    ],
    cons: [
      'Needs decent ongoing review volume to feel populated',
      'Higher motion budget — accessibility care needed',
    ],
    bestFor:
      'Once you have steady weekly review volume and want to compound network effects.',
    badge: 'Live energy',
    accentClass: 'from-primary via-brand-orange to-brand-gold',
  },
  {
    slug: 'bento',
    label: 'C · Bento Thesis',
    headline: 'Three numbers. One perfect order.',
    inspiration: 'Apple Vision Pro × Notion',
    pitch:
      'Argues the thesis on first sight. A bento grid demonstrates the 3-axis rating system, pulls a real review quote, and proves scale — all without the user scrolling.',
    pros: [
      'Communicates the unique value prop upfront',
      'Most "investor-deck-ready" of the set',
      'Works equally well at low or high data volume',
    ],
    cons: [
      'Less emotional, more analytical — softer crave-factor',
      'Bento is becoming a bit ubiquitous in 2026',
    ],
    bestFor:
      'When the priority is education — converting first-time visitors who don’t yet know why dish-level matters.',
    badge: 'Thesis demo',
    accentClass: 'from-bg-cream via-bg-warm to-surface-2',
  },
  {
    slug: 'story',
    label: 'D · Story',
    headline: 'You’re hungry. → Now you know what to order.',
    inspiration: 'apple.com/iphone-15-pro',
    pitch:
      'Five full-screen scroll moments argue the product, beat by beat. A single dish photo follows you through, slowly coming into focus. No bento, no decoration — just a confident point of view.',
    pros: [
      'Most immersive and "Apple-grade" of the bunch',
      'Makes a strong, defensible argument before you ever search',
      'Memorable; people share scroll-stories',
    ],
    cons: [
      'Demands real attention — bounces low-intent visitors',
      'Heavy on motion/scroll — needs careful reduced-motion fallbacks',
    ],
    bestFor:
      'A flagship launch moment, press tour, or hero campaign where attention is earned.',
    badge: 'Scrollytelling',
    accentClass: 'from-surface-dark via-text-primary to-heading',
  },
  {
    slug: 'edit',
    label: 'E · The Cravia Edit',
    headline: 'Eat with intent.',
    inspiration: 'Apple TV+ · Apple Books · NYT Cooking',
    pitch:
      'The page is a magazine. Masthead, edition number, today’s pick, and a curated grid of issue covers ("The Biryani Index", "Underrated Gems", "Date Night, Solved"). Argues that Cravia is editorial, not algorithmic.',
    pros: [
      'Differentiates sharply from every Zomato-clone landing',
      'Curation = trust; great for premium brand positioning',
      'Easy to refresh weekly, generates re-visit habit',
    ],
    cons: [
      'Requires real editorial work to keep covers updated',
      'Less obviously a "search and discover" tool at first glance',
    ],
    bestFor:
      'When the brand wants to feel hand-curated and human, not algorithmic.',
    badge: 'Magazine',
    accentClass: 'from-bg-cream via-bg-warm to-card',
  },
  {
    slug: 'rings',
    label: 'F · Rings',
    headline: 'Three rings. One perfect bite.',
    inspiration: 'Apple Watch · activity rings',
    pitch:
      'Three concentric SVG rings (Taste · Portion · Value) close on load to a real dish’s scores. The icon and the rating system become inseparable. Demos the product instantly.',
    pros: [
      'Most "ownable" visual identity — the rings become a brand asset',
      'Teaches the 3-axis rating system in a single glance',
      'Translates beautifully to icons, share cards, and merch',
    ],
    cons: [
      'Single-idea hero — relies on follow-on sections to do the lifting',
      'Risk of feeling too literally Apple-derivative',
    ],
    bestFor:
      'If the long-term brand strategy is to make the 3-axis rating itself the icon.',
    badge: 'Iconographic',
    accentClass: 'from-primary via-brand-orange to-brand-gold',
  },
] as const

export default function ProtoIndexPage() {
  return (
    <div className="bg-background px-4 pt-24 pb-24 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-[1280px]">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Landing page prototypes
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-heading sm:text-6xl">
            Six directions.
            <br />
            One product.
          </h1>
          <p className="mt-5 text-base text-text-secondary sm:text-lg">
            Each prototype takes a single, defensible stance on what should
            greet a first-time visitor. Open them side-by-side, ride the
            motion, read the headline aloud — and trust your gut on which voice
            sounds most like Cravia.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:mt-16 lg:grid-cols-3">
          {PROTOTYPES.map((p, i) => (
            <Link
              key={p.slug}
              href={`/proto/${p.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-7 transition-all hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl"
            >
              <div
                className={`pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${p.accentClass}`}
              />

              <div className="flex items-center justify-between">
                <span className="font-display text-5xl font-bold text-heading/[0.08]">
                  0{i + 1}
                </span>
                <span className="rounded-pill border border-border bg-bg-warm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                  {p.badge}
                </span>
              </div>

              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                {p.label}
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-heading">
                {p.headline}
              </h2>
              <p className="mt-1 text-xs italic text-text-muted">
                Inspired by {p.inspiration}
              </p>

              <p className="mt-5 text-sm leading-relaxed text-text-secondary">
                {p.pitch}
              </p>

              <div className="mt-6 space-y-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-success">
                    Strengths
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {p.pros.map((pro) => (
                      <li
                        key={pro}
                        className="flex items-start gap-2 text-xs text-text-secondary"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-success" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                    Trade-offs
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {p.cons.map((con) => (
                      <li
                        key={con}
                        className="flex items-start gap-2 text-xs text-text-secondary"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-border" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-bg-warm p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  Best for
                </p>
                <p className="mt-1 text-xs text-text-secondary">{p.bestFor}</p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">
                  Open prototype
                </span>
                <span className="text-primary transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-dashed border-border bg-bg-cream p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            How to evaluate
          </p>
          <h3 className="mt-2 font-display text-xl font-bold text-heading sm:text-2xl">
            Open each one in a tab. Read the headline out loud. Trust your gut.
          </h3>
          <p className="mt-3 text-sm text-text-secondary sm:text-base">
            We can also remix — e.g. Cinematic hero + Bento sub-rating section,
            Story scrolls collapsed inside the Edit masthead, or Rings used as
            a recurring iconographic motif inside any of the others. Tell me
            which direction (or hybrid) resonates and I&rsquo;ll wire the
            chosen treatment into{' '}
            <code className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">/</code>{' '}
            (the real landing page).
          </p>
        </div>
      </div>
    </div>
  )
}

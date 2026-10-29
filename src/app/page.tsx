import Image from "next/image";
import Link from "next/link";
import { getFeaturedProducts } from "@/lib/data/products";
import { getHomepageSettings } from "@/lib/data/settings";
import ProductCard from "@/components/product/ProductCard";
import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";
import NewsletterCTA from "@/components/home/NewsletterCTA";

export const dynamic = "force-dynamic";

const INGREDIENTS = [
  { name: "Garlic", slug: "garlic-powder", image: "/images/products/garlic-powder.png" },
  { name: "Ginger", slug: "ginger-powder", image: "/images/products/ginger-powder.png" },
  { name: "Onion", slug: "onion-powder", image: "/images/products/onion-powder.png" },
  { name: "Tomato", slug: "tomato-powder", image: "/images/products/tomato-powder.png" },
  { name: "Turmeric", slug: "turmeric-powder", image: "/images/products/turmeric-powder.png" },
  { name: "Beetroot", slug: "beetroot-powder", image: "/images/products/beetroot-powder.png" },
];

export default async function HomePage() {
  const [featured, settings] = await Promise.all([getFeaturedProducts(4), getHomepageSettings()]);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden grain-grid">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-cobalt/25 blur-[140px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-lime/10 blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-20 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-2 lg:pb-28">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-lime">
                {settings.heroBadge}
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="font-display mt-6 text-[clamp(2.6rem,6vw,4.75rem)] font-semibold leading-[1.02] text-balance text-white">
                {settings.heroHeadline}
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/60 sm:text-lg">
                {settings.heroSubheadline}
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <MagneticButton>
                  <Link
                    href="/shop"
                    className="btn-grain inline-flex items-center gap-2 rounded-full bg-lime px-8 py-4 text-sm font-bold uppercase tracking-wide text-midnight glow-lime transition-transform hover:scale-[1.03]"
                  >
                    Explore Collection
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </MagneticButton>
                <Link
                  href="/our-story"
                  className="text-sm font-medium text-white/70 underline-offset-4 hover:text-lime hover:underline"
                >
                  Our Story →
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.32}>
              <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-white/10 pt-8 max-w-md">
                <div>
                  <dt className="text-2xl font-display font-semibold text-white">100%</dt>
                  <dd className="text-xs text-white/50 mt-1">Single Ingredient</dd>
                </div>
                <div>
                  <dt className="text-2xl font-display font-semibold text-white">0</dt>
                  <dd className="text-xs text-white/50 mt-1">Additives</dd>
                </div>
                <div>
                  <dt className="text-2xl font-display font-semibold text-white">6+</dt>
                  <dd className="text-xs text-white/50 mt-1">Natural Powders</dd>
                </div>
              </dl>
            </Reveal>
          </div>

          <Reveal delay={0.1} y={40} className="relative">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md animate-floaty">
              <Image
                src="/images/hero-composition.png"
                alt="Indira Naturals product composition"
                fill
                priority
                className="rounded-[2rem] object-cover glow-cobalt"
              />
            </div>
          </Reveal>
        </div>

        {/* marquee */}
        <div className="relative overflow-hidden border-y border-white/10 bg-white/[0.02] py-3">
          <div className="animate-marquee flex w-max gap-10 whitespace-nowrap text-sm uppercase tracking-[0.2em] text-white/40">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-10">
                {["Pure Garlic", "Pure Ginger", "Pure Onion", "Pure Tomato", "Pure Turmeric", "Pure Beetroot", "No Additives", "Single Ingredient"].map(
                  (t) => (
                    <span key={t} className="flex items-center gap-10">
                      {t} <span className="text-lime">✦</span>
                    </span>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INGREDIENT SELECTOR */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-8">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cobalt-soft">Pick Your Ingredient</p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-white sm:text-4xl">
            One ingredient. Zero compromise.
          </h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {INGREDIENTS.map((ing, i) => (
            <Reveal key={ing.slug} delay={i * 0.05}>
              <Link
                href={`/shop/${ing.slug}`}
                className="group relative flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-lime/40 hover:bg-white/[0.06]"
              >
                <div className="relative h-20 w-20 overflow-hidden rounded-full border border-white/10">
                  <Image src={ing.image} alt={ing.name} fill className="object-cover transition-transform group-hover:scale-110" />
                </div>
                <span className="text-sm font-medium text-white/80 group-hover:text-lime">{ing.name}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cobalt-soft">Bestsellers</p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-white sm:text-4xl">Featured Collection</h2>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-lime hover:underline">
            View all products →
          </Link>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* BRAND STORY STRIP */}
      <section className="relative mt-24 overflow-hidden border-y border-white/10 bg-gradient-to-br from-cobalt/15 via-midnight to-midnight py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 sm:px-8 lg:grid-cols-2">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image src="/images/our-story.jpg" alt="Our process" fill className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-lime">Why Indira Naturals</p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-white sm:text-4xl text-balance">
              Dried slow. Milled fine. Nothing else added.
            </h2>
            <p className="mt-5 max-w-md text-white/60 leading-relaxed">
              Every jar starts with real produce — garlic, ginger, onion, tomato — dried at low
              temperature and stone-milled into a fine, pantry-ready powder. No fillers, no
              shortcuts, just the ingredient itself, concentrated.
            </p>
            <Link
              href="/our-story"
              className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-lime hover:text-lime"
            >
              Read Our Story
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </Reveal>
        </div>
      </section>

      <NewsletterCTA />
    </div>
  );
}

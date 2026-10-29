import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Our Story",
  description: "How Indira Naturals crafts single-ingredient natural powders.",
};

export default function OurStoryPage() {
  return (
    <div>
      <section className="relative overflow-hidden grain-grid py-20">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cobalt-soft">Our Story</p>
            <h1 className="font-display mt-4 text-4xl font-semibold text-white sm:text-5xl text-balance">
              Real ingredients, concentrated — not reinvented.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-white/60 leading-relaxed">
              Indira Naturals began with a simple idea: everyday cooking deserves ingredients that
              are exactly what they say they are. No fillers, no shortcuts — just garlic, ginger,
              onion, tomato and other produce, dried and milled into convenient, long-lasting
              powders.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20 sm:px-8">
        <Reveal>
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl">
            <Image src="/images/our-story.jpg" alt="Indira Naturals process" fill className="object-cover" />
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          {[
            {
              title: "Source",
              text: "We work with fresh, quality produce — garlic, ginger, onion, tomato and more — selected for consistent quality.",
            },
            {
              title: "Dry",
              text: "Each batch is dried at a controlled, low temperature to protect natural aroma, colour and flavour.",
            },
            {
              title: "Mill",
              text: "Dried produce is milled into a fine, consistent powder and packed to stay fresh in your pantry.",
            },
          ].map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <span className="font-display text-3xl text-lime">0{i + 1}</span>
                <h3 className="mt-3 font-display text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-16 text-center">
          <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
            Our commitment to you
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/60 leading-relaxed">
            We list only what&apos;s true about our products — ingredients, usage and pack sizes —
            and we welcome genuine customer reviews on every product page. As our range and
            certifications grow, we&apos;ll update this page to reflect it.
          </p>
          <Link href="/shop" className="mt-6 inline-block rounded-full bg-lime px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-midnight">
            Explore Collection
          </Link>
        </Reveal>
      </section>
    </div>
  );
}

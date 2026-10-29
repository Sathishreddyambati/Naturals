import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { recipes } from "@/lib/data/recipes";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Recipes",
  description: "Simple recipes using Indira Naturals single-ingredient powders.",
};

export default function RecipesPage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="relative h-[40vh] min-h-[320px] w-full">
          <Image src="/images/recipes-hero.jpg" alt="Recipes" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/60 to-midnight/20" />
          <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-14 text-center">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-lime">In the Kitchen</p>
              <h1 className="font-display mt-3 text-4xl font-semibold text-white sm:text-5xl">Recipes</h1>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r, i) => (
            <Reveal key={r.slug} delay={i * 0.06}>
              <Link
                href={`/recipes/${r.slug}`}
                className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all hover:-translate-y-1 hover:border-lime/30"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={r.image} alt={r.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <span>{r.time}</span>
                    <span>·</span>
                    <span>Serves {r.servings}</span>
                  </div>
                  <h3 className="mt-2 font-display text-lg font-semibold text-white group-hover:text-lime">{r.title}</h3>
                  <p className="mt-1.5 text-sm text-white/60 line-clamp-2">{r.description}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRecipeBySlug, recipes } from "@/lib/data/recipes";
import Reveal from "@/components/ui/Reveal";

export function generateStaticParams() {
  return recipes.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);
  if (!recipe) return {};
  return { title: recipe.title, description: recipe.description };
}

export default async function RecipeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);
  if (!recipe) notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8">
      <Reveal>
        <Link href="/recipes" className="text-sm text-white/50 hover:text-lime">
          ← Back to Recipes
        </Link>
        <h1 className="font-display mt-4 text-4xl font-semibold text-white">{recipe.title}</h1>
        <p className="mt-3 text-white/60">{recipe.description}</p>
        <div className="mt-4 flex gap-4 text-sm text-white/50">
          <span>⏱ {recipe.time}</span>
          <span>🍽 Serves {recipe.servings}</span>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="relative mt-8 aspect-video overflow-hidden rounded-3xl">
          <Image src={recipe.image} alt={recipe.title} fill className="object-cover" />
        </div>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <h2 className="font-display text-lg font-semibold text-white">Ingredients</h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-white/70">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-lime">•</span>
                {ing}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            {recipe.usesProducts.map((slug) => (
              <Link
                key={slug}
                href={`/shop/${slug}`}
                className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold text-white/70 hover:border-lime hover:text-lime"
              >
                Shop {slug.replace("-powder", "").replace("-", " ")}
              </Link>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-lg font-semibold text-white">Method</h2>
          <ol className="mt-4 flex flex-col gap-4 text-sm text-white/70">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime/10 text-xs font-bold text-lime">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </div>
  );
}

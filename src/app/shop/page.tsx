import { listProducts, getCategories, type SortOption } from "@/lib/data/products";
import ProductCard from "@/components/product/ProductCard";
import ShopFilters from "@/components/shop/ShopFilters";
import Reveal from "@/components/ui/Reveal";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop All Natural Powders",
  description: "Browse single-ingredient garlic, ginger, onion, tomato and more natural powders.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    listProducts({ search: params.q, category: params.category, sort: params.sort as SortOption }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cobalt-soft">The Collection</p>
        <h1 className="font-display mt-3 text-4xl font-semibold text-white sm:text-5xl">Shop All Powders</h1>
        <p className="mt-4 max-w-xl text-white/60">
          Single-ingredient, naturally dried and milled. Choose your pack size and quantity on
          each product page.
        </p>
      </Reveal>

      <div className="mt-10">
        <ShopFilters categories={categories} />
      </div>

      {products.length === 0 ? (
        <div className="py-24 text-center text-white/50">No products match your search.</div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i * 0.04, 0.3)}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

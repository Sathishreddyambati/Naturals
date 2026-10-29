import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import ProductGallery from "@/components/product/ProductGallery";
import PurchaseBox from "@/components/product/PurchaseBox";
import ReviewForm from "@/components/product/ReviewForm";
import StarRating from "@/components/product/StarRating";
import ProductCard from "@/components/product/ProductCard";
import Reveal from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.tagline || product.description,
    openGraph: { images: product.images },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.isActive) notFound();

  const related = await getRelatedProducts(product.category, product.id, 4);
  const avgRating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <Reveal>
          <ProductGallery images={product.images} name={product.name} />
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cobalt-soft">{product.category}</p>
          <h1 className="font-display mt-3 text-4xl font-semibold text-white">{product.name}</h1>
          <p className="mt-2 text-white/60">{product.tagline}</p>

          {product.reviews.length > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <StarRating rating={avgRating} />
              <span className="text-xs text-white/50">
                {avgRating.toFixed(1)} ({product.reviews.length} review{product.reviews.length > 1 ? "s" : ""})
              </span>
            </div>
          )}

          <div className="mt-8">
            <PurchaseBox
              productId={product.id}
              slug={product.slug}
              name={product.name}
              image={product.images[0] ?? ""}
              variants={product.variants}
            />
          </div>

          <div className="mt-10 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">Description</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{product.description}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">Ingredients</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{product.ingredients}</p>
              <h3 className="mt-4 text-xs font-semibold uppercase tracking-wider text-white/50">Usage</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{product.usage}</p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Reviews */}
      <section className="mt-20 border-t border-white/10 pt-14">
        <h2 className="font-display text-2xl font-semibold text-white">Customer Reviews</h2>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col gap-5">
            {product.reviews.length === 0 ? (
              <p className="text-white/50">No reviews yet. Be the first to share your experience.</p>
            ) : (
              product.reviews.map((r) => (
                <div key={r.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{r.customerName}</span>
                    <StarRating rating={r.rating} />
                  </div>
                  <p className="mt-2 text-sm text-white/60">{r.comment}</p>
                </div>
              ))
            )}
          </div>
          <ReviewForm productId={product.id} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-20 border-t border-white/10 pt-14">
          <h2 className="font-display text-2xl font-semibold text-white">You May Also Like</h2>
          <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

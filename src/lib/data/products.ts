import { db } from "@/db";
import { products, productVariants, reviews } from "@/db/schema";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";

export type SortOption = "featured" | "price_asc" | "price_desc" | "newest" | "name_asc";

export async function listProducts(opts: {
  search?: string;
  category?: string;
  sort?: SortOption;
  activeOnly?: boolean;
}) {
  const { search, category, sort = "featured", activeOnly = true } = opts;

  const conditions = [];
  if (activeOnly) conditions.push(eq(products.isActive, true));
  if (category && category !== "all") conditions.push(eq(products.category, category));
  if (search) {
    conditions.push(
      or(ilike(products.name, `%${search}%`), ilike(products.tagline, `%${search}%`)),
    );
  }

  const rows = await db
    .select()
    .from(products)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(
      sort === "newest"
        ? desc(products.createdAt)
        : sort === "name_asc"
          ? asc(products.name)
          : asc(products.sortOrder),
    );

  const variantRows = await db.select().from(productVariants);

  const withVariants = rows.map((p) => {
    const variants = variantRows
      .filter((v) => v.productId === p.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const activeVariants = variants.filter((v) => v.isActive);
    const minPrice = activeVariants.length
      ? Math.min(...activeVariants.map((v) => v.price))
      : (variants[0]?.price ?? 0);
    const totalStock = variants.reduce((s, v) => s + v.stock, 0);
    return { ...p, variants, minPrice, totalStock };
  });

  if (sort === "price_asc") withVariants.sort((a, b) => a.minPrice - b.minPrice);
  if (sort === "price_desc") withVariants.sort((a, b) => b.minPrice - a.minPrice);

  return withVariants;
}

export async function getProductBySlug(slug: string) {
  const [product] = await db.select().from(products).where(eq(products.slug, slug));
  if (!product) return null;
  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, product.id))
    .orderBy(asc(productVariants.sortOrder));
  const productReviews = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.productId, product.id), eq(reviews.isApproved, true)))
    .orderBy(desc(reviews.createdAt));
  return { ...product, variants, reviews: productReviews };
}

export async function getFeaturedProducts(limit = 4) {
  const rows = await listProducts({ activeOnly: true });
  const featured = rows.filter((p) => p.isFeatured);
  return (featured.length ? featured : rows).slice(0, limit);
}

export async function getRelatedProducts(category: string, excludeId: number, limit = 4) {
  const rows = await listProducts({ category, activeOnly: true });
  return rows.filter((p) => p.id !== excludeId).slice(0, limit);
}

export async function getCategories() {
  const rows = await db.select({ category: products.category }).from(products);
  return Array.from(new Set(rows.map((r) => r.category)));
}

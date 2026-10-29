import { db } from "@/db";
import { products, productVariants } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product] = await db.select().from(products).where(eq(products.id, Number(id)));
  if (!product) notFound();
  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, product.id))
    .orderBy(asc(productVariants.sortOrder));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white">Edit Product</h1>
      <p className="mt-1 text-sm text-white/50">{product.name}</p>
      <div className="mt-8">
        <ProductForm
          initial={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            tagline: product.tagline,
            description: product.description,
            category: product.category,
            images: product.images,
            ingredients: product.ingredients,
            usage: product.usage,
            isActive: product.isActive,
            isFeatured: product.isFeatured,
            sortOrder: product.sortOrder,
            variants: variants.map((v) => ({
              id: v.id,
              packSize: v.packSize,
              sku: v.sku,
              price: (v.price / 100).toString(),
              compareAtPrice: v.compareAtPrice ? (v.compareAtPrice / 100).toString() : "",
              stock: v.stock.toString(),
              isActive: v.isActive,
            })),
          }}
        />
      </div>
    </div>
  );
}

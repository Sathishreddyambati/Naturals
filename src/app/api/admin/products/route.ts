import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, productVariants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-guard";
import { productInputSchema } from "@/lib/validation";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const rows = await db.select().from(products).orderBy(products.sortOrder);
  const variantRows = await db.select().from(productVariants);
  const items = rows.map((p) => ({
    ...p,
    variants: variantRows.filter((v) => v.productId === p.id),
  }));
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { variants, ...productData } = parsed.data;

  const existingSlug = await db.select().from(products).where(eq(products.slug, productData.slug));
  if (existingSlug.length) {
    return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
  }

  const [created] = await db.insert(products).values(productData).returning();
  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    await db.insert(productVariants).values({
      productId: created.id,
      packSize: v.packSize,
      sku: v.sku,
      price: v.price,
      compareAtPrice: v.compareAtPrice ?? null,
      stock: v.stock,
      isActive: v.isActive,
      sortOrder: i,
    });
  }

  return NextResponse.json({ id: created.id });
}

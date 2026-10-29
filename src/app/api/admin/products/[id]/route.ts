import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, productVariants } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-guard";
import { productInputSchema } from "@/lib/validation";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const productId = Number(id);
  const body = await req.json().catch(() => null);
  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { variants, ...productData } = parsed.data;

  const clash = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, productData.slug), ne(products.id, productId)));
  if (clash.length) {
    return NextResponse.json({ error: "Another product already uses this slug" }, { status: 409 });
  }

  await db
    .update(products)
    .set({ ...productData, updatedAt: new Date() })
    .where(eq(products.id, productId));

  const existingVariants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId));

  const keepIds = new Set<number>();
  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    if (v.id && existingVariants.some((ev) => ev.id === v.id)) {
      await db
        .update(productVariants)
        .set({
          packSize: v.packSize,
          sku: v.sku,
          price: v.price,
          compareAtPrice: v.compareAtPrice ?? null,
          stock: v.stock,
          isActive: v.isActive,
          sortOrder: i,
        })
        .where(eq(productVariants.id, v.id));
      keepIds.add(v.id);
    } else {
      const [inserted] = await db
        .insert(productVariants)
        .values({
          productId,
          packSize: v.packSize,
          sku: v.sku,
          price: v.price,
          compareAtPrice: v.compareAtPrice ?? null,
          stock: v.stock,
          isActive: v.isActive,
          sortOrder: i,
        })
        .returning();
      keepIds.add(inserted.id);
    }
  }

  for (const ev of existingVariants) {
    if (!keepIds.has(ev.id)) {
      await db.delete(productVariants).where(eq(productVariants.id, ev.id));
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  await db.delete(products).where(eq(products.id, Number(id)));
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, productVariants } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({ orderId: z.number().int().positive() });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  await db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, parsed.data.orderId)).for("update");
    if (!order) return;
    if (order.paymentStatus === "paid") return; // never cancel a paid order via this route
    if (!order.stockRestored) {
      for (const item of order.items) {
        await tx
          .update(productVariants)
          .set({ stock: sql`${productVariants.stock} + ${item.quantity}` })
          .where(eq(productVariants.id, item.variantId));
      }
    }
    await tx
      .update(orders)
      .set({
        status: "cancelled",
        paymentStatus: "failed",
        stockRestored: true,
        statusHistory: sql`${orders.statusHistory} || ${JSON.stringify([
          { status: "cancelled", at: new Date().toISOString(), note: "Cancelled by customer" },
        ])}::jsonb`,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));
  });

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, productVariants } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-guard";
import { z } from "zod";

const schema = z.object({
  status: z.enum([
    "pending_payment",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "failed",
    "refunded",
  ]),
  trackingCarrier: z.string().max(100).optional().nullable(),
  trackingNumber: z.string().max(100).optional().nullable(),
  note: z.string().max(500).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const orderId = Number(id);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update");
    if (!order) throw new Error("Order not found");

    // Restore stock automatically if order is being cancelled/refunded and stock
    // hasn't already been restored.
    const releasingStatuses = ["cancelled", "refunded"];
    let stockRestored = order.stockRestored;
    if (releasingStatuses.includes(parsed.data.status) && !order.stockRestored) {
      for (const item of order.items) {
        await tx
          .update(productVariants)
          .set({ stock: sql`${productVariants.stock} + ${item.quantity}` })
          .where(eq(productVariants.id, item.variantId));
      }
      stockRestored = true;
    }

    await tx
      .update(orders)
      .set({
        status: parsed.data.status,
        trackingCarrier: parsed.data.trackingCarrier ?? order.trackingCarrier,
        trackingNumber: parsed.data.trackingNumber ?? order.trackingNumber,
        paymentStatus: parsed.data.status === "refunded" ? "refunded" : order.paymentStatus,
        stockRestored,
        statusHistory: sql`${orders.statusHistory} || ${JSON.stringify([
          { status: parsed.data.status, at: new Date().toISOString(), note: parsed.data.note },
        ])}::jsonb`,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));
  });

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, productVariants, webhookEvents } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { verifyWebhookSignature } from "@/lib/razorpay";

// Razorpay webhook — configure at Dashboard > Settings > Webhooks pointing to
// https://yourdomain.com/api/razorpay/webhook with events:
// payment.captured, payment.failed, order.paid
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const valid = verifyWebhookSignature(rawBody, signature);
    if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const payload = JSON.parse(rawBody);
  const eventId: string | undefined = payload.id ?? payload.event + payload.created_at;

  if (eventId) {
    const [existing] = await db.select().from(webhookEvents).where(eq(webhookEvents.eventId, eventId));
    if (existing) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    await db.insert(webhookEvents).values({ eventId, type: payload.event, payload });
  }

  const entity = payload.payload?.payment?.entity ?? payload.payload?.order?.entity;
  const razorpayOrderId: string | undefined = entity?.order_id ?? entity?.id;

  if (!razorpayOrderId) {
    return NextResponse.json({ ok: true });
  }

  const [order] = await db.select().from(orders).where(eq(orders.razorpayOrderId, razorpayOrderId));
  if (!order) return NextResponse.json({ ok: true });

  if (payload.event === "payment.captured" || payload.event === "order.paid") {
    if (order.paymentStatus !== "paid") {
      await db
        .update(orders)
        .set({
          status: "processing",
          paymentStatus: "paid",
          razorpayPaymentId: entity?.id ?? order.razorpayPaymentId,
          statusHistory: sql`${orders.statusHistory} || ${JSON.stringify([
            { status: "paid", at: new Date().toISOString(), note: "Confirmed via webhook" },
          ])}::jsonb`,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));
    }
  }

  if (payload.event === "payment.failed") {
    await db.transaction(async (tx) => {
      const [current] = await tx.select().from(orders).where(eq(orders.id, order.id)).for("update");
      if (!current || current.paymentStatus === "paid") return;
      if (!current.stockRestored) {
        for (const item of current.items) {
          await tx
            .update(productVariants)
            .set({ stock: sql`${productVariants.stock} + ${item.quantity}` })
            .where(eq(productVariants.id, item.variantId));
        }
      }
      await tx
        .update(orders)
        .set({
          status: "failed",
          paymentStatus: "failed",
          stockRestored: true,
          statusHistory: sql`${orders.statusHistory} || ${JSON.stringify([
            { status: "failed", at: new Date().toISOString(), note: "Payment failed (webhook)" },
          ])}::jsonb`,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, current.id));
    });
  }

  return NextResponse.json({ ok: true });
}

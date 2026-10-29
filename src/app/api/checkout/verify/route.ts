import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { verifyPaymentSchema } from "@/lib/validation";
import { verifyPaymentSignature } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = verifyPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid verification payload" }, { status: 400 });
  }
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.razorpayOrderId !== razorpay_order_id) {
    return NextResponse.json({ error: "Order mismatch" }, { status: 400 });
  }

  // Already confirmed (idempotent — avoid duplicate processing)
  if (order.paymentStatus === "paid") {
    return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
  }

  const valid = verifyPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!valid) {
    await db
      .update(orders)
      .set({
        status: "failed",
        paymentStatus: "failed",
        statusHistory: sql`${orders.statusHistory} || ${JSON.stringify([
          { status: "failed", at: new Date().toISOString(), note: "Signature verification failed" },
        ])}::jsonb`,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  await db
    .update(orders)
    .set({
      status: "processing",
      paymentStatus: "paid",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      statusHistory: sql`${orders.statusHistory} || ${JSON.stringify([
        { status: "paid", at: new Date().toISOString() },
      ])}::jsonb`,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
}

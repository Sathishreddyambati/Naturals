import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatPaise } from "@/lib/money";
import Reveal from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Awaiting Payment",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Payment Failed",
  refunded: "Refunded",
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 sm:px-8">
      <Reveal className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime/10 text-3xl">
          {order.paymentStatus === "paid" || order.paymentMethod === "cod" ? "✅" : "⏳"}
        </div>
        <h1 className="font-display mt-6 text-3xl font-semibold text-white sm:text-4xl">
          {order.paymentStatus === "paid" || order.paymentMethod === "cod" ? "Order Confirmed!" : "Order Received"}
        </h1>
        <p className="mt-3 text-white/60">
          Thank you! A confirmation has been recorded for order{" "}
          <span className="font-semibold text-lime">{order.orderNumber}</span>.
        </p>
      </Reveal>

      <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
          <span className="text-sm text-white/50">Status</span>
          <span className="rounded-full bg-cobalt/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cobalt-soft">
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>
        <ul className="mt-4 flex flex-col gap-3 border-b border-white/10 pb-4 text-sm">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between text-white/70">
              <span>
                {item.name} ({item.packSize}) × {item.quantity}
              </span>
              <span className="text-white">{formatPaise(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-1.5 text-sm text-white/70">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPaise(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-lime">
              <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
              <span>-{formatPaise(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{order.shippingFee === 0 ? "Free" : formatPaise(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-2 text-base font-semibold text-white">
            <span>Total</span>
            <span className="text-lime">{formatPaise(order.total)}</span>
          </div>
        </div>
        <div className="mt-4 border-t border-white/10 pt-4 text-sm text-white/60">
          <p className="font-medium text-white">Shipping to</p>
          <p>{order.shippingAddress.fullName}</p>
          <p>
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
          </p>
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href="/track-order" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-lime hover:text-lime">
          Track This Order
        </Link>
        <Link href="/shop" className="rounded-full bg-lime px-6 py-3 text-sm font-bold text-midnight">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

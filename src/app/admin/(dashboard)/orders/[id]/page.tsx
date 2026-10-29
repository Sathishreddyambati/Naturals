import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { formatPaise } from "@/lib/money";
import OrderStatusForm from "@/components/admin/OrderStatusForm";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.id, Number(id)));
  if (!order) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white">Order {order.orderNumber}</h1>
      <p className="mt-1 text-sm text-white/50">
        Placed {new Date(order.createdAt).toLocaleString()} · {order.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay"}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-display text-lg font-semibold text-white">Items</h2>
            <ul className="mt-4 flex flex-col divide-y divide-white/10">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between py-3 text-sm">
                  <span className="text-white/70">
                    {item.name} ({item.packSize}) × {item.quantity}
                  </span>
                  <span className="font-medium text-white">{formatPaise(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-1.5 border-t border-white/10 pt-4 text-sm text-white/70">
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
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-display text-lg font-semibold text-white">Customer & Shipping</h2>
            <p className="mt-3 text-sm text-white/70">{order.email} · {order.phone}</p>
            <p className="mt-2 text-sm text-white/70">
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-display text-lg font-semibold text-white">Status History</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-white/60">
              {order.statusHistory.map((h, i) => (
                <li key={i} className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white">{h.status}{h.note ? ` — ${h.note}` : ""}</span>
                  <span>{new Date(h.at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <OrderStatusForm
          orderId={order.id}
          currentStatus={order.status}
          trackingCarrier={order.trackingCarrier}
          trackingNumber={order.trackingNumber}
        />
      </div>
    </div>
  );
}

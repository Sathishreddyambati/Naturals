"use client";

import { useState } from "react";
import { formatPaise } from "@/lib/money";
import Reveal from "@/components/ui/Reveal";

type TrackedOrder = {
  orderNumber: string;
  status: string;
  trackingCarrier?: string | null;
  trackingNumber?: string | null;
  total: number;
  items: { name: string; packSize: string; quantity: number; price: number }[];
  statusHistory: { status: string; at: string; note?: string }[];
};

const STATUS_STEPS = ["pending_payment", "processing", "shipped", "delivered"];
const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Order Placed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [contact, setContact] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, contact }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Order not found");
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order not found");
    } finally {
      setLoading(false);
    }
  }

  const currentStepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cobalt-soft">Order Status</p>
        <h1 className="font-display mt-3 text-4xl font-semibold text-white">Track Your Order</h1>
        <p className="mt-3 text-white/60">Enter your order number and the email or phone used at checkout.</p>
      </Reveal>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1.5 text-xs font-medium text-white/60">
          Order Number
          <input
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="IN-20260101-ABCDE"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-lime/60"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1.5 text-xs font-medium text-white/60">
          Email or Phone
          <input
            required
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="you@email.com"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-lime/60"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-lime px-6 py-3 text-sm font-bold uppercase tracking-wide text-midnight disabled:opacity-60"
        >
          {loading ? "Searching..." : "Track"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {order && (
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-white">Order {order.orderNumber}</h2>
            <span className="text-sm text-lime">{formatPaise(order.total)}</span>
          </div>

          {currentStepIndex >= 0 && (
            <div className="mt-8 flex items-center justify-between">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex flex-1 flex-col items-center text-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${
                      i <= currentStepIndex ? "border-lime bg-lime text-midnight" : "border-white/20 text-white/40"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <p className={`mt-2 text-[11px] ${i <= currentStepIndex ? "text-white" : "text-white/40"}`}>
                    {STATUS_LABEL[step]}
                  </p>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`absolute hidden`} />
                  )}
                </div>
              ))}
            </div>
          )}
          {["cancelled", "failed", "refunded"].includes(order.status) && (
            <p className="mt-6 text-sm text-red-400">
              This order is currently marked as <strong>{order.status}</strong>.
            </p>
          )}

          {order.trackingNumber && (
            <p className="mt-6 text-sm text-white/70">
              Carrier: <span className="text-white">{order.trackingCarrier}</span> · Tracking #:{" "}
              <span className="text-white">{order.trackingNumber}</span>
            </p>
          )}

          <ul className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-4 text-sm">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between text-white/70">
                <span>
                  {item.name} ({item.packSize}) × {item.quantity}
                </span>
                <span className="text-white">{formatPaise(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

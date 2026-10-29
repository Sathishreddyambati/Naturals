"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { formatPaise } from "@/lib/money";
import Reveal from "@/components/ui/Reveal";

type CouponState = { code: string; discount: number } | null;

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clear = useCartStore((s) => s.clear);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<CouponState>(null);
  const [couponError, setCouponError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const discount = coupon?.discount ?? 0;
  const estimatedTotal = Math.max(subtotal - discount, 0);

  async function applyCoupon() {
    setCouponError("");
    if (!couponInput.trim()) return;
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid coupon");
      setCoupon({ code: data.code, discount: data.discount });
    } catch (err) {
      setCoupon(null);
      setCouponError(err instanceof Error ? err.message : "Invalid coupon");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone,
          address: { fullName, line1, line2, city, state, pincode, country: "India" },
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          couponCode: coupon?.code ?? null,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to place order");

      if (data.paymentMethod === "cod") {
        clear();
        router.push(`/order/${data.orderNumber}?status=placed`);
        return;
      }

      if (!window.Razorpay) {
        throw new Error("Payment SDK failed to load. Please check your connection and try again.");
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Indira Naturals",
        description: `Order ${data.orderNumber}`,
        order_id: data.razorpayOrderId,
        prefill: { name: fullName, email, contact: phone },
        theme: { color: "#1558C9" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderId, ...response }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error ?? "Payment verification failed");
            clear();
            router.push(`/order/${data.orderNumber}?status=paid`);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Payment verification failed");
          }
        },
        modal: {
          ondismiss: async () => {
            await fetch("/api/checkout/cancel", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderId }),
            }).catch(() => {});
          },
        },
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to place order");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-5xl">🧺</p>
        <h1 className="font-display mt-4 text-2xl font-semibold text-white">Your bag is empty</h1>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-lime px-6 py-3 text-sm font-bold text-midnight">
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cobalt-soft">Secure Checkout</p>
        <h1 className="font-display mt-3 text-4xl font-semibold text-white">Checkout</h1>
      </Reveal>

      <form onSubmit={handleSubmit} className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-8">
          <fieldset className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <legend className="px-2 font-display text-sm font-semibold uppercase tracking-wide text-white">
              Contact Details
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Email" type="email" value={email} onChange={setEmail} required />
              <Input label="Phone" type="tel" value={phone} onChange={setPhone} required />
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <legend className="px-2 font-display text-sm font-semibold uppercase tracking-wide text-white">
              Shipping Address
            </legend>
            <div className="grid gap-4">
              <Input label="Full Name" value={fullName} onChange={setFullName} required />
              <Input label="Address Line 1" value={line1} onChange={setLine1} required />
              <Input label="Address Line 2 (optional)" value={line2} onChange={setLine2} />
              <div className="grid gap-4 sm:grid-cols-3">
                <Input label="City" value={city} onChange={setCity} required />
                <Input label="State" value={state} onChange={setState} required />
                <Input label="Pincode" value={pincode} onChange={setPincode} required />
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <legend className="px-2 font-display text-sm font-semibold uppercase tracking-wide text-white">
              Payment Method
            </legend>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label
                className={`flex flex-1 cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                  paymentMethod === "razorpay" ? "border-lime bg-lime/5" : "border-white/15"
                }`}
              >
                <input type="radio" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} className="accent-lime" />
                <div>
                  <p className="text-sm font-semibold text-white">Pay Online</p>
                  <p className="text-xs text-white/50">UPI, Cards, Netbanking via Razorpay</p>
                </div>
              </label>
              <label
                className={`flex flex-1 cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                  paymentMethod === "cod" ? "border-lime bg-lime/5" : "border-white/15"
                }`}
              >
                <input type="radio" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="accent-lime" />
                <div>
                  <p className="text-sm font-semibold text-white">Cash on Delivery</p>
                  <p className="text-xs text-white/50">Pay when your order arrives</p>
                </div>
              </label>
            </div>
          </fieldset>
        </div>

        <div className="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-display text-lg font-semibold text-white">Order Summary</h2>
          <ul className="mt-4 flex flex-col gap-3 border-b border-white/10 pb-4 text-sm">
            {items.map((item) => (
              <li key={item.variantId} className="flex justify-between text-white/70">
                <span>
                  {item.name} ({item.packSize}) × {item.quantity}
                </span>
                <span className="text-white">{formatPaise(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex gap-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Coupon code"
              className="flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-lime/60"
            />
            <button type="button" onClick={applyCoupon} className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase text-white/80 hover:border-lime hover:text-lime">
              Apply
            </button>
          </div>
          {couponError && <p className="mt-2 text-xs text-red-400">{couponError}</p>}
          {coupon && <p className="mt-2 text-xs text-lime">Coupon {coupon.code} applied!</p>}

          <div className="mt-4 flex flex-col gap-2 text-sm text-white/70">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-white">{formatPaise(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-lime">
                <span>Discount</span>
                <span>-{formatPaise(discount)}</span>
              </div>
            )}
            <p className="text-xs text-white/40">Final shipping fee is calculated securely on the server.</p>
          </div>

          <div className="mt-4 flex justify-between border-t border-white/10 pt-4 text-base font-semibold text-white">
            <span>Estimated Total</span>
            <span className="text-lime">{formatPaise(estimatedTotal)}</span>
          </div>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-full bg-lime py-3.5 text-sm font-bold uppercase tracking-wide text-midnight transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {submitting ? "Processing..." : paymentMethod === "cod" ? "Place Order" : "Pay Now"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-medium text-white/60">
      {label}
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-lime/60"
      />
    </label>
  );
}

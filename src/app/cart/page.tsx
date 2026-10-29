"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";
import { formatPaise } from "@/lib/money";
import Reveal from "@/components/ui/Reveal";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cobalt-soft">Your Bag</p>
        <h1 className="font-display mt-3 text-4xl font-semibold text-white">Shopping Cart</h1>
      </Reveal>

      {items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center text-white/50">
          <p className="text-5xl">🧺</p>
          <p>Your cart is empty.</p>
          <Link href="/shop" className="mt-2 rounded-full bg-lime px-6 py-3 text-sm font-bold text-midnight">
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr]">
          <ul className="flex flex-col divide-y divide-white/10">
            {items.map((item) => (
              <li key={item.variantId} className="flex gap-4 py-5">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-midnight-soft">
                  {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-white">{item.name}</h3>
                      <p className="text-xs text-white/50">{item.packSize}</p>
                    </div>
                    <button onClick={() => removeItem(item.variantId)} className="text-white/40 hover:text-red-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-white/15">
                      <button className="px-3 py-1.5 text-white/70 hover:text-lime" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>
                        −
                      </button>
                      <span className="min-w-[1.5rem] text-center text-sm">{item.quantity}</span>
                      <button
                        className="px-3 py-1.5 text-white/70 hover:text-lime disabled:opacity-30"
                        disabled={item.quantity >= item.maxStock}
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="font-semibold text-lime">{formatPaise(item.price * item.quantity)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-display text-lg font-semibold text-white">Order Summary</h2>
            <div className="mt-4 flex justify-between text-sm text-white/70">
              <span>Subtotal</span>
              <span className="text-white">{formatPaise(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-white/40">Shipping & coupons calculated at checkout.</p>
            <Link
              href="/checkout"
              className="mt-6 block w-full rounded-full bg-lime py-3.5 text-center text-sm font-bold uppercase tracking-wide text-midnight hover:scale-[1.02] transition-transform"
            >
              Proceed to Checkout
            </Link>
            <Link href="/shop" className="mt-3 block text-center text-sm text-white/60 hover:text-lime">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

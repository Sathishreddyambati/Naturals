"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/lib/store/cart";
import { formatPaise } from "@/lib/money";

export default function CartDrawer() {
  const isOpen = useCartStore((s) => s.isDrawerOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-midnight-soft"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <h2 className="font-display text-lg font-semibold">Your Bag ({items.length})</h2>
              <button onClick={closeDrawer} aria-label="Close cart" className="rounded-full p-2 hover:bg-white/10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-white/60">
                  <p className="text-4xl">🧺</p>
                  <p>Your bag is empty.</p>
                  <Link
                    href="/shop"
                    onClick={closeDrawer}
                    className="mt-2 rounded-full bg-lime px-5 py-2 text-sm font-semibold text-midnight"
                  >
                    Explore Collection
                  </Link>
                </div>
              ) : (
                <ul className="flex flex-col gap-5">
                  {items.map((item) => (
                    <li key={item.variantId} className="flex gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white/5">
                        {item.image && (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-white">{item.name}</p>
                            <p className="text-xs text-white/50">{item.packSize}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="text-white/40 hover:text-lime"
                            aria-label="Remove item"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M6 6l12 12M18 6L6 18" />
                            </svg>
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-white/15">
                            <button
                              className="px-2.5 py-1 text-white/70 hover:text-lime"
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            >
                              −
                            </button>
                            <span className="min-w-[1.5rem] text-center text-sm">{item.quantity}</span>
                            <button
                              className="px-2.5 py-1 text-white/70 hover:text-lime disabled:opacity-30"
                              disabled={item.quantity >= item.maxStock}
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <span className="text-sm font-semibold text-lime">
                            {formatPaise(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-white/10 px-6 py-5">
                <div className="mb-4 flex items-center justify-between text-sm text-white/70">
                  <span>Subtotal</span>
                  <span className="text-base font-semibold text-white">{formatPaise(subtotal)}</span>
                </div>
                <p className="mb-4 text-xs text-white/40">Shipping & taxes calculated at checkout.</p>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="block w-full rounded-full bg-lime py-3.5 text-center text-sm font-bold uppercase tracking-wide text-midnight transition-transform hover:scale-[1.02]"
                >
                  Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="mt-2 block w-full rounded-full border border-white/15 py-3 text-center text-sm font-medium text-white/80 hover:border-lime/50 hover:text-lime"
                >
                  View Bag
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

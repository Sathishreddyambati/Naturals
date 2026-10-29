"use client";

import Link from "next/link";
import Image from "next/image";
import { useWishlistStore } from "@/lib/store/wishlist";
import { formatPaise } from "@/lib/money";
import Reveal from "@/components/ui/Reveal";

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cobalt-soft">Saved for Later</p>
        <h1 className="font-display mt-3 text-4xl font-semibold text-white">Your Wishlist</h1>
      </Reveal>

      {items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center text-white/50">
          <p className="text-5xl">🤍</p>
          <p>Nothing saved yet. Browse the collection and tap the heart icon to save items.</p>
          <Link href="/shop" className="mt-2 rounded-full bg-lime px-6 py-3 text-sm font-bold text-midnight">
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.productId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-midnight-soft">
                {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium text-white">{item.name}</h3>
                  <p className="text-sm text-lime">from {formatPaise(item.price)}</p>
                </div>
                <button onClick={() => remove(item.productId)} className="text-white/40 hover:text-red-400" aria-label="Remove">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  </svg>
                </button>
              </div>
              <Link
                href={`/shop/${item.slug}`}
                className="mt-3 block rounded-full border border-white/15 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-white/80 hover:border-lime hover:text-lime"
              >
                View Product
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

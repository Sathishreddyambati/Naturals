"use client";

import { useWishlistStore } from "@/lib/store/wishlist";

export default function WishlistButton({
  product,
}: {
  product: { productId: number; slug: string; name: string; image: string; price: number };
}) {
  const has = useWishlistStore((s) => s.has(product.productId));
  const toggle = useWishlistStore((s) => s.toggle);

  return (
    <button
      aria-label="Toggle wishlist"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(product);
      }}
      className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-colors ${
        has ? "bg-lime text-midnight" : "bg-black/40 text-white hover:bg-black/60"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={has ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
        <path d="M12 20.5s-7.5-4.6-9.8-9.1C.7 7.8 2.3 4.5 5.8 4c2.1-.3 4.1.8 6.2 3 2.1-2.2 4.1-3.3 6.2-3 3.5.5 5.1 3.8 3.6 7.4-2.3 4.5-9.8 9.1-9.8 9.1z" />
      </svg>
    </button>
  );
}

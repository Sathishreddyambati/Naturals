"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPaise } from "@/lib/money";
import { useCartStore } from "@/lib/store/cart";

type Variant = {
  id: number;
  packSize: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  isActive: boolean;
};

export default function PurchaseBox({
  productId,
  slug,
  name,
  image,
  variants,
}: {
  productId: number;
  slug: string;
  name: string;
  image: string;
  variants: Variant[];
}) {
  const activeVariants = variants.filter((v) => v.isActive);
  const [variantId, setVariantId] = useState<number | null>(activeVariants[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  const variant = useMemo(
    () => activeVariants.find((v) => v.id === variantId) ?? null,
    [activeVariants, variantId],
  );

  if (!variant) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/60">
        This product is currently unavailable.
      </div>
    );
  }

  const outOfStock = variant.stock <= 0;

  function handleAdd() {
    if (!variant || outOfStock) return;
    addItem({
      variantId: variant.id,
      productId,
      slug,
      name,
      image,
      packSize: variant.packSize,
      price: variant.price,
      quantity,
      maxStock: variant.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleBuyNow() {
    handleAdd();
    router.push("/checkout");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Pack Size</p>
        <div className="flex flex-wrap gap-2">
          {activeVariants.map((v) => (
            <button
              key={v.id}
              onClick={() => {
                setVariantId(v.id);
                setQuantity(1);
              }}
              className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                v.id === variantId
                  ? "border-lime bg-lime/10 text-lime"
                  : "border-white/15 text-white/70 hover:border-white/40"
              } ${v.stock <= 0 ? "opacity-40" : ""}`}
            >
              {v.packSize}
              {v.stock <= 0 && <span className="ml-1 text-[10px]">(Out)</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="font-display text-3xl font-semibold text-white">{formatPaise(variant.price)}</span>
        {variant.compareAtPrice && (
          <span className="text-base text-white/40 line-through">{formatPaise(variant.compareAtPrice)}</span>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span
          className={`h-2 w-2 rounded-full ${
            outOfStock ? "bg-red-500" : variant.stock <= 15 ? "bg-lime" : "bg-emerald-400"
          }`}
        />
        <span className="text-white/60">
          {outOfStock ? "Out of stock" : variant.stock <= 15 ? `Only ${variant.stock} left in stock` : "In stock"}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-full border border-white/15">
          <button
            className="px-4 py-2.5 text-white/70 hover:text-lime"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="min-w-[2rem] text-center text-sm font-semibold">{quantity}</span>
          <button
            className="px-4 py-2.5 text-white/70 hover:text-lime disabled:opacity-30"
            disabled={quantity >= variant.stock}
            onClick={() => setQuantity((q) => Math.min(variant.stock, q + 1))}
          >
            +
          </button>
        </div>
        <span className="text-xs text-white/40">Max {variant.stock} per order</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="flex-1 rounded-full border border-lime/60 py-4 text-sm font-bold uppercase tracking-wide text-lime transition-colors hover:bg-lime/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {added ? "Added to Bag ✓" : "Add to Bag"}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="flex-1 rounded-full bg-lime py-4 text-sm font-bold uppercase tracking-wide text-midnight transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}

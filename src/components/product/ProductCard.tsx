import Link from "next/link";
import Image from "next/image";
import { formatPaise } from "@/lib/money";
import WishlistButton from "./WishlistButton";

export type ProductCardData = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  images: string[];
  minPrice: number;
  totalStock: number;
  variants?: { compareAtPrice?: number | null }[];
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images?.[0] ?? "/images/hero-composition.png";
  const compareAt = product.variants?.find((v) => v.compareAtPrice)?.compareAtPrice;
  const outOfStock = product.totalStock <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-lime/30 hover:shadow-[0_20px_60px_-20px_rgba(212,255,36,0.25)]">
      <Link href={`/shop/${product.slug}`} className="relative block aspect-square overflow-hidden bg-midnight-soft">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {outOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/80">
            Out of Stock
          </span>
        )}
        {!outOfStock && product.totalStock <= 15 && (
          <span className="absolute left-3 top-3 rounded-full bg-lime/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-midnight">
            Low Stock
          </span>
        )}
        <div className="absolute right-3 top-3">
          <WishlistButton product={{ productId: product.id, slug: product.slug, name: product.name, image, price: product.minPrice }} />
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-display text-base font-semibold text-white group-hover:text-lime transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-white/50 line-clamp-1">{product.tagline}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-semibold text-lime">from {formatPaise(product.minPrice)}</span>
          {compareAt && <span className="text-xs text-white/40 line-through">{formatPaise(compareAt)}</span>}
        </div>
        <Link
          href={`/shop/${product.slug}`}
          className="mt-3 inline-flex items-center justify-center rounded-full border border-white/15 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 transition-colors hover:border-lime hover:text-lime"
        >
          View Product
        </Link>
      </div>
    </div>
  );
}

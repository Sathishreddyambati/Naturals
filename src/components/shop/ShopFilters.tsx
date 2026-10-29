"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A–Z" },
];

export default function ShopFilters({ categories }: { categories: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  function update(params: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  }

  const activeCategory = searchParams.get("category") ?? "all";
  const activeSort = searchParams.get("sort") ?? "featured";

  return (
    <div className="flex flex-col gap-5 border-b border-white/10 pb-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: query || null });
        }}
        className="flex max-w-md"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
          placeholder="Search products..."
          className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-lime/60"
        />
      </form>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {["all", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => update({ category: cat === "all" ? null : cat })}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                activeCategory === cat
                  ? "border-lime bg-lime text-midnight"
                  : "border-white/15 text-white/60 hover:border-white/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <select
          value={activeSort}
          onChange={(e) => update({ sort: e.target.value })}
          className="rounded-full border border-white/15 bg-midnight-soft px-4 py-2 text-xs font-medium text-white outline-none focus:border-lime/60"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-midnight">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

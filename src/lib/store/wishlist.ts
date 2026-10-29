"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WishlistItem = {
  productId: number;
  slug: string;
  name: string;
  image: string;
  price: number;
};

type WishlistState = {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  has: (productId: number) => boolean;
  remove: (productId: number) => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.productId === item.productId);
          return {
            items: exists
              ? state.items.filter((i) => i.productId !== item.productId)
              : [...state.items, item],
          };
        }),
      has: (productId) => get().items.some((i) => i.productId === productId),
      remove: (productId) => set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
    }),
    { name: "indira-wishlist" },
  ),
);

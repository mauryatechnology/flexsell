import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";

interface WishlistState {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleWishlist: (product) => set((state) => {
        const exists = state.items.some(item => item._id === product._id);
        if (exists) {
          return { items: state.items.filter(item => item._id !== product._id) };
        } else {
          return { items: [...state.items, product] };
        }
      }),
      isInWishlist: (productId) => {
        return get().items.some(item => item._id === productId);
      }
    }),
    {
      name: "flexsell-wishlist-storage",
    }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";

export interface CartItem {
  id: string; // Dynamic combination of productID + selected variants
  product: Product;
  selectedVariants: Record<string, string>;
  quantity: number;
  pricePerUnit: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, selectedVariants: Record<string, string>, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, qty: number) => void;
  clearCart: () => void;
  getCartSubtotal: () => number;
  getCartItemsCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, selectedVariants, quantity = 1) => {
        const variantKey = Object.entries(selectedVariants)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([k, v]) => `${k}:${v}`)
          .join("|");
        
        const itemId = `${product._id}-${variantKey}`;
        
        // Calculate price per unit from matching color variant
        const selectedColor = selectedVariants["Color"] || selectedVariants["color"] || "Default";
        const matchedVariant = product.colorVariants?.find(
          cv => cv.color.toLowerCase() === selectedColor.toLowerCase()
        ) || product.colorVariants?.[0];
        
        const calculatedPrice = matchedVariant ? matchedVariant.price : 0;
        
        set((state) => {
          const existingIndex = state.items.findIndex(item => item.id === itemId);
          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex].quantity += quantity;
            return { items: updatedItems };
          } else {
            return {
              items: [
                ...state.items,
                {
                  id: itemId,
                  product,
                  selectedVariants,
                  quantity,
                  pricePerUnit: calculatedPrice,
                }
              ]
            };
          }
        });
      },
      
      removeItem: (itemId) => set((state) => ({
        items: state.items.filter(item => item.id !== itemId)
      })),
      
      updateQuantity: (itemId, qty) => set((state) => ({
        items: state.items.map(item => 
          item.id === itemId ? { ...item, quantity: Math.max(1, qty) } : item
        )
      })),
      
      clearCart: () => set({ items: [] }),
      
      getCartSubtotal: () => {
        return get().items.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0);
      },
      
      getCartItemsCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      }
    }),
    {
      name: "flexsell-cart-storage",
    }
  )
);

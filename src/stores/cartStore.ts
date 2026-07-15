import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";
import { useProductStore } from "./productStore";
import { useToastStore } from "./toastStore";

export interface CartItem {
  id: string; // Dynamic combination of productID + selected variants
  product: Product;
  selectedVariants: Record<string, string>;
  quantity: number;
  pricePerUnit: number;
}

interface TaxBreakdown {
  hsnCode: string;
  gstRate: number;
  baseAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
}

interface CartState {
  items: CartItem[];
  buyerState: string; // Destination state (defaults to Madhya Pradesh)
  setBuyerState: (state: string) => void;
  addItem: (product: Product, selectedVariants: Record<string, string>, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, qty: number) => void;
  clearCart: () => void;
  getCartSubtotal: () => number; // Sum of pricePerUnit * quantity (inclusive or exclusive based on config)
  getCartItemsCount: () => number;
  getTaxDetails: () => {
    isIntrastate: boolean;
    baseSubtotal: number;
    totalCgst: number;
    totalSgst: number;
    totalIgst: number;
    grandTotal: number;
    hsnBreakdown: Record<string, TaxBreakdown>;
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      buyerState: "Madhya Pradesh",

      setBuyerState: (state) => set({ buyerState: state }),

      addItem: (product, selectedVariants, quantity = 1) => {
        const variantKey = Object.entries(selectedVariants)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([k, v]) => `${k}:${v}`)
          .join("|");

        const itemId = `${product._id}-${variantKey}`;

        // Find the matched color variant from the product store for accurate stock & pricing
        const storeProducts = useProductStore.getState().products;
        const liveProduct = storeProducts.find(p => p._id === product._id) || product;

        const selectedColor = selectedVariants["Color"] || selectedVariants["color"] || "Default";
        const selectedSize = selectedVariants["Pack Sizing"] || selectedVariants["Size"] || selectedVariants["size"];
        const selectedWeight = selectedVariants["Weight Unit"] || selectedVariants["Weight"] || selectedVariants["weight"];

        const matchedColorVariant = liveProduct.colorVariants?.find(
          cv => cv.color.toLowerCase() === selectedColor.toLowerCase()
        ) || liveProduct.colorVariants?.[0];

        let matchedVariant = null;
        if (matchedColorVariant && matchedColorVariant.subVariants) {
          matchedVariant = matchedColorVariant.subVariants.find(sv => 
            (!selectedSize || sv.size.toLowerCase() === selectedSize.toLowerCase()) && 
            (!selectedWeight || sv.weight.toLowerCase() === selectedWeight.toLowerCase())
          ) || matchedColorVariant.subVariants[0];
        }

        if (!matchedVariant) {
          useToastStore.getState().addToast("Failed to match product variant.", "error");
          return;
        }

        const calculatedPrice = matchedVariant.price;
        const availableStock = matchedVariant.stock;
        const moq = liveProduct.moq ?? 1;

        // Check if item exists in cart
        const existingItem = get().items.find(item => item.id === itemId);
        const currentQty = existingItem ? existingItem.quantity : 0;
        let targetQty = currentQty + quantity;

        // Verify MOQ constraint
        if (targetQty < moq) {
          useToastStore.getState().addToast(`MOQ required. Standard B2B limit for this product is at least ${moq} units.`, "warning");
          targetQty = moq;
        }

        // Verify Stock limit
        if (targetQty > availableStock) {
          useToastStore.getState().addToast(`Insufficient stock. Capped order at maximum available (${availableStock} units).`, "warning");
          targetQty = availableStock;
        }

        if (targetQty <= 0) {
          useToastStore.getState().addToast("Cannot add empty quantity.", "error");
          return;
        }

        set((state) => {
          const existingIndex = state.items.findIndex(item => item.id === itemId);
          const updatedItems = [...state.items];

          if (existingIndex > -1) {
            updatedItems[existingIndex].quantity = targetQty;
            useToastStore.getState().addToast(`Updated quantity in cart to ${targetQty}.`, "success");
            return { items: updatedItems };
          } else {
            useToastStore.getState().addToast(`Successfully added ${targetQty} items to B2B cart!`, "success");
            return {
              items: [
                ...state.items,
                {
                  id: itemId,
                  product: liveProduct,
                  selectedVariants,
                  quantity: targetQty,
                  pricePerUnit: calculatedPrice,
                }
              ]
            };
          }
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== itemId)
        }));
        useToastStore.getState().addToast("Item removed from wholesale cart.", "info");
      },

      updateQuantity: (itemId, qty) => {
        const item = get().items.find(i => i.id === itemId);
        if (!item) return;

        // Find live stock and MOQ boundaries
        const storeProducts = useProductStore.getState().products;
        const liveProduct = storeProducts.find(p => p._id === item.product._id) || item.product;
        const selectedColor = item.selectedVariants["Color"] || item.selectedVariants["color"] || "Default";
        const selectedSize = item.selectedVariants["Pack Sizing"] || item.selectedVariants["Size"] || item.selectedVariants["size"];
        const selectedWeight = item.selectedVariants["Weight Unit"] || item.selectedVariants["Weight"] || item.selectedVariants["weight"];

        const matchedColorVariant = liveProduct.colorVariants?.find(
          cv => cv.color.toLowerCase() === selectedColor.toLowerCase()
        ) || liveProduct.colorVariants?.[0];

        let matchedVariant = null;
        if (matchedColorVariant && matchedColorVariant.subVariants) {
          matchedVariant = matchedColorVariant.subVariants.find(sv => 
            (!selectedSize || sv.size.toLowerCase() === selectedSize.toLowerCase()) && 
            (!selectedWeight || sv.weight.toLowerCase() === selectedWeight.toLowerCase())
          ) || matchedColorVariant.subVariants[0];
        }

        if (!matchedVariant) return;

        const availableStock = matchedVariant.stock;
        const moq = liveProduct.moq ?? 1;

        let targetQty = qty;

        // Enforce MOQ
        if (targetQty < moq) {
          useToastStore.getState().addToast(`Wholesale MOQ required: minimum ${moq} units.`, "warning");
          targetQty = moq;
        }

        // Enforce stock
        if (targetQty > availableStock) {
          useToastStore.getState().addToast(`Limit exceeded. Only ${availableStock} units remaining in stock.`, "warning");
          targetQty = availableStock;
        }

        set((state) => ({
          items: state.items.map(i =>
            i.id === itemId ? { ...i, quantity: targetQty } : i
          )
        }));
      },

      clearCart: () => set({ items: [] }),

      getCartSubtotal: () => {
        return get().items.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0);
      },

      getCartItemsCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTaxDetails: () => {
        const isIntrastate = get().buyerState === "Madhya Pradesh";
        const hsnBreakdown: Record<string, TaxBreakdown> = {};
        
        let baseSubtotal = 0;
        let totalCgst = 0;
        let totalSgst = 0;
        let totalIgst = 0;
        let grandTotal = 0;

        get().items.forEach((item) => {
          const p = item.product;
          const rate = p.gstRate ?? 18;
          const hsn = p.hsnCode ?? "3924";
          const isIncl = p.priceIncludesGst ?? true;
          
          const unitPrice = item.pricePerUnit;
          const qty = item.quantity;
          const totalAmount = unitPrice * qty;

          let basePrice = unitPrice;
          let itemTax = 0;
          let finalItemTotal = totalAmount;

          if (isIncl) {
            // Price includes GST
            basePrice = unitPrice / (1 + rate / 100);
            const itemBase = basePrice * qty;
            itemTax = totalAmount - itemBase;
            baseSubtotal += itemBase;
            grandTotal += totalAmount;
          } else {
            // Price excludes GST
            const itemBase = unitPrice * qty;
            itemTax = itemBase * (rate / 100);
            finalItemTotal = itemBase + itemTax;
            baseSubtotal += itemBase;
            grandTotal += finalItemTotal;
          }

          let cgst = 0;
          let sgst = 0;
          let igst = 0;

          if (isIntrastate) {
            cgst = itemTax / 2;
            sgst = itemTax / 2;
            totalCgst += cgst;
            totalSgst += sgst;
          } else {
            igst = itemTax;
            totalIgst += igst;
          }

          if (hsnBreakdown[hsn]) {
            hsnBreakdown[hsn].baseAmount += (basePrice * qty);
            hsnBreakdown[hsn].cgst += cgst;
            hsnBreakdown[hsn].sgst += sgst;
            hsnBreakdown[hsn].igst += igst;
            hsnBreakdown[hsn].totalTax += itemTax;
          } else {
            hsnBreakdown[hsn] = {
              hsnCode: hsn,
              gstRate: rate,
              baseAmount: (basePrice * qty),
              cgst,
              sgst,
              igst,
              totalTax: itemTax,
            };
          }
        });

        return {
          isIntrastate,
          baseSubtotal,
          totalCgst,
          totalSgst,
          totalIgst,
          grandTotal,
          hsnBreakdown,
        };
      }
    }),
    {
      name: "flexsell-cart-storage",
    }
  )
);

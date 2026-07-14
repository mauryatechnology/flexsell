import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";

interface ProductStoreState {
  products: Product[];
  fsiStartHex: string;
  initializeProducts: (initial: Product[]) => void;
  addProduct: (product: Omit<Product, "_id" | "createdAt">) => void;
  updateProduct: (id: string, updatedFields: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setFsiStartHex: (hex: string) => void;
  getNextFsiNo: () => string;
}

export const useProductStore = create<ProductStoreState>()(
  persist(
    (set, get) => ({
      products: [],
      fsiStartHex: "A000",
      
      initializeProducts: (initial) => {
        if (get().products.length === 0) {
          set({ products: initial });
        }
      },
      
      addProduct: (productData) => set((state) => {
        const newProduct: Product = {
          ...productData,
          _id: `prod_${(state.products.length + 1).toString().padStart(3, "0")}`,
          isActive: true,
          createdAt: new Date().toISOString()
        };
        return { products: [newProduct, ...state.products] };
      }),
      
      updateProduct: (id, updatedFields) => set((state) => ({
        products: state.products.map(p => 
          p._id === id ? { ...p, ...updatedFields } : p
        )
      })),
      
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p._id !== id)
      })),

      setFsiStartHex: (hex) => set({ 
        fsiStartHex: hex.trim().replace(/[^0-9A-Fa-f]/g, "").toUpperCase() || "A000" 
      }),

      getNextFsiNo: () => {
        const startHex = get().fsiStartHex || "A000";
        const startVal = parseInt(startHex, 16) || 40960;
        
        const currentProducts = get().products;
        if (currentProducts.length === 0) {
          return `FSI-${startHex.toUpperCase()}`;
        }
        
        let maxVal = startVal - 1;
        currentProducts.forEach(p => {
          if (p.fsiNo) {
            const match = p.fsiNo.match(/FSI-([0-9A-Fa-f]+)/);
            if (match) {
              const val = parseInt(match[1], 16);
              if (!isNaN(val) && val > maxVal) {
                maxVal = val;
              }
            }
          }
        });
        
        const nextVal = maxVal + 1;
        return `FSI-${nextVal.toString(16).toUpperCase()}`;
      }
    }),
    {
      name: "flexsell-products-storage",
    }
  )
);

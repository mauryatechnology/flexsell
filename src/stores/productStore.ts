import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";

interface ProductStoreState {
  products: Product[];
  initializeProducts: (initial: Product[]) => void;
  addProduct: (product: Omit<Product, "_id" | "createdAt">) => void;
  updateProduct: (id: string, updatedFields: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

export const useProductStore = create<ProductStoreState>()(
  persist(
    (set, get) => ({
      products: [],
      
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
      }))
    }),
    {
      name: "flexsell-products-storage",
    }
  )
);

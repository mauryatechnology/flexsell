import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Category } from "@/types";

interface CategoryStoreState {
  categories: Category[];
  initializeCategories: (initial: Category[]) => void;
  addCategory: (category: Omit<Category, "_id" | "createdAt">) => void;
  updateCategory: (id: string, updatedFields: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
}

export const useCategoryStore = create<CategoryStoreState>()(
  persist(
    (set, get) => ({
      categories: [],
      
      initializeCategories: (initial) => {
        if (get().categories.length === 0) {
          set({ categories: initial });
        }
      },
      
      addCategory: (categoryData) => set((state) => {
        const newCategory: Category = {
          ...categoryData,
          _id: `cat_${(state.categories.length + 1).toString().padStart(3, "0")}`,
          isActive: true
        };
        return { categories: [...state.categories, newCategory] };
      }),
      
      updateCategory: (id, updatedFields) => set((state) => ({
        categories: state.categories.map(c => 
          c._id === id ? { ...c, ...updatedFields } : c
        )
      })),
      
      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter(c => c._id !== id)
      }))
    }),
    {
      name: "flexsell-categories-storage",
    }
  )
);

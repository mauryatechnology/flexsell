import { Category } from "@/types";
import { categories as staticCategories } from "@/data/categories";
import { apiClient, isMockMode, delay } from "@/lib/apiClient";

const MOCK_STORAGE_KEY = "flexsell-categories-storage";

function getMockCategories(): Category[] {
  if (typeof window === "undefined") return staticCategories;
  const stored = localStorage.getItem(MOCK_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.state?.categories) {
        return parsed.state.categories;
      }
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error("Error parsing mock categories", e);
    }
  }
  saveMockCategories(staticCategories);
  return staticCategories;
}

function saveMockCategories(categories: Category[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    MOCK_STORAGE_KEY,
    JSON.stringify({
      state: { categories },
      version: 0,
    })
  );
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    if (isMockMode) {
      await delay();
      return getMockCategories();
    }
    return apiClient.get<Category[]>("/categories");
  },

  async createCategory(
    categoryData: Omit<Category, "_id" | "createdAt">
  ): Promise<Category> {
    if (isMockMode) {
      await delay();
      const categories = getMockCategories();
      const newCategory: Category = {
        ...categoryData,
        _id: `cat_${(categories.length + 1).toString().padStart(3, "0")}`,
        isActive: true,
      };
      saveMockCategories([...categories, newCategory]);
      return newCategory;
    }
    return apiClient.post<Category>("/categories", categoryData);
  },

  async updateCategory(
    id: string,
    updatedFields: Partial<Category>
  ): Promise<Category> {
    if (isMockMode) {
      await delay();
      const categories = getMockCategories();
      let updatedCategory: Category | null = null;

      const newCategories = categories.map((c) => {
        if (c._id === id) {
          updatedCategory = { ...c, ...updatedFields };
          return updatedCategory;
        }
        return c;
      });

      if (!updatedCategory) throw new Error("Category not found");
      saveMockCategories(newCategories);
      return updatedCategory;
    }
    return apiClient.put<Category>(`/categories/${id}`, updatedFields);
  },

  async deleteCategory(id: string): Promise<void> {
    if (isMockMode) {
      await delay();
      const categories = getMockCategories();
      const newCategories = categories.filter((c) => c._id !== id);
      saveMockCategories(newCategories);
      return;
    }
    return apiClient.delete<void>(`/categories/${id}`);
  },
};

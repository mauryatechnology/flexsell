import * as React from "react";
import { categories } from "@/data/categories";
import { AdminCategoriesManager } from "@/components/admin/AdminCategoriesManager";

export default function AdminCategoriesPage() {
  return <AdminCategoriesManager initialCategories={categories} />;
}

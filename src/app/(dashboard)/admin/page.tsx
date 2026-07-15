import * as React from "react";
import { productService } from "@/services/productService";
import { AdminOverview } from "@/components/admin/AdminOverview";

export default async function AdminDashboardPage() {
  const products = await productService.getProducts();
  return <AdminOverview initialProducts={products} />;
}

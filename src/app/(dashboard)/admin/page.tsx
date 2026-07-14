import * as React from "react";
import { products } from "@/data/products";
import { AdminOverview } from "@/components/admin/AdminOverview";

export default function AdminDashboardPage() {
  return <AdminOverview initialProducts={products} />;
}

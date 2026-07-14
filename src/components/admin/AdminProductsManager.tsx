"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Plus, Edit, Trash2, QrCode } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useProductStore } from "@/stores/productStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { Product, Category } from "@/types";
import { BarcodeScanner } from "./BarcodeScanner";

interface AdminProductsManagerProps {
  initialProducts: Product[];
  initialCategories: Category[];
}

export function AdminProductsManager({ initialProducts, initialCategories }: AdminProductsManagerProps) {
  const router = useRouter();
  const { products, initializeProducts, deleteProduct, fsiStartHex, setFsiStartHex } = useProductStore();
  const { categories, initializeCategories } = useCategoryStore();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [isScannerOpen, setIsScannerOpen] = React.useState(false);

  // Sync server data into client stores
  React.useEffect(() => {
    initializeProducts(initialProducts);
    initializeCategories(initialCategories);
  }, [initialProducts, initialCategories, initializeProducts, initializeCategories]);

  const activeProducts = products.length > 0 ? products : initialProducts;
  const activeCategories = categories.length > 0 ? categories : initialCategories;

  // Filter products by search term
  const filteredProducts = React.useMemo(() => {
    if (!searchTerm) return activeProducts;
    const term = searchTerm.toLowerCase();
    return activeProducts.filter(p => 
      p.title.toLowerCase().includes(term) || 
      p.sku.toLowerCase().includes(term)
    );
  }, [activeProducts, searchTerm]);

  // Find category name by ID
  const getCategoryName = (catId: string) => {
    const cat = activeCategories.find(c => c._id === catId);
    return cat ? cat.name : catId;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your B2B catalog, pricing, and inventory.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsScannerOpen(true)}>
            <QrCode className="h-4 w-4 mr-2" /> Scan Barcode / Audit
          </Button>
          <Link href="/admin/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* FSI Barcode Settings */}
      <Card className="border">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-foreground">FSI Hex Sequencer Settings</h4>
            <p className="text-xs text-muted-foreground">Configure the starting hexadecimal sequence seed for new product uploads.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Hex Start:</span>
            <Input
              className="w-28 text-foreground font-mono text-center uppercase"
              value={fsiStartHex}
              onChange={(e) => setFsiStartHex(e.target.value)}
              maxLength={6}
              placeholder="A000"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products by title or SKU..." 
              className="pl-9 text-foreground" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-foreground">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                      No products found. Add a new product or search another term.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-secondary overflow-hidden flex-shrink-0">
                            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold line-clamp-1">{product.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Category: {getCategoryName(product.categoryId)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs space-y-1 whitespace-nowrap">
                        <div className="font-bold text-foreground">SKU: {product.sku}</div>
                        {product.fsiNo && <div className="text-primary text-[10px]">FSI: {product.fsiNo}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold">{formatPrice(product.price)}</div>
                        <div className="text-xs text-muted-foreground line-through">{formatPrice(product.mrp)}</div>
                      </td>
                      <td className="px-6 py-4">
                        {product.stock > 10 ? (
                          <span className="text-success font-medium">{product.stock} in stock</span>
                        ) : (
                          <span className="text-destructive font-medium">{product.stock} in stock (Low)</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-success/10 text-success px-2 py-1 rounded-full text-xs font-semibold">Active</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                        <Link href={`/admin/products/${product._id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => deleteProduct(product._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Barcode scanner modal */}
      <BarcodeScanner isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Plus, Edit, Trash2, QrCode, ExternalLink, Download, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useProductStore } from "@/stores/productStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { useHsnStore } from "@/stores/hsnStore";
import { useToastStore } from "@/stores/toastStore";
import { Product, Category, ColorVariant, SubVariant } from "@/types";
import { BarcodeScanner } from "./BarcodeScanner";
import { Barcode } from "@/components/ui/Barcode";
import { Pagination } from "@/components/ui/Pagination";
import { getBarcodeSvgString } from "@/lib/barcodeHelper";
import { InventoryManager } from "./InventoryManager";

interface AdminProductsManagerProps {
  initialProducts: Product[];
  initialCategories: Category[];
}

export function AdminProductsManager({ initialProducts, initialCategories }: AdminProductsManagerProps) {
  const { products, initializeProducts, updateProduct, deleteProduct } = useProductStore();
  const { categories, initializeCategories } = useCategoryStore();
  const { hsns, initializeHsns } = useHsnStore();
  const { addToast } = useToastStore();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [selectedHsn, setSelectedHsn] = React.useState("all");
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [selectedStockStatus, setSelectedStockStatus] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("title-asc");

  const [isScannerOpen, setIsScannerOpen] = React.useState(false);
  const [barcodePrintProduct, setBarcodePrintProduct] = React.useState<Product | null>(null);
  const [activePanel, setActivePanel] = React.useState<"catalog" | "inventory">("catalog");

  // Multi-select bulk state
  const [selectedProductIds, setSelectedProductIds] = React.useState<string[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 10;

  // Sync server data into client stores
  React.useEffect(() => {
    initializeProducts(initialProducts);
    initializeCategories(initialCategories);
    initializeHsns();
  }, [initialProducts, initialCategories, initializeProducts, initializeCategories, initializeHsns]);

  const activeProducts = products.length > 0 ? products : initialProducts;
  const activeCategories = categories.length > 0 ? categories : initialCategories;

  // Reset page & selections when filters change
  React.useEffect(() => {
    setCurrentPage(1);
    setSelectedProductIds([]);
  }, [searchTerm, selectedCategory, selectedHsn, selectedStatus, selectedStockStatus, sortBy]);

  // Filters & Sorting logic
  const processedProducts = React.useMemo(() => {
    let list = [...activeProducts];

    // Text Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(term) || 
        p.colorVariants?.some(cv => 
          cv.color.toLowerCase().includes(term) ||
          cv.subVariants?.some(sv => 
            sv.sku.toLowerCase().includes(term) ||
            (sv.barcode && sv.barcode.toLowerCase().includes(term))
          )
        )
      );
    }

    // Category Filter
    if (selectedCategory !== "all") {
      list = list.filter(p => p.categoryId === selectedCategory);
    }

    // HSN Code Filter
    if (selectedHsn !== "all") {
      list = list.filter(p => p.hsnCode === selectedHsn);
    }

    // Active Status Filter
    if (selectedStatus !== "all") {
      const isProductActive = selectedStatus === "active";
      list = list.filter(p => p.isActive === isProductActive);
    }

    // Stock Level Filter
    if (selectedStockStatus !== "all") {
      if (selectedStockStatus === "instock") {
        list = list.filter(p => p.totalStock > 20);
      } else if (selectedStockStatus === "lowstock") {
        list = list.filter(p => p.totalStock > 0 && p.totalStock <= 20);
      } else if (selectedStockStatus === "outofstock") {
        list = list.filter(p => p.totalStock === 0);
      }
    }

    // Sorting
    list.sort((a, b) => {
      const priceA = a.colorVariants?.[0]?.subVariants?.[0]?.price ?? 0;
      const priceB = b.colorVariants?.[0]?.subVariants?.[0]?.price ?? 0;

      switch (sortBy) {
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "price-asc":
          return priceA - priceB;
        case "price-desc":
          return priceB - priceA;
        case "stock-asc":
          return a.totalStock - b.totalStock;
        case "stock-desc":
          return b.totalStock - a.totalStock;
        default:
          return 0;
      }
    });

    return list;
  }, [activeProducts, searchTerm, selectedCategory, selectedHsn, selectedStatus, selectedStockStatus, sortBy]);

  const totalPages = Math.ceil(processedProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [processedProducts, currentPage]);

  const toggleProductActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateProduct(id, { isActive: !currentStatus });
      addToast(
        `Product status toggled to ${!currentStatus ? "Active" : "Inactive"}.`,
        "success"
      );
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to toggle product status",
        "error"
      );
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this product?")) {
      try {
        await deleteProduct(id);
        setSelectedProductIds(prev => prev.filter(pId => pId !== id));
        addToast("Product successfully removed from catalog.", "info");
      } catch (err) {
        addToast(
          err instanceof Error ? err.message : "Failed to delete product",
          "error"
        );
      }
    }
  };

  // Row selection helpers
  const handleSelectRow = (productId: string) => {
    setSelectedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const handleSelectAllOnPage = () => {
    const pageIds = paginatedProducts.map(p => p._id);
    const allSelected = pageIds.every(id => selectedProductIds.includes(id));

    if (allSelected) {
      setSelectedProductIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedProductIds(prev => {
        const union = new Set([...prev, ...pageIds]);
        return Array.from(union);
      });
    }
  };

  // Bulk actions handlers
  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    if (confirm(`Are you sure you want to delete the ${selectedProductIds.length} selected products?`)) {
      try {
        await Promise.all(selectedProductIds.map(id => deleteProduct(id)));
        addToast(`Successfully deleted ${selectedProductIds.length} products in bulk.`, "success");
        setSelectedProductIds([]);
      } catch (err) {
        addToast(
          err instanceof Error ? err.message : "Failed to delete products",
          "error"
        );
      }
    }
  };

  const handleBulkDownloadBarcodes = () => {
    if (selectedProductIds.length === 0) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      addToast("Popup blocker prevented printing.", "error");
      return;
    }

    const selectedProducts = activeProducts.filter(p => selectedProductIds.includes(p._id));
    
    let cardsHtml = "";
    selectedProducts.forEach(product => {
      product.colorVariants.forEach(cv => {
        cv.subVariants?.forEach(sv => {
          const barValue = sv.barcode || sv.sku || "FX0000";
          cardsHtml += `
            <div style="text-align:center; width:180px; margin:10px; display:inline-block; box-sizing:border-box;">
              <div style="display:flex; justify-content:center; margin-bottom:6px;">
                ${getBarcodeSvgString(barValue, 0.8, 35)}
              </div>
              <div style="font-size:10px; font-weight:bold; font-family:monospace;">SKU: ${sv.sku} (${cv.color} - ${sv.size} / ${sv.weight})</div>
            </div>
          `;
        });
      });
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Bulk Print Barcodes</title>
          <style>
            body { font-family: sans-serif; padding: 20px; background: #fff; text-align:center; }
            .grid { display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; }
            @media print {
              body { background: white; padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor:pointer; background:#10b981; color:white; border:none; border-radius:5px; font-weight:bold;">
              Print Barcode Labels
            </button>
            <p style="font-size:12px; color:#666;">Confirm print preview settings and margin layout configuration.</p>
          </div>
          <div class="grid">${cardsHtml}</div>
        </body>
      </html>
    `);

    printWindow.document.close();
    addToast("Bulk barcode sheets successfully compiled.", "success");
  };

  // Individual barcode printing inside the modal
  const handlePrintIndividualBarcode = (product: Product, cv: ColorVariant, sv: SubVariant) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      addToast("Popup blocker prevented printing.", "error");
      return;
    }

    const barValue = sv.barcode || sv.sku || "FX0000";

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Label - ${sv.sku}</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 90vh; font-family: sans-serif; background:#fff; }
            .card { text-align: center; width: 220px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div style="text-align:center;">
            <button onclick="window.print()" style="padding: 8px 16px; margin-bottom: 20px; cursor: pointer; background: #10b981; color: white; border: none; border-radius: 4px; font-weight: bold;">
              Print Barcode
            </button>
            <div class="card">
              <div style="display:flex; justify-content:center; margin-bottom:6px;">
                ${getBarcodeSvgString(barValue, 0.8, 35)}
              </div>
              <div style="font-size:10px; font-weight:bold; font-family:monospace;">SKU: ${sv.sku}</div>
              <div style="font-size:9px; color:#555;">${cv.color} - ${sv.size} / ${sv.weight}</div>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    addToast("Individual barcode window compiled.", "success");
  };

  const triggerPrintBarcodes = () => {
    if (!barcodePrintProduct) return;
    
    // Create print-only layout inside a new window
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      addToast("Popup blocker prevented printing. Please enable popups.", "error");
      return;
    }

    const titleText = barcodePrintProduct.title;
    const cardsHtml = barcodePrintProduct.colorVariants.flatMap(cv => 
      cv.subVariants?.map(sv => {
        const barValue = sv.barcode || sv.sku || "FX0000";
        
        return `
          <div style="text-align:center; width:180px; margin:10px; display:inline-block;">
            <div style="display:flex; justify-content:center; margin-bottom:6px;">
              ${getBarcodeSvgString(barValue, 0.8, 35)}
            </div>
            <div style="font-size:10px; font-weight:bold; font-family:monospace;">SKU: ${sv.sku}</div>
            <div style="font-size:8px; color:#555;">${cv.color} - ${sv.size} / ${sv.weight}</div>
          </div>
        `;
      }) || []
    ).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode Labels - ${titleText}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; background: #fff; text-align:center; }
            .grid { display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; }
            @media print {
              body { background: white; padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; text-align:center;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor:pointer; background:#10b981; color:white; border:none; border-radius:5px; font-weight:bold;">
              Print Barcode Sheet
            </button>
            <p style="font-size:12px; color:#666; margin-top:5px;">Ensure margins are disabled and background graphics are printed.</p>
          </div>
          <div class="grid">${cardsHtml}</div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    addToast("Barcode printable layout generated.", "success");
  };

  // Find category name by ID
  const getCategoryName = (catId: string) => {
    const cat = activeCategories.find(c => c._id === catId);
    return cat ? cat.name : catId;
  };

  const isAllPageSelected = paginatedProducts.length > 0 && paginatedProducts.every(p => selectedProductIds.includes(p._id));

  return (
    <div className="space-y-6 text-foreground">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">Manage B2B inventory lines, custom MOQ, and SEO tags.</p>
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

      {/* Panel Tab Switcher */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActivePanel("catalog")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
            activePanel === "catalog" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Product Catalog List
        </button>
        <button
          onClick={() => setActivePanel("inventory")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
            activePanel === "inventory" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Warehouse Inventory & Ledger (10/10)
        </button>
      </div>

      {activePanel === "catalog" ? (
        <>
          {/* Bulk Action Bar */}
      {selectedProductIds.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
          <div className="text-sm font-bold text-primary">
            {selectedProductIds.length} Products selected for batch operations
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBulkDownloadBarcodes} 
              className="text-xs bg-background hover:bg-secondary font-bold flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Print/Download Barcodes
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleBulkDelete} 
              className="text-xs font-bold flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Advanced Filters & Sorting Bar */}
      <Card>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Text Search */}
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by title or SKU..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="h-10 rounded-md border bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary font-semibold text-foreground w-full"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {activeCategories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>

          {/* HSN Filter */}
          <select
            className="h-10 rounded-md border bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary font-semibold text-foreground w-full"
            value={selectedHsn}
            onChange={(e) => setSelectedHsn(e.target.value)}
          >
            <option value="all">All HSN Codes</option>
            {hsns.map(h => (
              <option key={h._id} value={h.code}>HSN {h.code}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="h-10 rounded-md border bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary font-semibold text-foreground w-full"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>

          {/* Stock Filter */}
          <select
            className="h-10 rounded-md border bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary font-semibold text-foreground w-full"
            value={selectedStockStatus}
            onChange={(e) => setSelectedStockStatus(e.target.value)}
          >
            <option value="all">All Stock Status</option>
            <option value="instock">In Stock (&gt;20)</option>
            <option value="lowstock">Low Stock (1-20)</option>
            <option value="outofstock">Out of Stock</option>
          </select>

          {/* Sorter */}
          <select
            className="h-10 rounded-md border bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary font-semibold text-foreground w-full col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-1"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="title-asc">Title: A to Z</option>
            <option value="title-desc">Title: Z to A</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock-asc">Stock: Low to High</option>
            <option value="stock-desc">Stock: High to Low</option>
          </select>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                <tr>
                  <th className="px-6 py-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded text-primary focus:ring-primary bg-background border-border cursor-pointer h-4 w-4"
                      checked={isAllPageSelected}
                      onChange={handleSelectAllOnPage}
                    />
                  </th>
                  <th className="px-6 py-4">Product Details</th>
                  <th className="px-6 py-4 font-mono">Tax HSN</th>
                  <th className="px-6 py-4">Wholesale Price</th>
                  <th className="px-6 py-4">Total Stock</th>
                  <th className="px-6 py-4">Active</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {processedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                      No matching wholesale products found. Change filters or search terms.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => {
                    const defaultVariant = product.colorVariants?.[0] || { price: 0, mrp: 0, stock: 0, sku: "NO SKU", images: [""] };
                    const imgUrl = defaultVariant.images?.[0] || "";
                    const variantsCount = product.colorVariants?.length || 0;
                    const isSelected = selectedProductIds.includes(product._id);

                    return (
                      <tr key={product._id} className={`hover:bg-secondary/20 transition-colors ${!product.isActive ? "opacity-60" : ""} ${isSelected ? "bg-primary/5" : ""}`}>
                        <td className="px-6 py-4 text-center">
                          <input 
                            type="checkbox" 
                            className="rounded text-primary focus:ring-primary bg-background border-border cursor-pointer h-4 w-4"
                            checked={isSelected}
                            onChange={() => handleSelectRow(product._id)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-secondary overflow-hidden flex-shrink-0 border">
                              {imgUrl && <img src={imgUrl} alt={product.title} className="w-full h-full object-cover" />}
                            </div>
                            <div>
                              <p className="font-bold line-clamp-1">{product.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Category: {getCategoryName(product.categoryId)} | {variantsCount} variants | MOQ: {product.moq || 5}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                          {product.hsnCode ? (
                            <div>HSN {product.hsnCode} ({product.gstRate}% GST)</div>
                          ) : (
                            <span className="text-warning">Not Set</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                           <div className="font-bold text-foreground">{formatPrice(defaultVariant?.subVariants?.[0]?.price ?? 0)}</div>
                          <div className="text-[10px] text-muted-foreground">MRP: {formatPrice(defaultVariant?.subVariants?.[0]?.mrp ?? 0)}</div>
                        </td>
                        <td className="px-6 py-4">
                          {product.totalStock > 20 ? (
                            <span className="bg-success/10 text-success px-2 py-0.5 rounded-full text-xs font-semibold">{product.totalStock} units</span>
                          ) : product.totalStock > 0 ? (
                            <span className="bg-warning/10 text-warning px-2 py-0.5 rounded-full text-xs font-semibold">{product.totalStock} units (Low)</span>
                          ) : (
                            <span className="bg-destructive/10 text-destructive px-2 py-0.5 rounded-full text-xs font-semibold">Out of Stock</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {/* Active / Inactive Toggle Switch */}
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={product.isActive}
                              onChange={() => toggleProductActive(product._id, product.isActive)}
                            />
                            <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </td>
                        <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                          {/* View in New Tab */}
                          <a href={`/products/${product.slug}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" title="View Storefront">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                          {/* Download all barcodes sheet */}
                          <Button variant="ghost" size="icon" title="Download Barcodes" onClick={() => setBarcodePrintProduct(product)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Link href={`/admin/products/${product._id}`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={processedProducts.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </div>
        </CardContent>
      </Card>
        </>
      ) : (
        <InventoryManager />
      )}

      {/* Barcode print modal dialogue */}
      {barcodePrintProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full border-border max-h-[85vh] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>Print Barcodes - {barcodePrintProduct.title}</span>
                <Button variant="ghost" size="sm" onClick={() => setBarcodePrintProduct(null)}>Close</Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 overflow-y-auto flex-1">
              <p className="text-xs text-muted-foreground">
                Select whether to print individual labels or generate a print sheet for all variants.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {barcodePrintProduct.colorVariants?.flatMap((cv) => 
                  cv.subVariants?.map((sv, idx) => (
                    <div key={`${cv.color}-${sv.id}-${idx}`} className="p-4 border rounded-lg bg-secondary/20 flex flex-col items-center gap-2">
                      <span className="text-xs font-bold text-primary">{cv.color} ({sv.size} / {sv.weight})</span>
                      <Barcode sku={sv.barcode || sv.sku} height={35} />
                      <span className="text-[10px] text-muted-foreground font-mono">SKU: {sv.sku}</span>
                      
                      {/* Individual download option */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePrintIndividualBarcode(barcodePrintProduct, cv, sv)}
                        className="text-xs mt-2 w-full flex items-center justify-center gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" /> Download Barcode
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setBarcodePrintProduct(null)}>Cancel</Button>
                <Button onClick={triggerPrintBarcodes} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5">
                  <Download className="h-4 w-4" /> Download All Barcodes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Barcode scanner modal */}
      <BarcodeScanner isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </div>
  );
}

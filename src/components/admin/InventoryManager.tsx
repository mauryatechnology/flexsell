"use client";

import * as React from "react";
import { useProductStore } from "@/stores/productStore";
import { useInventoryHistoryStore } from "@/stores/inventoryHistoryStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToastStore } from "@/stores/toastStore";
import { 
  Download, 
  Upload, 
  Search, 
  History, 
  Grid, 
  AlertTriangle, 
  Plus,
  Minus
} from "lucide-react";
import { Product, ColorVariant, SubVariant } from "@/types";

export function InventoryManager() {
  const { products, updateProduct } = useProductStore();
  const { logs, addLog, clearLogs } = useInventoryHistoryStore();
  const { addToast } = useToastStore();

  const [activeTab, setActiveTab] = React.useState<"grid" | "ledger">("grid");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [stockFilter, setStockFilter] = React.useState<"all" | "low" | "out">("all");
  
  // Ledger search states
  const [ledgerSearch, setLedgerSearch] = React.useState("");
  const [ledgerActionFilter, setLedgerActionFilter] = React.useState("all");

  // Inline adjustment state
  const [adjustments, setAdjustments] = React.useState<Record<string, string>>({});

  // Flattened list of all product variants for easy tabular display
  const flattenedVariants = React.useMemo(() => {
    const list: Array<{
      product: Product;
      colorVariant: ColorVariant;
      subVariant: SubVariant;
      sku: string;
      stock: number;
    }> = [];

    products.forEach((product) => {
      product.colorVariants?.forEach((cv) => {
        cv.subVariants?.forEach((sv) => {
          list.push({
            product,
            colorVariant: cv,
            subVariant: sv,
            sku: sv.sku,
            stock: sv.stock,
          });
        });
      });
    });

    return list;
  }, [products]);

  // Filtered variants
  const filteredVariants = React.useMemo(() => {
    return flattenedVariants.filter((item) => {
      const matchesSearch = 
        item.product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.colorVariant.color.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStock = 
        stockFilter === "all" ? true :
        stockFilter === "low" ? item.stock > 0 && item.stock < 15 :
        item.stock === 0;

      return matchesSearch && matchesStock;
    });
  }, [flattenedVariants, searchTerm, stockFilter]);

  // Filtered logs
  const filteredLogs = React.useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = 
        log.productName.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
        log.sku.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
        log.variantDetails.toLowerCase().includes(ledgerSearch.toLowerCase());

      const matchesAction = 
        ledgerActionFilter === "all" ? true :
        log.actionType === ledgerActionFilter;

      return matchesSearch && matchesAction;
    });
  }, [logs, ledgerSearch, ledgerActionFilter]);

  // Handlers for manual adjustments
  const handleQuickAdjust = async (sku: string, currentStock: number, item: typeof flattenedVariants[0], action: "add" | "sub" | "set") => {
    const inputVal = adjustments[sku] || "";
    const parsed = parseInt(inputVal, 10);
    
    if (isNaN(parsed) || parsed <= 0) {
      addToast("Please input a valid quantity.", "warning");
      return;
    }

    let change = 0;
    let newStock = currentStock;

    if (action === "add") {
      change = parsed;
      newStock = currentStock + parsed;
    } else if (action === "sub") {
      change = -parsed;
      newStock = Math.max(0, currentStock - parsed);
    } else if (action === "set") {
      change = parsed - currentStock;
      newStock = parsed;
    }

    // Save state
    await saveStockUpdate(item, newStock, change, "Manual Adjustment");
    
    // Clear adjustment input
    setAdjustments(prev => {
      const copy = { ...prev };
      delete copy[sku];
      return copy;
    });
  };

  const saveStockUpdate = async (
    item: typeof flattenedVariants[0], 
    newStock: number, 
    change: number, 
    actionType: "Scan Adjustment" | "CSV Bulk Import" | "Order Deduction" | "Manual Adjustment"
  ) => {
    const { product, colorVariant, subVariant } = item;
    
    const updatedVariants = product.colorVariants.map((cv) => {
      if (cv.color === colorVariant.color) {
        const updatedSubs = cv.subVariants.map((sv) => 
          sv.id === subVariant.id ? { ...sv, stock: newStock } : sv
        );
        return { ...cv, subVariants: updatedSubs };
      }
      return cv;
    });

    const totalStock = updatedVariants.reduce((sum, cv) => 
      sum + (cv.subVariants?.reduce((sSum, sv) => sSum + sv.stock, 0) || 0)
    , 0);

    const updatedProduct = {
      ...product,
      totalStock,
      colorVariants: updatedVariants
    };

    // Update product store
    await updateProduct(product._id, updatedProduct);

    // Write Stock Ledger audit log
    const variantDetails = `${colorVariant.color} • ${subVariant.size || "Standard"} • ${subVariant.weight || "250g"}`;
    addLog({
      sku: subVariant.sku,
      productName: product.title,
      variantDetails,
      actionType,
      change,
      prevStock: subVariant.stock,
      newStock
    });

    addToast(`Stock for SKU ${subVariant.sku} updated successfully.`, "success");
  };

  // CSV Bulk Export
  const handleExportCSV = () => {
    const headers = ["SKU", "Product Name", "Color", "Size", "Weight", "Current Stock"];
    const rows = flattenedVariants.map((v) => [
      v.sku,
      v.product.title,
      v.colorVariant.color,
      v.subVariant.size || "Standard",
      v.subVariant.weight || "250g",
      v.subVariant.stock.toString()
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `flexsell_inventory_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Inventory CSV file downloaded successfully.", "success");
  };

  // CSV Bulk Import
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/);
      let successCount = 0;
      let errorCount = 0;

      // Skip headers
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV parser supporting quotes
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(",");
        if (matches.length < 6) {
          errorCount++;
          continue;
        }

        const sku = matches[0].replace(/"/g, "").trim();
        const stockStr = matches[5].replace(/"/g, "").trim();
        const targetStock = parseInt(stockStr, 10);

        if (isNaN(targetStock) || targetStock < 0) {
          errorCount++;
          continue;
        }

        // Match SKU in catalog
        const matchItem = flattenedVariants.find(item => item.sku.toLowerCase() === sku.toLowerCase());
        if (matchItem) {
          const change = targetStock - matchItem.stock;
          if (change !== 0) {
            await saveStockUpdate(matchItem, targetStock, change, "CSV Bulk Import");
            successCount++;
          }
        } else {
          errorCount++;
        }
      }

      if (successCount > 0) {
        addToast(`CSV Import Complete: Updated ${successCount} variant stocks. Errors: ${errorCount}.`, "success");
      } else {
        addToast(`CSV Import finished. No stock changes applied. Errors: ${errorCount}`, "warning");
      }

      // Reset file input
      e.target.value = "";
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Navigation Headers */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">B2B Warehouse Inventory Control</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Quickly adjust cargo lines, download spreadsheets, or trace the ledger logs.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex items-center gap-1.5 font-semibold">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <label className="cursor-pointer">
            <span className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-colors gap-1.5">
              <Upload className="h-4 w-4" /> Import CSV
            </span>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleImportCSV} 
              className="hidden" 
            />
          </label>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("grid")}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "grid" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Grid className="h-4 w-4" /> Stock Adjustment Grid
        </button>
        <button
          onClick={() => setActiveTab("ledger")}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "ledger" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="h-4 w-4" /> Stock Adjustment Ledger
        </button>
      </div>

      {/* TAB CONTENT: STOCK GRID */}
      {activeTab === "grid" && (
        <Card className="border border-border shadow-sm">
          <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search SKU, Product, or Color..."
                className="pl-9 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {(["all", "low", "out"] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={stockFilter === filter ? "default" : "outline"}
                  size="sm"
                  className="capitalize font-bold"
                  onClick={() => setStockFilter(filter)}
                >
                  {filter === "all" ? "All Stocks" : filter === "low" ? "Low Stock (<15)" : "Out of Stock"}
                </Button>
              ))}
            </div>
          </div>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-secondary/40 font-bold text-muted-foreground uppercase text-[10px] border-b">
                <tr>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">SKU Code</th>
                  <th className="px-6 py-3">Color</th>
                  <th className="px-6 py-3">Size/Weight</th>
                  <th className="px-6 py-3 text-center">Current Stock</th>
                  <th className="px-6 py-3 text-right">Quick Stock Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredVariants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                      No active cargo lines match filters.
                    </td>
                  </tr>
                ) : (
                  filteredVariants.map((item) => {
                    const sku = item.sku;
                    const stock = item.stock;
                    const inputVal = adjustments[sku] || "";
                    const isLowStock = stock > 0 && stock < 15;
                    const isOutStock = stock === 0;

                    return (
                      <tr key={sku} className="hover:bg-secondary/15 transition-colors text-foreground">
                        <td className="px-6 py-4 font-bold max-w-xs truncate" title={item.product.title}>
                          {item.product.title}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-muted-foreground">{sku}</td>
                        <td className="px-6 py-4 font-medium">{item.colorVariant.color}</td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {item.subVariant.size || "—"} / {item.subVariant.weight || "—"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isOutStock ? (
                            <span className="bg-destructive/10 text-destructive font-black px-2 py-0.5 rounded shadow-sm text-[10px]">
                              OUT OF STOCK
                            </span>
                          ) : isLowStock ? (
                            <span className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 font-extrabold px-2 py-0.5 rounded shadow-sm text-[10px] flex items-center justify-center gap-1 w-fit mx-auto">
                              <AlertTriangle className="h-3 w-3" /> LOW STOCK ({stock})
                            </span>
                          ) : (
                            <span className="bg-success/10 text-success font-black px-2.5 py-0.5 rounded text-[10px]">
                              {stock} units
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Input
                              type="number"
                              placeholder="Qty"
                              className="h-8 w-16 text-center text-xs font-bold font-mono border-input"
                              value={inputVal}
                              onChange={(e) => setAdjustments(prev => ({ ...prev, [sku]: e.target.value }))}
                            />
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 w-8 p-0" 
                              title="Add Stock"
                              onClick={() => handleQuickAdjust(sku, stock, item, "add")}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 w-8 p-0" 
                              title="Deduct Stock"
                              onClick={() => handleQuickAdjust(sku, stock, item, "sub")}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              size="sm" 
                              className="h-8 px-2 text-[10px] font-bold" 
                              title="Set Stock"
                              onClick={() => handleQuickAdjust(sku, stock, item, "set")}
                            >
                              Set
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* TAB CONTENT: STOCK LEDGER LOGS */}
      {activeTab === "ledger" && (
        <Card className="border border-border shadow-sm">
          <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Product, SKU, or Details..."
                className="pl-9 h-10"
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                className="h-9 px-3 rounded-md border border-border bg-background text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary"
                value={ledgerActionFilter}
                onChange={(e) => setLedgerActionFilter(e.target.value)}
              >
                <option value="all">All Operations</option>
                <option value="Manual Adjustment">Manual Adjustments</option>
                <option value="CSV Bulk Import">CSV Bulk Imports</option>
                <option value="Scan Adjustment">Scanner Adjustments</option>
                <option value="Order Deduction">Order Sales Deductions</option>
              </select>
              <Button variant="outline" size="sm" onClick={clearLogs} className="font-bold text-destructive border-destructive/20 hover:bg-destructive/10 h-9">
                Clear Logs
              </Button>
            </div>
          </div>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-secondary/40 font-bold text-muted-foreground uppercase text-[10px] border-b">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Product / Variant</th>
                  <th className="px-6 py-3 font-mono">SKU</th>
                  <th className="px-6 py-3">Action Type</th>
                  <th className="px-6 py-3 text-center">Previous Stock</th>
                  <th className="px-6 py-3 text-center">Adjustment</th>
                  <th className="px-6 py-3 text-center">Resulting Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground italic">
                      No stock ledger events recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isPositive = log.change > 0;
                    const changeStr = isPositive ? `+${log.change}` : `${log.change}`;

                    return (
                      <tr key={log.id} className="hover:bg-secondary/15 transition-colors text-foreground">
                        <td className="px-6 py-4 text-muted-foreground font-mono whitespace-nowrap">{log.timestamp}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold">{log.productName}</span>
                          <div className="text-[10px] text-muted-foreground mt-0.5 font-semibold">
                            {log.variantDetails}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-muted-foreground">{log.sku}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            log.actionType === "CSV Bulk Import" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                            log.actionType === "Scan Adjustment" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" :
                            log.actionType === "Order Deduction" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                            "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                          }`}>
                            {log.actionType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-muted-foreground">{log.prevStock}</td>
                        <td className={`px-6 py-4 text-center font-black ${
                          isPositive ? "text-success" : "text-destructive"
                        }`}>
                          {changeStr}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-foreground bg-secondary/10">{log.newStock}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

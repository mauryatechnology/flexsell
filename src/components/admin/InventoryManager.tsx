"use client";

import * as React from "react";
import Link from "next/link";
import { useProductStore } from "@/stores/productStore";
import { useInventoryHistoryStore } from "@/stores/inventoryHistoryStore";
import { Card, CardContent } from "@/components/ui/Card";
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
  Minus,
  X,
  ArrowRight,
  Loader2
} from "lucide-react";
import { Product, ColorVariant, SubVariant } from "@/types";

export function InventoryManager() {
  const { products, updateProduct } = useProductStore();
  const { logs, addLog, clearLogs, initializeLogs, isLoading: ledgerLoading } = useInventoryHistoryStore();
  const { addToast } = useToastStore();

  const [activeTab, setActiveTab] = React.useState<"grid" | "ledger">("grid");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [stockFilter, setStockFilter] = React.useState<"all" | "low" | "out">("all");
  
  // Ledger search states
  const [ledgerSearch, setLedgerSearch] = React.useState("");
  const [ledgerActionFilter, setLedgerActionFilter] = React.useState("all");

  // Inline adjustment state
  const [adjustments, setAdjustments] = React.useState<Record<string, string>>({});

  // Pagination states
  const [gridPage, setGridPage] = React.useState(1);
  const gridPageSize = 10;

  const [ledgerPage, setLedgerPage] = React.useState(1);
  const ledgerPageSize = 10;

  // CSV Import Dialog state
  const [importResults, setImportResults] = React.useState<{
    isOpen: boolean;
    successCount: number;
    skippedCount: number;
    errors: Array<{
      line: number;
      sku: string;
      reason: "SKU Not Found" | "Invalid Stock Value" | "Parsing Error";
      detail: string;
    }>;
  } | null>(null);

  // Initialize logs on mount
  React.useEffect(() => {
    initializeLogs();
  }, [initializeLogs]);

  // Reset pagination on filter changes
  React.useEffect(() => {
    setGridPage(1);
  }, [searchTerm, stockFilter]);

  React.useEffect(() => {
    setLedgerPage(1);
  }, [ledgerSearch, ledgerActionFilter]);

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

  // Paginated grid variants
  const totalGridPages = Math.ceil(filteredVariants.length / gridPageSize) || 1;
  const paginatedVariants = React.useMemo(() => {
    const startIndex = (gridPage - 1) * gridPageSize;
    return filteredVariants.slice(startIndex, startIndex + gridPageSize);
  }, [filteredVariants, gridPage]);

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

  // Paginated logs
  const totalLedgerPages = Math.ceil(filteredLogs.length / ledgerPageSize) || 1;
  const paginatedLogs = React.useMemo(() => {
    const startIndex = (ledgerPage - 1) * ledgerPageSize;
    return filteredLogs.slice(startIndex, startIndex + ledgerPageSize);
  }, [filteredLogs, ledgerPage]);

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
      sum + (cv.subVariants?.filter(sv => sv.isActive !== false).reduce((sSum, sv) => sSum + sv.stock, 0) || 0)
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
    await addLog({
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
      let skippedCount = 0;
      const errorsList: Array<{
        line: number;
        sku: string;
        reason: "SKU Not Found" | "Invalid Stock Value" | "Parsing Error";
        detail: string;
      }> = [];

      if (lines.length <= 1) {
        addToast("The uploaded CSV file is empty.", "error");
        return;
      }

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV columns
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(",");
        
        if (matches.length < 6) {
          errorsList.push({
            line: i + 1,
            sku: matches[0]?.replace(/"/g, "").trim() || "Unknown",
            reason: "Parsing Error",
            detail: `Line contains only ${matches.length} columns (expected at least 6).`
          });
          continue;
        }

        const sku = matches[0].replace(/"/g, "").trim();
        const stockStr = matches[5].replace(/"/g, "").trim();
        const targetStock = parseInt(stockStr, 10);

        if (isNaN(targetStock) || targetStock < 0) {
          errorsList.push({
            line: i + 1,
            sku,
            reason: "Invalid Stock Value",
            detail: `Stock value '${stockStr}' must be a positive integer.`
          });
          continue;
        }

        // Match SKU in catalog
        const matchItem = flattenedVariants.find(item => item.sku.toLowerCase() === sku.toLowerCase());
        if (matchItem) {
          const change = targetStock - matchItem.stock;
          if (change !== 0) {
            await saveStockUpdate(matchItem, targetStock, change, "CSV Bulk Import");
            successCount++;
          } else {
            skippedCount++;
          }
        } else {
          errorsList.push({
            line: i + 1,
            sku,
            reason: "SKU Not Found",
            detail: `SKU '${sku}' not found. Only existing stocks can be adjusted by this sheet.`
          });
        }
      }

      setImportResults({
        isOpen: true,
        successCount,
        skippedCount,
        errors: errorsList
      });

      // Clear input so same file can be uploaded again
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Operations */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 border rounded-xl shadow-sm text-foreground">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Warehouse Inventory Audit & Adjustment</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Perform physical stock takes, export stock sheets, or upload bulk logistics sheets.
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportCSV} 
            className="flex-1 md:flex-none font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" /> Export Stock Sheet
          </Button>

          <label className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/95 border rounded-md cursor-pointer text-xs font-bold shadow-sm transition-colors">
            <Upload className="h-3.5 w-3.5" /> Import Stock Update
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
      <div className="flex border-b border-border text-foreground">
        <button
          onClick={() => setActiveTab("grid")}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === "grid" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Grid className="h-4 w-4" /> Stock Adjustment Grid
        </button>
        <button
          onClick={() => setActiveTab("ledger")}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === "ledger" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="h-4 w-4" /> Stock Adjustment Ledger
        </button>
      </div>

      {/* TAB CONTENT: STOCK GRID */}
      {activeTab === "grid" && (
        <Card className="border border-border shadow-sm text-foreground">
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
                  className="capitalize font-bold cursor-pointer"
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
                {paginatedVariants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                      No active cargo lines match filters.
                    </td>
                  </tr>
                ) : (
                  paginatedVariants.map((item) => {
                    const sku = item.sku;
                    const stock = item.stock;
                    const inputVal = adjustments[sku] || "";
                    const isLowStock = stock > 0 && stock < 15;
                    const isOutStock = stock === 0;

                    return (
                      <tr key={item.product._id + "-" + item.subVariant.id} className="hover:bg-secondary/15 transition-colors text-foreground">
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
                            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded shadow-sm">
                              {stock} units (Low)
                            </span>
                          ) : (
                            <span className="font-bold text-success font-mono">{stock} units</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-1">
                            <Input
                              type="number"
                              min={1}
                              placeholder="Qty"
                              className="w-14 h-8 text-center text-xs p-1"
                              value={inputVal}
                              onChange={(e) => setAdjustments(prev => ({ ...prev, [sku]: e.target.value }))}
                            />
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-success hover:bg-success/15 cursor-pointer"
                              title="Add Stock (+)"
                              onClick={() => handleQuickAdjust(sku, stock, item, "add")}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/15 cursor-pointer"
                              title="Deduct Stock (-)"
                              disabled={stock === 0}
                              onClick={() => handleQuickAdjust(sku, stock, item, "sub")}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="h-8 px-2 text-[10px] font-bold cursor-pointer"
                              title="Override Absolute Stock (=)"
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
          
          {/* Pagination Controls */}
          {totalGridPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-border/60 bg-secondary/5 gap-4">
              <span className="text-xs text-muted-foreground font-medium">
                Showing {(gridPage - 1) * gridPageSize + 1} to {Math.min(filteredVariants.length, gridPage * gridPageSize)} of {filteredVariants.length} lines
              </span>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-bold text-xs h-8 px-3 cursor-pointer"
                  disabled={gridPage === 1}
                  onClick={() => setGridPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-xs font-semibold px-2">
                  Page {gridPage} of {totalGridPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-bold text-xs h-8 px-3 cursor-pointer"
                  disabled={gridPage === totalGridPages}
                  onClick={() => setGridPage(p => Math.min(totalGridPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* TAB CONTENT: STOCK LEDGER LOGS */}
      {activeTab === "ledger" && (
        <Card className="border border-border shadow-sm text-foreground">
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
              <Button variant="outline" size="sm" onClick={clearLogs} className="font-bold text-destructive border-destructive/20 hover:bg-destructive/10 h-9 cursor-pointer">
                Clear Logs
              </Button>
            </div>
          </div>
          
          <CardContent className="p-0 overflow-x-auto">
            {ledgerLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span>Loading ledger events...</span>
              </div>
            ) : (
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
                  {paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground italic">
                        No stock ledger events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((log) => {
                      const isPositive = log.change > 0;
                      const changeStr = isPositive ? `+${log.change}` : `${log.change}`;

                      return (
                        <tr key={log._id} className="hover:bg-secondary/15 transition-colors text-foreground">
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
                          <td className="px-6 py-4 text-center font-mono font-medium">{log.prevStock}</td>
                          <td className="px-6 py-4 text-center font-mono font-bold">
                            <span className={isPositive ? "text-success" : "text-destructive"}>
                              {changeStr}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-mono font-bold">{log.newStock}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </CardContent>

          {/* Pagination Controls */}
          {totalLedgerPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-border/60 bg-secondary/5 gap-4">
              <span className="text-xs text-muted-foreground font-medium">
                Showing {(ledgerPage - 1) * ledgerPageSize + 1} to {Math.min(filteredLogs.length, ledgerPage * ledgerPageSize)} of {filteredLogs.length} events
              </span>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-bold text-xs h-8 px-3 cursor-pointer"
                  disabled={ledgerPage === 1}
                  onClick={() => setLedgerPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-xs font-semibold px-2">
                  Page {ledgerPage} of {totalLedgerPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-bold text-xs h-8 px-3 cursor-pointer"
                  disabled={ledgerPage === totalLedgerPages}
                  onClick={() => setLedgerPage(p => Math.min(totalLedgerPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* CSV IMPORT RESULTS MODAL DIALOG */}
      {importResults && importResults.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card text-card-foreground border border-border w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center bg-secondary/15">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-lg">CSV Stock Import Summary</h3>
              </div>
              <button 
                onClick={() => setImportResults(null)}
                className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-5 text-sm leading-relaxed">
              {/* Summary Alerts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Successful Updates</span>
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {importResults.successCount}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">Stock levels modified successfully.</p>
                </div>
                <div className="p-4 rounded-lg bg-zinc-500/10 border border-zinc-500/20">
                  <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">Skipped (No Change)</span>
                  <span className="text-3xl font-black text-zinc-600 dark:text-zinc-400 mt-1 block">
                    {importResults.skippedCount}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">Stock matches current levels.</p>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Errors / Warnings</span>
                  <span className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                    {importResults.errors.length}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">Lines that could not be processed.</p>
                </div>
              </div>

              {/* Informative Alert for New Products */}
              {importResults.errors.some(e => e.reason === "SKU Not Found") && (
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/25 flex gap-3 text-xs">
                  <AlertTriangle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-blue-700 dark:text-blue-400 block">Sourcing New Inventory?</span>
                    <p className="text-muted-foreground leading-normal">
                      Stock adjustments can only be applied to **existing** catalog SKUs. If you are importing new inventory lines or new variations (different colors, sizes, or weights), you must add them first.
                    </p>
                    <div className="flex gap-4 pt-1.5 font-bold">
                      <Link href="/admin/products/new" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                        Add New Product <ArrowRight className="h-3 w-3" />
                      </Link>
                      <Link href="/admin/products" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                        Manage Existing Products <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Details Log */}
              {importResults.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase text-muted-foreground tracking-wider">Detailed Error Logs</h4>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="max-h-60 overflow-y-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-secondary/40 font-bold text-muted-foreground border-b uppercase text-[9px]">
                          <tr>
                            <th className="px-4 py-2 text-center w-12">Line</th>
                            <th className="px-4 py-2 w-28">SKU</th>
                            <th className="px-4 py-2 w-32">Error Type</th>
                            <th className="px-4 py-2">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {importResults.errors.map((err, idx) => (
                            <tr key={idx} className="hover:bg-secondary/5">
                              <td className="px-4 py-2.5 text-center font-mono font-medium text-muted-foreground">{err.line}</td>
                              <td className="px-4 py-2.5 font-mono font-bold text-foreground">{err.sku}</td>
                              <td className="px-4 py-2.5">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
                                  err.reason === "SKU Not Found" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400" :
                                  err.reason === "Invalid Stock Value" ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400" :
                                  "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400"
                                }`}>
                                  {err.reason}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-muted-foreground leading-normal">
                                {err.detail}
                                {err.reason === "SKU Not Found" && (
                                  <Link 
                                    href="/admin/products/new" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline font-bold inline-flex items-center gap-0.5 ml-1"
                                  >
                                    Add product/variant <ArrowRight className="h-2.5 w-2.5" />
                                  </Link>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-end bg-secondary/15">
              <Button 
                onClick={() => setImportResults(null)}
                className="font-bold text-xs h-9 cursor-pointer"
              >
                Close Summary
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

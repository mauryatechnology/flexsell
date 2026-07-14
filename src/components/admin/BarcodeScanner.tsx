"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { useProductStore } from "@/stores/productStore";
import { Barcode } from "@/components/ui/Barcode";
import { formatPrice } from "@/lib/utils";
import { X, Search, QrCode, ArrowRight, Minus, Plus } from "lucide-react";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BarcodeScanner({ isOpen, onClose }: BarcodeScannerProps) {
  const { products, updateProduct } = useProductStore();
  const [scanInput, setScanInput] = React.useState("");
  const [scannedProduct, setScannedProduct] = React.useState<any>(null);
  const [errorMsg, setErrorMsg] = React.useState("");

  // Auto-focus input on open
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setScanInput("");
      setScannedProduct(null);
      setErrorMsg("");
    }
  }, [isOpen]);

  const handleScanSearch = (barcodeVal: string) => {
    setErrorMsg("");
    const cleaned = barcodeVal.trim().toUpperCase();
    if (!cleaned) return;

    // Search product where value matches SKU-FSI combination
    const found = products.find(p => {
      const matchKey = `${p.sku}-${p.fsiNo}`.toUpperCase().replace(/[^A-Z0-9]/g, "");
      const searchKey = cleaned.replace(/[^A-Z0-9]/g, "");
      return matchKey === searchKey || p.sku.toUpperCase() === cleaned || p.fsiNo.toUpperCase() === cleaned;
    });

    if (found) {
      setScannedProduct(found);
      setScanInput(`${found.sku}-${found.fsiNo}`);
    } else {
      setScannedProduct(null);
      setErrorMsg(`Barcode "${barcodeVal}" not matched in active B2B inventory.`);
    }
  };

  const handleStockChange = (amount: number) => {
    if (!scannedProduct) return;
    const newStock = Math.max(0, scannedProduct.stock + amount);
    updateProduct(scannedProduct._id, { stock: newStock });
    
    // Update local state to reflect change instantly
    setScannedProduct((prev: any) => ({ ...prev, stock: newStock }));
  };

  // Generate warehouse storage location based on Category ID
  const getWarehouseLocation = (catId: string) => {
    const sections: Record<string, string> = {
      cat_kitchen_tools: "Aisle A, Rack 04 (Kitchen Goods)",
      cat_home_cleaning: "Aisle A, Rack 12 (Cleaning Supplies)",
      cat_electronics: "Aisle B, Rack 02 (Electronics)",
      cat_beauty: "Aisle C, Rack 08 (Cosmetics)",
      cat_fashion: "Aisle D, Rack 15 (Apparel)",
      cat_hardware: "Aisle E, Rack 03 (Tools & DIY)",
      cat_toys: "Aisle F, Rack 09 (Kids Section)"
    };
    return sections[catId] || "Aisle G, Rack 01 (General Cargo)";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm text-foreground">
      <div className="relative w-full max-w-2xl bg-background rounded-xl border border-border shadow-lg flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Simulated Barcode Scanner (FSI-SKU lookup)</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Scanner Input field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Laser Scan Input (Paste barcode value)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  placeholder="e.g. FS-HK-CHOP12-001-FSI-89000137-07"
                  className="pl-9 text-foreground font-mono uppercase text-sm"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleScanSearch(scanInput);
                  }}
                />
              </div>
              <Button onClick={() => handleScanSearch(scanInput)}>Trigger Scan</Button>
            </div>
            {errorMsg && <p className="text-xs text-destructive font-medium">{errorMsg}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Quick Simulation Dropdown */}
            <div className="md:col-span-1 space-y-2 border-r pr-4">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Product to Scan</label>
              <div className="space-y-1 max-h-48 overflow-y-auto border rounded-md p-2 bg-secondary/15">
                {products.slice(0, 10).map((prod) => {
                  const bcValue = `${prod.sku}-${prod.fsiNo}`;
                  return (
                    <button
                      key={prod._id}
                      onClick={() => handleScanSearch(bcValue)}
                      className="w-full text-left p-1.5 text-xs rounded hover:bg-primary/10 transition-colors truncate font-mono text-foreground"
                    >
                      {prod.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Columns: Scanned Details */}
            <div className="md:col-span-2">
              {scannedProduct ? (
                <div className="space-y-6">
                  <div className="flex gap-4 items-start border-b pb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-base leading-tight">{scannedProduct.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">SKU: {scannedProduct.sku}</p>
                      <p className="text-xs text-muted-foreground">FSI: {scannedProduct.fsiNo}</p>
                    </div>
                    {/* Small Barcode display */}
                    <Barcode sku={scannedProduct.sku} fsiNo={scannedProduct.fsiNo} />
                  </div>

                  {/* Stock Audit Controls */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/20 p-4 rounded-xl border border-border">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Current Stock</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className={`text-3xl font-extrabold ${
                          scannedProduct.stock > 25 ? "text-success" :
                          scannedProduct.stock > 10 ? "text-yellow-600 dark:text-yellow-500" :
                          "text-destructive"
                        }`}>{scannedProduct.stock}</span>
                        <span className="text-xs text-muted-foreground">units</span>
                      </div>
                    </div>

                    <div className="bg-secondary/20 p-4 rounded-xl border border-border">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Storage Bin Location</p>
                      <p className="text-sm font-bold text-foreground mt-2">{getWarehouseLocation(scannedProduct.categoryId)}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick Inventory Adjustment (Audit):</label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleStockChange(-10)} className="flex-1">
                        <Minus className="h-3 w-3 mr-1" /> 10
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleStockChange(-1)} className="flex-1">
                        <Minus className="h-3 w-3 mr-1" /> 1
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleStockChange(1)} className="flex-1">
                        <Plus className="h-3 w-3 mr-1" /> 1
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleStockChange(10)} className="flex-1">
                        <Plus className="h-3 w-3 mr-1" /> 10
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-4 flex justify-between items-center text-sm">
                    <div>
                      <span className="text-muted-foreground">Price: </span>
                      <span className="font-bold text-foreground">{formatPrice(scannedProduct.price)}</span>
                    </div>
                    <div className="text-xs text-success bg-success/15 px-2.5 py-1 rounded-full font-semibold">
                      Fulfillments Enabled
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col justify-center items-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl bg-secondary/5">
                  <QrCode className="h-12 w-12 text-muted-foreground/30 animate-pulse mb-3" />
                  <p className="text-sm text-center max-w-xs">
                    Please use the search field, scan a barcode, or click one of the quick simulation products on the left.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t bg-secondary/10 rounded-b-xl">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}

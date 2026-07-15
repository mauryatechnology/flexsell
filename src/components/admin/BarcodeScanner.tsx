"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { useProductStore } from "@/stores/productStore";
import { useToastStore } from "@/stores/toastStore";
import { Barcode } from "@/components/ui/Barcode";
import { formatPrice } from "@/lib/utils";
import { X, Search, QrCode, ArrowRight, Minus, Plus, Camera, CameraOff } from "lucide-react";
import { Product, ColorVariant, SubVariant } from "@/types";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BarcodeScanner({ isOpen, onClose }: BarcodeScannerProps) {
  const { products, updateProduct } = useProductStore();
  const [scanInput, setScanInput] = React.useState("");
  const [scannedProduct, setScannedProduct] = React.useState<Product | null>(null);
  const [scannedVariant, setScannedVariant] = React.useState<ColorVariant | null>(null);
  const [scannedSubVariant, setScannedSubVariant] = React.useState<SubVariant | null>(null);
  const [errorMsg, setErrorMsg] = React.useState("");

  // Camera states
  const [isScanning, setIsScanning] = React.useState(false);
  const html5QrcodeRef = React.useRef<any>(null);

  // Stop camera function
  const stopCamera = React.useCallback(async () => {
    if (html5QrcodeRef.current) {
      try {
        if (html5QrcodeRef.current.isScanning) {
          await html5QrcodeRef.current.stop();
        }
      } catch (err) {
        console.error("Failed to stop camera scanner:", err);
      } finally {
        html5QrcodeRef.current = null;
        setIsScanning(false);
      }
    }
  }, []);

  // Start camera function
  const startCamera = async () => {
    setErrorMsg("");
    try {
      // Request media camera permission explicitly first
      if (typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Release hardware track instantly
        tempStream.getTracks().forEach(track => track.stop());
      } else {
        throw new Error("Camera API is not supported in this browser.");
      }

      // Set scanning state first, so React renders the video div container in the DOM
      setIsScanning(true);

      // Wait for React to render and commit the element to the DOM
      setTimeout(async () => {
        try {
          const { Html5Qrcode } = await import("html5-qrcode");
          
          // Re-verify that the scanning was not cancelled during the tick
          const container = document.getElementById("scanner-video-feed");
          if (!container) {
            console.error("scanner-video-feed element not found in DOM yet");
            return;
          }

          await stopCamera();

          const scanner = new Html5Qrcode("scanner-video-feed");
          html5QrcodeRef.current = scanner;

          await scanner.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: (width, height) => {
                const boxWidth = Math.min(width * 0.85, 280);
                const boxHeight = Math.min(height * 0.45, 110);
                return { width: boxWidth, height: boxHeight };
              },
              aspectRatio: 1.333333
            },
            (decodedText) => {
              handleScanSearch(decodedText);
              stopCamera();
            },
            (error) => {
              // Keep searching
            }
          );
        } catch (delayedErr) {
          console.error("Delayed camera start failed:", delayedErr);
          setErrorMsg("Failed to initialize video scanner feed.");
          setIsScanning(false);
        }
      }, 150);

    } catch (err: any) {
      console.error("Camera scanner failed to start:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMsg("Camera permission denied. Please allow camera access in browser settings.");
      } else {
        setErrorMsg("Camera access failed. Ensure a camera is connected and enabled.");
      }
      setIsScanning(false);
    }
  };

  // Auto-focus input on open & clean up camera
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setScanInput("");
      setScannedProduct(null);
      setErrorMsg("");
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, stopCamera]);

  const handleScanSearch = (barcodeVal: string) => {
    setErrorMsg("");
    const cleaned = barcodeVal.trim().toUpperCase();
    if (!cleaned) return;

    let foundProduct = null;
    let foundVariant = null;
    let foundSubVariant = null;

    for (const p of products) {
      for (const cv of p.colorVariants || []) {
        const matchSub = cv.subVariants?.find(sv => 
          sv.sku.toUpperCase() === cleaned || 
          (sv.barcode && sv.barcode.toUpperCase() === cleaned)
        );
        if (matchSub) {
          foundProduct = p;
          foundVariant = cv;
          foundSubVariant = matchSub;
          break;
        }
      }
      if (foundProduct) break;
    }

    if (foundProduct && foundVariant && foundSubVariant) {
      setScannedProduct(foundProduct);
      setScannedVariant(foundVariant);
      setScannedSubVariant(foundSubVariant);
      setScanInput(foundSubVariant.sku);
      useToastStore.getState().addToast(`Matched variant: ${foundProduct.title} (${foundVariant.color} - ${foundSubVariant.size} / ${foundSubVariant.weight})`, "success");
    } else {
      setScannedProduct(null);
      setScannedVariant(null);
      setScannedSubVariant(null);
      setErrorMsg(`Barcode "${barcodeVal}" not matched in active B2B variants inventory.`);
      useToastStore.getState().addToast(`Barcode lookup failed.`, "error");
    }
  };

  const handleStockChange = (amount: number) => {
    if (!scannedProduct || !scannedVariant || !scannedSubVariant) return;
    const newStock = Math.max(0, scannedSubVariant.stock + amount);
    
    const updatedVariants = scannedProduct.colorVariants.map((cv: ColorVariant) => {
      if (cv.color === scannedVariant.color) {
        const updatedSubs = (cv.subVariants || []).map((sv) => 
          sv.id === scannedSubVariant.id ? { ...sv, stock: newStock } : sv
        );
        return { ...cv, subVariants: updatedSubs };
      }
      return cv;
    });

    const totalStock = updatedVariants.reduce((sum: number, cv: ColorVariant) => 
      sum + (cv.subVariants?.reduce((sSum, sv) => sSum + sv.stock, 0) || 0)
    , 0);

    const updatedProduct = {
      ...scannedProduct,
      totalStock,
      colorVariants: updatedVariants
    };

    updateProduct(scannedProduct._id, updatedProduct);
    
    // Update local state to reflect change instantly
    setScannedProduct(updatedProduct);
    setScannedSubVariant({ ...scannedSubVariant, stock: newStock });
    useToastStore.getState().addToast(`Stock level adjusted to ${newStock} units.`, "success");
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
              <Button
                type="button"
                variant={isScanning ? "destructive" : "secondary"}
                onClick={isScanning ? stopCamera : startCamera}
                className="flex items-center gap-2"
              >
                {isScanning ? (
                  <>
                    <CameraOff className="h-4 w-4" /> Stop Cam
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" /> Live Camera Scan
                  </>
                )}
              </Button>
            </div>
            {errorMsg && <p className="text-xs text-destructive font-medium">{errorMsg}</p>}
          </div>

          {isScanning && (
            <div className="relative w-full max-w-lg mx-auto aspect-[4/3] rounded-xl overflow-hidden border border-primary/30 bg-black flex flex-col items-center justify-center">
              <div id="scanner-video-feed" className="w-full h-full"></div>
              {/* Laser scanning visual animation line */}
              <div className="absolute inset-x-0 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-bounce top-1/2"></div>
              <div className="absolute bottom-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">
                Align barcode inside the central window
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Quick Simulation Dropdown */}
            <div className="md:col-span-1 space-y-2 border-r pr-4">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Product to Scan</label>
              <div className="space-y-1 max-h-48 overflow-y-auto border rounded-md p-2 bg-secondary/15">
                {products.slice(0, 10).map((prod) => {
                  const bcValue = prod.colorVariants?.[0]?.subVariants?.[0]?.sku || prod._id;
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
              {scannedProduct && scannedVariant && scannedSubVariant ? (
                <div className="space-y-6">
                  <div className="flex gap-4 items-start border-b pb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-base leading-tight">{scannedProduct.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">SKU: {scannedSubVariant.sku}</p>
                      <p className="text-xs text-muted-foreground">Color: {scannedVariant.color} | Size: {scannedSubVariant.size} | Weight: {scannedSubVariant.weight}</p>
                    </div>
                    {/* Small Barcode display */}
                    <Barcode sku={scannedSubVariant.sku} />
                  </div>

                  {/* Stock Audit Controls */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/20 p-4 rounded-xl border border-border">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Current Stock</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className={`text-3xl font-extrabold ${
                          scannedSubVariant.stock > 25 ? "text-success" :
                          scannedSubVariant.stock > 10 ? "text-yellow-600 dark:text-yellow-500" :
                          "text-destructive"
                        }`}>{scannedSubVariant.stock}</span>
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
                      <span className="font-bold text-foreground">{formatPrice(scannedSubVariant.price)}</span>
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

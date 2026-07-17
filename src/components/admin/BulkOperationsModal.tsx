"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Download,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Loader2,
  X,
  FileSpreadsheet,
  Trash2,
  QrCode
} from "lucide-react";
import { Product, Category, HsnRecord } from "@/types";
import { type ExcelValidationError } from "@/lib/excelHelper";
import { useToastStore } from "@/stores/toastStore";

interface BulkOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
  hsns: HsnRecord[];
  selectedProductIds: string[];
  onImportSuccess: () => void;
  onBulkDelete: () => void;
  onBulkPrintBarcodes: () => void;
}

export function BulkOperationsModal({
  isOpen,
  onClose,
  products,
  categories,
  hsns,
  selectedProductIds,
  onImportSuccess,
  onBulkDelete,
  onBulkPrintBarcodes
}: BulkOperationsModalProps) {
  const { addToast } = useToastStore();
  
  const [dragActive, setDragActive] = React.useState(false);
  const [isParsing, setIsParsing] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  
  const [parsedData, setParsedData] = React.useState<any[] | null>(null);
  const [validationErrors, setValidationErrors] = React.useState<ExcelValidationError[]>([]);
  const [fileInfo, setFileInfo] = React.useState<{ name: string; size: number } | null>(null);
  const [importStats, setImportStats] = React.useState<{
    productsCount: number;
    variantsCount: number;
    combinationsCount: number;
  } | null>(null);

  // Reset state when opening/closing
  React.useEffect(() => {
    if (!isOpen) {
      setParsedData(null);
      setValidationErrors([]);
      setFileInfo(null);
      setImportStats(null);
      setIsParsing(false);
      setIsUploading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const downloadFromServer = async (url: string, defaultFilename: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      const errJson = await response.json();
      throw new Error(errJson.message || "Failed to download file from server");
    }
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = defaultFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  };

  const processFile = async (file: File) => {
    if (!file) return;
    
    // Check extension
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "xlsx" && ext !== "xls") {
      addToast("Unsupported file format. Please upload an Excel (.xlsx) file.", "error");
      return;
    }

    setFileInfo({ name: file.name, size: file.size });
    setIsParsing(true);
    setValidationErrors([]);
    setParsedData(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/products/import", {
        method: "POST",
        body: formData,
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || "Failed to parse Excel file.");
      }

      setValidationErrors(resJson.errors || []);
      setParsedData(resJson.products || []);
      setImportStats(resJson.stats || null);
    } catch (err: any) {
      addToast(err.message || "Failed to parse Excel file.", "error");
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleExportTemplate = async () => {
    try {
      const now = new Date();
      const timestamp = now.toISOString().replace(/[-:T]/g, "").slice(0, 14);
      await downloadFromServer(`/api/products/export?template=true`, `flexsell_add_products_${timestamp}.xlsx`);
      addToast("Excel template downloaded successfully.", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to download template.", "error");
    }
  };

  const handleExportSelected = async () => {
    if (selectedProductIds.length === 0) {
      addToast("No products selected. Please select products to export.", "warning");
      return;
    }
    try {
      const now = new Date();
      const timestamp = now.toISOString().replace(/[-:T]/g, "").slice(0, 14);
      await downloadFromServer(
        `/api/products/export?ids=${selectedProductIds.join(",")}`,
        `flexsell_update_products_${timestamp}.xlsx`
      );
      addToast(`Exported selected products successfully.`, "success");
    } catch (err: any) {
      addToast(err.message || "Failed to export products.", "error");
    }
  };

  const handleConfirmUpload = async () => {
    if (!parsedData || parsedData.length === 0) return;

    setIsUploading(true);
    try {
      const response = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: parsedData })
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || "Failed to import products.");
      }

      const { summary } = resJson;
      const successMsg = `Import completed! Inserted: ${summary.inserted}, Updated: ${summary.updated}.`;
      
      if (summary.errors && summary.errors.length > 0) {
        addToast(`${successMsg} Note: ${summary.errors.length} rows failed.`, "warning");
        // Print errors in console for debugging
        console.error("Bulk Import Row Failures:", summary.errors);
      } else {
        addToast(successMsg, "success");
      }

      onImportSuccess();
      onClose();
    } catch (err: any) {
      addToast(err.message || "Error importing products.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Determine validation status
  const criticalErrors = validationErrors.filter((e) => e.type === "error");
  const warnings = validationErrors.filter((e) => e.type === "warning");
  const hasErrors = criticalErrors.length > 0;
  const hasWarnings = warnings.length > 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full border-border max-h-[90vh] flex flex-col bg-background shadow-2xl relative animate-in zoom-in-95 duration-250">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary/40"
        >
          <X className="h-5 w-5" />
        </button>

        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileSpreadsheet className="h-5.5 w-5.5 text-primary" />
            <span>Bulk Product Operations</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Export & Actions Panel */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border/80 bg-secondary/10 p-5 rounded-xl flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-foreground">A. Add New Products</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Download a blank Excel template structured with correct headers, descriptions, and reference tabs to start fresh.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportTemplate}
                  className="mt-4 font-semibold w-full flex items-center justify-center gap-1.5"
                >
                  <Download className="h-4 w-4" /> Download Blank Template
                </Button>
              </div>

              <div className="border border-border/80 bg-secondary/10 p-5 rounded-xl flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-foreground">B. Update Existing Products</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Export selected products in catalog to modify titles, descriptions, pricing, inventory, or variants, then re-import.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportSelected}
                  disabled={selectedProductIds.length === 0}
                  className="mt-4 font-semibold w-full flex items-center justify-center gap-1.5"
                >
                  <Download className="h-4 w-4" /> 
                  Export Selected ({selectedProductIds.length})
                </Button>
              </div>
            </div>

            {/* Selected Products Batch Actions */}
            {selectedProductIds.length > 0 && (
              <div className="border border-primary/20 bg-primary/5 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
                <div>
                  <h3 className="font-bold text-xs text-primary flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-black">
                      {selectedProductIds.length}
                    </span>
                    Selected Products Actions
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Execute catalog or barcode operations on the selected batch.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportSelected}
                    className="text-xs font-semibold flex items-center gap-1.5 bg-background"
                  >
                    <Download className="h-3.5 w-3.5" /> Export Data
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onBulkPrintBarcodes}
                    className="text-xs font-semibold flex items-center gap-1.5 bg-background text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  >
                    <QrCode className="h-3.5 w-3.5" /> Print Barcodes
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onBulkDelete();
                    }}
                    className="text-xs font-bold flex items-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete Selected
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border/60 my-6"></div>

          {/* Import Drag & Drop Zone */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-foreground">C. Import Excel File</h3>
            <p className="text-xs text-muted-foreground">
              Upload your completed template or update sheet to process database additions/edits.
            </p>

            {!fileInfo ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer ${
                  dragActive 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50 hover:bg-secondary/10"
                }`}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                />
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">Click to upload or drag & drop</p>
                  <p className="text-xs text-muted-foreground mt-1">Excel files (.xlsx, .xls)</p>
                </div>
              </div>
            ) : (
              <div className="border rounded-xl p-4 bg-secondary/15 flex items-center justify-between border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-lg">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold truncate max-w-[250px] md:max-w-[400px]">{fileInfo.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{(fileInfo.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFileInfo(null);
                      setParsedData(null);
                      setValidationErrors([]);
                      setImportStats(null);
                    }}
                    className="text-xs text-destructive hover:bg-destructive/10 font-bold"
                  >
                    Change File
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Parsing States */}
          {isParsing && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground font-semibold">Parsing and validating Excel file...</span>
            </div>
          )}

          {/* Validation Results & Collision Dialog List */}
          {parsedData && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Summary Header - Detailed Import Information Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-secondary/10 border p-4 rounded-xl text-xs border-border">
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Total Products</span>
                  <span className="text-base font-black text-foreground">{importStats?.productsCount || 0}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Color Variants</span>
                  <span className="text-base font-black text-foreground">{importStats?.variantsCount || 0}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Total SKU Combos</span>
                  <span className="text-base font-black text-foreground">{importStats?.combinationsCount || 0}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Validation Status</span>
                  <div className="flex items-center gap-1.5 font-bold mt-0.5">
                    {hasErrors ? (
                      <span className="flex items-center gap-1 text-destructive">
                        <XCircle className="h-3.5 w-3.5" /> {criticalErrors.length} Errors
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-success">
                        <CheckCircle className="h-3.5 w-3.5" /> {hasWarnings ? "Valid w/ Warnings" : "Ready to Import"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Validation Logs / Duplicate Error List */}
              {validationErrors.length > 0 && (
                <div className="border border-border/80 rounded-xl overflow-hidden">
                  <div className="bg-secondary/40 px-4 py-2 border-b flex items-center justify-between">
                    <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">Validation Errors & Warnings</span>
                    <span className="text-[10px] text-muted-foreground">Fix errors to enable upload</span>
                  </div>
                  <div className="divide-y max-h-[220px] overflow-y-auto">
                    {validationErrors.map((err, i) => (
                      <div key={i} className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                        <div className="flex items-start gap-2.5">
                          {err.type === "error" ? (
                            <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-bold text-foreground">
                              Row {err.row} | Column: <span className="underline">{err.column}</span>
                            </p>
                            <p className="text-muted-foreground mt-0.5">{err.message}</p>
                          </div>
                        </div>
                        {err.productId && (
                          <a
                            href={`/admin/products/${err.productId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="self-start sm:self-center shrink-0"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[10px] h-7 px-2 font-black flex items-center gap-1 text-primary border-primary/20 hover:border-primary hover:bg-primary/5"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Product
                            </Button>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload warning alert */}
              {!hasErrors && hasWarnings && (
                <div className="p-3 bg-warning/10 border border-warning/20 text-warning rounded-lg text-xs flex gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="font-semibold">
                    The sheet has warnings but can still be uploaded. Unrecognized categories or HSN records will fall back to default values.
                  </p>
                </div>
              )}
            </div>
          )}

        </CardContent>

        {/* Modal Footer */}
        <div className="border-t px-6 py-4 bg-secondary/20 rounded-b-2xl flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          
          {parsedData && (
            <Button
              onClick={handleConfirmUpload}
              disabled={hasErrors || isUploading || isParsing || parsedData.length === 0}
              className="bg-primary hover:bg-primary/95 text-white font-bold flex items-center gap-1.5 min-w-[120px]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Importing...
                </>
              ) : (
                <>
                  Confirm & Upload
                </>
              )}
            </Button>
          )}
        </div>

      </Card>
    </div>
  );
}

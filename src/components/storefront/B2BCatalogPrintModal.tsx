"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Product, Category } from "@/types";
import { Button } from "@/components/ui/Button";
import { Printer, X, QrCode, Building2, Mail, Calendar, ShieldCheck, Layers } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface B2BCatalogPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories?: Category[];
  catalogTitle: string;
  filterSummary?: string;
}

export function B2BCatalogPrintModal({
  isOpen,
  onClose,
  products,
  categories = [],
  catalogTitle,
  filterSummary,
}: B2BCatalogPrintModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const [currentUrl, setCurrentUrl] = React.useState<string>("");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (typeof window !== "undefined" && isOpen) {
      setCurrentUrl(window.location.href);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const formattedDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getPrimaryImage = (product: Product): string => {
    if (!product.colorVariants || product.colorVariants.length === 0) return "/icon.png";
    const primaryColor = product.colorVariants[0];
    if (!primaryColor.images || primaryColor.images.length === 0) return "/icon.png";
    const img = primaryColor.images[0];
    return typeof img === "string" ? img : img.url || "/icon.png";
  };

  const getCategoryName = (categoryId: string): string => {
    const found = categories.find((c) => c._id === categoryId);
    return found ? found.name : "Wholesale Goods";
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.print();
  };

  const modalContent = (
    <div className="b2b-print-modal-portal fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      
      {/* Screen Controls Header (Hidden on Print) */}
      <div className="no-print fixed top-4 right-4 z-50 flex items-center gap-3 bg-background/90 border border-border backdrop-blur-md p-2 rounded-xl shadow-2xl">
        <Button onClick={handlePrint} size="sm" className="gap-2 bg-primary text-primary-foreground font-semibold">
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </Button>
        <Button onClick={onClose} variant="outline" size="sm" className="gap-1 text-muted-foreground">
          <X className="h-4 w-4" />
          Close
        </Button>
      </div>

      {/* Isolated Printable Catalog Document Container */}
      <div
        id="printable-b2b-catalog"
        className="bg-background text-foreground w-full max-w-5xl rounded-2xl border border-border shadow-2xl overflow-hidden my-auto"
      >
        {/* Printable Section Header */}
        <div className="p-6 md:p-8 bg-card border-b border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            
            {/* Left Header: Brand & Catalog Information */}
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
                  FlexSell Wholesale
                </span>
                <span className="text-xs text-muted-foreground font-mono">B2B Sourcing Specification</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight uppercase">
                {catalogTitle}
              </h1>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground pt-2 font-medium">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Date: {formattedDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Total Items: {products.length} Products</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>GSTIN: 23AAAAA0000A1Z5</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>sales@flexsellwholesale.com</span>
                </div>
              </div>

              {filterSummary && (
                <p className="text-xs text-primary font-semibold pt-1">
                  Active Filter Scope: {filterSummary}
                </p>
              )}
            </div>

            {/* Right Header: Dynamic QR Code Header */}
            <div className="flex flex-col items-center justify-center p-3 bg-secondary/30 rounded-xl border border-border/60 text-center shrink-0">
              {currentUrl ? (
                <QRCodeSVG value={currentUrl} size={92} level="M" includeMargin={false} />
              ) : (
                <div className="w-[92px] h-[92px] bg-secondary flex items-center justify-center rounded">
                  <QrCode className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <span className="text-[10px] font-bold text-foreground mt-2 max-w-[130px] leading-tight">
                Scan to View Live Interactive Catalog
              </span>
              <span className="text-[9px] text-muted-foreground font-mono mt-0.5">
                Direct Bulk Sourcing
              </span>
            </div>

          </div>
        </div>

        {/* Structured Product Catalog Table */}
        <div className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-secondary/40 border-b border-border text-foreground font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-3 w-16 text-center">Image</th>
                  <th className="p-3">Product Specs & SKU</th>
                  <th className="p-3 w-28">Category & HSN</th>
                  <th className="p-3 w-32 text-right">Wholesale Bulk Price</th>
                  <th className="p-3 w-24 text-center">MOQ / Stock</th>
                  <th className="p-3 w-36">Variants & Colors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product, idx) => {
                  const primaryColor = product.colorVariants?.[0];
                  const primarySub = primaryColor?.subVariants?.[0];

                  const b2bPrice = primarySub?.b2bPrice ?? primarySub?.b2cPrice ?? 0;
                  const mrp = primarySub?.mrp ?? 0;
                  const moq = primarySub?.b2bMoq ?? 1;
                  const sku = primarySub?.sku ?? "SKU-N/A";
                  const hsn = product.hsnCode ?? "3924";
                  const gst = product.gstRate ?? 18;
                  const imageUrl = getPrimaryImage(product);

                  const availableColors = product.colorVariants?.map((cv) => cv.color).join(", ") || "Standard";
                  const availableSizes = primaryColor?.subVariants?.map((sv) => sv.size).filter((s) => s && s !== "Standard").join(", ");

                  return (
                    <tr key={product._id || idx} className="hover:bg-secondary/10 transition-colors print-avoid-break">
                      
                      {/* Thumbnail Image */}
                      <td className="p-3 text-center align-top">
                        <div className="w-14 h-14 relative rounded-lg border border-border overflow-hidden bg-secondary/20 mx-auto shrink-0">
                          <img
                            src={imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </td>

                      {/* Title & SKU */}
                      <td className="p-3 align-top space-y-1">
                        <p className="font-bold text-foreground text-sm line-clamp-2">
                          {product.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground font-mono">
                          <span>SKU: {sku}</span>
                          {product.tags && product.tags.length > 0 && (
                            <span className="text-primary font-sans text-[10px] bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                              {product.tags[0]}
                            </span>
                          )}
                        </div>
                        {product.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 italic font-normal">
                            {product.description.replace(/<[^>]*>?/gm, "")}
                          </p>
                        )}
                      </td>

                      {/* Category & HSN */}
                      <td className="p-3 align-top space-y-1">
                        <p className="font-semibold text-foreground text-xs">
                          {getCategoryName(product.categoryId)}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          HSN: {hsn} ({gst}% GST)
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {product.priceIncludesGst ? "Gst Incl." : "+ GST Extra"}
                        </p>
                      </td>

                      {/* Wholesale Price Breakdown */}
                      <td className="p-3 align-top text-right space-y-0.5">
                        <p className="text-sm font-black text-primary">
                          ₹{b2bPrice.toLocaleString("en-IN")}
                        </p>
                        {mrp > b2bPrice && (
                          <p className="text-[11px] text-muted-foreground line-through">
                            MRP: ₹{mrp.toLocaleString("en-IN")}
                          </p>
                        )}
                        {primarySub?.dropshippingPrice ? (
                          <p className="text-[10px] text-muted-foreground">
                            Dropship: ₹{primarySub.dropshippingPrice}
                          </p>
                        ) : null}
                      </td>

                      {/* MOQ & Stock */}
                      <td className="p-3 align-top text-center space-y-1">
                        <span className="inline-block font-bold text-foreground bg-secondary px-2 py-0.5 rounded text-xs border border-border">
                          MOQ: {moq} pcs
                        </span>
                        <p className="text-[11px] text-muted-foreground font-medium">
                          Stock: {product.totalStock > 0 ? `${product.totalStock} units` : "Out of stock"}
                        </p>
                      </td>

                      {/* Variants & Colors */}
                      <td className="p-3 align-top space-y-1 text-xs text-muted-foreground">
                        <p><span className="font-semibold text-foreground">Colors:</span> {availableColors}</p>
                        {availableSizes && (
                          <p><span className="font-semibold text-foreground">Sizes:</span> {availableSizes}</p>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Commercial Terms & Sourcing Footer */}
        <div className="p-6 bg-secondary/30 border-t border-border text-xs text-muted-foreground space-y-2">
          <div className="flex items-center gap-1.5 text-foreground font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>FlexSell B2B Wholesale Sourcing Terms</span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-[11px] list-disc list-inside">
            <li>Minimum Order Quantity (MOQ) applies per variant as indicated above.</li>
            <li>Prices are subject to market change and availability at checkout.</li>
            <li>Freight charges calculated based on volumetric weight at time of order.</li>
            <li>For customized volume tier orders or OEM packaging, contact sales support.</li>
          </ul>
          <div className="pt-2 text-center text-[10px] text-muted-foreground font-mono border-t border-border/40 mt-3">
            Generated via FlexSell Wholesale Platform • Page Document Ref: FS-CAT-{Date.now().toString().slice(-6)}
          </div>
        </div>

      </div>

      {/* Embedded Strict Print CSS Rule to prevent multiple / duplicate document printing */}
      <style jsx global>{`
        @media print {
          html, body {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            color: black !important;
          }
          body > *:not(.b2b-print-modal-portal) {
            display: none !important;
          }
          .b2b-print-modal-portal {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #printable-b2b-catalog {
            position: static !important;
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

    </div>
  );

  return createPortal(modalContent, document.body);
}

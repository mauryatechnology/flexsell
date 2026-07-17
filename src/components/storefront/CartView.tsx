"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Trash2, ShoppingBag, ShieldCheck, MapPin, FileText } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { useProductStore } from "@/stores/productStore";
import Image from "next/image";

import { INDIAN_STATES } from "@/lib/constants";

export function CartView() {
  const { items, updateQuantity, removeItem, buyerState, setBuyerState, getCartSubtotal, hydrateProducts, getTaxDetails } = useCartStore();

  React.useEffect(() => {
    const initCartProducts = async () => {
      const productState = useProductStore.getState();
      if (productState.products.length === 0) {
        await productState.initializeProducts();
      }
      hydrateProducts();
    };
    initCartProducts();
  }, [hydrateProducts]);

  const taxDetails = React.useMemo(() => {
    return getTaxDetails();
  }, [items, buyerState, getTaxDetails]);

  const { isIntrastate, baseSubtotal, totalCgst, totalSgst, totalIgst, grandTotal, hsnBreakdown } = taxDetails;

  const handleQtyInputChange = (itemId: string, val: string) => {
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      updateQuantity(itemId, parsed);
    }
  };

  const handleQtyBlur = (itemId: string, val: string, minLimit: number) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < minLimit) {
      updateQuantity(itemId, minLimit);
    }
  };

  const handleExportQuote = () => {
    if (items.length === 0) return;
    const printWindow = window.open("/quote", "_blank");
    if (!printWindow) {
      alert("Please allow popups to export the B2B Quote.");
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <div className="bg-secondary/40 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Your B2B Cart is Empty</h2>
        <p className="text-muted-foreground mb-8">Choose from our wholesale catalogue direct from manufacturers.</p>
        <Link href="/products">
          <Button size="lg" className="w-full">Explore All Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-8xl px-4 md:px-6 py-8 text-foreground w-full">
      <div className="mb-6">
        <Link href="/products" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            if (!item.product) {
              return null; // Product data hasn't hydrated yet or product was deleted
            }

            const formattedVariants = Object.entries(item.selectedVariants)
              .map(([key, val]) => `${key}: ${val}`)
              .join(", ");
            const matchingColor = item.selectedVariants["Color"] || item.selectedVariants["color"];
            const activeVariant = item.product.colorVariants?.find(cv => cv.color === matchingColor)
              || item.product.colorVariants?.[0];
            const activeSubVariant = activeVariant?.subVariants?.find(sv =>
              (!item.selectedVariants["Size"] || sv.size === item.selectedVariants["Size"]) &&
              (!item.selectedVariants["Weight"] || sv.weight === item.selectedVariants["Weight"])
            ) || activeVariant?.subVariants?.[0];
            const firstImg = activeVariant?.images?.[0];
            const imgUrl = firstImg ? (typeof firstImg === "string" ? firstImg : firstImg.url || "") : "";
            const sku = activeSubVariant?.sku || "NO SKU";
            const moq = item.product.moq || 1;
            const maxStock = activeSubVariant?.stock || 0;

            return (
              <Card key={item.id} className="border-border">
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                  <div className="w-24 h-24 bg-secondary rounded-md overflow-hidden flex-shrink-0 border relative">
                    <Image
                      src={imgUrl || "https://placehold.co/400x400/10b981/ffffff?text=Product"}
                      alt={item.product.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-foreground line-clamp-2">{item.product.title}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 -mt-1 -mr-1"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono mt-1">
                        <span>SKU: {sku}</span>
                        {item.product.hsnCode && <span>HSN: {item.product.hsnCode} ({item.product.gstRate}% GST)</span>}
                      </div>
                      {formattedVariants && (
                        <p className="text-xs text-primary font-semibold mt-1">{formattedVariants}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-4 mt-4">
                      {/* Quantity Input Box or Out of Stock Badge */}
                      <div className="flex items-center gap-2">
                        {maxStock === 0 ? (
                          <div className="bg-destructive/10 text-destructive text-xs font-bold px-3 py-1 rounded-full border border-destructive/20">
                            Out of Stock
                          </div>
                        ) : (
                          <>
                            <span className="text-xs text-muted-foreground font-medium">Qty:</span>
                            <div className="flex items-center">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 px-0 rounded-r-none text-foreground border-r-0"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= moq}
                              >
                                -
                              </Button>
                              <input
                                type="number"
                                className="h-8 w-16 text-center text-sm font-semibold text-foreground bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                value={item.quantity}
                                onChange={(e) => handleQtyInputChange(item.id, e.target.value)}
                                onBlur={(e) => handleQtyBlur(item.id, e.target.value, moq)}
                                min={moq}
                                max={maxStock}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 px-0 rounded-l-none text-foreground border-l-0"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= maxStock}
                              >
                                +
                              </Button>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              (MOQ: {moq} | Stock: {maxStock})
                            </span>
                          </>
                        )}
                      </div>

                      {/* Pricing Breakdown per Item */}
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(item.pricePerUnit)} each
                          {item.product.priceIncludesGst ? " (incl. GST)" : " (excl. GST)"}
                        </p>
                        <p className="font-bold text-lg text-foreground">
                          {formatPrice(item.pricePerUnit * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Right Side: GST Calculator & Order Summary */}
        <div className="space-y-6">
          {/* Place of Supply State Card */}
          <Card className="border-border">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                <MapPin className="h-5 w-5" />
                <span>Place of Supply (GST Location)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                GST is split dynamically as CGST/SGST (Intrastate) if shipped to Madhya Pradesh, or IGST (Interstate) otherwise.
              </p>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Shipment Destination State:</label>
                <select
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm font-semibold text-foreground focus:ring-2 focus:ring-primary"
                  value={buyerState}
                  onChange={(e) => setBuyerState(e.target.value)}
                >
                  <option value="" disabled>Select a state...</option>
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Totals Card */}
          <Card className="border-border">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-bold text-lg border-b pb-4">Order Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Amount (Excl. GST)</span>
                  <span>{formatPrice(baseSubtotal)}</span>
                </div>

                {/* Intrastate CGST & SGST Split */}
                {isIntrastate ? (
                  <>
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>CGST (Central Tax)</span>
                      <span>{formatPrice(totalCgst)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>SGST (State Tax)</span>
                      <span>{formatPrice(totalSgst)}</span>
                    </div>
                  </>
                ) : (
                  /* Interstate IGST Slabs */
                  <div className="flex justify-between text-blue-600 dark:text-blue-400">
                    <span>IGST (Integrated Tax)</span>
                    <span>{formatPrice(totalIgst)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-success font-semibold">Free Delivery</span>
                </div>
              </div>

              {/* Dynamic HSN Slabs Summary List */}
              {Object.keys(hsnBreakdown).length > 0 && (
                <div className="border-t pt-4 space-y-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">HSN Tax Slab Breakdown</span>
                  <div className="space-y-2.5 max-h-32 overflow-y-auto pr-1">
                    {Object.values(hsnBreakdown).map((slab) => (
                      <div key={slab.hsnCode} className="text-xs flex justify-between items-start border-b border-border/40 pb-2">
                        <div>
                          <span className="font-bold text-foreground block">HSN {slab.hsnCode}</span>
                          <span className="text-muted-foreground text-[10px]">
                            Rate: {slab.gstRate}% | Base: {formatPrice(slab.baseAmount)}
                          </span>
                        </div>
                        <span className="font-semibold text-foreground">{formatPrice(slab.totalTax)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between font-bold text-lg border-t pt-4">
                <span>Grand Total (Incl. GST)</span>
                <span className="text-primary">{formatPrice(grandTotal)}</span>
              </div>

              <div className="space-y-3 mt-6">
                <Link href={buyerState ? "/checkout" : "#"} className="block" onClick={(e) => {
                  if (!buyerState) {
                    e.preventDefault();
                    document.querySelector('select')?.focus();
                  }
                }}>
                  <Button size="lg" className="w-full text-base bg-primary text-primary-foreground hover:opacity-90 font-bold" disabled={!buyerState}>
                    {!buyerState ? "Select State to Checkout" : "Proceed to Checkout"}
                  </Button>
                </Link>

                <Button
                  onClick={handleExportQuote}
                  variant="outline"
                  size="lg"
                  className="w-full text-sm font-semibold border-primary/20 text-primary hover:bg-primary/5 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="h-4.5 w-4.5" /> Export B2B Quote (PDF)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

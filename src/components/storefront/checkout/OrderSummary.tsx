import * as React from "react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

interface OrderSummaryProps {
  items: any[];
  baseSubtotal: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  isIntrastate: boolean;
  couponDiscount: number;
  appliedCoupon: any;
  hsnBreakdown: Record<string, any>;
  grandTotal: number;
  isSubmitting: boolean;
  children?: React.ReactNode; // For CouponInput insertion
}

export function OrderSummary({
  items,
  baseSubtotal,
  totalCgst,
  totalSgst,
  totalIgst,
  isIntrastate,
  couponDiscount,
  appliedCoupon,
  hsnBreakdown,
  grandTotal,
  isSubmitting,
  children
}: OrderSummaryProps) {
  return (
    <div className="p-6 space-y-6">
      <h3 className="font-bold text-lg border-b pb-4 text-foreground">Order Summary</h3>

      <div className="space-y-2 border-b pb-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-muted-foreground max-w-[70%] line-clamp-1">
              {item.product?.title || "Loading Product..."} <span className="text-xs font-semibold text-primary">x{item.quantity}</span>
            </span>
            <span>{formatPrice(item.pricePerUnit * item.quantity)}</span>
          </div>
        ))}
      </div>

      {children}

      <div className="space-y-3 text-sm text-foreground">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Base Subtotal</span>
          <span>{formatPrice(baseSubtotal)}</span>
        </div>

        {isIntrastate ? (
          <>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>CGST (Central GST)</span>
              <span>{formatPrice(totalCgst)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>SGST (State GST)</span>
              <span>{formatPrice(totalSgst)}</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between text-blue-600 dark:text-blue-400">
            <span>IGST (Integrated GST)</span>
            <span>{formatPrice(totalIgst)}</span>
          </div>
        )}

        {couponDiscount > 0 && (
          <div className="flex justify-between text-primary font-bold">
            <span>Coupon Discount ({appliedCoupon?.couponCode})</span>
            <span>-{formatPrice(couponDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-success font-medium">Free Shipping</span>
        </div>
      </div>

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

      <div className="flex justify-between font-bold text-lg border-t pt-4 text-foreground">
        <span>Total to Pay</span>
        <span>{formatPrice(Math.max(0, grandTotal - couponDiscount))}</span>
      </div>

      <Button type="submit" size="lg" className="w-full text-base bg-foreground text-background hover:bg-foreground/90" disabled={isSubmitting}>
        {isSubmitting ? "Placing Order..." : "Confirm Order"}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By placing your order, you agree to our B2B Sourcing Terms of Service and Cargo Liability Rules.
      </p>
    </div>
  );
}

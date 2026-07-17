"use client";

import * as React from "react";
import Link from "next/link";
import { useOrderStore } from "@/stores/orderStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Printer, Truck, Calendar, CheckCircle, Clock, AlertTriangle, FileText, Check } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ClientOrderDetailPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const orderId = resolvedParams.id;

  const { orders, initializeOrders, isLoading } = useOrderStore();
  const [cmsData, setCmsData] = React.useState<any>(null);

  React.useEffect(() => {
    initializeOrders();
    fetch("/api/cms")
      .then(res => res.json())
      .then(data => setCmsData(data))
      .catch(err => console.error("Failed to load CMS data:", err));
  }, [initializeOrders]);

  const order = React.useMemo(() => orders.find(o => o._id === orderId), [orders, orderId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-foreground">
        <h2 className="text-xl font-bold mb-2">Loading Order Invoice...</h2>
        <p className="text-muted-foreground">Retrieving cargo status information.</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-foreground">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-3" />
        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">We couldn't find any order matching ID "{orderId}".</p>
        <Link href="/client/orders">
          <Button><ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders</Button>
        </Link>
      </div>
    );
  }

  // Determine active steps for horizontal stepper
  const steps = ["Placed", "Processing", "Shipped", "Delivered"];
  const currentStepIdx = steps.indexOf(order.status);
  const isCancelled = order.status === "Cancelled";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 container mx-auto px-4 py-8 text-foreground max-w-5xl">
      {/* Back Bar */}
      <div className="flex justify-between items-center no-print">
        <Link href="/client/orders">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Orders
          </Button>
        </Link>
        <Button onClick={handlePrint} variant="outline" className="font-bold flex items-center gap-1.5 shadow-sm">
          <Printer className="h-4 w-4" /> Print Commercial Invoice
        </Button>
      </div>

      {/* Visual Stepper Tracker */}
      {!isCancelled ? (
        <Card className="border border-border p-6 bg-card shadow-sm no-print">
          <div className="relative flex justify-between items-center max-w-3xl mx-auto">
            {/* Connection Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-0" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-500 -z-0" 
              style={{ width: `${(Math.max(0, currentStepIdx) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step, idx) => {
              const isActive = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    isActive 
                      ? "border-primary bg-primary text-primary-foreground font-bold shadow-md" 
                      : "border-muted bg-background text-muted-foreground"
                  } ${isCurrent ? "ring-4 ring-primary/20 scale-110" : ""}`}>
                    {isActive && idx < currentStepIdx ? (
                      <Check className="h-4 w-4 stroke-[3]" />
                    ) : (
                      <span className="text-xs">{idx + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs font-bold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{step}</span>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <Card className="border border-destructive/25 p-4 bg-destructive/5 flex items-center gap-3 no-print">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <p className="text-xs font-bold text-destructive">
            This order has been Cancelled. If you have questions, please reach out to wholesale B2B support.
          </p>
        </Card>
      )}

      {/* Order details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Items details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Invoice Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              {/* Billing and shipping Address info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pb-4 border-b">
                <div>
                  <h4 className="font-bold text-[10px] text-muted-foreground uppercase mb-1">Shipping To:</h4>
                  <p className="font-bold">{order.customerName}</p>
                  {order.shippingAddress.company && (
                    <p className="text-muted-foreground font-semibold">{order.shippingAddress.company}</p>
                  )}
                  <p className="text-muted-foreground mt-1">{order.shippingAddress.address}</p>
                  <p className="text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pinCode}</p>
                </div>
                <div>
                  <h4 className="font-bold text-[10px] text-muted-foreground uppercase mb-1">Billing Details:</h4>
                  <p className="text-muted-foreground">Order Ref ID: <span className="font-mono font-bold text-foreground">{order._id}</span></p>
                  <p className="text-muted-foreground mt-0.5">Order Date: {order.date}</p>
                  <p className="text-muted-foreground">GST Status: {cmsData?.commerceSettings?.defaultTaxRate || 18}% GST claimable invoice</p>
                  {order.shippingAddress.gstin && (
                    <p className="font-mono font-bold text-primary mt-1">Customer GSTIN: {order.shippingAddress.gstin}</p>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <h4 className="font-bold text-[10px] text-muted-foreground uppercase">Invoice Items:</h4>
                <div className="divide-y border rounded-lg overflow-hidden bg-secondary/5">
                  {order.items.map((item) => {
                    const matchingColor = item.selectedVariants?.["Color"] || item.selectedVariants?.["color"];
                    const activeVariant = item.product.colorVariants?.find(cv => cv.color === matchingColor) 
                      || item.product.colorVariants?.[0];
                    const activeSubVariant = activeVariant?.subVariants?.find(sv => 
                      (!item.selectedVariants?.["Size"] || sv.size === item.selectedVariants?.["Size"]) &&
                      (!item.selectedVariants?.["Weight"] || sv.weight === item.selectedVariants?.["Weight"])
                    ) || activeVariant?.subVariants?.[0];
                    const sku = activeSubVariant?.sku || "NO SKU";
                    const formattedVariants = Object.entries(item.selectedVariants || {})
                      .map(([key, val]) => `${key}: ${val}`)
                      .join(" • ");

                    return (
                      <div key={item.id} className="p-4 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-foreground">{item.product.title}</p>
                          <p className="text-muted-foreground mt-1 font-mono">
                            SKU: {sku} | Option: {formattedVariants}
                          </p>
                          <p className="text-muted-foreground mt-0.5 font-semibold">Qty: {item.quantity} x {formatPrice(item.pricePerUnit)}</p>
                        </div>
                        <span className="font-bold text-foreground text-sm">{formatPrice(item.pricePerUnit * item.quantity)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="flex flex-col md:flex-row md:justify-between items-start gap-6 pt-4 border-t">
                <div className="text-[10px] text-muted-foreground max-w-sm">
                  <p className="font-semibold uppercase text-foreground mb-0.5">Note:</p>
                  <p>Invoices are inclusive of standard {cmsData?.commerceSettings?.defaultTaxRate || 18}% GST. GSTIN claims are processed during invoice download validation.</p>
                  {cmsData?.brandSettings?.gstin && (
                    <p className="mt-1 font-semibold text-foreground">Seller GSTIN: {cmsData.brandSettings.gstin}</p>
                  )}
                  {cmsData?.brandSettings?.companyAddress && (
                    <p className="text-muted-foreground">Office: {cmsData.brandSettings.companyAddress}</p>
                  )}
                </div>
                <div className="w-full md:w-56 space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxable Base Value:</span>
                    <span>{formatPrice(order.amount / (1 + (cmsData?.commerceSettings?.defaultTaxRate || 18) / 100))}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>CGST/SGST ({cmsData?.commerceSettings?.defaultTaxRate || 18}%):</span>
                    <span>{formatPrice(order.amount - (order.amount / (1 + (cmsData?.commerceSettings?.defaultTaxRate || 18) / 100)))}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-foreground border-t pt-2 mt-2">
                    <span>Total (incl. GST):</span>
                    <span>{formatPrice(order.amount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment & Authorized Signatory Block (Premium B2B Invoice style) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-dashed">
                <div className="space-y-3 text-xs">
                  <div>
                    <h4 className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Payment Details:</h4>
                    <p className="font-bold text-foreground bg-secondary/10 inline-block px-2 py-1 rounded border">
                      {order.paymentMethod === "COD" ? "Cash on Delivery (COD)" : 
                       order.paymentMethod === "Razorpay" ? "Online Payment (UPI/Cards)" : 
                       order.paymentMethod || "N/A"}
                    </p>
                    <p className="text-muted-foreground mt-2">Status: <span className="font-bold">{order.paymentStatus || "Pending"}</span></p>
                    {order.transactionId && (
                      <p className="text-muted-foreground mt-1 font-mono text-[11px]">
                        Txn ID: {order.transactionId}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col justify-between items-end h-full pt-4 md:pt-0">
                  <div className="text-center w-56 border border-border/85 p-3 rounded-lg bg-secondary/10 relative">
                    <div className="border border-primary/25 border-dashed rounded text-[9px] font-bold text-primary px-2 py-1 rotate-[-4deg] absolute left-2 top-2 opacity-80 uppercase tracking-widest no-print">
                      {cmsData?.brandSettings?.storeName || "FlexSell"} B2B Verified
                    </div>
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground italic font-serif">Authorized Signatory</span>
                    </div>
                    <div className="border-t border-border pt-1.5 font-bold text-[10px] text-foreground uppercase tracking-wider">
                      For {cmsData?.brandSettings?.storeName || "FlexSell Wholesale"}
                    </div>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tracking Details */}
        <div className="space-y-6">
          {order.shipmentDetails ? (
            <Card className="border border-primary/25 bg-primary/5 shadow-sm">
              <CardHeader className="pb-3 border-b border-primary/10">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Truck className="h-4.5 w-4.5" /> Shipment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs">
                <div className="space-y-2.5">
                  <div>
                    <span className="text-muted-foreground">Dispatch Method:</span>
                    <p className="font-bold capitalize mt-0.5">{order.shipmentDetails.type === "self" ? "FlexSell Cargo (Self)" : "Third-Party Courier"}</p>
                  </div>
                  {order.shipmentDetails.carrierName && (
                    <div>
                      <span className="text-muted-foreground">Carrier:</span>
                      <p className="font-bold">{order.shipmentDetails.carrierName}</p>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <span className="text-muted-foreground">Tracking Reference ID:</span>
                    <p className="font-mono font-bold mt-1 text-foreground bg-secondary/45 px-2 py-0.5 rounded inline-block">
                      {order.shipmentDetails.trackingId}
                    </p>
                  </div>
                  {order.shipmentDetails.trackingUrl && (
                    <div className="border-t pt-2">
                      <span className="text-muted-foreground">Tracking Website Link:</span>
                      <p className="mt-1">
                        <a href={order.shipmentDetails.trackingUrl} target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline break-all">
                          Click here to track shipment
                        </a>
                      </p>
                    </div>
                  )}
                  {order.shipmentDetails.estimatedDelivery && (
                    <div className="border-t pt-2">
                      <span className="text-muted-foreground">Estimated Delivery Date:</span>
                      <p className="font-bold mt-1 text-primary flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" /> {order.shipmentDetails.estimatedDelivery}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-border bg-secondary/5 no-print">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> Dispatch Pending
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                This order is packed and awaiting hand-over to the carrier. Tracking credentials will appear here once dispatched.
              </CardContent>
            </Card>
          )}

          {/* Timeline History log */}
          <Card className="border border-border">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Shipment Timeline Log
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="relative pl-4 border-l border-border space-y-5 ml-1 text-xs">
                {order.history && order.history.map((ev, i) => (
                  <div key={i} className="relative space-y-1">
                    <div className={`absolute -left-[21.5px] top-1 h-3 w-3 rounded-full border-2 bg-background ${
                      ev.status === "Delivered" ? "border-green-600 bg-green-600" :
                      ev.status === "Shipped" ? "border-primary bg-primary" :
                      ev.status === "Cancelled" ? "border-destructive bg-destructive" :
                      "border-yellow-500 bg-yellow-500"
                    }`} />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{ev.status}</span>
                      <span className="text-[10px] text-muted-foreground">{ev.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{ev.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

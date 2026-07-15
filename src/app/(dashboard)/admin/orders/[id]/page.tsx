"use client";

import * as React from "react";
import Link from "next/link";
import { useOrderStore } from "@/stores/orderStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Printer, Truck, Calendar, MapPin, CheckCircle, Clock, AlertTriangle, FileText } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const orderId = resolvedParams.id;

  const { orders } = useOrderStore();
  const order = React.useMemo(() => orders.find(o => o._id === orderId), [orders, orderId]);

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-foreground">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-3" />
        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">We couldn't find any wholesale order matching ID "{orderId}".</p>
        <Link href="/admin/orders">
          <Button><ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders</Button>
        </Link>
      </div>
    );
  }

  // GST Calculation Breakdown
  const subtotal = order.amount / 1.18; // 18% GST Inclusive subtotal
  const gstAmount = order.amount - subtotal;
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 container mx-auto px-4 py-8 text-foreground max-w-5xl">
      {/* Back & Print Bar (Hidden during printing) */}
      <div className="flex justify-between items-center no-print">
        <Link href="/admin/orders">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders List
          </Button>
        </Link>
        <Button onClick={handlePrint} className="font-bold flex items-center gap-1.5 shadow-sm">
          <Printer className="h-4 w-4" /> Print Commercial Invoice
        </Button>
      </div>

      {/* Invoice Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Columns: Invoice and Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="print-shadow-none border border-border">
            <CardHeader className="border-b pb-6 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h1 className="text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" /> FlexSell Wholesale
                </h1>
                <p className="text-xs text-muted-foreground mt-1">Wholesale Importers & B2B Distributors</p>
                <p className="text-[10px] text-muted-foreground">GSTIN: 24AAACF1001M1Z5 | HSN Category: 3924</p>
              </div>
              <div className="text-left md:text-right">
                <h2 className="text-lg font-extrabold uppercase tracking-wide text-foreground">Tax Invoice</h2>
                <p className="text-xs font-mono font-bold mt-1">Invoice ID: {order._id}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Invoice Date: {order.date}</p>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-2 inline-block ${order.statusClass} no-print`}>
                  {order.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              {/* Billing and Shipping Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border-b pb-6">
                <div>
                  <h3 className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Billed & Shipped To:</h3>
                  <p className="font-bold text-sm text-foreground">{order.customerName}</p>
                  {order.shippingAddress.company && (
                    <p className="text-xs text-muted-foreground font-semibold">{order.shippingAddress.company}</p>
                  )}
                  <p className="text-muted-foreground mt-1.5">{order.shippingAddress.address}</p>
                  <p className="text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pinCode}</p>
                  <p className="text-muted-foreground mt-1.5">Phone: {order.shippingAddress.phone}</p>
                  <p className="text-muted-foreground">Email: {order.shippingAddress.email}</p>
                </div>
                <div>
                  <h3 className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Wholesale Logistics Dispatcher:</h3>
                  <p className="font-semibold text-foreground">FlexSell Surat Central Warehouse</p>
                  <p className="text-muted-foreground mt-1.5">Plot No. 12, GIDC Industrial Estate</p>
                  <p className="text-muted-foreground">Sachin, Surat, Gujarat - 394230</p>
                  <p className="text-muted-foreground mt-1.5">Support: wholesale@flexsell.in</p>
                  <p className="text-muted-foreground">Phone: +91 261 2409000</p>
                </div>
              </div>

              {/* Itemized Table */}
              <div>
                <h3 className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Itemized Wholesale Goods List:</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border rounded-lg">
                    <thead className="bg-secondary/40 font-bold uppercase tracking-wider text-muted-foreground text-[10px] border-b">
                      <tr>
                        <th className="px-4 py-2.5">Item Description</th>
                        <th className="px-4 py-2.5 text-center">Qty</th>
                        <th className="px-4 py-2.5 text-right">Price per Unit</th>
                        <th className="px-4 py-2.5 text-right">GST Rate</th>
                        <th className="px-4 py-2.5 text-right">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y border-b">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item) => {
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
                            <tr key={item.id} className="hover:bg-secondary/10">
                              <td className="px-4 py-3 font-semibold text-foreground">
                                {item.product.title}
                                <div className="text-[10px] text-muted-foreground mt-0.5 font-normal">
                                  SKU: {sku} | {formattedVariants}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center font-bold">{item.quantity} units</td>
                              <td className="px-4 py-3 text-right font-medium">{formatPrice(item.pricePerUnit)}</td>
                              <td className="px-4 py-3 text-right text-muted-foreground">18% GST incl.</td>
                              <td className="px-4 py-3 text-right font-bold text-foreground">
                                {formatPrice(item.pricePerUnit * item.quantity)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground italic">
                            No cargo items found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tax Invoice calculation summary */}
              <div className="flex flex-col md:flex-row md:justify-between items-start gap-6 pt-4">
                <div className="text-xs text-muted-foreground max-w-sm">
                  <p className="font-bold text-[10px] uppercase tracking-wider mb-1">Commercial Declaration:</p>
                  <p className="italic leading-relaxed">
                    The items detailed in this commercial invoice are manufactured in accordance with strict B2B quality norms. All values listed are inclusive of standard Integrated Goods and Services Tax (IGST) at 18%. Invoices are eligible for input tax credit (ITC) claims.
                  </p>
                </div>
                <div className="w-full md:w-64 space-y-2 text-xs border p-4 rounded-lg bg-secondary/15">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxable Base Value:</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>CGST (9.0%):</span>
                    <span className="font-semibold">{formatPrice(cgst)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>SGST (9.0%):</span>
                    <span className="font-semibold">{formatPrice(sgst)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground border-t pt-2">
                    <span>Total GST Amount:</span>
                    <span className="font-semibold">{formatPrice(gstAmount)}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-foreground border-t-2 border-primary/20 pt-2">
                    <span>Grand Total:</span>
                    <span>{formatPrice(order.amount)}</span>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Column: Timeline & Shipment status */}
        <div className="space-y-6">
          {/* Tracking info card */}
          {order.shipmentDetails ? (
            <Card className="border border-primary/15 bg-primary/5">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Truck className="h-4.5 w-4.5 text-primary" /> Delivery Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground">Courier Type:</span>
                    <p className="font-bold capitalize mt-0.5">{order.shipmentDetails.type}</p>
                  </div>
                  {order.shipmentDetails.carrierName && (
                    <div>
                      <span className="text-muted-foreground">Carrier:</span>
                      <p className="font-bold mt-0.5">{order.shipmentDetails.carrierName}</p>
                    </div>
                  )}
                  <div className="col-span-2 border-t pt-2">
                    <span className="text-muted-foreground">Tracking ID / AWB:</span>
                    <p className="font-mono font-bold mt-1 text-foreground bg-secondary/40 px-2 py-0.5 rounded inline-block">
                      {order.shipmentDetails.trackingId}
                    </p>
                  </div>
                  {order.shipmentDetails.trackingUrl && (
                    <div className="col-span-2 border-t pt-2">
                      <span className="text-muted-foreground">Tracking Link:</span>
                      <p className="mt-1">
                        <a href={order.shipmentDetails.trackingUrl} target="_blank" rel="noreferrer" className="text-primary font-semibold hover:underline break-all">
                          {order.shipmentDetails.trackingUrl}
                        </a>
                      </p>
                    </div>
                  )}
                  {order.shipmentDetails.estimatedDelivery && (
                    <div className="col-span-2 border-t pt-2">
                      <span className="text-muted-foreground">Estimated Delivery:</span>
                      <p className="font-bold mt-0.5 text-primary flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {order.shipmentDetails.estimatedDelivery}
                      </p>
                    </div>
                  )}
                </div>
                {order.shipmentDetails.notes && (
                  <div className="border-t pt-2">
                    <span className="text-muted-foreground font-semibold">Dispatch Note:</span>
                    <p className="italic text-muted-foreground mt-0.5">{order.shipmentDetails.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-yellow-500/20 bg-yellow-500/5 no-print">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-yellow-600 flex items-center gap-1.5">
                  <AlertTriangle className="h-4.5 w-4.5" /> Pending Shipment
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                <p>This order is waiting for warehouse logistics dispatch. No tracking details have been generated yet.</p>
                <Link href="/admin/orders" className="block mt-4">
                  <Button size="sm" className="w-full text-xs">Configure Shipment</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Timeline timeline card */}
          <Card className="border border-border">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-muted-foreground" /> Fulfillment Stepper
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="relative pl-4 border-l border-border space-y-6 ml-1 text-xs">
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

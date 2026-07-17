"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/stores/orderStore";
import { useToastStore } from "@/stores/toastStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Printer, Truck, Calendar, MapPin, CheckCircle, Clock, AlertTriangle, FileText, Edit2, Trash2 } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

const INDIAN_STATES = [
  "Madhya Pradesh",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Union Territory"
];

export default function AdminOrderDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { addToast } = useToastStore();
  const resolvedParams = React.use(params);
  const orderId = resolvedParams.id;

  const { orders, initializeOrders, isLoading } = useOrderStore();
  const [cmsData, setCmsData] = React.useState<any>(null);

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = React.useState(false);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [gstin, setGstin] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [apartment, setApartment] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState(INDIAN_STATES[0]);
  const [pinCode, setPinCode] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [editedItems, setEditedItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    initializeOrders();
    fetch("/api/cms")
      .then(res => res.json())
      .then(data => setCmsData(data))
      .catch(err => console.error("Failed to load CMS data:", err));
  }, [initializeOrders]);

  const order = React.useMemo(() => orders.find(o => o._id === orderId), [orders, orderId]);

  const handleOpenEditModal = () => {
    if (!order) return;
    setFirstName(order.shippingAddress.firstName || "");
    setLastName(order.shippingAddress.lastName || "");
    setCompany(order.shippingAddress.company || "");
    setGstin(order.shippingAddress.gstin || "");
    setAddress(order.shippingAddress.address || "");
    setApartment(order.shippingAddress.apartment || "");
    setCity(order.shippingAddress.city || "");
    setState(order.shippingAddress.state || INDIAN_STATES[0]);
    setPinCode(order.shippingAddress.pinCode || "");
    setPhone(order.shippingAddress.phone || "");
    setEditedItems(JSON.parse(JSON.stringify(order.items || [])));
    setIsEditModalOpen(true);
  };

  const handleItemQtyChange = (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    setEditedItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i));
  };

  const handleRemoveItem = (itemId: string) => {
    setEditedItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !address || !city || !state || !pinCode || !phone) {
      addToast("Please fill in all required fields", "warning");
      return;
    }
    if (editedItems.length === 0) {
      addToast("An order must contain at least one item", "warning");
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const newAmount = editedItems.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0);

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: editedItems,
          amount: newAmount,
          shippingAddress: {
            firstName,
            lastName,
            email: order?.shippingAddress.email,
            company,
            address,
            apartment,
            city,
            state,
            pinCode,
            phone,
            gstin
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to update order details");
      }

      addToast("Order details updated successfully!", "success");
      setIsEditModalOpen(false);
      initializeOrders();
    } catch (err: unknown) {
      addToast((err as any).message || "Failed to save edits", "error");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel and delete this order permanently? This restores all item stock back to inventory.")) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to cancel order");
      }
      addToast("Order cancelled and deleted successfully!", "success");
      router.push("/admin/orders");
    } catch (err: unknown) {
      addToast((err as any).message || "Failed to cancel order", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-foreground">
        <h2 className="text-xl font-bold mb-2">Loading Order Invoice...</h2>
        <p className="text-muted-foreground">Fetching cargo dispatch logs from database.</p>
      </div>
    );
  }

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
  const gstRate = cmsData?.commerceSettings?.defaultTaxRate || 18;
  const subtotal = order.amount / (1 + gstRate / 100); // Dynamic GST Inclusive subtotal
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
        <div className="flex gap-2">
          {order.status !== "Cancelled" && (
            <>
              <Button onClick={handleOpenEditModal} variant="outline" className="font-bold flex items-center gap-1.5 h-9 text-xs">
                <Edit2 className="h-3.5 w-3.5" /> Edit Details
              </Button>
              <Button onClick={handleCancelOrder} variant="outline" className="font-bold text-destructive hover:bg-destructive/5 hover:text-destructive flex items-center gap-1.5 h-9 text-xs">
                <Trash2 className="h-3.5 w-3.5" /> Cancel Order
              </Button>
            </>
          )}
          <Button onClick={handlePrint} className="font-bold flex items-center gap-1.5 shadow-sm h-9 text-xs">
            <Printer className="h-3.5 w-3.5" /> Print Commercial Invoice
          </Button>
        </div>
      </div>

      {/* Invoice Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Columns: Invoice and Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="print-shadow-none border border-border">
            <CardHeader className="border-b pb-6 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h1 className="text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" /> {cmsData?.brandSettings?.storeName || "FlexSell Wholesale"}
                </h1>
                <p className="text-xs text-muted-foreground mt-1">Wholesale Importers & B2B Distributors</p>
                <p className="text-[10px] text-muted-foreground">GSTIN: {cmsData?.brandSettings?.gstin || "24AAACF1001M1Z5"} | HSN Category: 3924</p>
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
                  {order.shippingAddress.gstin && (
                    <p className="font-mono font-bold text-primary mt-1">Customer GSTIN: {order.shippingAddress.gstin}</p>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Wholesale Logistics Dispatcher:</h3>
                  <p className="font-semibold text-foreground">{cmsData?.brandSettings?.storeName || "FlexSell Surat Central Warehouse"}</p>
                  <p className="text-muted-foreground mt-1.5">{cmsData?.brandSettings?.companyAddress || "Plot No. 12, GIDC Industrial Estate, Sachin, Surat, Gujarat - 394230"}</p>
                  <p className="text-muted-foreground mt-1.5">Support: {cmsData?.brandSettings?.supportEmail || "wholesale@flexsell.in"}</p>
                  <p className="text-muted-foreground">Phone: {cmsData?.brandSettings?.supportPhone || "+91 261 2409000"}</p>
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
              </div>              {/* Tax Invoice calculation summary */}
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

      {/* Edit Order Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-card border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-foreground space-y-4">
            <div>
              <h3 className="text-xl font-bold tracking-tight">Edit Wholesale Order Details</h3>
              <p className="text-muted-foreground text-xs mt-0.5">Modify shipping details or adjust item quantities.</p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-6 text-xs">
              {/* Shipping Details */}
              <div className="space-y-3">
                <h4 className="font-bold border-b pb-1.5 text-xs text-primary uppercase">Shipping Credentials</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-muted-foreground">First Name *</label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-muted-foreground">Last Name *</label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-muted-foreground">Company Name</label>
                    <Input value={company} onChange={(e) => setCompany(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-muted-foreground">GSTIN</label>
                    <Input value={gstin} onChange={(e) => setGstin(e.target.value)} className="font-mono uppercase" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground">Street Address *</label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground">Apartment, unit, suite</label>
                  <Input value={apartment} onChange={(e) => setApartment(e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-muted-foreground">City *</label>
                    <Input value={city} onChange={(e) => setCity(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-muted-foreground">State *</label>
                    <select value={state} onChange={(e) => setState(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-muted-foreground">Pin Code *</label>
                    <Input value={pinCode} onChange={(e) => setPinCode(e.target.value)} required className="font-mono" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground">Phone *</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="font-bold border-b pb-1.5 text-xs text-primary uppercase">Order Items & Quantities</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {editedItems.map((item) => {
                    const formattedVariants = Object.entries(item.selectedVariants || {})
                      .map(([key, val]) => `${key}: ${val}`)
                      .join(" • ");
                    return (
                      <div key={item.id} className="flex items-center justify-between border p-3 rounded-lg bg-secondary/15 gap-3">
                        <div className="space-y-0.5 max-w-[65%]">
                          <p className="font-bold text-foreground truncate">{item.product.title}</p>
                          <p className="text-[10px] text-muted-foreground">{formattedVariants}</p>
                          <p className="text-[10px] text-primary font-bold">Price: {formatPrice(item.pricePerUnit)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground font-bold">Qty:</span>
                            <input
                              type="number"
                              className="w-14 text-center border rounded p-1 bg-transparent text-foreground text-xs font-bold focus:outline-none"
                              value={item.quantity}
                              min={1}
                              onChange={(e) => handleItemQtyChange(item.id, parseInt(e.target.value, 10) || 1)}
                            />
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-destructive hover:bg-destructive/5"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmittingEdit}>
                  {isSubmittingEdit ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Info, Eye, Truck, Calendar, MapPin, CheckCircle, Clock, AlertTriangle, Printer } from "lucide-react";
import { useOrderStore, Order, ShipmentDetails } from "@/stores/orderStore";
import { formatPrice } from "@/lib/utils";
import { Pagination } from "@/components/ui/Pagination";
import Link from "next/link";

export function AdminOrdersManager() {
  const { orders, initializeOrders, updateOrderStatus, shipOrder } = useOrderStore();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

  React.useEffect(() => {
    initializeOrders();
  }, [initializeOrders]);

  // Shipment fulfillment states
  const [isFulfilling, setIsFulfilling] = React.useState(false);
  const [shipType, setShipType] = React.useState<"self" | "third-party">("self");
  const [carrierName, setCarrierName] = React.useState("");
  const [trackingId, setTrackingId] = React.useState("");
  const [trackingUrl, setTrackingUrl] = React.useState("");
  const [estDelivery, setEstDelivery] = React.useState("");
  const [dispatchNotes, setDispatchNotes] = React.useState("");

  // Sync selected order structure
  const activeSelectedOrder = React.useMemo(() => {
    if (!selectedOrder) return null;
    return orders.find(o => o._id === selectedOrder._id) || null;
  }, [orders, selectedOrder]);

  // Reset form when active selected order changes or fulfillment toggles
  React.useEffect(() => {
    setIsFulfilling(false);
    setShipType("self");
    setCarrierName("");
    setTrackingId("");
    setTrackingUrl("");
    setEstDelivery("");
    setDispatchNotes("");
  }, [selectedOrder]);

  // Handle auto tracking ID generation for self-shipment
  React.useEffect(() => {
    if (isFulfilling && shipType === "self" && activeSelectedOrder) {
      const randNum = Math.floor(100000 + Math.random() * 900000);
      setTrackingId(`FLEX-IN-${activeSelectedOrder._id.replace("FS-", "")}-${randNum}`);
    } else if (isFulfilling && shipType === "third-party") {
      setTrackingId("");
    }
  }, [isFulfilling, shipType, activeSelectedOrder]);

  const handleConfirmFulfillment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSelectedOrder) return;

    if (shipType === "third-party" && (!carrierName || !trackingId)) {
      alert("Please provide the Carrier Name and Tracking ID for third-party courier dispatch.");
      return;
    }

    const details: ShipmentDetails = {
      type: shipType,
      carrierName: shipType === "third-party" ? carrierName : undefined,
      trackingId,
      trackingUrl: shipType === "third-party" ? trackingUrl || undefined : undefined,
      estimatedDelivery: estDelivery || undefined,
      shippedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      notes: dispatchNotes || undefined
    };

    shipOrder(activeSelectedOrder._id, details);
    setIsFulfilling(false);
  };

  const filteredOrders = React.useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return orders;
    return orders.filter(o => 
      o._id.toLowerCase().includes(term) || 
      o.customerName.toLowerCase().includes(term)
    );
  }, [orders, searchTerm]);

  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 10;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  const paginatedOrders = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  return (
    <div className="space-y-6 text-foreground">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage and fulfill wholesale B2B shipments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Orders Table */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 border-b">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search orders by ID or customer..." 
                  className="pl-9 text-foreground" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                    <tr>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Total Amount</th>
                      <th className="px-6 py-4">Fulfillment Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                          No order records found.
                        </td>
                      </tr>
                    ) : (
                      paginatedOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-6 py-4 font-bold">{order._id}</td>
                          <td className="px-6 py-4 text-muted-foreground">{order.date}</td>
                          <td className="px-6 py-4">
                            <p className="font-semibold">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Phone: {order.shippingAddress.phone}</p>
                          </td>
                          <td className="px-6 py-4 font-bold">{formatPrice(order.amount)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${order.statusClass}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              Manage <Eye className="h-4 w-4 ml-1.5" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-4 pb-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={filteredOrders.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Order Detail and Status changer Panel */}
        <div>
          {activeSelectedOrder ? (
            <Card className="sticky top-24">
              <CardHeader className="border-b pb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold">Manage Shipment</CardTitle>
                    <Link href={`/admin/orders/${activeSelectedOrder._id}`}>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10" title="View Full Details & Invoice">
                        <Printer className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground mt-1">{activeSelectedOrder._id}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  Clear
                </Button>
              </CardHeader>
              <CardContent className="pt-4 space-y-6 text-sm">
                
                {/* Fulfillment Actions Card */}
                {isFulfilling ? (
                  <form onSubmit={handleConfirmFulfillment} className="space-y-4 bg-secondary/15 p-4 rounded-lg border">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Truck className="h-4 w-4" /> Shipment Setup
                    </h4>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Shipping Provider Type:</label>
                      <div className="flex gap-4 mt-1">
                        <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                          <input 
                            type="radio" 
                            checked={shipType === "self"} 
                            onChange={() => setShipType("self")} 
                            className="text-primary focus:ring-primary"
                          />
                          Self-Shipped (Manual)
                        </label>
                        <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                          <input 
                            type="radio" 
                            checked={shipType === "third-party"} 
                            onChange={() => setShipType("third-party")}
                            className="text-primary focus:ring-primary"
                          />
                          Third-Party Courier
                        </label>
                      </div>
                    </div>

                    {shipType === "self" ? (
                      <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Auto-Generated Tracking ID:</label>
                          <Input value={trackingId} readOnly disabled className="bg-secondary/40 font-mono text-xs font-bold text-foreground" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Est. Delivery Date (Optional):</label>
                          <Input type="date" value={estDelivery} onChange={(e) => setEstDelivery(e.target.value)} className="text-xs text-foreground" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Carrier Name:</label>
                          <select 
                            value={carrierName} 
                            onChange={(e) => setCarrierName(e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            <option value="">Select Carrier...</option>
                            <option value="Delhivery">Delhivery</option>
                            <option value="BlueDart">BlueDart</option>
                            <option value="DTDC">DTDC</option>
                            <option value="FedEx">FedEx</option>
                            <option value="SafeExpress">SafeExpress</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Tracking ID:</label>
                          <Input 
                            placeholder="Enter carrier air waybill number..." 
                            value={trackingId} 
                            onChange={(e) => setTrackingId(e.target.value)} 
                            className="text-xs text-foreground font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Tracking URL (Optional):</label>
                          <Input 
                            placeholder="https://example.com/track..." 
                            value={trackingUrl} 
                            onChange={(e) => setTrackingUrl(e.target.value)} 
                            className="text-xs text-foreground"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Est. Delivery Date (Optional):</label>
                          <Input type="date" value={estDelivery} onChange={(e) => setEstDelivery(e.target.value)} className="text-xs text-foreground" />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Dispatch Remarks (Optional):</label>
                      <textarea 
                        rows={2} 
                        placeholder="Driver contact details, warehouse remarks..." 
                        value={dispatchNotes}
                        onChange={(e) => setDispatchNotes(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button type="submit" size="sm" className="flex-1 font-bold">
                        Confirm & Dispatch
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setIsFulfilling(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border p-3 rounded-lg bg-secondary/15">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Current Status</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${activeSelectedOrder.statusClass}`}>
                            {activeSelectedOrder.status}
                          </span>
                        </div>
                      </div>
                      
                      {activeSelectedOrder.status === "Processing" && (
                        <div className="flex flex-col gap-1.5">
                          <Button size="sm" onClick={() => setIsFulfilling(true)} className="flex items-center gap-1.5 font-bold h-8 text-xs">
                            <Truck className="h-3.5 w-3.5" /> Fulfill Shipment
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => updateOrderStatus(activeSelectedOrder._id, "Cancelled")} className="text-destructive hover:bg-destructive/10 border-destructive/30 hover:border-destructive h-8 text-xs">
                            Cancel Order
                          </Button>
                        </div>
                      )}

                      {activeSelectedOrder.status === "Shipped" && (
                        <div className="flex flex-col gap-1.5">
                          <Button size="sm" onClick={() => updateOrderStatus(activeSelectedOrder._id, "Delivered")} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 h-8 text-xs font-bold">
                            <CheckCircle className="h-3.5 w-3.5" /> Mark Delivered
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => updateOrderStatus(activeSelectedOrder._id, "Cancelled")} className="text-destructive hover:bg-destructive/10 border-destructive/30 hover:border-destructive h-8 text-xs">
                            Cancel Order
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tracking Details display if already Shipped or Delivered */}
                {activeSelectedOrder.shipmentDetails && (
                  <div className="bg-primary/5 border border-primary/15 p-4 rounded-lg space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Truck className="h-4 w-4" /> Dispatch Tracking Info:
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Courier Type:</p>
                        <p className="font-bold capitalize">{activeSelectedOrder.shipmentDetails.type}</p>
                      </div>
                      {activeSelectedOrder.shipmentDetails.carrierName && (
                        <div>
                          <p className="text-muted-foreground">Carrier Name:</p>
                          <p className="font-bold">{activeSelectedOrder.shipmentDetails.carrierName}</p>
                        </div>
                      )}
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Tracking ID:</p>
                        <p className="font-mono font-bold text-foreground bg-secondary/35 px-1.5 py-0.5 rounded inline-block">{activeSelectedOrder.shipmentDetails.trackingId}</p>
                      </div>
                      {activeSelectedOrder.shipmentDetails.trackingUrl && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Tracking Link:</p>
                          <a href={activeSelectedOrder.shipmentDetails.trackingUrl} target="_blank" rel="noreferrer" className="text-primary font-semibold hover:underline break-all">
                            {activeSelectedOrder.shipmentDetails.trackingUrl}
                          </a>
                        </div>
                      )}
                      {activeSelectedOrder.shipmentDetails.estimatedDelivery && (
                        <div>
                          <p className="text-muted-foreground">Est. Delivery:</p>
                          <p className="font-bold">{activeSelectedOrder.shipmentDetails.estimatedDelivery}</p>
                        </div>
                      )}
                    </div>
                    {activeSelectedOrder.shipmentDetails.notes && (
                      <div className="pt-2 border-t text-xs">
                        <p className="text-muted-foreground font-semibold">Dispatch Note:</p>
                        <p className="italic text-muted-foreground mt-0.5">{activeSelectedOrder.shipmentDetails.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Shipping Credentials:</h4>
                  <p className="font-bold">{activeSelectedOrder.shippingAddress.firstName} {activeSelectedOrder.shippingAddress.lastName}</p>
                  {activeSelectedOrder.shippingAddress.company && (
                    <p className="text-xs text-muted-foreground font-medium">{activeSelectedOrder.shippingAddress.company}</p>
                  )}
                  <p className="text-muted-foreground mt-1">{activeSelectedOrder.shippingAddress.address}</p>
                  <p className="text-muted-foreground">{activeSelectedOrder.shippingAddress.city}, {activeSelectedOrder.shippingAddress.state} - {activeSelectedOrder.shippingAddress.pinCode}</p>
                  <p className="text-muted-foreground mt-1">Email: {activeSelectedOrder.shippingAddress.email}</p>
                  <p className="text-muted-foreground">Phone: {activeSelectedOrder.shippingAddress.phone}</p>
                </div>

                {/* Timeline History */}
                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> Shipment Timeline Log:
                  </h4>
                  <div className="relative pl-4 border-l border-border space-y-4 ml-1">
                    {activeSelectedOrder.history && activeSelectedOrder.history.map((ev, i) => (
                      <div key={i} className="relative space-y-1">
                        <div className={`absolute -left-[21.5px] top-1 h-3 w-3 rounded-full border-2 bg-background ${
                          ev.status === "Delivered" ? "border-green-600 bg-green-600" :
                          ev.status === "Shipped" ? "border-primary bg-primary" :
                          ev.status === "Cancelled" ? "border-destructive bg-destructive" :
                          "border-yellow-500 bg-yellow-500"
                        }`} />
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground">{ev.status}</span>
                          <span className="text-[10px] text-muted-foreground">{ev.timestamp}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{ev.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">Order Cargo Items:</h4>
                  {activeSelectedOrder.items && activeSelectedOrder.items.length > 0 ? (
                    <div className="space-y-3">
                      {activeSelectedOrder.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-start">
                          <div className="max-w-[70%]">
                            <p className="font-semibold text-foreground line-clamp-1">{item.product.title}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity} x {formatPrice(item.pricePerUnit)}</p>
                          </div>
                          <span className="font-medium text-foreground">{formatPrice(item.pricePerUnit * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Order generated with blank default parameters.</p>
                  )}
                </div>

                <div className="border-t pt-4 flex justify-between font-bold text-base text-foreground">
                  <span>Grand Total (incl. GST)</span>
                  <span>{formatPrice(activeSelectedOrder.amount)}</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-24 bg-secondary/10 border-dashed border-2">
              <CardContent className="py-16 text-center text-muted-foreground flex flex-col items-center">
                <Info className="h-8 w-8 mb-2 text-muted-foreground" />
                <p className="text-sm">Select an order row from the table to manage shipment tracking and toggle dispatch statuses.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

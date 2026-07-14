"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Info, Eye } from "lucide-react";
import { useOrderStore, Order } from "@/stores/orderStore";
import { formatPrice } from "@/lib/utils";

export function AdminOrdersManager() {
  const { orders, initializeOrders, updateOrderStatus } = useOrderStore();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

  React.useEffect(() => {
    initializeOrders();
  }, [initializeOrders]);

  // Sync selected order structure
  const activeSelectedOrder = React.useMemo(() => {
    if (!selectedOrder) return null;
    return orders.find(o => o._id === selectedOrder._id) || null;
  }, [orders, selectedOrder]);

  const filteredOrders = React.useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return orders;
    return orders.filter(o => 
      o._id.toLowerCase().includes(term) || 
      o.customerName.toLowerCase().includes(term)
    );
  }, [orders, searchTerm]);

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
                      filteredOrders.map((order) => (
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
            </CardContent>
          </Card>
        </div>

        {/* Selected Order Detail and Status changer Panel */}
        <div>
          {activeSelectedOrder ? (
            <Card className="sticky top-24">
              <CardHeader className="border-b pb-4 flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Manage Shipment</CardTitle>
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
                {/* Status selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fulfillment Actions:</label>
                  <select 
                    value={activeSelectedOrder.status}
                    onChange={(e) => updateOrderStatus(activeSelectedOrder._id, e.target.value as Order["status"])}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

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

"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { customers } from "@/data/customers";
import { useOrderStore } from "@/stores/orderStore";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, User, ShoppingBag, CreditCard, Mail, Phone, MapPin, Building, ShieldAlert, CheckCircle2, Truck, Clock } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminCustomerDetailPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const customerId = resolvedParams.id;

  const { orders, initializeOrders } = useOrderStore();

  React.useEffect(() => {
    initializeOrders();
  }, [initializeOrders]);

  const customer = React.useMemo(() => customers.find(c => c.id === customerId), [customerId]);

  const customerOrders = React.useMemo(() => {
    if (!customer) return [];
    return orders.filter(o => o.shippingAddress.email.toLowerCase() === customer.email.toLowerCase());
  }, [orders, customer]);

  if (!customer) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-foreground">
        <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-3" />
        <h2 className="text-2xl font-bold mb-2">Customer Record Not Found</h2>
        <p className="text-muted-foreground mb-6">We couldn't locate any customer record matching ID "{customerId}".</p>
        <Link href="/admin/customers">
          <Button><ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers</Button>
        </Link>
      </div>
    );
  }

  // Stat computations
  const totalSpent = customerOrders.reduce((sum, o) => sum + o.amount, 0);
  const pendingOrders = customerOrders.filter(o => o.status === "Processing").length;
  const shippedOrders = customerOrders.filter(o => o.status === "Shipped").length;
  const deliveredOrders = customerOrders.filter(o => o.status === "Delivered").length;

  return (
    <div className="space-y-6 container mx-auto px-4 py-8 text-foreground max-w-6xl">
      {/* Back Header */}
      <div>
        <Link href="/admin/customers">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers List
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 gap-4">
          <div className="flex items-center gap-3">
            <Avatar initials={customer.initials} className="h-12 w-12 text-lg bg-primary text-primary-foreground border" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
              <p className="text-xs text-muted-foreground">ID: {customer.id} | Company: {customer.company || "Individual"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-full">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Orders</p>
              <h4 className="text-lg font-black">{customerOrders.length}</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-yellow-500/10 text-yellow-600 p-2 rounded-full">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Processing</p>
              <h4 className="text-lg font-black">{pendingOrders}</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-purple-500/10 text-purple-600 p-2 rounded-full">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Shipped</p>
              <h4 className="text-lg font-black">{shippedOrders}</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-green-500/10 text-green-600 p-2 rounded-full">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Revenue Spent</p>
              <h4 className="text-lg font-black text-primary">{formatPrice(totalSpent)}</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Profile details */}
        <div className="space-y-6">
          <Card className="border border-border">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-primary" /> Profile Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground font-semibold flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email Address:</span>
                <p className="font-bold text-foreground pl-5">{customer.email}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground font-semibold flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone Number:</span>
                <p className="font-bold text-foreground pl-5">{customer.phone}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground font-semibold flex items-center gap-1.5"><Building className="h-3.5 w-3.5" /> Business Company:</span>
                <p className="font-bold text-foreground pl-5">{customer.company || "Individual / Direct"}</p>
              </div>
              {customer.gstin && (
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> B2B GSTIN Code:</span>
                  <p className="font-mono font-bold text-primary pl-5">{customer.gstin}</p>
                </div>
              )}
              <div className="space-y-1 pt-2 border-t">
                <span className="text-muted-foreground font-semibold flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 animate-bounce-slow" /> Shipping Address:</span>
                <div className="pl-5 text-muted-foreground space-y-0.5">
                  <p className="font-bold text-foreground">{customer.name}</p>
                  <p>{customer.address}</p>
                  <p>{customer.city}, {customer.state} - {customer.pinCode}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Order history list */}
        <div className="lg:col-span-2">
          <Card className="border border-border">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-bold">Wholesale Purchase Log</CardTitle>
              <CardDescription>All invoices and tracking history generated for this buyer.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[10px] text-muted-foreground uppercase bg-secondary/30 border-b">
                    <tr>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Invoice Date</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {customerOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground italic">
                          No wholesale purchases logged for this account.
                        </td>
                      </tr>
                    ) : (
                      customerOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-secondary/10 transition-colors">
                          <td className="px-4 py-3 font-bold">{order._id}</td>
                          <td className="px-4 py-3 text-muted-foreground">{order.date}</td>
                          <td className="px-4 py-3 text-right font-bold text-foreground">{formatPrice(order.amount)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${order.statusClass}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link href={`/admin/orders`}>
                              <Button variant="outline" size="sm" className="h-7 text-[10px]">
                                Manage
                              </Button>
                            </Link>
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
      </div>
    </div>
  );
}

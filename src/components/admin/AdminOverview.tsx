"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { IndianRupee, ShoppingBag, Layers, AlertTriangle, TrendingUp } from "lucide-react";
import { useOrderStore } from "@/stores/orderStore";
import { useProductStore } from "@/stores/productStore";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/types";

interface AdminOverviewProps {
  initialProducts: Product[];
}

export function AdminOverview({ initialProducts }: AdminOverviewProps) {
  const { orders, initializeOrders } = useOrderStore();
  const { products, initializeProducts } = useProductStore();

  React.useEffect(() => {
    initializeOrders();
    initializeProducts(initialProducts);
  }, [initializeOrders, initializeProducts, initialProducts]);

  const activeProducts = products.length > 0 ? products : initialProducts;

  // Compute live calculations
  const totalRevenue = React.useMemo(() => {
    return orders
      .filter(o => o.status !== "Cancelled")
      .reduce((sum, o) => sum + o.amount, 0);
  }, [orders]);

  const lowStockCount = React.useMemo(() => {
    return activeProducts.filter(p => p.stock < 15).length;
  }, [activeProducts]);

  const recentOrders = React.useMemo(() => {
    return orders.slice(0, 5);
  }, [orders]);

  return (
    <div className="space-y-8 text-foreground">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening in your B2B warehouse today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total B2B Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
            <p className="text-xs text-success mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> Live sales sum
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Placed Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-success mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> Dynamic orders log
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Cargo Lines</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProducts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Live products in catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Products with stock &lt; 15 units
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-96">
          <CardHeader>
            <CardTitle>B2B Operations Status</CardTitle>
          </CardHeader>
          <CardContent className="h-full flex flex-col justify-center items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
              <span>Surat Direct Cargo Pipeline: Active</span>
            </div>
            <p className="text-xs text-center max-w-sm">
              Shipment schedules, logistical dispatches, and factory cargo fulfillments compile automatically upon B2B order placements.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center italic">No B2B orders generated yet.</p>
            ) : (
              <div className="space-y-6">
                {recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order {order._id}</p>
                      <p className="text-xs text-muted-foreground">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(order.amount)}</p>
                      <p className={`text-xs font-semibold ${
                        order.status === "Delivered" ? "text-success" : 
                        order.status === "Cancelled" ? "text-destructive" : 
                        "text-primary"
                      }`}>{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

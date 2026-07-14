import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Package, Clock, Truck, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ClientDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full text-blue-600 dark:text-blue-300">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <h3 className="text-2xl font-bold">12</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full text-yellow-600 dark:text-yellow-300">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <h3 className="text-2xl font-bold">1</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full text-purple-600 dark:text-purple-300">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Shipped</p>
              <h3 className="text-2xl font-bold">2</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full text-green-600 dark:text-green-300">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Delivered</p>
              <h3 className="text-2xl font-bold">9</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link href="/client/orders" className="text-sm text-primary hover:underline font-medium">
            View All
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                <tr>
                  <th className="px-4 py-3 rounded-l-md">Order ID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-r-md">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b last:border-0">
                  <td className="px-4 py-4 font-medium">#FS-10025</td>
                  <td className="px-4 py-4">Oct 24, 2023</td>
                  <td className="px-4 py-4 font-bold">₹ 4,500</td>
                  <td className="px-4 py-4">
                    <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 px-2.5 py-1 rounded-full text-xs font-semibold">Processing</span>
                  </td>
                  <td className="px-4 py-4">
                    <Button variant="outline" size="sm">Track</Button>
                  </td>
                </tr>
                <tr className="border-b last:border-0">
                  <td className="px-4 py-4 font-medium">#FS-10024</td>
                  <td className="px-4 py-4">Oct 18, 2023</td>
                  <td className="px-4 py-4 font-bold">₹ 1,299</td>
                  <td className="px-4 py-4">
                    <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500 px-2.5 py-1 rounded-full text-xs font-semibold">Shipped</span>
                  </td>
                  <td className="px-4 py-4">
                    <Button variant="outline" size="sm">Track</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

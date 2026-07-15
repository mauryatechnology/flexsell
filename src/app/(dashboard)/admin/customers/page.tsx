"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Customer } from "@/data/customers";
import { customerService } from "@/services/customerService";
import { useOrderStore } from "@/stores/orderStore";
import { formatPrice } from "@/lib/utils";
import { User, Eye, ShoppingBag, CreditCard, Mail, Phone, Building } from "lucide-react";

export default function AdminCustomersPage() {
  const { orders, initializeOrders } = useOrderStore();
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        await initializeOrders();
        const data = await customerService.getCustomers();
        setCustomers(data);
      } catch (err) {
        console.error("Failed to load customers", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [initializeOrders]);

  // Compute stats for each customer dynamically
  const customerStats = React.useMemo(() => {
    return customers.map(cust => {
      const customerOrders = orders.filter(
        o => o.shippingAddress.email.toLowerCase() === cust.email.toLowerCase()
      );
      const totalSpend = customerOrders.reduce((sum, o) => sum + o.amount, 0);
      return {
        ...cust,
        ordersCount: customerOrders.length,
        totalSpend
      };
    });
  }, [orders, customers]);

  return (
    <div className="space-y-6 text-foreground container mx-auto px-4 py-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wholesale Customers</h1>
        <p className="text-muted-foreground mt-1">Manage and view purchasing history of B2B wholesale buyers.</p>
      </div>

      <Card className="border border-border">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-lg font-bold">Active Buyer Accounts</CardTitle>
          <CardDescription>Dynamic purchasing volume and GSTIN credentials.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b">
                <tr>
                  <th className="px-6 py-3.5">Customer Name</th>
                  <th className="px-6 py-3.5">Company Details</th>
                  <th className="px-6 py-3.5 text-center">Total Orders</th>
                  <th className="px-6 py-3.5 text-right">Total Revenue</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                      Loading B2B customers...
                    </td>
                  </tr>
                ) : customerStats.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                      No customer accounts found.
                    </td>
                  </tr>
                ) : (
                  customerStats.map((cust) => (
                    <tr key={cust._id} className="hover:bg-secondary/15 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <Avatar initials={cust.initials} className="bg-primary text-primary-foreground border" />
                        <div>
                          <p className="font-bold text-foreground">{cust.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{cust.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-muted-foreground" /> {cust.company || "Individual"}
                        </p>
                        {cust.gstin && (
                          <p className="text-[10px] font-mono text-primary font-bold mt-0.5">GSTIN: {cust.gstin}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-bold">{cust.ordersCount} orders</td>
                      <td className="px-6 py-4 text-right font-black text-foreground">
                        {formatPrice(cust.totalSpend)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/customers/${cust._id}`}>
                          <Button variant="outline" size="sm" className="font-semibold">
                            View Profile <Eye className="h-3.5 w-3.5 ml-1.5" />
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
  );
}

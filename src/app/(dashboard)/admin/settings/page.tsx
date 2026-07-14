import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Site Settings</h1>
          <p className="text-muted-foreground mt-1">Manage global configuration for your storefront.</p>
        </div>
        <Button>Save Settings</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>Basic details about your wholesale business.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Store Name</label>
              <Input defaultValue="FlexSell Wholesale" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Support Email</label>
              <Input defaultValue="support@flexsell.in" type="email" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Support Phone</label>
              <Input defaultValue="+91 98765 43210" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commerce Settings</CardTitle>
            <CardDescription>Configure order minimums and taxes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Order Value (₹)</label>
              <Input defaultValue="1000" type="number" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Tax Rate (%)</label>
              <Input defaultValue="18" type="number" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Enable Cash on Delivery</label>
                <p className="text-xs text-muted-foreground">Allow COD for trusted clients.</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-primary focus:ring-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

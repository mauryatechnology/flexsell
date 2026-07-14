import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PackageSearch } from "lucide-react";

export default function OrderTrackingPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto bg-secondary w-16 h-16 rounded-full flex items-center justify-center">
             <PackageSearch className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Track Your Order</CardTitle>
          <CardDescription>Enter your Order ID and Email to track the current status of your shipment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-4 text-left">
            <div className="space-y-2">
              <label className="text-sm font-medium">Order ID</label>
              <Input placeholder="e.g. FS-10025" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input type="email" placeholder="john@company.com" />
            </div>
            
            <Button className="w-full mt-2" size="lg">Track Order</Button>
          </form>

          <div className="p-4 bg-primary/10 rounded-lg text-sm text-primary text-left">
            <p className="font-semibold mb-1">Where do I find my Order ID?</p>
            <p className="opacity-90">Your Order ID was sent to your email during checkout. You can also find it in your Client Dashboard under "My Orders".</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

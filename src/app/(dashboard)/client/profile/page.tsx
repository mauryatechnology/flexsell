"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { activeCustomer } from "@/data/customers";

export default function ClientProfilePage() {
  const firstName = activeCustomer.name.split(" ")[0] || "";
  const lastName = activeCustomer.name.split(" ").slice(1).join(" ") || "";

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Personal profile changes updated successfully!");
  };

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    alert("B2B wholesale credentials verified and saved!");
  };

  return (
    <div className="space-y-6 text-foreground">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Account Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your personal and business details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Details */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Personal Information</CardTitle>
            <CardDescription>Update your basic profile details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePersonal} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">First Name</label>
                  <Input defaultValue={firstName} className="text-sm font-semibold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Last Name</label>
                  <Input defaultValue={lastName} className="text-sm font-semibold" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Email Address</label>
                <Input defaultValue={activeCustomer.email} type="email" className="text-sm font-semibold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Phone Number</label>
                <Input defaultValue={activeCustomer.phone} className="text-sm font-semibold" />
              </div>
              <Button type="submit" className="font-bold">Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        {/* Business details */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Business Information</CardTitle>
            <CardDescription>B2B credentials for wholesale billing.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveBusiness} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Company Name</label>
                <Input defaultValue={activeCustomer.company} className="text-sm font-semibold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">GSTIN (Input Tax Claim)</label>
                <Input defaultValue={activeCustomer.gstin || "24AAACD0000D1Z0"} className="text-sm font-mono font-bold" />
                <p className="text-[10px] text-muted-foreground">Required for claiming Input Tax Credit (ITC).</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Business Type</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="distributor">Distributor / Dealer</option>
                  <option value="wholesaler" selected>Wholesaler</option>
                  <option value="retailer">Retailer</option>
                </select>
              </div>
              <Button type="submit" className="font-bold">Update Business Profile</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

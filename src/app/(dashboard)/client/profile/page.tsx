"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { customerService } from "@/services/customerService";
import { Customer } from "@/types";
import { useToastStore } from "@/stores/toastStore";

export default function ClientProfilePage() {
  const { addToast } = useToastStore();
  const [activeCustomer, setActiveCustomer] = React.useState<Customer | null>(null);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [gstin, setGstin] = React.useState("");
  const [isSubmittingPersonal, setIsSubmittingPersonal] = React.useState(false);
  const [isSubmittingBusiness, setIsSubmittingBusiness] = React.useState(false);

  React.useEffect(() => {
    customerService.getActiveCustomer().then((cust) => {
      setActiveCustomer(cust);
      setFirstName(cust.name?.split(" ")[0] || "");
      setLastName(cust.name?.split(" ").slice(1).join(" ") || "");
      setEmail(cust.email || "");
      setPhone(cust.phone || "");
      setCompany(cust.company || "");
      setGstin(cust.gstin || "");
    }).catch(console.error);
  }, []);

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPersonal(true);
    try {
      const updated = await customerService.updateActiveCustomer({
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone
      });
      setActiveCustomer(updated);
      addToast("Personal profile updated successfully!", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to update personal details", "error");
    } finally {
      setIsSubmittingPersonal(false);
    }
  };

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBusiness(true);
    try {
      const updated = await customerService.updateActiveCustomer({
        company,
        gstin
      });
      setActiveCustomer(updated);
      addToast("Business information updated successfully!", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to update business profile", "error");
    } finally {
      setIsSubmittingBusiness(false);
    }
  };

  if (!activeCustomer) {
    return <div className="text-center py-10 text-muted-foreground">Loading profile...</div>;
  }

  return (
    <div className="space-y-6 text-foreground">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Account Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your personal and B2B business details.</p>
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
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="text-sm font-semibold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Last Name</label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required className="text-sm font-semibold" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Email Address</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="text-sm font-semibold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Phone Number</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} required className="text-sm font-semibold" />
              </div>
              <Button type="submit" className="font-bold" disabled={isSubmittingPersonal}>
                {isSubmittingPersonal ? "Saving..." : "Save Changes"}
              </Button>
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
                <Input value={company} onChange={(e) => setCompany(e.target.value)} required className="text-sm font-semibold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">GSTIN (Input Tax Claim)</label>
                <Input value={gstin} onChange={(e) => setGstin(e.target.value)} required className="text-sm font-mono font-bold" />
                <p className="text-[10px] text-muted-foreground">Required for claiming Input Tax Credit (ITC).</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Business Type</label>
                <select 
                  defaultValue="wholesaler"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="distributor">Distributor / Dealer</option>
                  <option value="wholesaler">Wholesaler</option>
                  <option value="retailer">Retailer</option>
                </select>
              </div>
              <Button type="submit" className="font-bold" disabled={isSubmittingBusiness}>
                {isSubmittingBusiness ? "Saving..." : "Update Business Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

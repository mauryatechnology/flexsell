"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToastStore } from "@/stores/toastStore";
import { ThemeEditor } from "@/components/admin/ThemeEditor";

export default function AdminSettingsPage() {
  const { addToast } = useToastStore();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  // Brand details states
  const [storeName, setStoreName] = React.useState("FlexSell Wholesale");
  const [supportEmail, setSupportEmail] = React.useState("support@flexsell.in");
  const [supportPhone, setSupportPhone] = React.useState("+91 98765 43210");
  const [companyAddress, setCompanyAddress] = React.useState("123 Business Hub, Indore, MP");
  const [gstin, setGstin] = React.useState("23AAACD1234D1Z0");

  // Bank details states
  const [beneficiaryName, setBeneficiaryName] = React.useState("FlexSell B2B Private Limited");
  const [bankName, setBankName] = React.useState("HDFC Bank");
  const [accountNo, setAccountNo] = React.useState("50200084729104");
  const [ifscCode, setIfscCode] = React.useState("HDFC0000024");
  const [branch, setBranch] = React.useState("Sachin GIDC, Surat");

  // Commerce settings states
  const [minOrderValue, setMinOrderValue] = React.useState("1000");
  const [defaultTaxRate, setDefaultTaxRate] = React.useState("18");
  const [enableCod, setEnableCod] = React.useState(true);
  const [enableOnlinePayment, setEnableOnlinePayment] = React.useState(true);

  // Active tab and ID Format states
  const [activeTab, setActiveTab] = React.useState<"general" | "id" | "theme">("general");
  const [customerPrefix, setCustomerPrefix] = React.useState("FSW-");
  const [customerStart, setCustomerStart] = React.useState("1");
  const [orderPrefix, setOrderPrefix] = React.useState("FS-");
  const [orderStart, setOrderStart] = React.useState("10026");
  const [productPrefix, setProductPrefix] = React.useState("");
  const [productStart, setProductStart] = React.useState("1");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "theme" || tabParam === "id" || tabParam === "general") {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleTabSelect = (tab: "general" | "id" | "theme") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.pushState(null, "", url.toString());
    }
  };

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/cms");
        if (res.ok) {
          const data = await res.json();
          const brand = data.brandDetails || {};
          const bank = data.bankDetails || {};
          const commerce = data.commerceSettings || {};
          const idFormats = data.idFormats || {};

          if (brand.storeName) setStoreName(brand.storeName);
          if (brand.supportEmail) setSupportEmail(brand.supportEmail);
          if (brand.supportPhone) setSupportPhone(brand.supportPhone);
          if (brand.companyAddress) setCompanyAddress(brand.companyAddress);
          if (brand.gstin) setGstin(brand.gstin);

          if (bank.beneficiaryName) setBeneficiaryName(bank.beneficiaryName);
          if (bank.bankName) setBankName(bank.bankName);
          if (bank.accountNo) setAccountNo(bank.accountNo);
          if (bank.ifscCode) setIfscCode(bank.ifscCode);
          if (bank.branch) setBranch(bank.branch);

          if (commerce.minOrderValue) setMinOrderValue(commerce.minOrderValue);
          if (commerce.defaultTaxRate) setDefaultTaxRate(commerce.defaultTaxRate);
          if (commerce.enableCod !== undefined) setEnableCod(commerce.enableCod);
          if (commerce.enableOnlinePayment !== undefined) setEnableOnlinePayment(commerce.enableOnlinePayment);

          if (idFormats.customerPrefix !== undefined) setCustomerPrefix(idFormats.customerPrefix);
          if (idFormats.customerStart !== undefined) setCustomerStart(idFormats.customerStart);
          if (idFormats.orderPrefix !== undefined) setOrderPrefix(idFormats.orderPrefix);
          if (idFormats.orderStart !== undefined) setOrderStart(idFormats.orderStart);
          if (idFormats.productPrefix !== undefined) setProductPrefix(idFormats.productPrefix);
          if (idFormats.productStart !== undefined) setProductStart(idFormats.productStart);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const brandDetails = { storeName, supportEmail, supportPhone, companyAddress, gstin };
      const bankDetails = { beneficiaryName, bankName, accountNo, ifscCode, branch };
      const commerceSettings = { minOrderValue, defaultTaxRate, enableCod, enableOnlinePayment };
      const idFormats = { customerPrefix, customerStart, orderPrefix, orderStart, productPrefix, productStart };

      const saveReqs = [
        fetch("/api/cms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "brandDetails", value: brandDetails }) }),
        fetch("/api/cms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "bankDetails", value: bankDetails }) }),
        fetch("/api/cms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "commerceSettings", value: commerceSettings }) }),
        fetch("/api/cms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "idFormats", value: idFormats }) }),
      ];

      await Promise.all(saveReqs);
      addToast("System settings updated successfully!", "success");
    } catch (err: unknown) {
      addToast((err as any).message || "Failed to save settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground text-sm">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System & Store Settings</h1>
          <p className="text-sm text-muted-foreground">Manage corporate info, bank details, tax rates, and ID formats.</p>
        </div>
        <Button onClick={handleSaveAll} disabled={isSaving} className="font-bold cursor-pointer">
          {isSaving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b gap-4 overflow-x-auto">
        <button
          onClick={() => handleTabSelect("general")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "general" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          General & Bank Settings
        </button>
        <button
          onClick={() => handleTabSelect("id")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "id" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          ID Format Manager
        </button>
        <button
          onClick={() => handleTabSelect("theme")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "theme" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Theme & Appearance
        </button>
      </div>

      {activeTab === "general" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Store & Company Info */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Company & Support Details</CardTitle>
              <CardDescription>Displayed on invoices, purchase orders, and customer notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Store Name</label>
                <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Support Email</label>
                <Input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} type="email" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Support Phone</label>
                <Input value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Corporate GSTIN</label>
                <Input value={gstin} onChange={(e) => setGstin(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Warehouse / Billing Address</label>
                <Input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Bank Account Details */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Bank Account Details (NEFT / RTGS)</CardTitle>
              <CardDescription>Printed on B2B invoices and proforma quotes for direct bank wire transfers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Beneficiary Name</label>
                <Input value={beneficiaryName} onChange={(e) => setBeneficiaryName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bank Name</label>
                <Input value={bankName} onChange={(e) => setBankName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Number</label>
                <Input value={accountNo} onChange={(e) => setAccountNo(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">IFSC Code</label>
                <Input value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Branch Location</label>
                <Input value={branch} onChange={(e) => setBranch(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Checkout & Commerce Config */}
          <Card className="border border-border lg:col-span-2">
            <CardHeader>
              <CardTitle>Commerce & Payment Configuration</CardTitle>
              <CardDescription>Set global order minimums, default tax rates, and active payment methods.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Order Value (₹)</label>
                <Input value={minOrderValue} onChange={(e) => setMinOrderValue(e.target.value)} type="number" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Tax Rate (%)</label>
                <Input value={defaultTaxRate} onChange={(e) => setDefaultTaxRate(e.target.value)} type="number" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Enable Cash on Delivery (COD)</label>
                  <p className="text-xs text-muted-foreground">Allow COD payment method for buyers.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={enableCod} 
                  onChange={(e) => setEnableCod(e.target.checked)} 
                  className="h-4 w-4 rounded text-primary focus:ring-primary bg-background border-border cursor-pointer" 
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Enable Online Payments</label>
                  <p className="text-xs text-muted-foreground">Allow Razorpay (UPI, Cards, Netbanking).</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={enableOnlinePayment} 
                  onChange={(e) => setEnableOnlinePayment(e.target.checked)} 
                  className="h-4 w-4 rounded text-primary focus:ring-primary bg-background border-border cursor-pointer" 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : activeTab === "id" ? (
        <div className="space-y-6">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>ID Format Manager</CardTitle>
              <CardDescription>Manage customizable dynamic formats and starting counts for dynamic resources.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer ID Settings */}
                <div className="space-y-4 border p-4 rounded-lg bg-secondary/5">
                  <h3 className="font-bold text-sm text-primary uppercase border-b pb-1.5">Customer ID Format</h3>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">ID Prefix</label>
                    <Input 
                      placeholder="e.g. CUST-" 
                      value={customerPrefix} 
                      onChange={(e) => setCustomerPrefix(e.target.value)} 
                    />
                    <p className="text-[10px] text-muted-foreground">Default: <code className="bg-secondary px-1 py-0.5 rounded font-black">FSW-</code></p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Starting Sequence Count</label>
                    <Input 
                      type="number"
                      placeholder="1" 
                      value={customerStart} 
                      onChange={(e) => setCustomerStart(e.target.value)} 
                    />
                    <p className="text-[10px] text-muted-foreground font-semibold italic text-primary">Next generated ID: {customerPrefix}{(parseInt(customerStart, 10) || 1).toString(16)}</p>
                  </div>
                </div>

                {/* Order ID Settings */}
                <div className="space-y-4 border p-4 rounded-lg bg-secondary/5">
                  <h3 className="font-bold text-sm text-primary uppercase border-b pb-1.5">Order ID Format</h3>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">ID Prefix</label>
                    <Input 
                      placeholder="e.g. ORD-" 
                      value={orderPrefix} 
                      onChange={(e) => setOrderPrefix(e.target.value)} 
                    />
                    <p className="text-[10px] text-muted-foreground">Default: <code className="bg-secondary px-1 py-0.5 rounded font-black">FS-</code></p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Starting Sequence Count</label>
                    <Input 
                      type="number"
                      placeholder="1" 
                      value={orderStart} 
                      onChange={(e) => setOrderStart(e.target.value)} 
                    />
                    <p className="text-[10px] text-muted-foreground font-semibold italic text-primary">Next generated ID: {orderPrefix}{(parseInt(orderStart, 10) || 1).toString(16)}</p>
                  </div>
                </div>

                {/* Product ID Settings */}
                <div className="space-y-4 border p-4 rounded-lg bg-secondary/5 md:col-span-2">
                  <h3 className="font-bold text-sm text-primary uppercase border-b pb-1.5">Product ID Format</h3>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">ID Prefix</label>
                    <Input 
                      placeholder="e.g. PROD-" 
                      value={productPrefix} 
                      onChange={(e) => setProductPrefix(e.target.value)} 
                    />
                    <p className="text-[10px] text-muted-foreground">Default: <code className="bg-secondary px-1 py-0.5 rounded font-black">(Empty / Random 24-char ObjectId)</code></p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Starting Sequence Count</label>
                    <Input 
                      type="number"
                      placeholder="1" 
                      value={productStart} 
                      onChange={(e) => setProductStart(e.target.value)} 
                    />
                    {productPrefix && (
                      <p className="text-[10px] text-muted-foreground font-semibold italic text-primary">Next generated ID: {productPrefix}{(parseInt(productStart, 10) || 1).toString(16)}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <ThemeEditor />
      )}
    </div>
  );
}

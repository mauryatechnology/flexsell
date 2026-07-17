"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToastStore } from "@/stores/toastStore";
import { notificationService } from "@/services/notificationService";

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

  // Active tab and ID Format states
  const [activeTab, setActiveTab] = React.useState<"general" | "id">("general");
  const [customerPrefix, setCustomerPrefix] = React.useState("FSW-");
  const [customerStart, setCustomerStart] = React.useState("1");
  const [orderPrefix, setOrderPrefix] = React.useState("FS-");
  const [orderStart, setOrderStart] = React.useState("10026");
  const [productPrefix, setProductPrefix] = React.useState("");
  const [productStart, setProductStart] = React.useState("1");

  // Webhook states
  const [webhooks, setWebhooks] = React.useState<any[]>([]);
  const [webhookUrl, setWebhookUrl] = React.useState("");
  const [webhookEvent, setWebhookEvent] = React.useState<"order.created" | "order.status_updated" | "customer.created">("order.created");
  const [isSubmittingWebhook, setIsSubmittingWebhook] = React.useState(false);

  const fetchWebhooks = async () => {
    try {
      const data = await notificationService.getWebhooksAdmin();
      setWebhooks(data);
    } catch (err) {
      console.error("Failed to load webhooks:", err);
    }
  };

  const handleAddWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl || !webhookEvent) return;
    setIsSubmittingWebhook(true);
    try {
      await notificationService.addWebhookAdmin({ url: webhookUrl, event: webhookEvent });
      addToast("Webhook subscription added successfully!", "success");
      setWebhookUrl("");
      fetchWebhooks();
    } catch (err: any) {
      addToast(err.message || "Failed to save webhook", "error");
    } finally {
      setIsSubmittingWebhook(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscription?")) return;
    try {
      await notificationService.deleteWebhookAdmin(id);
      addToast("Webhook subscription deleted!", "success");
      fetchWebhooks();
    } catch (err: any) {
      addToast(err.message || "Failed to delete subscription", "error");
    }
  };

  const handleToggleWebhook = async (id: string, active: boolean) => {
    try {
      await notificationService.toggleWebhookAdmin(id, active);
      addToast("Subscription status updated", "success");
      fetchWebhooks();
    } catch (err: any) {
      addToast(err.message || "Failed to toggle status", "error");
    }
  };

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/cms");
        if (!res.ok) throw new Error("Failed to load settings");
        const data = await res.json();

        if (data.brandSettings) {
          const bs = data.brandSettings;
          setStoreName(bs.storeName || "FlexSell Wholesale");
          setSupportEmail(bs.supportEmail || "support@flexsell.in");
          setSupportPhone(bs.supportPhone || "+91 98765 43210");
          setCompanyAddress(bs.companyAddress || "123 Business Hub, Indore, MP");
          setGstin(bs.gstin || "23AAACD1234D1Z0");
          
          if (bs.bankDetails) {
            const bd = bs.bankDetails;
            setBeneficiaryName(bd.beneficiaryName || "FlexSell B2B Private Limited");
            setBankName(bd.bankName || "HDFC Bank");
            setAccountNo(bd.accountNo || "50200084729104");
            setIfscCode(bd.ifscCode || "HDFC0000024");
            setBranch(bd.branch || "Sachin GIDC, Surat");
          }
        }

        if (data.commerceSettings) {
          const cs = data.commerceSettings;
          setMinOrderValue(String(cs.minOrderValue ?? "1000"));
          setDefaultTaxRate(String(cs.defaultTaxRate ?? "18"));
          setEnableCod(cs.enableCod ?? true);
        }

        if (data.idSettings) {
          const ids = data.idSettings;
          setCustomerPrefix(ids.customerPrefix || "FSW-");
          setCustomerStart(String(ids.customerStart ?? "1"));
          setOrderPrefix(ids.orderPrefix || "FS-");
          setOrderStart(String(ids.orderStart ?? "10026"));
          setProductPrefix(ids.productPrefix || "");
          setProductStart(String(ids.productStart ?? "1"));
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
    fetchWebhooks();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // 1. Save brandSettings
      const brandRes = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "brandSettings",
          value: {
            storeName,
            supportEmail,
            supportPhone,
            companyAddress,
            gstin,
            bankDetails: {
              beneficiaryName,
              bankName,
              accountNo,
              ifscCode,
              branch
            }
          }
        })
      });

      // 2. Save commerceSettings
      const commerceRes = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "commerceSettings",
          value: {
            minOrderValue: parseFloat(minOrderValue) || 0,
            defaultTaxRate: parseFloat(defaultTaxRate) || 0,
            enableCod
          }
        })
      });

      // 3. Save idSettings
      const idRes = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "idSettings",
          value: {
            customerPrefix,
            customerStart: parseInt(customerStart, 10) || 1,
            orderPrefix,
            orderStart: parseInt(orderStart, 10) || 1,
            productPrefix,
            productStart: parseInt(productStart, 10) || 1
          }
        })
      });

      if (!brandRes.ok || !commerceRes.ok || !idRes.ok) {
        throw new Error("Failed to save settings");
      }

      addToast("Settings saved successfully!", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to save settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading brand configurations...</div>;
  }

  return (
    <div className="space-y-6 text-foreground">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site & Brand Settings</h1>
          <p className="text-muted-foreground mt-1">Manage global brand and commerce configuration.</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-border pb-px gap-4 no-print">
        <button
          onClick={() => setActiveTab("general")}
          className={`pb-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "general"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          General Configurations
        </button>
        <button
          onClick={() => setActiveTab("id")}
          className={`pb-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "id"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          ID Format Manager
        </button>
      </div>

      {activeTab === "general" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Brand Information */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Brand Information</CardTitle>
              <CardDescription>Configure your wholesale store identity details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Store/Company Name</label>
                <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Support Email</label>
                  <Input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} type="email" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Support Phone</label>
                  <Input value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Corporate Address</label>
                <Input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Seller GSTIN</label>
                <Input value={gstin} onChange={(e) => setGstin(e.target.value)} className="font-mono font-bold" />
              </div>
            </CardContent>
          </Card>

          {/* Commerce Settings */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Commerce Settings</CardTitle>
              <CardDescription>Configure order values, taxes and COD options.</CardDescription>
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
                  <label className="text-sm font-medium">Enable Cash on Delivery</label>
                  <p className="text-xs text-muted-foreground">Allow COD payment method for buyers.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={enableCod} 
                  onChange={(e) => setEnableCod(e.target.checked)} 
                  className="h-4 w-4 rounded text-primary focus:ring-primary bg-background border-border cursor-pointer" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Bank Wire Details */}
          <Card className="border border-border lg:col-span-2">
            <CardHeader>
              <CardTitle>Bank Transfer Details</CardTitle>
              <CardDescription>Wholesale wire transfer details displayed on commercial invoices.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Input value={accountNo} onChange={(e) => setAccountNo(e.target.value)} className="font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">IFSC Code</label>
                  <Input value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} className="font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Branch</label>
                  <Input value={branch} onChange={(e) => setBranch(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Webhook Settings Panel */}
          <Card className="border border-border lg:col-span-2">
            <CardHeader>
              <CardTitle>Webhook Notifications (B2B Integrations)</CardTitle>
              <CardDescription>Configure target Webhook URLs that fire on key events (checkout, shipping, signup).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-xs">
              {/* Form to Add Subscription */}
              <form onSubmit={handleAddWebhook} className="space-y-4 border-b pb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Endpoint Target URL *</label>
                    <Input 
                      placeholder="https://api.yourdomain.com/webhooks/flexsell" 
                      value={webhookUrl} 
                      onChange={(e) => setWebhookUrl(e.target.value)} 
                      required 
                      type="url"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Target Event *</label>
                    <select 
                      value={webhookEvent} 
                      onChange={(e) => setWebhookEvent(e.target.value as "order.created" | "order.status_updated" | "customer.created")} 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="order.created">order.created (On Checkout)</option>
                      <option value="order.status_updated">order.status_updated (On Ship/Deliver/Cancel)</option>
                      <option value="customer.created">customer.created (On Signup)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmittingWebhook} size="sm" className="font-bold">
                    {isSubmittingWebhook ? "Registering..." : "Add Subscription"}
                  </Button>
                </div>
              </form>

              {/* List of Subscriptions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase">Registered Webhook URL Endpoints</h4>
                {webhooks.length === 0 ? (
                  <p className="text-muted-foreground text-xs italic">No webhooks registered yet.</p>
                ) : (
                  <div className="space-y-3">
                    {webhooks.map((sub) => (
                      <div key={sub._id} className="flex flex-col md:flex-row md:items-center justify-between border rounded-lg p-3 bg-secondary/10 gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-primary">{sub.event}</span>
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <span className="font-mono text-muted-foreground break-all">{sub.url}</span>
                          </div>
                          <p className="font-mono text-[10px] text-muted-foreground">Secret Key: <code className="text-foreground bg-secondary px-1 py-0.5 rounded font-black">{sub.secret}</code></p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Active:</span>
                            <input 
                              type="checkbox" 
                              checked={sub.isActive} 
                              onChange={(e) => handleToggleWebhook(sub._id, e.target.checked)}
                              className="h-3.5 w-3.5 rounded text-primary focus:ring-primary bg-background border-border cursor-pointer"
                            />
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-destructive hover:bg-destructive/5 hover:text-destructive"
                            onClick={() => handleDeleteWebhook(sub._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>ID Format Manager</CardTitle>
              <CardDescription>Manage customizable dynamic formats and starting counts for dynamic resources. If customized prefixes are empty or set to legacy defaults (FSW- / FS- / empty), legacy ID sequences are used.</CardDescription>
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
      )}
    </div>
  );
}

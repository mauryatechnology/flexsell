"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Eye, EyeOff, ShieldCheck, Truck, Sparkles, Building2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [pinCode, setPinCode] = React.useState("");
  const [gstin, setGstin] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [customerTypes, setCustomerTypes] = React.useState<("B2C" | "B2B" | "Dropshipping")[]>(["B2C"]);

  const { registerCustomer, error, clearError } = useAuthStore();
  const { addToast } = useToastStore();

  React.useEffect(() => {
    clearError();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !phone || !password || !address || !city || !state || !pinCode) {
      addToast("Please fill in all required fields", "warning");
      return;
    }

    setIsSubmitting(true);
    const fullName = `${firstName} ${lastName}`.trim();
    const success = await registerCustomer({
      name: fullName,
      email,
      password,
      company,
      address,
      city,
      state,
      pinCode,
      phone,
      gstin,
      customerTypes,
    });
    setIsSubmitting(false);

    if (success) {
      addToast("Wholesale account created successfully!", "success");
      router.push("/client");
      router.refresh();
    } else {
      addToast(useAuthStore.getState().error || "Registration failed", "error");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-center text-foreground min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 rounded-2xl overflow-hidden border border-border shadow-xl bg-card"
      >
        {/* Left Branding Panel */}
        <div className="md:col-span-4 bg-gradient-to-br from-primary via-emerald-600 to-emerald-700 p-8 text-primary-foreground flex flex-col justify-between hidden md:flex">
          <div className="space-y-4">
            <span className="inline-block bg-white/20 backdrop-blur text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Wholesale Registration
            </span>
            <h2 className="text-2xl font-black leading-tight">
              Access Direct Manufacturer Wholesale Rates
            </h2>
            <p className="text-xs text-white/90 leading-relaxed">
              Join 2,000+ Indian retailers and dropshipper partners accessing factory prices and low MOQs.
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-white/20 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Instant B2B GST Tax Invoicing</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 shrink-0" />
              <span>Bulk Order Pricing Tiers</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 shrink-0" />
              <span>Express Surat Cargo Shipping</span>
            </div>
          </div>
        </div>

        {/* Right Registration Form */}
        <div className="md:col-span-8 p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight">Create Wholesale Account</h1>
            <p className="text-xs text-muted-foreground">
              Register your business to unlock factory pricing and dropshipping features.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-md border border-destructive/20 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">1. Personal & Login Credentials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold">First Name *</label>
                  <Input placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={isSubmitting} className="text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Last Name *</label>
                  <Input placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={isSubmitting} className="text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Email Address *</label>
                  <Input type="email" placeholder="john@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSubmitting} className="text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Phone Number *</label>
                  <Input type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={isSubmitting} className="text-xs" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold">Password *</label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} placeholder="Create password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isSubmitting} className="pr-10 text-xs" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="font-bold">Select Business Account Model *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {[
                      { type: "B2B", label: "Wholesale Buyer (B2B)", desc: "Bulk factory sourcing with GST tax invoice credits & tier discounts." },
                      { type: "Dropshipping", label: "Dropshipper Partner", desc: "White-label direct delivery to your retail customers from Surat." },
                      { type: "B2C", label: "Retail Consumer", desc: "Standard individual utility items & personal order sourcing." }
                    ].map((item) => {
                      const isSelected = customerTypes.includes(item.type as any);
                      return (
                        <div
                          key={item.type}
                          onClick={() => setCustomerTypes([item.type as any])}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected ? "border-primary bg-primary/10 shadow-sm" : "border-border hover:border-primary/40 bg-background"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">{item.label}</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 leading-normal">{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">2. Business Details & Shipping Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold">Company / Shop Name</label>
                  <Input placeholder="Doe Enterprises" value={company} onChange={(e) => setCompany(e.target.value)} disabled={isSubmitting} className="text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">GSTIN (Optional)</label>
                  <Input placeholder="24AAACD4521D1Z1" value={gstin} onChange={(e) => setGstin(e.target.value)} disabled={isSubmitting} className="text-xs" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold">Street Address *</label>
                  <Input placeholder="45 Textile Market, Ring Road" value={address} onChange={(e) => setAddress(e.target.value)} required disabled={isSubmitting} className="text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">City *</label>
                  <Input placeholder="Surat" value={city} onChange={(e) => setCity(e.target.value)} required disabled={isSubmitting} className="text-xs" />
                </div>
                <div className="space-y-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold">State *</label>
                      <Input placeholder="Gujarat" value={state} onChange={(e) => setState(e.target.value)} required disabled={isSubmitting} className="text-xs" />
                    </div>
                    <div>
                      <label className="font-bold">Pin Code *</label>
                      <Input placeholder="395002" value={pinCode} onChange={(e) => setPinCode(e.target.value)} required disabled={isSubmitting} className="text-xs" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input type="checkbox" id="terms" className="mt-0.5 rounded text-primary focus:ring-primary" required disabled={isSubmitting} />
              <label htmlFor="terms" className="text-[11px] text-muted-foreground">
                I agree to the <Link href="/policies/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/policies/privacy" className="text-primary hover:underline">Privacy Policy</Link>. I confirm I am registering a legitimate business account.
              </label>
            </div>

            <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : "Create B2B Account"}
            </Button>
          </form>

          <div className="text-center text-xs border-t pt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

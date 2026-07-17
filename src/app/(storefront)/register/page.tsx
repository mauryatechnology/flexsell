"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";

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
    <div className="container mx-auto px-4 py-12 flex justify-center text-foreground">
      <Card className="w-full max-w-2xl border border-border">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Create Wholesale Account</CardTitle>
          <CardDescription>
            Join FlexSell to access premium B2B pricing and direct manufacturer sourcing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3 font-bold">1. Account Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name *</label>
                  <Input placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name *</label>
                  <Input placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address *</label>
                  <Input type="email" placeholder="john@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number *</label>
                  <Input type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={isSubmitting} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Password *</label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isSubmitting} className="pr-10" />
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
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3 font-bold">2. Business & Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company/Business Name</label>
                  <Input placeholder="Doe Enterprises" value={company} onChange={(e) => setCompany(e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">GSTIN (Optional)</label>
                  <Input placeholder="24AAACD4521D1Z1" value={gstin} onChange={(e) => setGstin(e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Street Address *</label>
                  <Input placeholder="45 Textile Market, Ring Road" value={address} onChange={(e) => setAddress(e.target.value)} required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">City *</label>
                  <Input placeholder="Surat" value={city} onChange={(e) => setCity(e.target.value)} required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium">State *</label>
                      <Input placeholder="Gujarat" value={state} onChange={(e) => setState(e.target.value)} required disabled={isSubmitting} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Pin Code *</label>
                      <Input placeholder="395002" value={pinCode} onChange={(e) => setPinCode(e.target.value)} required disabled={isSubmitting} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input type="checkbox" id="terms" className="mt-1 rounded text-primary focus:ring-primary" required disabled={isSubmitting} />
              <label htmlFor="terms" className="text-xs text-muted-foreground">
                I agree to the <Link href="/policies/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/policies/privacy" className="text-primary hover:underline">Privacy Policy</Link>. I confirm I am registering a legitimate business account.
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="text-center text-sm border-t pt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

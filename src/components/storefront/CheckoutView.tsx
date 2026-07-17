"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCartStore } from "@/stores/cartStore";
import { useOrderStore } from "@/stores/orderStore";
import { useToastStore } from "@/stores/toastStore";
import { formatPrice } from "@/lib/utils";
import { customerService } from "@/services/customerService";
import { couponService } from "@/services/couponService";

const INDIAN_STATES = [
  "Madhya Pradesh",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Union Territory"
];

export function CheckoutView() {
  const router = useRouter();
  const { addToast } = useToastStore();
  const { items, buyerState, setBuyerState, clearCart } = useCartStore();
  const { createOrder } = useOrderStore();

  const taxDetails = React.useMemo(() => {
    return useCartStore.getState().getTaxDetails();
  }, [items, buyerState]);

  const { isIntrastate, baseSubtotal, totalCgst, totalSgst, totalIgst, grandTotal, hsnBreakdown } = taxDetails;

  // Form states
  const [email, setEmail] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [gstin, setGstin] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [apartment, setApartment] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState(INDIAN_STATES[0]);
  const [pinCode, setPinCode] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Coupon states
  const [couponCode, setCouponCode] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<any>(null);
  const [couponDiscount, setCouponDiscount] = React.useState(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = React.useState(false);

  // Admin delegation states
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [customersList, setCustomersList] = React.useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = React.useState("");
  const [savedAddresses, setSavedAddresses] = React.useState<any[]>([]);

  // Load customer on mount
  React.useEffect(() => {
    const loadCustomer = async () => {
      try {
        const customer = await customerService.getActiveCustomer();
        setCurrentUser(customer);
        
        if (customer.role === "admin") {
          const list = await customerService.getCustomers();
          setCustomersList(list);
          setState(INDIAN_STATES[0]);
          setBuyerState(INDIAN_STATES[0]);
        } else {
          setEmail(customer.email);
          
          // Fetch saved addresses
          try {
            const addrs = await customerService.getSavedAddresses();
            setSavedAddresses(addrs);
            const defaultAddr = addrs.find((a: any) => a.isDefault);
            if (defaultAddr) {
              setFirstName(defaultAddr.firstName);
              setLastName(defaultAddr.lastName);
              setCompany(defaultAddr.company || "");
              setGstin(defaultAddr.gstin || "");
              setAddress(defaultAddr.address);
              setApartment(defaultAddr.apartment || "");
              setCity(defaultAddr.city);
              setState(defaultAddr.state || INDIAN_STATES[0]);
              setPinCode(defaultAddr.pinCode);
              setPhone(defaultAddr.phone);
              setBuyerState(defaultAddr.state || INDIAN_STATES[0]);
              return;
            }
          } catch (addrErr) {
            console.error("Failed to load saved addresses", addrErr);
          }

          // Fallback to customer model fields
          setFirstName(customer.name.split(" ")[0] || "");
          setLastName(customer.name.split(" ").slice(1).join(" ") || "");
          setCompany(customer.company || "");
          setGstin(customer.gstin || "");
          setAddress(customer.address);
          setCity(customer.city);
          setState(customer.state || INDIAN_STATES[0]);
          setPinCode(customer.pinCode);
          setPhone(customer.phone);
          setBuyerState(customer.state || INDIAN_STATES[0]);
        }
      } catch (err) {
        console.error("Failed to load active customer:", err);
      }
    };
    loadCustomer();
  }, [setBuyerState]);

  const handleSelectSavedAddress = (id: string) => {
    const selected = savedAddresses.find(a => a._id === id);
    if (selected) {
      setFirstName(selected.firstName || "");
      setLastName(selected.lastName || "");
      setCompany(selected.company || "");
      setGstin(selected.gstin || "");
      setAddress(selected.address || "");
      setApartment(selected.apartment || "");
      setCity(selected.city || "");
      setState(selected.state || INDIAN_STATES[0]);
      setPinCode(selected.pinCode || "");
      setPhone(selected.phone || "");
      setBuyerState(selected.state || INDIAN_STATES[0]);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    try {
      const data = await couponService.validateCoupon(couponCode, grandTotal);
      if (!data.valid) {
        throw new Error(data.message || "Invalid coupon");
      }
      setAppliedCoupon({
        couponCode: data.coupon?.code || couponCode.toUpperCase(),
        discountAmount: data.discountAmount
      });
      setCouponDiscount(data.discountAmount);
      addToast(`Coupon "${data.coupon?.code || couponCode.toUpperCase()}" applied successfully!`, "success");
    } catch (err: any) {
      addToast(err.message || "Failed to validate coupon", "error");
      setCouponDiscount(0);
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
    addToast("Coupon removed", "info");
  };

  const handleSelectDelegatedCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const selected = customersList.find((c) => c._id === customerId);
    if (selected) {
      setEmail(selected.email || "");
      setFirstName(selected.name?.split(" ")[0] || "");
      setLastName(selected.name?.split(" ").slice(1).join(" ") || "");
      setCompany(selected.company || "");
      setGstin(selected.gstin || "");
      setAddress(selected.address || "");
      setCity(selected.city || "");
      setState(selected.state || INDIAN_STATES[0]);
      setPinCode(selected.pinCode || "");
      setPhone(selected.phone || "");
      setBuyerState(selected.state || INDIAN_STATES[0]);
    } else {
      setEmail("");
      setFirstName("");
      setLastName("");
      setCompany("");
      setGstin("");
      setAddress("");
      setCity("");
      setState(INDIAN_STATES[0]);
      setPinCode("");
      setPhone("");
      setBuyerState(INDIAN_STATES[0]);
    }
  };

  // Sync state dropdown with store POS
  const handleStateChange = (val: string) => {
    setState(val);
    setBuyerState(val);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentUser?.role === "admin") {
      if (!selectedCustomerId) {
        alert("Administrators cannot place orders for themselves. Please select a B2B customer from the dropdown list at the top.");
        return;
      }
      if (email.toLowerCase() === currentUser.email.toLowerCase()) {
        alert("Administrators cannot place orders for themselves. Please select a different B2B customer.");
        return;
      }
    }

    if (!email || !firstName || !lastName || !address || !city || !state || !pinCode || !phone) {
      alert("Please fill in all required shipping address fields.");
      return;
    }

    const shippingAddress = {
      firstName,
      lastName,
      email,
      company: company || undefined,
      address,
      apartment: apartment || undefined,
      city,
      state,
      pinCode,
      phone,
      gstin: gstin || undefined
    };

    setIsSubmitting(true);
    try {
      // Create B2B order using the dynamic grandTotal less coupon discount
      const orderId = await createOrder(items, Math.max(0, grandTotal - couponDiscount), shippingAddress);

      // Clear shopping cart
      clearCart();

      // Redirect to client or admin orders depending on who is placing the order
      if (currentUser?.role === "admin") {
        router.push(`/admin/orders?success=${orderId}`);
      } else {
        router.push(`/client/orders?success=${orderId}`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-foreground">Checkout is Unavailable</h2>
        <p className="text-muted-foreground mb-6">Your B2B shopping cart is currently empty. Add products to configure bulk pricing.</p>
        <Link href="/products">
          <Button size="lg" className="w-full">Browse Catalog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-8xl px-4 md:px-6 py-8 text-foreground w-full">
      <h1 className="text-3xl font-bold text-foreground mb-8 text-center">Secure Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div className="space-y-6">
          {currentUser?.role === "admin" && (
            <Card className="border-primary/50 border bg-primary/5">
              <CardHeader>
                <CardTitle className="text-primary text-base">
                  Placing Order on Behalf of Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="text-sm font-semibold text-foreground block">
                  Select B2B Customer <span className="text-destructive">*</span>
                </label>
                <select
                  className="h-10 px-3 rounded-md border border-border bg-background text-sm font-semibold text-foreground focus:ring-2 focus:ring-primary w-full cursor-pointer"
                  value={selectedCustomerId}
                  onChange={(e) => handleSelectDelegatedCustomer(e.target.value)}
                  required
                >
                  <option value="">-- Choose Customer --</option>
                  {customersList.map((cust) => (
                    <option key={cust._id} value={cust._id}>
                      {cust.name} ({cust._id}) - {cust.email}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Selecting a customer will automatically load their registered company address and calculate the corresponding state/IGST tax rates.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Email or mobile phone number"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="flex items-center gap-2">
                <input type="checkbox" id="offers" className="rounded text-primary focus:ring-primary bg-background" />
                <label htmlFor="offers" className="text-sm text-muted-foreground">Email me with wholesale news and offers</label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {savedAddresses.length > 0 && (
                <div className="space-y-1.5 pb-2 border-b">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Quick Select Saved Address</label>
                  <select
                    onChange={(e) => handleSelectSavedAddress(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">-- Choose a Saved Address --</option>
                    {savedAddresses.map(addr => (
                      <option key={addr._id} value={addr._id}>
                        {addr.name} ({addr.firstName} {addr.lastName} - {addr.city}, {addr.state})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Company Name (optional)"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
                <Input
                  placeholder="GSTIN (optional)"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                />
              </div>
              <Input
                placeholder="Street Address, Shop No."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <Input
                placeholder="Apartment, suite, unit, etc. (optional)"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
              />
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
                <select
                  className="h-10 px-3 rounded-md border border-border bg-background text-sm font-semibold text-foreground focus:ring-2 focus:ring-primary w-full"
                  value={state}
                  onChange={(e) => handleStateChange(e.target.value)}
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                <Input
                  placeholder="PIN Code"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  required
                />
              </div>
              <Input
                placeholder="Contact Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-md p-4 bg-secondary/30 border-border">
                <div className="flex items-center gap-3">
                  <input type="radio" id="cod" name="payment" defaultChecked className="text-primary focus:ring-primary bg-background border-border" />
                  <label htmlFor="cod" className="font-medium text-foreground">Cash on Delivery (COD)</label>
                </div>
              </div>
              <div className="border rounded-md p-4 opacity-50 cursor-not-allowed border-border">
                <div className="flex items-center gap-3">
                  <input type="radio" id="online" name="payment" disabled />
                  <label htmlFor="online" className="font-medium text-muted-foreground">Credit/Debit Card, UPI (Coming Soon)</label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20 bg-secondary/20 border-border">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-bold text-lg border-b pb-4 text-foreground">Order Summary</h3>

              <div className="space-y-2 border-b pb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground max-w-[70%] line-clamp-1">
                      {item.product.title} <span className="text-xs font-semibold text-primary">x{item.quantity}</span>
                    </span>
                    <span>{formatPrice(item.pricePerUnit * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon Entry Panel */}
              <div className="space-y-2 border-b pb-4">
                <label className="text-xs font-bold uppercase text-muted-foreground block">Have a Coupon / Promo Code?</label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-primary/10 border border-primary/20 p-2.5 rounded-lg">
                    <div>
                      <span className="font-mono font-bold text-primary text-xs">{appliedCoupon.couponCode}</span>
                      <span className="text-[10px] text-muted-foreground block">
                        Saved {formatPrice(couponDiscount)}
                      </span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-destructive font-semibold" onClick={handleRemoveCoupon}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. B2B15"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="font-mono uppercase h-9 text-xs"
                    />
                    <Button type="button" size="sm" className="h-9 font-bold px-4" onClick={handleApplyCoupon} disabled={isValidatingCoupon}>
                      {isValidatingCoupon ? "..." : "Apply"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm text-foreground">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Subtotal</span>
                  <span>{formatPrice(baseSubtotal)}</span>
                </div>

                {isIntrastate ? (
                  <>
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>CGST (Central GST)</span>
                      <span>{formatPrice(totalCgst)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>SGST (State GST)</span>
                      <span>{formatPrice(totalSgst)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-blue-600 dark:text-blue-400">
                    <span>IGST (Integrated GST)</span>
                    <span>{formatPrice(totalIgst)}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-primary font-bold">
                    <span>Coupon Discount ({appliedCoupon?.couponCode})</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-success font-medium">Free Shipping</span>
                </div>
              </div>

              {/* Dynamic HSN Slabs Summary List */}
              {Object.keys(hsnBreakdown).length > 0 && (
                <div className="border-t pt-4 space-y-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">HSN Tax Slab Breakdown</span>
                  <div className="space-y-2.5 max-h-32 overflow-y-auto pr-1">
                    {Object.values(hsnBreakdown).map((slab) => (
                      <div key={slab.hsnCode} className="text-xs flex justify-between items-start border-b border-border/40 pb-2">
                        <div>
                          <span className="font-bold text-foreground block">HSN {slab.hsnCode}</span>
                          <span className="text-muted-foreground text-[10px]">
                            Rate: {slab.gstRate}% | Base: {formatPrice(slab.baseAmount)}
                          </span>
                        </div>
                        <span className="font-semibold text-foreground">{formatPrice(slab.totalTax)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between font-bold text-lg border-t pt-4 text-foreground">
                <span>Total to Pay</span>
                <span>{formatPrice(Math.max(0, grandTotal - couponDiscount))}</span>
              </div>

              <Button type="submit" size="lg" className="w-full text-base bg-foreground text-background hover:bg-foreground/90" disabled={isSubmitting}>
                {isSubmitting ? "Placing Order..." : "Confirm Order"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By placing your order, you agree to our B2B Sourcing Terms of Service and Cargo Liability Rules.
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

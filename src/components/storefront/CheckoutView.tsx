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

  // Payment states
  const [paymentMethod, setPaymentMethod] = React.useState<"Razorpay" | "Bank Transfer">("Razorpay");
  const [bankRefNumber, setBankRefNumber] = React.useState("");
  const [showPaymentSimulation, setShowPaymentSimulation] = React.useState(false);
  const [paymentCardName, setPaymentCardName] = React.useState("");
  const [paymentCardNumber, setPaymentCardNumber] = React.useState("");
  const [paymentCardExpiry, setPaymentCardExpiry] = React.useState("");
  const [paymentCardCvv, setPaymentCardCvv] = React.useState("");
  const [isPaying, setIsPaying] = React.useState(false);

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
        router.push("/login?callbackUrl=/checkout");
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

  const handleConfirmRazorpayPayment = async (simulateStatus: "success" | "failure") => {
    if (simulateStatus === "failure") {
      alert("Payment failed. Please verify your card details or select an alternative payment method.");
      setShowPaymentSimulation(false);
      return;
    }

    setIsPaying(true);
    try {
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

      const txnId = "pay_" + Math.random().toString(36).substring(2, 10).toUpperCase();

      const orderId = await createOrder(
        items,
        Math.max(0, grandTotal - couponDiscount),
        shippingAddress,
        {
          paymentMethod: "Razorpay",
          paymentStatus: "Paid",
          transactionId: txnId
        }
      );

      clearCart();
      setShowPaymentSimulation(false);
      router.push(`/order-confirmation/${orderId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to process payment. Please try again.");
    } finally {
      setIsPaying(false);
    }
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

    if (paymentMethod === "Razorpay") {
      setShowPaymentSimulation(true);
      return;
    }

    if (paymentMethod === "Bank Transfer" && !bankRefNumber) {
      alert("Please enter the transaction reference number (UTR) for the bank wire transfer.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create B2B order using the bank wire mode
      const orderId = await createOrder(
        items, 
        Math.max(0, grandTotal - couponDiscount), 
        shippingAddress,
        {
          paymentMethod: "Bank Transfer",
          paymentStatus: "Pending",
          transactionId: bankRefNumber
        }
      );

      // Clear shopping cart
      clearCart();

      // Redirect to the professional order confirmation page
      router.push(`/order-confirmation/${orderId}`);
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
              <div 
                className={`border rounded-md p-4 cursor-pointer transition-colors ${
                  paymentMethod === "Razorpay" 
                    ? "bg-primary/5 border-primary" 
                    : "bg-secondary/30 border-border hover:bg-secondary/50"
                }`}
                onClick={() => setPaymentMethod("Razorpay")}
              >
                <div className="flex items-start gap-3">
                  <input 
                    type="radio" 
                    id="razorpay" 
                    name="payment" 
                    checked={paymentMethod === "Razorpay"}
                    onChange={() => setPaymentMethod("Razorpay")}
                    className="mt-1 text-primary focus:ring-primary bg-background border-border" 
                  />
                  <div className="flex-1">
                    <label htmlFor="razorpay" className="font-semibold text-foreground cursor-pointer block">
                      Razorpay Online Checkout
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Pay instantly using corporate credit cards, net banking, or corporate wallets.
                    </p>
                  </div>
                </div>
              </div>

              <div 
                className={`border rounded-md p-4 cursor-pointer transition-colors ${
                  paymentMethod === "Bank Transfer" 
                    ? "bg-primary/5 border-primary" 
                    : "bg-secondary/30 border-border hover:bg-secondary/50"
                }`}
                onClick={() => setPaymentMethod("Bank Transfer")}
              >
                <div className="flex items-start gap-3">
                  <input 
                    type="radio" 
                    id="bank" 
                    name="payment" 
                    checked={paymentMethod === "Bank Transfer"}
                    onChange={() => setPaymentMethod("Bank Transfer")}
                    className="mt-1 text-primary focus:ring-primary bg-background border-border" 
                  />
                  <div className="flex-1">
                    <label htmlFor="bank" className="font-semibold text-foreground cursor-pointer block">
                      Direct Bank Wire (RTGS / NEFT / IMPS)
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Send funds directly to our corporate bank account. Goods will be dispatched after receipt verification.
                    </p>
                    
                    {paymentMethod === "Bank Transfer" && (
                      <div className="mt-4 pt-4 border-t border-dashed border-border/80 space-y-3">
                        <div className="bg-secondary/40 p-3 rounded text-xs space-y-1">
                          <p><span className="font-bold text-muted-foreground">Bank:</span> HDFC Bank</p>
                          <p><span className="font-bold text-muted-foreground">A/C Name:</span> FlexSell Wholesale Pvt Ltd</p>
                          <p><span className="font-bold text-muted-foreground">A/C Number:</span> 50200084596321</p>
                          <p><span className="font-bold text-muted-foreground">IFSC Code:</span> HDFC0000182</p>
                          <p><span className="font-bold text-muted-foreground">Branch:</span> Ring Road, Surat</p>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-foreground block">
                            Bank Reference / UTR Number <span className="text-destructive">*</span>
                          </label>
                          <Input
                            placeholder="Enter 12-digit UTR/Txn ID"
                            value={bankRefNumber}
                            onChange={(e) => setBankRefNumber(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
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

      {/* Razorpay Online Payment Gateway Simulation Dialog */}
      {showPaymentSimulation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Razorpay Header Bar */}
            <div className="bg-[#1A253C] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded bg-blue-500 flex items-center justify-center font-bold text-white text-sm">R</div>
                <div>
                  <h3 className="font-bold text-sm leading-none">Razorpay Secure</h3>
                  <span className="text-[10px] text-gray-400">FlexSell Wholesale Gateway</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block font-medium">AMOUNT</span>
                <span className="font-mono font-bold text-sm text-blue-400">
                  {formatPrice(Math.max(0, grandTotal - couponDiscount))}
                </span>
              </div>
            </div>

            {/* Simulated Form Details */}
            <div className="p-6 space-y-5">
              <div className="bg-blue-500/5 border border-blue-500/10 p-3.5 rounded-lg text-xs leading-relaxed text-blue-600 dark:text-blue-400">
                <strong>Simulated Sandbox:</strong> Verify card credentials and choose payment outcome. No real money will be charged.
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Card Holder Name</label>
                  <Input 
                    placeholder="e.g. John Doe Corp" 
                    value={paymentCardName}
                    onChange={(e) => setPaymentCardName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Card Number</label>
                  <Input 
                    placeholder="4111 2222 3333 4444" 
                    value={paymentCardNumber}
                    onChange={(e) => setPaymentCardNumber(e.target.value)}
                    maxLength={19}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase">Expiry Date</label>
                    <Input 
                      placeholder="MM/YY" 
                      value={paymentCardExpiry}
                      onChange={(e) => setPaymentCardExpiry(e.target.value)}
                      maxLength={5}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase">CVV / CVN</label>
                    <Input 
                      type="password" 
                      placeholder="•••" 
                      value={paymentCardCvv}
                      onChange={(e) => setPaymentCardCvv(e.target.value)}
                      maxLength={3}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2.5">
                <Button 
                  type="button" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm h-11"
                  onClick={() => handleConfirmRazorpayPayment("success")}
                  disabled={isPaying}
                >
                  {isPaying ? "Processing Payment..." : "Simulate Payment Success"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold text-xs h-10"
                  onClick={() => handleConfirmRazorpayPayment("failure")}
                  disabled={isPaying}
                >
                  Simulate Payment Failure
                </Button>
                <Button 
                  type="button" 
                  variant="ghost"
                  className="w-full text-xs text-muted-foreground hover:text-foreground h-9"
                  onClick={() => setShowPaymentSimulation(false)}
                  disabled={isPaying}
                >
                  Cancel and go back
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

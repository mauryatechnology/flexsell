"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCartStore } from "@/stores/cartStore";
import { useOrderStore } from "@/stores/orderStore";
import { formatPrice } from "@/lib/utils";

export function CheckoutView() {
  const router = useRouter();
  const { items, getCartSubtotal, clearCart } = useCartStore();
  const { createOrder } = useOrderStore();

  const subtotal = getCartSubtotal();
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;

  // Form states
  const [email, setEmail] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [apartment, setApartment] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [pinCode, setPinCode] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

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
      phone
    };

    // Create B2B order
    const orderId = createOrder(items, total, shippingAddress);

    // Clear shopping cart
    clearCart();

    // Redirect to client orders
    router.push(`/client/orders?success=${orderId}`);
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
    <div className="container mx-auto px-4 py-8 text-foreground">
      <h1 className="text-3xl font-bold text-foreground mb-8 text-center">Secure Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div className="space-y-6">
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
              <Input 
                placeholder="Company Name (optional)" 
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
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
                <Input 
                  placeholder="State" 
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
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

              <div className="space-y-3 text-sm text-foreground">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated GST (18%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-success font-medium">Free Shipping</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg border-t pt-4 text-foreground">
                <span>Total to Pay</span>
                <span>{formatPrice(total)}</span>
              </div>

              <Button type="submit" size="lg" className="w-full text-base bg-foreground text-background hover:bg-foreground/90">
                Confirm Order
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

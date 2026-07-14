"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Trash2, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";

export function CartView() {
  const { items, updateQuantity, removeItem, getCartSubtotal } = useCartStore();

  const subtotal = getCartSubtotal();
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <div className="bg-secondary/40 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Your B2B Cart is Empty</h2>
        <p className="text-muted-foreground mb-8">Choose from our wholesale catalogue direct from Surat manufacturers.</p>
        <Link href="/products">
          <Button size="lg" className="w-full">Explore All Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/products" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const formattedVariants = Object.entries(item.selectedVariants)
              .map(([key, val]) => `${key}: ${val}`)
              .join(", ");
            return (
              <Card key={item.id}>
                <CardContent className="p-4 flex gap-4">
                  <div className="w-24 h-24 bg-secondary rounded-md overflow-hidden flex-shrink-0">
                    <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground line-clamp-1">{item.product.title}</h3>
                      <p className="text-xs text-muted-foreground">SKU: {item.product.sku}</p>
                      {formattedVariants && (
                        <p className="text-xs text-primary font-medium mt-1">{formattedVariants}</p>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 px-0 text-foreground"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 px-0 text-foreground"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-foreground">{formatPrice(item.pricePerUnit * item.quantity)}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div>
          <Card>
            <CardContent className="p-6 space-y-6">
              <h3 className="font-bold text-lg border-b pb-4 text-foreground">Order Summary</h3>
              
              <div className="space-y-3 text-sm text-foreground">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Tax (18% GST)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-success font-medium">Free</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg border-t pt-4 text-foreground">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              <div className="space-y-3">
                <Input placeholder="Discount code (optional)" className="text-foreground" />
                <Button className="w-full">Apply Code</Button>
              </div>

              <Link href="/checkout" className="block mt-6">
                <Button size="lg" className="w-full text-base bg-foreground text-background hover:bg-foreground/90">
                  Proceed to Checkout
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

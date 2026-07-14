import * as React from "react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Package, Truck, Handshake, IndianRupee } from "lucide-react";
import { pagesContent } from "@/data/pagesContent";

export const metadata: Metadata = {
  title: "B2B Dropshipping & Franchise Programs",
  description: "Sell thousands of trending wholesale goods without holding stock. Join our white-label B2B dropshipping fulfillment or open an offline franchise outlet."
};

export default function DropshippingPage() {
  const dropshipData = pagesContent.dropshipping;
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold mb-4 inline-block">{dropshipData.badge}</span>
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">{dropshipData.title}</h1>
        <p className="text-lg text-muted-foreground">{dropshipData.subtitle}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-secondary/30 p-8 rounded-xl border flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-4">{dropshipData.dropshipTitle}</h2>
            <ul className="space-y-4 mb-6">
              {dropshipData.dropshipBullets.map((bullet, idx) => (
                <li key={idx} className="flex gap-3">
                  <Package className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> 
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
          <Button className="w-full mt-4">{dropshipData.ctaDropship}</Button>
        </div>
        
        <div className="bg-secondary/30 p-8 rounded-xl border flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-4">{dropshipData.franchiseTitle}</h2>
            <ul className="space-y-4 mb-6">
              {dropshipData.franchiseBullets.map((bullet, idx) => (
                <li key={idx} className="flex gap-3">
                  <Handshake className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> 
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
          <Button className="w-full mt-4" variant="outline">{dropshipData.ctaFranchise}</Button>
        </div>
      </div>
    </div>
  );
}

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";

interface PaymentSectionProps {
  paymentMethod: "Razorpay" | "Bank Transfer";
  setPaymentMethod: (val: "Razorpay" | "Bank Transfer") => void;
  bankRefNumber: string;
  setBankRefNumber: (val: string) => void;
}

export function PaymentSection({
  paymentMethod,
  setPaymentMethod,
  bankRefNumber,
  setBankRefNumber
}: PaymentSectionProps) {
  return (
    <>
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

    </>
  );
}

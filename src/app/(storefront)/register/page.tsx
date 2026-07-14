import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">Create Wholesale Account</CardTitle>
          <CardDescription>Join FlexSell to access premium B2B pricing and direct manufacturer sourcing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input placeholder="Doe" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input type="email" placeholder="john@company.com" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input type="tel" placeholder="+91 98765 43210" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Company/Business Name</label>
              <Input placeholder="Doe Enterprises" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input type="password" placeholder="Create a strong password" />
            </div>
            
            <div className="flex items-start gap-2 pt-2">
              <input type="checkbox" id="terms" className="mt-1 rounded text-primary focus:ring-primary" required />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the <Link href="/policies/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/policies/privacy" className="text-primary hover:underline">Privacy Policy</Link>. I confirm I am registering a legitimate business account.
              </label>
            </div>
            
            <Link href="/client" className="block pt-2">
              <Button className="w-full">Create Account</Button>
            </Link>
          </form>

          <div className="text-center text-sm border-t pt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

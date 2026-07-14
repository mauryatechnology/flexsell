import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email or Phone</label>
              <Input placeholder="Enter your email or phone number" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Password</label>
                <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <Input type="password" placeholder="Enter your password" />
            </div>
            
            <Link href="/client">
              <Button className="w-full mt-2">Sign In</Button>
            </Link>
          </form>

          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Register now
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

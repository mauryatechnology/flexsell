"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { login, loginWithGoogle, error, clearError } = useAuthStore();
  const { addToast } = useToastStore();

  React.useEffect(() => {
    // Clear any previous auth errors when page loads
    clearError();

    // Dynamically load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if ((window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: "652908610181-88s80steoogb6d6lsg60eo5vsc7pn5ff.apps.googleusercontent.com",
          callback: handleGoogleResponse,
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: "100%", text: "signin_with" }
        );
      }
    };

    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {
        // Ignore if already removed
      }
    };
  }, []);

  const handleGoogleResponse = async (response: any) => {
    setIsSubmitting(true);
    try {
      const success = await loginWithGoogle(response.credential);
      if (success) {
        addToast("Logged in via Google successfully!", "success");
        // Get user role to determine redirection
        const currentCustomer = useAuthStore.getState().customer;
        const redirectDest = currentCustomer?.role === "admin" ? "/admin" : (callbackUrl || "/client");
        router.push(redirectDest);
        router.refresh();
      } else {
        addToast("Google Sign-In failed", "error");
      }
    } catch (err: any) {
      addToast(err.message || "Google Sign-In failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      addToast("Please fill in all fields", "warning");
      return;
    }

    setIsSubmitting(true);
    const success = await login(identifier, password);
    setIsSubmitting(false);

    if (success) {
      addToast("Signed in successfully!", "success");
      const currentCustomer = useAuthStore.getState().customer;
      const redirectDest = currentCustomer?.role === "admin" ? "/admin" : (callbackUrl || "/client");
      router.push(redirectDest);
      router.refresh();
    } else {
      addToast(useAuthStore.getState().error || "Invalid credentials", "error");
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center text-foreground">
      <Card className="w-full max-w-md border border-border">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Enter your email/Customer ID and password to access your B2B account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email or Customer ID (e.g. FSW-0001)</label>
              <Input
                type="text"
                placeholder="Enter email or FSW-000x"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase">Or continue with</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <div id="google-signin-btn" className="w-full flex justify-center"></div>

          <div className="text-center text-sm border-t pt-4">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Register now
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={
      <div className="container mx-auto px-4 py-16 flex justify-center text-foreground">
        <div className="text-center font-medium">Loading form...</div>
      </div>
    }>
      <LoginForm />
    </React.Suspense>
  );
}

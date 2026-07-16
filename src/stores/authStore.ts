import { create } from "zustand";
import { Customer } from "@/types";

interface AuthState {
  customer: Customer | null;
  isLoading: boolean;
  error: string | null;
  
  login: (identifier: string, password: string) => Promise<boolean>;
  registerCustomer: (data: any) => Promise<boolean>;
  loginWithGoogle: (idToken: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  customer: null,
  isLoading: false,
  error: null,

  login: async (identifier, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      set({ customer: data.customer, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  registerCustomer: async (customerData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      set({ customer: data.customer, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  loginWithGoogle: async (idToken) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google authentication failed");
      set({ customer: data.customer, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout API failed", err);
    } finally {
      set({ customer: null, isLoading: false });
      window.location.href = "/login";
    }
  },

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/customers/active");
      if (res.ok) {
        const data = await res.json();
        set({ customer: data });
      } else {
        set({ customer: null });
      }
    } catch (err) {
      set({ customer: null });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

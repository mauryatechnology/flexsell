import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  price: number,
  options: {
    currency?: "INR" | "USD" | "EUR" | "GBP";
    notation?: Intl.NumberFormatOptions["notation"];
  } = {}
) {
  let { currency, notation = "standard" } = options;

  if (!currency && typeof window !== "undefined") {
    try {
      const store = require("@/stores/currencyStore");
      currency = store.useCurrencyStore.getState().currency;
    } catch {
      // Fallback
    }
  }
  if (!currency) currency = "INR";

  const LOCALES: Record<string, string> = {
    INR: "en-IN",
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB"
  };

  const exchangeRates: Record<string, number> = {
    INR: 1.0,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0093
  };

  const rate = exchangeRates[currency] || 1.0;
  const converted = price * rate;

  return new Intl.NumberFormat(LOCALES[currency] || "en-IN", {
    style: "currency",
    currency,
    notation,
    maximumFractionDigits: 2,
  }).format(converted);
}

export function truncate(str: string, length: number) {
  if (!str) return "";
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export function sanitizeImgUrl(
  url: string,
  fallback: string = "https://placehold.co/400x400/10b981/ffffff?text=Product"
): string {
  if (!url) return fallback;
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed;
  }
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }
  if (trimmed.match(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/|$)/)) {
    return `https://${trimmed}`;
  }
  return `/${trimmed}`;
}

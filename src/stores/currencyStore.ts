import { create } from "zustand";

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP";

interface CurrencyState {
  currency: CurrencyCode;
  exchangeRate: number;
  setCurrency: (code: CurrencyCode) => void;
  convertPrice: (priceInInr: number) => number;
  formatPriceWithCurrency: (priceInInr: number) => string;
}

const RATES: Record<CurrencyCode, number> = {
  INR: 1.0,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0093
};

const LOCALES: Record<CurrencyCode, string> = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB"
};

export const useCurrencyStore = create<CurrencyState>()((set, get) => ({
  currency: (typeof window !== "undefined" && localStorage.getItem("flexsell-currency") as CurrencyCode) || "INR",
  exchangeRate: RATES[(typeof window !== "undefined" && localStorage.getItem("flexsell-currency") as CurrencyCode) || "INR"],

  setCurrency: (code) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("flexsell-currency", code);
    }
    set({
      currency: code,
      exchangeRate: RATES[code]
    });
  },

  convertPrice: (priceInInr) => {
    return priceInInr * get().exchangeRate;
  },

  formatPriceWithCurrency: (priceInInr) => {
    const { currency, exchangeRate } = get();
    const converted = priceInInr * exchangeRate;
    return new Intl.NumberFormat(LOCALES[currency], {
      style: "currency",
      currency,
      maximumFractionDigits: 2
    }).format(converted);
  }
}));

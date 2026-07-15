import { create } from "zustand";
import { apiClient, isMockMode, delay } from "@/lib/apiClient";

export interface StockLog {
  _id: string;
  sku: string;
  productName: string;
  variantDetails: string;
  actionType: "Scan Adjustment" | "CSV Bulk Import" | "Order Deduction" | "Manual Adjustment";
  change: number;
  prevStock: number;
  newStock: number;
  timestamp: string;
}

interface InventoryHistoryState {
  logs: StockLog[];
  isLoading: boolean;
  error: string | null;
  initializeLogs: () => Promise<void>;
  addLog: (log: Omit<StockLog, "_id" | "timestamp">) => Promise<void>;
  clearLogs: () => Promise<void>;
}

const MOCK_STORAGE_KEY = "flexsell-inventory-history-storage";

function getMockLogs(): StockLog[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(MOCK_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error("Error parsing mock logs", e);
    }
  }
  return [];
}

function saveMockLogs(logs: StockLog[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(logs));
}

export const useInventoryHistoryStore = create<InventoryHistoryState>()((set, get) => ({
  logs: [],
  isLoading: false,
  error: null,

  initializeLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      if (isMockMode) {
        await delay();
        set({ logs: getMockLogs(), isLoading: false });
        return;
      }
      const data = await apiClient.get<StockLog[]>("/inventory/ledger");
      set({ logs: data, isLoading: false });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : "Failed to load ledger history", 
        isLoading: false 
      });
    }
  },

  addLog: async (logData) => {
    try {
      const payload = {
        ...logData,
        timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      };
      
      if (isMockMode) {
        await delay();
        const current = getMockLogs();
        const newLog: StockLog = {
          ...payload,
          _id: Math.random().toString(36).substring(2, 11),
        };
        const updated = [newLog, ...current];
        saveMockLogs(updated);
        set({ logs: updated });
        return;
      }

      const newLog = await apiClient.post<StockLog>("/inventory/ledger", payload);
      set((state) => ({ logs: [newLog, ...state.logs] }));
    } catch (err) {
      console.error("Failed to persist stock log to DB", err);
      // Fallback: local state insert to not break UI operations
      const newLog: StockLog = {
        ...logData,
        _id: Math.random().toString(36).substring(2, 11),
        timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      };
      set((state) => ({ logs: [newLog, ...state.logs] }));
    }
  },

  clearLogs: async () => {
    set({ isLoading: true });
    try {
      if (isMockMode) {
        await delay();
        saveMockLogs([]);
        set({ logs: [], isLoading: false });
        return;
      }
      await apiClient.delete<void>("/inventory/ledger");
      set({ logs: [], isLoading: false });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : "Failed to clear ledger history", 
        isLoading: false 
      });
    }
  },
}));

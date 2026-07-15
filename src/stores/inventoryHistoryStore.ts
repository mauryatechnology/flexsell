import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface StockLog {
  id: string;
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
  addLog: (log: Omit<StockLog, "id" | "timestamp">) => void;
  clearLogs: () => void;
}

export const useInventoryHistoryStore = create<InventoryHistoryState>()(
  persist(
    (set) => ({
      logs: [],
      addLog: (logData) => set((state) => {
        const newLog: StockLog = {
          ...logData,
          id: Math.random().toString(36).substring(2, 11),
          timestamp: new Date().toLocaleString("en-IN"),
        };
        return { logs: [newLog, ...state.logs] };
      }),
      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: "flexsell-inventory-history-storage",
    }
  )
);

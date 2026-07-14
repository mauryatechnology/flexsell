import { create } from "zustand";
import { persist } from "zustand/middleware";
import { HsnRecord } from "@/types";

interface HsnStoreState {
  hsns: HsnRecord[];
  supplierState: string; // Default: "Madhya Pradesh"
  initializeHsns: () => void;
  addHsn: (hsn: Omit<HsnRecord, "_id" | "createdAt" | "updatedAt">) => void;
  updateHsn: (id: string, updatedFields: Partial<HsnRecord>) => void;
  deleteHsn: (id: string) => void;
  setSupplierState: (stateName: string) => void;
}

export const useHsnStore = create<HsnStoreState>()(
  persist(
    (set, get) => ({
      hsns: [],
      supplierState: "Madhya Pradesh",

      initializeHsns: () => {
        if (get().hsns.length === 0) {
          const defaultHsns: HsnRecord[] = [
            {
              _id: "hsn_3924",
              code: "3924",
              gstRate: 18,
              description: "Plastics tableware, kitchenware, other household articles",
              isActive: true
            },
            {
              _id: "hsn_7323",
              code: "7323",
              gstRate: 12,
              description: "Table, kitchen or other household articles of iron or steel",
              isActive: true
            },
            {
              _id: "hsn_8215",
              code: "8215",
              gstRate: 18,
              description: "Spoons, forks, ladles, skimmers, cake-servers, fish-knives, butter-knives",
              isActive: true
            },
            {
              _id: "hsn_6304",
              code: "6304",
              gstRate: 5,
              description: "Other furnishing articles, bedsheets, blankets, towels",
              isActive: true
            },
            {
              _id: "hsn_8509",
              code: "8509",
              gstRate: 18,
              description: "Electro-mechanical domestic appliances with self-contained electric motor",
              isActive: true
            }
          ];
          set({ hsns: defaultHsns });
        }
      },

      addHsn: (hsnData) => set((state) => {
        const newRecord: HsnRecord = {
          ...hsnData,
          _id: `hsn_${Math.random().toString(36).substring(2, 9)}`,
          createdAt: new Date().toISOString()
        };
        return { hsns: [...state.hsns, newRecord] };
      }),

      updateHsn: (id, updatedFields) => set((state) => ({
        hsns: state.hsns.map(h => 
          h._id === id ? { ...h, ...updatedFields, updatedAt: new Date().toISOString() } : h
        )
      })),

      deleteHsn: (id) => set((state) => ({
        hsns: state.hsns.filter(h => h._id !== id)
      })),

      setSupplierState: (stateName) => set({ supplierState: stateName })
    }),
    {
      name: "flexsell-hsn-storage",
    }
  )
);

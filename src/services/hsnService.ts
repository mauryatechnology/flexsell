import { HsnRecord } from "@/types";
import { apiClient, isMockMode, delay } from "@/lib/apiClient";

const MOCK_STORAGE_KEY = "flexsell-hsn-storage";

function getMockHsns(): HsnRecord[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(MOCK_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.state?.hsns) {
        return parsed.state.hsns;
      }
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error("Error parsing mock hsns", e);
    }
  }

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

  saveMockHsns(defaultHsns);
  return defaultHsns;
}

function saveMockHsns(hsns: HsnRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    MOCK_STORAGE_KEY,
    JSON.stringify({
      state: { hsns },
      version: 0,
    })
  );
}

export const hsnService = {
  async getHsnRecords(): Promise<HsnRecord[]> {
    if (isMockMode) {
      await delay();
      return getMockHsns();
    }
    return apiClient.get<HsnRecord[]>("/hsn");
  },

  async createHsnRecord(
    hsnData: Omit<HsnRecord, "_id" | "createdAt" | "updatedAt">
  ): Promise<HsnRecord> {
    if (isMockMode) {
      await delay();
      const hsns = getMockHsns();
      const newRecord: HsnRecord = {
        ...hsnData,
        _id: `hsn_${Math.random().toString(36).substring(2, 9)}`,
        createdAt: new Date().toISOString()
      };
      saveMockHsns([...hsns, newRecord]);
      return newRecord;
    }
    return apiClient.post<HsnRecord>("/hsn", hsnData);
  },

  async updateHsnRecord(
    id: string,
    updatedFields: Partial<HsnRecord>
  ): Promise<HsnRecord> {
    if (isMockMode) {
      await delay();
      const hsns = getMockHsns();
      let updatedRecord: HsnRecord | null = null;

      const newHsns = hsns.map((h) => {
        if (h._id === id) {
          updatedRecord = {
            ...h,
            ...updatedFields,
            updatedAt: new Date().toISOString()
          };
          return updatedRecord;
        }
        return h;
      });

      if (!updatedRecord) throw new Error("HSN record not found");
      saveMockHsns(newHsns);
      return updatedRecord;
    }
    return apiClient.put<HsnRecord>(`/hsn/${id}`, updatedFields);
  },

  async deleteHsnRecord(id: string): Promise<void> {
    if (isMockMode) {
      await delay();
      const hsns = getMockHsns();
      const newHsns = hsns.filter((h) => h._id !== id);
      saveMockHsns(newHsns);
      return;
    }
    return apiClient.delete<void>(`/hsn/${id}`);
  }
};

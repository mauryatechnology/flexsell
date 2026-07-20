import { Customer, SavedAddress } from "@/types";
import { apiClient, isMockMode } from "@/lib/apiClient";

const ADDRESSES_STORAGE_KEY = "flexsell-addresses-storage";

function getLocalAddresses(): SavedAddress[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ADDRESSES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to read addresses from localStorage", err);
    return [];
  }
}

function saveLocalAddresses(addresses: SavedAddress[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
  } catch (err) {
    console.error("Failed to save addresses to localStorage", err);
  }
}

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    return apiClient.get<Customer[]>("/customers");
  },

  async getActiveCustomer(): Promise<Customer> {
    return apiClient.get<Customer>("/customers/active");
  },

  async updateActiveCustomer(data: Partial<Customer>): Promise<Customer> {
    return apiClient.put<Customer>("/customers/active", data);
  },

  async getSavedAddresses(): Promise<SavedAddress[]> {
    if (isMockMode) {
      return getLocalAddresses();
    }
    return apiClient.get<SavedAddress[]>("/customers/addresses");
  },

  async addSavedAddress(data: Omit<SavedAddress, "_id">): Promise<SavedAddress[]> {
    if (isMockMode) {
      const addresses = getLocalAddresses();
      const newAddress: SavedAddress = {
        ...data,
        _id: "addr-" + Date.now(),
      };
      if (newAddress.isDefault) {
        addresses.forEach(a => { a.isDefault = false; });
      }
      const updated = [...addresses, newAddress];
      saveLocalAddresses(updated);
      return updated;
    }
    return apiClient.post<SavedAddress[]>("/customers/addresses", data);
  },

  async updateSavedAddress(data: SavedAddress): Promise<SavedAddress[]> {
    if (isMockMode) {
      const addresses = getLocalAddresses();
      const updated = addresses.map(a => {
        if (a._id === data._id) {
          return { ...a, ...data };
        }
        if (data.isDefault) {
          return { ...a, isDefault: false };
        }
        return a;
      });
      saveLocalAddresses(updated);
      return updated;
    }
    return apiClient.put<SavedAddress[]>("/customers/addresses", data);
  },

  async deleteSavedAddress(id: string): Promise<SavedAddress[]> {
    if (isMockMode) {
      const addresses = getLocalAddresses();
      const updated = addresses.filter(a => a._id !== id);
      saveLocalAddresses(updated);
      return updated;
    }
    return apiClient.delete<SavedAddress[]>(`/customers/addresses?id=${id}`);
  }
};

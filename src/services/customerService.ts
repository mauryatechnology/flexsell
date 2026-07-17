import { Customer, SavedAddress } from "@/types";
import { apiClient, isMockMode, delay } from "@/lib/apiClient";

const staticActiveCustomer: Customer = {
  _id: "60c72b2f9b1d8e001c8e2001",
  name: "John Doe",
  email: "john@doeent.com",
  company: "Doe Ent.",
  address: "45 Textile Market, Ring Road",
  city: "Surat",
  state: "Gujarat",
  pinCode: "395002",
  phone: "+91 98765 43210",
  initials: "JD",
  gstin: "24AAACD4521D1Z1"
};

const staticCustomers: Customer[] = [staticActiveCustomer];
const ADDRESS_STORAGE_KEY = "flexsell-addresses-storage";

function getMockAddresses(): SavedAddress[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(ADDRESS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing mock addresses", e);
    }
  }
  const defaultMock: SavedAddress[] = [
    {
      _id: "addr_1",
      name: "Surat Office",
      firstName: "John",
      lastName: "Doe",
      company: "Doe Ent.",
      address: "45 Textile Market, Ring Road",
      apartment: "2nd Floor",
      city: "Surat",
      state: "Gujarat",
      pinCode: "395002",
      phone: "+91 98765 43210",
      gstin: "24AAACD4521D1Z1",
      isDefault: true
    }
  ];
  saveMockAddresses(defaultMock);
  return defaultMock;
}

function saveMockAddresses(addresses: SavedAddress[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(addresses));
}

const CUSTOMER_STORAGE_KEY = "flexsell-active-customer-storage";

function getMockActiveCustomer(): Customer {
  if (typeof window === "undefined") return staticActiveCustomer;
  const stored = localStorage.getItem(CUSTOMER_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing mock active customer", e);
    }
  }
  saveMockActiveCustomer(staticActiveCustomer);
  return staticActiveCustomer;
}

function saveMockActiveCustomer(customer: Customer) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer));
}

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    if (isMockMode) {
      await delay();
      return [getMockActiveCustomer()];
    }
    return apiClient.get<Customer[]>("/customers");
  },

  async getActiveCustomer(): Promise<Customer> {
    if (isMockMode) {
      await delay();
      return getMockActiveCustomer();
    }
    return apiClient.get<Customer>("/customers/active");
  },

  async updateActiveCustomer(data: Partial<Customer>): Promise<Customer> {
    if (isMockMode) {
      await delay();
      const current = getMockActiveCustomer();
      const updated = { ...current, ...data };
      saveMockActiveCustomer(updated);
      return updated;
    }
    return apiClient.put<Customer>("/customers/active", data);
  },

  async getSavedAddresses(): Promise<SavedAddress[]> {
    if (isMockMode) {
      await delay();
      return getMockAddresses();
    }
    return apiClient.get<SavedAddress[]>("/customers/addresses");
  },

  async addSavedAddress(data: Omit<SavedAddress, "_id">): Promise<SavedAddress[]> {
    if (isMockMode) {
      await delay();
      const list = getMockAddresses();
      const newAddr: SavedAddress = {
        ...data,
        _id: "addr_" + Math.random().toString(36).substring(2, 9),
      };
      if (newAddr.isDefault) {
        list.forEach(a => a.isDefault = false);
      }
      list.push(newAddr);
      if (list.length === 1) list[0].isDefault = true;
      saveMockAddresses(list);
      return list;
    }
    return apiClient.post<SavedAddress[]>("/customers/addresses", data);
  },

  async updateSavedAddress(data: SavedAddress): Promise<SavedAddress[]> {
    if (isMockMode) {
      await delay();
      const list = getMockAddresses();
      if (data.isDefault) {
        list.forEach(a => a.isDefault = false);
      }
      const updated = list.map(a => a._id === data._id ? { ...a, ...data } : a);
      saveMockAddresses(updated);
      return updated;
    }
    return apiClient.put<SavedAddress[]>("/customers/addresses", data);
  },

  async deleteSavedAddress(id: string): Promise<SavedAddress[]> {
    if (isMockMode) {
      await delay();
      const list = getMockAddresses();
      const filtered = list.filter(a => a._id !== id);
      const wasDefault = list.find(a => a._id === id)?.isDefault;
      if (wasDefault && filtered.length > 0) {
        filtered[0].isDefault = true;
      }
      saveMockAddresses(filtered);
      return filtered;
    }
    return apiClient.delete<SavedAddress[]>(`/customers/addresses?id=${id}`);
  }
};

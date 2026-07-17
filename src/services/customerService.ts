import { Customer, SavedAddress } from "@/types";
import { apiClient } from "@/lib/apiClient";

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
    return apiClient.get<SavedAddress[]>("/customers/addresses");
  },

  async addSavedAddress(data: Omit<SavedAddress, "_id">): Promise<SavedAddress[]> {
    return apiClient.post<SavedAddress[]>("/customers/addresses", data);
  },

  async updateSavedAddress(data: SavedAddress): Promise<SavedAddress[]> {
    return apiClient.put<SavedAddress[]>("/customers/addresses", data);
  },

  async deleteSavedAddress(id: string): Promise<SavedAddress[]> {
    return apiClient.delete<SavedAddress[]>(`/customers/addresses?id=${id}`);
  }
};

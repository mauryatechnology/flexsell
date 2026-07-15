import { Customer } from "@/data/customers";
import { customers as staticCustomers, activeCustomer as staticActiveCustomer } from "@/data/customers";
import { apiClient, isMockMode, delay } from "@/lib/apiClient";

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    if (isMockMode) {
      await delay();
      return staticCustomers;
    }
    return apiClient.get<Customer[]>("/customers");
  },

  async getActiveCustomer(): Promise<Customer> {
    if (isMockMode) {
      await delay();
      return staticActiveCustomer;
    }
    return apiClient.get<Customer>("/customers/active");
  }
};

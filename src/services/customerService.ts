import { Customer } from "@/data/customers";
import { customers as staticCustomers, activeCustomer as staticActiveCustomer } from "@/data/customers";
import { apiClient, isMockMode, delay } from "@/lib/apiClient";

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    if (isMockMode) {
      await delay();
      return staticCustomers;
    }
    if (typeof window === "undefined") {
      const dbConnect = (await import("@/lib/dbConnect")).default;
      await dbConnect();
      const CustomerModel = (await import("@/models/Customer")).default;
      const customersList = await CustomerModel.find({}).lean();
      return JSON.parse(JSON.stringify(customersList));
    }
    return apiClient.get<Customer[]>("/customers");
  },

  async getActiveCustomer(): Promise<Customer> {
    if (isMockMode) {
      await delay();
      return staticActiveCustomer;
    }
    if (typeof window === "undefined") {
      const dbConnect = (await import("@/lib/dbConnect")).default;
      await dbConnect();
      const CustomerModel = (await import("@/models/Customer")).default;
      const customer = await CustomerModel.findOne({}).lean();
      if (!customer) throw new Error("No active customer found");
      return JSON.parse(JSON.stringify(customer));
    }
    return apiClient.get<Customer>("/customers/active");
  }
};

import { Customer } from "@/types";
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
      if (!customer) return staticActiveCustomer;
      return JSON.parse(JSON.stringify(customer));
    }
    return apiClient.get<Customer>("/customers/active");
  }
};

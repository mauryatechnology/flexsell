import { describe, it, expect, beforeEach } from "vitest";

// Mock localStorage and window before importing the services
const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => { mockStorage[key] = value; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => {
    for (const key in mockStorage) {
      delete mockStorage[key];
    }
  },
};

global.window = {} as any;
global.localStorage = localStorageMock as any;

import { customerService } from "@/services/customerService";

describe("CustomerService (Mock Mode)", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("should retrieve active customer profile details", async () => {
    const customer = await customerService.getActiveCustomer();
    expect(customer._id).toBe("60c72b2f9b1d8e001c8e2001");
    expect(customer.name).toBe("John Doe");
  });

  it("should update active customer profile successfully", async () => {
    const updated = await customerService.updateActiveCustomer({ name: "Jane Smith", company: "Smith Corp" });
    expect(updated.name).toBe("Jane Smith");
    expect(updated.company).toBe("Smith Corp");

    const fetched = await customerService.getActiveCustomer();
    expect(fetched.name).toBe("Jane Smith");
  });

  it("should retrieve saved addresses", async () => {
    const addresses = await customerService.getSavedAddresses();
    expect(addresses.length).toBe(1);
    expect(addresses[0]._id).toBe("addr_1");
  });

  it("should create new saved address successfully", async () => {
    const newAddr = {
      name: "Mumbai Warehouse",
      firstName: "Jane",
      lastName: "Smith",
      company: "Smith Corp",
      address: "100 Logistics Park",
      city: "Mumbai",
      state: "Maharashtra",
      pinCode: "400001",
      phone: "+91 99999 88888",
      gstin: "27AAACD4521D1Z1",
      isDefault: false
    };

    const addresses = await customerService.addSavedAddress(newAddr);
    expect(addresses.length).toBe(2);
    expect(addresses.some(a => a.name === "Mumbai Warehouse")).toBe(true);
  });

  it("should delete address successfully", async () => {
    const addresses = await customerService.getSavedAddresses();
    const target = addresses[0];

    await customerService.deleteSavedAddress(target._id);

    const activeList = await customerService.getSavedAddresses();
    expect(activeList.some(a => a._id === target._id)).toBe(false);
  });
});

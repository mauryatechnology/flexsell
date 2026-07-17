import { Invoice } from "@/types";
import { apiClient } from "@/lib/apiClient";

export interface InvoiceListParams {
  type?: "invoice" | "receipt";
  status?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const invoiceService = {
  async getInvoices(params?: InvoiceListParams): Promise<any> {
    let url = "/invoices";
    const queryParams: string[] = [];
    if (params?.type) queryParams.push(`type=${params.type}`);
    if (params?.status) queryParams.push(`status=${params.status}`);
    if (params?.customerId) queryParams.push(`customerId=${params.customerId}`);
    if (params?.startDate) queryParams.push(`startDate=${params.startDate}`);
    if (params?.endDate) queryParams.push(`endDate=${params.endDate}`);
    if (params?.search) queryParams.push(`search=${encodeURIComponent(params.search)}`);
    if (params?.page) queryParams.push(`page=${params.page}`);
    if (params?.limit) queryParams.push(`limit=${params.limit}`);

    if (queryParams.length > 0) {
      url += `?${queryParams.join("&")}`;
    }
    return apiClient.get<any>(url);
  },

  async getInvoiceById(id: string): Promise<Invoice> {
    return apiClient.get<Invoice>(`/invoices/${id}`);
  },

  async createInvoice(data: Partial<Invoice> & {
    newCustomer?: {
      name: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      pinCode: string;
      company?: string;
      gstin?: string;
    };
  }): Promise<Invoice> {
    return apiClient.post<Invoice>("/invoices", data);
  },

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
    return apiClient.put<Invoice>(`/invoices/${id}`, data);
  },

  async voidInvoice(id: string): Promise<Invoice> {
    return apiClient.put<Invoice>(`/invoices/${id}`, { status: "void" });
  },

  async deleteInvoice(id: string): Promise<void> {
    return apiClient.delete(`/invoices/${id}`);
  },

  async getInvoiceByOrderId(orderId: string): Promise<Invoice | null> {
    try {
      const result = await apiClient.get<any>(`/invoices?orderId=${orderId}`);
      const invoices = Array.isArray(result) ? result : result.invoices || [];
      return invoices.length > 0 ? invoices[0] : null;
    } catch {
      return null;
    }
  }
};

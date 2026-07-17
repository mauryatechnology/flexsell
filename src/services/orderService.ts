import { Order, ShipmentDetails, CartItem } from "@/types";
import { apiClient } from "@/lib/apiClient";

export const orderService = {
  async getOrders(params?: { page?: number; limit?: number; startDate?: string; endDate?: string }): Promise<any> {
    let url = "/orders";
    const queryParams: string[] = [];
    if (params?.page) queryParams.push(`page=${params.page}`);
    if (params?.limit) queryParams.push(`limit=${params.limit}`);
    if (params?.startDate) queryParams.push(`startDate=${params.startDate}`);
    if (params?.endDate) queryParams.push(`endDate=${params.endDate}`);
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join("&")}`;
    }
    return apiClient.get<any>(url);
  },

  async createOrder(
    items: CartItem[],
    amount: number,
    shippingAddress: Order["shippingAddress"],
    paymentDetails?: {
      paymentMethod: Order["paymentMethod"];
      paymentStatus: Order["paymentStatus"];
      transactionId?: string;
    },
    couponCode?: string,
    couponDiscount?: number
  ): Promise<Order> {
    return apiClient.post<Order>("/orders", { 
      items, 
      amount, 
      shippingAddress, 
      paymentDetails,
      couponCode,
      couponDiscount
    });
  },

  async updateOrderStatus(id: string, status: Order["status"]): Promise<Order> {
    return apiClient.put<Order>(`/orders/${id}/status`, { status });
  },

  async shipOrder(id: string, shipmentDetails: ShipmentDetails): Promise<Order> {
    return apiClient.put<Order>(`/orders/${id}/ship`, shipmentDetails);
  },

  async getOrderById(id: string): Promise<Order> {
    return apiClient.get<Order>(`/orders/${id}`);
  }
};

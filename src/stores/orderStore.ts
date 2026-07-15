import { create } from "zustand";
import { Order, ShipmentDetails, CartItem } from "@/types";
import { orderService } from "@/services/orderService";

export type { Order, ShipmentDetails };

interface OrderStoreState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  initializeOrders: () => Promise<void>;
  createOrder: (
    items: CartItem[], 
    amount: number, 
    shippingAddress: Order["shippingAddress"]
  ) => Promise<string>;
  updateOrderStatus: (id: string, status: Order["status"]) => Promise<void>;
  shipOrder: (id: string, shipmentDetails: ShipmentDetails) => Promise<void>;
}

export const useOrderStore = create<OrderStoreState>()((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,

  initializeOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await orderService.getOrders();
      set({ orders: data, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load orders",
        isLoading: false
      });
    }
  },

  createOrder: async (items, amount, shippingAddress) => {
    set({ isLoading: true, error: null });
    try {
      const newOrder = await orderService.createOrder(items, amount, shippingAddress);
      set((state) => ({
        orders: [newOrder, ...state.orders],
        isLoading: false
      }));
      return newOrder._id;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to create order",
        isLoading: false
      });
      throw err;
    }
  },

  updateOrderStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      const updatedOrder = await orderService.updateOrderStatus(id, status);
      set((state) => ({
        orders: state.orders.map((o) => (o._id === id ? updatedOrder : o)),
        isLoading: false
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to update order status",
        isLoading: false
      });
      throw err;
    }
  },

  shipOrder: async (id, shipmentDetails) => {
    set({ isLoading: true, error: null });
    try {
      const updatedOrder = await orderService.shipOrder(id, shipmentDetails);
      set((state) => ({
        orders: state.orders.map((o) => (o._id === id ? updatedOrder : o)),
        isLoading: false
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to ship order",
        isLoading: false
      });
      throw err;
    }
  }
}));

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "./cartStore";

export interface Order {
  _id: string;
  date: string;
  amount: number;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  statusClass: string;
  itemsCount: number;
  customerName: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    pinCode: string;
    phone: string;
  };
  items: CartItem[];
}

interface OrderStoreState {
  orders: Order[];
  initializeOrders: () => void;
  createOrder: (
    items: CartItem[], 
    amount: number, 
    shippingAddress: Order["shippingAddress"]
  ) => string;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
}

const statusClasses: Record<Order["status"], string> = {
  Processing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
  Shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500",
  Delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500"
};

export const useOrderStore = create<OrderStoreState>()(
  persist(
    (set, get) => ({
      orders: [],
      
      initializeOrders: () => {
        if (get().orders.length === 0) {
          const mockOrders: Order[] = [
            {
              _id: "FS-10025",
              date: "Jul 10, 2026",
              amount: 4500,
              status: "Processing",
              statusClass: statusClasses["Processing"],
              itemsCount: 5,
              customerName: "Jane Doe (Doe Ent.)",
              shippingAddress: {
                firstName: "Jane",
                lastName: "Doe",
                email: "jane@doeent.com",
                company: "Doe Ent.",
                address: "45 Textile Market, Ring Road",
                city: "Surat",
                state: "Gujarat",
                pinCode: "395002",
                phone: "+91 98765 43210"
              },
              items: []
            },
            {
              _id: "FS-10024",
              date: "Jul 05, 2026",
              amount: 1299,
              status: "Shipped",
              statusClass: statusClasses["Shipped"],
              itemsCount: 2,
              customerName: "Acme Corp",
              shippingAddress: {
                firstName: "John",
                lastName: "Smith",
                email: "john@acme.com",
                company: "Acme Corp",
                address: "Industrial Area Phase 2",
                city: "Ahmedabad",
                state: "Gujarat",
                pinCode: "380001",
                phone: "+91 99988 77766"
              },
              items: []
            },
            {
              _id: "FS-10022",
              date: "Jun 24, 2026",
              amount: 12450,
              status: "Delivered",
              statusClass: statusClasses["Delivered"],
              itemsCount: 15,
              customerName: "Tech Solutions India",
              shippingAddress: {
                firstName: "Amit",
                lastName: "Patel",
                email: "amit@techsolutions.in",
                company: "Tech Solutions India",
                address: "GIDC Electronic Zone",
                city: "Gandhinagar",
                state: "Gujarat",
                pinCode: "382010",
                phone: "+91 88877 66655"
              },
              items: []
            }
          ];
          set({ orders: mockOrders });
        }
      },
      
      createOrder: (items, amount, shippingAddress) => {
        const nextIdNum = 10026 + get().orders.length;
        const orderId = `FS-${nextIdNum}`;
        const newOrder: Order = {
          _id: orderId,
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric"
          }),
          amount,
          status: "Processing",
          statusClass: statusClasses["Processing"],
          itemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
          customerName: `${shippingAddress.firstName} ${shippingAddress.lastName}${
            shippingAddress.company ? ` (${shippingAddress.company})` : ""
          }`,
          shippingAddress,
          items
        };
        
        set((state) => ({
          orders: [newOrder, ...state.orders]
        }));
        
        return orderId;
      },
      
      updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map(o => 
          o._id === id ? { ...o, status, statusClass: statusClasses[status] } : o
        )
      }))
    }),
    {
      name: "flexsell-orders-storage",
    }
  )
);

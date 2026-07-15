import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "./cartStore";
import { customers } from "@/data/customers";
import { products } from "@/data/products";

export interface HistoryEvent {
  status: string;
  timestamp: string;
  description: string;
}

export interface ShipmentDetails {
  type: "self" | "third-party";
  carrierName?: string;
  trackingId: string;
  trackingUrl?: string;
  shippedAt?: string;
  deliveredAt?: string;
  estimatedDelivery?: string;
  notes?: string;
}

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
  shipmentDetails?: ShipmentDetails;
  history: HistoryEvent[];
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
  shipOrder: (id: string, shipmentDetails: ShipmentDetails) => void;
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
        if (get().orders.length === 0 || get().orders.some(o => o.items.length === 0)) {
          const mockOrders: Order[] = [
            {
              _id: "FS-10025",
              date: "Jul 10, 2026",
              amount: 4500,
              status: "Processing",
              statusClass: statusClasses["Processing"],
              itemsCount: 18,
              customerName: `${customers[0].name} (${customers[0].company})`,
              shippingAddress: {
                firstName: customers[0].name.split(" ")[0],
                lastName: customers[0].name.split(" ").slice(1).join(" "),
                email: customers[0].email,
                company: customers[0].company,
                address: customers[0].address,
                city: customers[0].city,
                state: customers[0].state,
                pinCode: customers[0].pinCode,
                phone: customers[0].phone
              },
              items: [
                {
                  id: "prod_001-Forest Green-Standard 1.2L-250g",
                  product: products[0],
                  selectedVariants: {
                    Color: "Forest Green",
                    Size: "Standard 1.2L",
                    Weight: "250g"
                  },
                  quantity: 18,
                  pricePerUnit: 250
                }
              ],
              history: [
                {
                  status: "Processing",
                  timestamp: "Jul 10, 2026, 10:30 AM",
                  description: "Order is packed and being processed for cargo handover."
                },
                {
                  status: "Placed",
                  timestamp: "Jul 10, 2026, 10:15 AM",
                  description: "Wholesale order generated successfully."
                }
              ]
            },
            {
              _id: "FS-10024",
              date: "Jul 05, 2026",
              amount: 1299,
              status: "Shipped",
              statusClass: statusClasses["Shipped"],
              itemsCount: 3,
              customerName: `${customers[1].name} (${customers[1].company})`,
              shippingAddress: {
                firstName: customers[1].name.split(" ")[0],
                lastName: customers[1].name.split(" ").slice(1).join(" "),
                email: customers[1].email,
                company: customers[1].company,
                address: customers[1].address,
                city: customers[1].city,
                state: customers[1].state,
                pinCode: customers[1].pinCode,
                phone: customers[1].phone
              },
              items: [
                {
                  id: "prod_001-Slate Gray-Standard 1.2L-250g",
                  product: products[0],
                  selectedVariants: {
                    Color: "Slate Gray",
                    Size: "Standard 1.2L",
                    Weight: "250g"
                  },
                  quantity: 3,
                  pricePerUnit: 433
                }
              ],
              shipmentDetails: {
                type: "third-party",
                carrierName: "BlueDart",
                trackingId: "BD-98240-IN",
                trackingUrl: "https://www.bluedart.com",
                estimatedDelivery: "Jul 15, 2026",
                shippedAt: "Jul 06, 2026"
              },
              history: [
                {
                  status: "Shipped",
                  timestamp: "Jul 06, 2026, 04:12 PM",
                  description: "Shipment handed over to BlueDart courier."
                },
                {
                  status: "Processing",
                  timestamp: "Jul 05, 2026, 02:30 PM",
                  description: "Order packaging and GST claim validation finished."
                },
                {
                  status: "Placed",
                  timestamp: "Jul 05, 2026, 11:22 AM",
                  description: "Wholesale order generated successfully."
                }
              ]
            },
            {
              _id: "FS-10022",
              date: "Jun 24, 2026",
              amount: 12450,
              status: "Delivered",
              statusClass: statusClasses["Delivered"],
              itemsCount: 50,
              customerName: `${customers[2].name} (${customers[2].company})`,
              shippingAddress: {
                firstName: customers[2].name.split(" ")[0],
                lastName: customers[2].name.split(" ").slice(1).join(" "),
                email: customers[2].email,
                company: customers[2].company,
                address: customers[2].address,
                city: customers[2].city,
                state: customers[2].state,
                pinCode: customers[2].pinCode,
                phone: customers[2].phone
              },
              items: [
                {
                  id: "prod_001-Forest Green-Pro 2.0L-500g",
                  product: products[0],
                  selectedVariants: {
                    Color: "Forest Green",
                    Size: "Pro 2.0L",
                    Weight: "500g"
                  },
                  quantity: 50,
                  pricePerUnit: 249
                }
              ],
              shipmentDetails: {
                type: "self",
                trackingId: "FLEX-IN-10022-CARGO",
                shippedAt: "Jun 25, 2026",
                deliveredAt: "Jun 28, 2026"
              },
              history: [
                {
                  status: "Delivered",
                  timestamp: "Jun 28, 2026, 02:45 PM",
                  description: "Order cargo delivered safely to company dock."
                },
                {
                  status: "Shipped",
                  timestamp: "Jun 25, 2026, 09:30 AM",
                  description: "Dispatched via local cargo transport."
                },
                {
                  status: "Processing",
                  timestamp: "Jun 24, 2026, 04:10 PM",
                  description: "Order details checked and verified by wholesale manager."
                },
                {
                  status: "Placed",
                  timestamp: "Jun 24, 2026, 11:15 AM",
                  description: "Wholesale order generated successfully."
                }
              ]
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
          items,
          history: [
            {
              status: "Placed",
              timestamp: new Date().toLocaleString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              }),
              description: "Wholesale order generated successfully."
            }
          ]
        };
        
        set((state) => ({
          orders: [newOrder, ...state.orders]
        }));
        
        return orderId;
      },
      
      updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map(o => {
          if (o._id !== id) return o;
          
          let description = `Order status updated to ${status}.`;
          if (status === "Processing") {
            description = "Order packaging and B2B validation completed.";
          } else if (status === "Delivered") {
            description = "Order cargo delivered safely to customer dock.";
          } else if (status === "Cancelled") {
            description = "Order has been cancelled by administrator.";
          }

          const newEvent = {
            status,
            timestamp: new Date().toLocaleString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            }),
            description
          };

          return {
            ...o,
            status,
            statusClass: statusClasses[status],
            history: [newEvent, ...o.history]
          };
        })
      })),

      shipOrder: (id, shipmentDetails) => set((state) => ({
        orders: state.orders.map(o => {
          if (o._id !== id) return o;

          const timestamp = new Date().toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });

          const carrierInfo = shipmentDetails.type === "self" 
            ? "local transport cargo (Self)" 
            : `${shipmentDetails.carrierName} courier`;

          const newEvent = {
            status: "Shipped",
            timestamp,
            description: `Shipment dispatched and handed over to ${carrierInfo}. Tracking ID: ${shipmentDetails.trackingId}`
          };

          return {
            ...o,
            status: "Shipped",
            statusClass: statusClasses["Shipped"],
            shipmentDetails,
            history: [newEvent, ...o.history]
          };
        })
      }))
    }),
    {
      name: "flexsell-orders-storage",
    }
  )
);

import { Order, ShipmentDetails, CartItem, Product } from "@/types";
import { apiClient, isMockMode, delay } from "@/lib/apiClient";
import { productService } from "@/services/productService";
import { useInventoryHistoryStore } from "@/stores/inventoryHistoryStore";

const MOCK_STORAGE_KEY = "flexsell-orders-storage";

const statusClasses: Record<Order["status"], string> = {
  Processing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
  Shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500",
  Delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500"
};

const dummyProduct: Product = {
  _id: "60c72b2f9b1d8e001c8e1001",
  title: "Multi-Functional 12-in-1 Vegetable Chopper & Slicer",
  slug: "multi-functional-12-in-1-vegetable-chopper-slicer",
  description: "Effortlessly chop, slice, grate, and dice vegetables with our ultimate kitchen utility helper.",
  categoryId: "60c72b2f9b1d8e001c8e1a16",
  rating: 4.5,
  reviewCount: 120,
  tags: ["bestseller", "wholesale"],
  isActive: true,
  totalStock: 500,
  colorVariants: []
};

function getMockOrders(): Order[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(MOCK_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const ordersList = (parsed?.state?.orders || (Array.isArray(parsed) ? parsed : null)) as Order[];
      if (ordersList) {
        // Clear cached orders that use the old 'prod_' string IDs
        const hasOldId = ordersList.some((o: Order) => o.items?.some((i) => i.id.startsWith("prod_")));
        if (hasOldId) {
          localStorage.removeItem(MOCK_STORAGE_KEY);
        } else {
          return ordersList;
        }
      }
    } catch (e) {
      console.error("Error parsing mock orders", e);
    }
  }

  // Fallback to initial mock orders
  const initialOrders: Order[] = [
    {
      _id: "FS-10025",
      date: "Jul 10, 2026",
      amount: 4500,
      status: "Processing",
      statusClass: statusClasses["Processing"],
      itemsCount: 18,
      customerName: "John Doe (Doe Ent.)",
      shippingAddress: {
        firstName: "John",
        lastName: "Doe",
        email: "john@doeent.com",
        company: "Doe Ent.",
        address: "45 Textile Market, Ring Road",
        city: "Surat",
        state: "Gujarat",
        pinCode: "395002",
        phone: "+91 98765 43210"
      },
      items: [
        {
          id: "60c72b2f9b1d8e001c8e1001-Forest Green-Standard 1.2L-250g",
          product: dummyProduct,
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
      customerName: "Jane Smith (Smith Retail Group)",
      shippingAddress: {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@smithretail.in",
        company: "Smith Retail Group",
        address: "GIDC Electronic Zone, Sector 26",
        city: "Gandhinagar",
        state: "Gujarat",
        pinCode: "382010",
        phone: "+91 88877 66655"
      },
      items: [
        {
          id: "60c72b2f9b1d8e001c8e1001-Slate Gray-Standard 1.2L-250g",
          product: dummyProduct,
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
      customerName: "Amit Patel (Patel Distributors)",
      shippingAddress: {
        firstName: "Amit",
        lastName: "Patel",
        email: "amit@pateldistributors.com",
        company: "Patel Distributors",
        address: "Industrial Area Phase 2",
        city: "Ahmedabad",
        state: "Gujarat",
        pinCode: "380001",
        phone: "+91 99988 77766"
      },
      items: [
        {
          id: "60c72b2f9b1d8e001c8e1001-Forest Green-Pro 2.0L-500g",
          product: dummyProduct,
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

  saveMockOrders(initialOrders);
  return initialOrders;
}

function saveMockOrders(orders: Order[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    MOCK_STORAGE_KEY,
    JSON.stringify({
      state: { orders },
      version: 0,
    })
  );
}

export const orderService = {
  async getOrders(params?: { page?: number; limit?: number; startDate?: string; endDate?: string }): Promise<any> {
    if (isMockMode) {
      await delay();
      let orders = getMockOrders();
      
      if (params?.startDate) {
        const start = new Date(params.startDate);
        orders = orders.filter(o => new Date(o.createdAt || o.date) >= start);
      }
      if (params?.endDate) {
        const end = new Date(params.endDate);
        end.setHours(23, 59, 59, 999);
        orders = orders.filter(o => new Date(o.createdAt || o.date) <= end);
      }

      if (params?.page && params?.limit) {
        const pageNum = params.page;
        const limitNum = params.limit;
        const total = orders.length;
        const skip = (pageNum - 1) * limitNum;
        return {
          orders: orders.slice(skip, skip + limitNum),
          total,
          page: pageNum,
          totalPages: Math.ceil(total / limitNum)
        };
      }
      return orders;
    }

    if (typeof window === "undefined") {
      const dbConnect = (await import("@/lib/dbConnect")).default;
      await dbConnect();
      const OrderModel = (await import("@/models/Order")).default;
      
      let query: any = {};
      if (params?.startDate || params?.endDate) {
        const dateQuery: any = {};
        if (params.startDate) dateQuery.$gte = new Date(params.startDate);
        if (params.endDate) {
          const end = new Date(params.endDate);
          end.setHours(23, 59, 59, 999);
          dateQuery.$lte = end;
        }
        query.createdAt = dateQuery;
      }

      if (params?.page && params?.limit) {
        const pageNum = params.page;
        const limitNum = params.limit;
        const skip = (pageNum - 1) * limitNum;
        const [orders, total] = await Promise.all([
          OrderModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
          OrderModel.countDocuments(query)
        ]);
        return {
          orders: JSON.parse(JSON.stringify(orders)),
          total,
          page: pageNum,
          totalPages: Math.ceil(total / limitNum)
        };
      }

      const orders = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
      return JSON.parse(JSON.stringify(orders));
    }

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
    }
  ): Promise<Order> {
    if (isMockMode) {
      await delay();
      const orders = getMockOrders();
      const nextIdNum = 10026 + orders.length;
      const orderId = `FS-${nextIdNum}`;

      // Deduct stock for each ordered item in mock storage
      for (const item of items) {
        try {
          const liveProduct = await productService.getProductById(item.product._id);
          
          const selectedColor = item.selectedVariants["Color"] || item.selectedVariants["color"] || "Default";
          const selectedSize = item.selectedVariants["Pack Sizing"] || item.selectedVariants["Size"] || item.selectedVariants["size"];
          const selectedWeight = item.selectedVariants["Weight Unit"] || item.selectedVariants["Weight"] || item.selectedVariants["weight"];

          const cv = liveProduct.colorVariants?.find(
            c => c.color.toLowerCase() === selectedColor.toLowerCase()
          ) || liveProduct.colorVariants?.[0];

          if (cv && cv.subVariants) {
            const sv = cv.subVariants.find(s => 
              (!selectedSize || s.size.toLowerCase() === selectedSize.toLowerCase()) && 
              (!selectedWeight || s.weight.toLowerCase() === selectedWeight.toLowerCase())
            ) || cv.subVariants[0];

            if (sv) {
              const prevStock = sv.stock;
              const newStock = Math.max(0, sv.stock - item.quantity);
              sv.stock = newStock;
              
              // Recalculate totalStock of product
              const totalStock = liveProduct.colorVariants.reduce((sum, c) => 
                sum + (c.subVariants?.reduce((sSum, s) => sSum + s.stock, 0) || 0)
              , 0);
              liveProduct.totalStock = totalStock;

              // Save the updated product back to mock storage
              await productService.updateProduct(liveProduct._id, liveProduct);

              // Add inventory history log
              const variantDetails = `${cv.color} • ${sv.size || "Standard"} • ${sv.weight || "250g"}`;
              useInventoryHistoryStore.getState().addLog({
                sku: sv.sku,
                productName: liveProduct.title,
                variantDetails,
                actionType: "Order Deduction",
                change: -item.quantity,
                prevStock,
                newStock
              });
            }
          }
        } catch (err) {
          console.error("Failed to deduct stock for item during mock order creation:", item, err);
        }
      }

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
        paymentMethod: paymentDetails?.paymentMethod,
        paymentStatus: paymentDetails?.paymentStatus,
        transactionId: paymentDetails?.transactionId,
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
            description: paymentDetails?.paymentMethod === "Razorpay"
              ? `Wholesale order generated successfully. Online Payment verified (Txn ID: ${paymentDetails.transactionId}).`
              : "Wholesale order generated successfully. Payment pending verification."
          }
        ]
      };

      saveMockOrders([newOrder, ...orders]);
      return newOrder;
    }

    if (typeof window === "undefined") {
      const dbConnect = (await import("@/lib/dbConnect")).default;
      await dbConnect();
      const OrderModel = (await import("@/models/Order")).default;
      const ProductModel = (await import("@/models/Product")).default;
      const { generateNextId } = await import("@/lib/idGenerator");
      
      const orderId = await generateNextId("order");

      // Deduct stock in database atomically
      for (const item of items) {
        try {
          const dbProduct = await ProductModel.findById(item.product._id);
          if (!dbProduct) continue;

          const selectedColor = item.selectedVariants["Color"] || item.selectedVariants["color"] || "Default";
          const selectedSize = item.selectedVariants["Pack Sizing"] || item.selectedVariants["Size"] || item.selectedVariants["size"];
          const selectedWeight = item.selectedVariants["Weight Unit"] || item.selectedVariants["Weight"] || item.selectedVariants["weight"];

          const cv = dbProduct.colorVariants?.find(
            (c: any) => c.color.toLowerCase() === selectedColor.toLowerCase()
          );
          if (!cv) continue;

          const sv = cv.subVariants?.find((s: any) => 
            (!selectedSize || s.size.toLowerCase() === selectedSize.toLowerCase()) && 
            (!selectedWeight || s.weight.toLowerCase() === selectedWeight.toLowerCase())
          );
          if (!sv) continue;

          // Atomic decrement using updateOne and arrayFilters
          const updateResult = await ProductModel.updateOne(
            {
              _id: item.product._id,
              "colorVariants.color": cv.color,
              "colorVariants.subVariants": {
                $elemMatch: {
                  size: sv.size,
                  weight: sv.weight,
                  stock: { $gte: item.quantity }
                }
              }
            },
            {
              $inc: {
                "colorVariants.$[cv].subVariants.$[sv].stock": -item.quantity,
                totalStock: -item.quantity
              }
            },
            {
              arrayFilters: [
                { "cv.color": cv.color },
                { "sv.size": sv.size, "sv.weight": sv.weight }
              ]
            }
          );
          if (updateResult.modifiedCount === 0) {
            throw new Error(`Insufficient stock for product ${dbProduct.title}`);
          }
        } catch (err) {
          console.error("Failed to deduct stock during server-side order creation:", item, err);
          throw err;
        }
      }

      const orderDate = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
      });

      const orderTime = new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      const customerName = `${shippingAddress.firstName} ${shippingAddress.lastName}${
        shippingAddress.company ? ` (${shippingAddress.company})` : ""
      }`;

      const order = await OrderModel.create({
        _id: orderId,
        date: orderDate,
        amount,
        status: "Processing",
        statusClass: statusClasses["Processing"],
        itemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
        customerName,
        shippingAddress,
        items,
        paymentMethod: paymentDetails?.paymentMethod,
        paymentStatus: paymentDetails?.paymentStatus,
        transactionId: paymentDetails?.transactionId,
        history: [
          {
            status: "Placed",
            timestamp: orderTime,
            description: paymentDetails?.paymentMethod === "Razorpay"
              ? `Wholesale order generated successfully. Online Payment verified (Txn ID: ${paymentDetails.transactionId}).`
              : "Wholesale order generated successfully. Payment pending verification."
          }
        ]
      });

      return JSON.parse(JSON.stringify(order));
    }

    return apiClient.post<Order>("/orders", { items, amount, shippingAddress, paymentDetails });
  },

  async updateOrderStatus(id: string, status: Order["status"]): Promise<Order> {
    if (isMockMode) {
      await delay();
      const orders = getMockOrders();
      let updatedOrder: Order | null = null;

      const newOrders = orders.map((o) => {
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

        updatedOrder = {
          ...o,
          status,
          statusClass: statusClasses[status],
          history: [newEvent, ...o.history]
        };
        return updatedOrder;
      });

      if (!updatedOrder) throw new Error("Order not found");
      saveMockOrders(newOrders);
      return updatedOrder;
    }

    if (typeof window === "undefined") {
      const dbConnect = (await import("@/lib/dbConnect")).default;
      await dbConnect();
      const OrderModel = (await import("@/models/Order")).default;
      
      const order = await OrderModel.findById(id);
      if (!order) throw new Error("Order not found");

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

      order.status = status;
      order.statusClass = statusClasses[status];
      order.history.unshift(newEvent);
      await order.save();

      return JSON.parse(JSON.stringify(order));
    }
    
    return apiClient.put<Order>(`/orders/${id}/status`, { status });
  },

  async shipOrder(id: string, shipmentDetails: ShipmentDetails): Promise<Order> {
    if (isMockMode) {
      await delay();
      const orders = getMockOrders();
      let updatedOrder: Order | null = null;

      const newOrders = orders.map((o) => {
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

        updatedOrder = {
          ...o,
          status: "Shipped",
          statusClass: statusClasses["Shipped"],
          shipmentDetails,
          history: [newEvent, ...o.history]
        };
        return updatedOrder;
      });

      if (!updatedOrder) throw new Error("Order not found");
      saveMockOrders(newOrders);
      return updatedOrder;
    }

    if (typeof window === "undefined") {
      const dbConnect = (await import("@/lib/dbConnect")).default;
      await dbConnect();
      const OrderModel = (await import("@/models/Order")).default;

      const order = await OrderModel.findById(id);
      if (!order) throw new Error("Order not found");

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

      order.status = "Shipped";
      order.statusClass = statusClasses["Shipped"];
      order.shipmentDetails = shipmentDetails;
      order.history.unshift(newEvent);
      await order.save();

      return JSON.parse(JSON.stringify(order));
    }

    return apiClient.put<Order>(`/orders/${id}/ship`, shipmentDetails);
  },

  async getOrderById(id: string): Promise<Order> {
    if (isMockMode) {
      await delay();
      const match = getMockOrders().find(o => o._id === id);
      if (!match) throw new Error("Order not found");
      return match;
    }
    if (typeof window === "undefined") {
      const dbConnect = (await import("@/lib/dbConnect")).default;
      await dbConnect();
      const OrderModel = (await import("@/models/Order")).default;
      const order = await OrderModel.findById(id).lean();
      if (!order) throw new Error("Order not found");
      return JSON.parse(JSON.stringify(order));
    }
    return apiClient.get<Order>(`/orders/${id}`);
  }
};

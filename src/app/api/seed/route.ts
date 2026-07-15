import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Customer from "@/models/Customer";
import HsnRecord from "@/models/HsnRecord";
import Order from "@/models/Order";

// Import original mock datasets
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { customers } from "@/data/customers";

const defaultHsns = [
  {
    _id: "hsn_3924",
    code: "3924",
    gstRate: 18,
    description: "Plastics tableware, kitchenware, other household articles",
    isActive: true
  },
  {
    _id: "hsn_7323",
    code: "7323",
    gstRate: 12,
    description: "Table, kitchen or other household articles of iron or steel",
    isActive: true
  },
  {
    _id: "hsn_8215",
    code: "8215",
    gstRate: 18,
    description: "Spoons, forks, ladles, skimmers, cake-servers, fish-knives, butter-knives",
    isActive: true
  },
  {
    _id: "hsn_6304",
    code: "6304",
    gstRate: 5,
    description: "Other furnishing articles, bedsheets, blankets, towels",
    isActive: true
  },
  {
    _id: "hsn_8509",
    code: "8509",
    gstRate: 18,
    description: "Electro-mechanical domestic appliances with self-contained electric motor",
    isActive: true
  }
];

const statusClasses = {
  Processing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
  Shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500",
  Delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500"
};

const initialOrders = [
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
        id: `${products[0]._id}-Forest Green-Standard 1.2L-250g`,
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
        id: `${products[0]._id}-Slate Gray-Standard 1.2L-250g`,
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
        id: `${products[0]._id}-Forest Green-Pro 2.0L-500g`,
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

export async function GET() {
  try {
    await dbConnect();

    // 1. Seed Categories
    await Category.deleteMany({});
    const seededCategories = await Category.insertMany(categories);

    // 2. Seed Products
    await Product.deleteMany({});
    const seededProducts = await Product.insertMany(products);

    // 3. Seed Customers
    await Customer.deleteMany({});
    const seededCustomers = await Customer.insertMany(customers);

    // 4. Seed HSN Records
    await HsnRecord.deleteMany({});
    const seededHsns = await HsnRecord.insertMany(defaultHsns);

    // 5. Seed Orders
    await Order.deleteMany({});
    const seededOrders = await Order.insertMany(initialOrders);

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      stats: {
        categories: seededCategories.length,
        products: seededProducts.length,
        customers: seededCustomers.length,
        hsnRecords: seededHsns.length,
        orders: seededOrders.length,
      }
    });
  } catch (error: any) {
    console.error("Database seeding error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to seed database"
    }, { status: 500 });
  }
}

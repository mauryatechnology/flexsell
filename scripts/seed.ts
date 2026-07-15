import fs from "fs";
import mongoose from "mongoose";

// Load environment variables manually if not set
if (!process.env.MONGODB_URI) {
  const envFile = fs.existsSync(".env.local") ? ".env.local" : ".env";
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, "utf-8");
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const index = trimmed.indexOf("=");
      if (index === -1) return;
      const key = trimmed.substring(0, index).trim();
      let value = trimmed.substring(index + 1).trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    });
  }
}

import Category from "../src/models/Category";
import Product from "../src/models/Product";
import Customer from "../src/models/Customer";
import HsnRecord from "../src/models/HsnRecord";
import Order from "../src/models/Order";

import { categories } from "../src/data/categories";
import { products } from "../src/data/products";
import { customers } from "../src/data/customers";

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

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("Connected successfully.");

  try {
    // Seed Categories
    console.log("Seeding Categories...");
    await Category.deleteMany({});
    await Category.insertMany(categories);
    console.log("Seeded", categories.length, "categories.");

    // Seed Products
    console.log("Seeding Products...");
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log("Seeded", products.length, "products.");

    // Seed Customers
    console.log("Seeding Customers...");
    await Customer.deleteMany({});
    await Customer.insertMany(customers);
    console.log("Seeded", customers.length, "customers.");

    // Seed HSN
    console.log("Seeding HSN Records...");
    await HsnRecord.deleteMany({});
    await HsnRecord.insertMany(defaultHsns);
    console.log("Seeded", defaultHsns.length, "HSN records.");

    // Seed Orders
    console.log("Seeding Orders...");
    await Order.deleteMany({});
    await Order.insertMany(initialOrders);
    console.log("Seeded", initialOrders.length, "orders.");

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Connection closed.");
  }
}

seed();

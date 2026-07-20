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

import Product from "../src/models/Product";
import Customer from "../src/models/Customer";

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }

  console.log("Connecting to MongoDB for migration...");
  await mongoose.connect(uri);
  console.log("Connected successfully.");

  try {
    // 1. Migrate Products
    console.log("Migrating Products to Multi-Tier Pricing...");
    const productsList = await Product.find({});
    let updatedProducts = 0;

    for (const prod of productsList) {
      let modified = false;
      
      if (!prod.defaultPriceTier) {
        prod.defaultPriceTier = "B2C";
        modified = true;
      }

      if (prod.colorVariants) {
        for (const cv of prod.colorVariants) {
          if (cv.subVariants) {
            for (const sv of cv.subVariants) {
              const oldPrice = (sv as any).price || 0;
              
              if (sv.b2cPrice === undefined || sv.b2cPrice === null || sv.b2cPrice === 0) {
                sv.b2cPrice = oldPrice;
                modified = true;
              }
              if (sv.b2bPrice === undefined || sv.b2bPrice === null || sv.b2bPrice === 0) {
                sv.b2bPrice = oldPrice;
                modified = true;
              }
              if (sv.dropshippingPrice === undefined || sv.dropshippingPrice === null || sv.dropshippingPrice === 0) {
                sv.dropshippingPrice = oldPrice;
                modified = true;
              }
              if (sv.b2bMoq === undefined || sv.b2bMoq === null || sv.b2bMoq === 0) {
                sv.b2bMoq = (prod as any).moq || 1;
                modified = true;
              }
            }
          }
        }
      }

      if (modified) {
        // Clear validation for old fields if mongoose schema is strict
        prod.markModified("colorVariants");
        await prod.save();
        updatedProducts++;
      }
    }
    console.log(`Migrated ${updatedProducts} products.`);

    // 2. Migrate Customers
    console.log("Migrating Customers to Customer Types Array...");
    const customersList = await Customer.find({});
    let updatedCustomers = 0;

    for (const cust of customersList) {
      let modified = false;

      if (!cust.customerTypes || cust.customerTypes.length === 0) {
        const oldType = (cust as any).businessType || "retailer";
        if (["wholesaler", "distributor"].includes(oldType)) {
          cust.customerTypes = ["B2C", "B2B"];
        } else {
          cust.customerTypes = ["B2C"];
        }
        modified = true;
      }

      if (modified) {
        await cust.save();
        updatedCustomers++;
      }
    }
    console.log(`Migrated ${updatedCustomers} customers.`);
    console.log("Migration complete!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await mongoose.connection.close();
    console.log("Connection closed.");
  }
}

migrate();

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { verifyToken, getTokenFromCookie } from "@/lib/auth";

const statusClasses = {
  Processing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
  Shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500",
  Delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500"
};

export async function GET() {
  try {
    await dbConnect();
    const token = await getTokenFromCookie();
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    let query = {};
    if (payload.role !== "admin") {
      // B2B buyer can only fetch their own orders matching their email
      query = { "shippingAddress.email": payload.email.toLowerCase() };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const token = await getTokenFromCookie();
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    const { items, amount, shippingAddress } = await request.json();
    
    // Determine the next sequential Order ID
    const count = await Order.countDocuments();
    const nextIdNum = 10026 + count;
    const orderId = `FS-${nextIdNum}`;

    // Deduct stock for each ordered item in MongoDB
    for (const item of items) {
      try {
        const dbProduct = await Product.findById(item.product._id);
        if (!dbProduct) continue;

        const selectedColor = item.selectedVariants["Color"] || item.selectedVariants["color"] || "Default";
        const selectedSize = item.selectedVariants["Pack Sizing"] || item.selectedVariants["Size"] || item.selectedVariants["size"];
        const selectedWeight = item.selectedVariants["Weight Unit"] || item.selectedVariants["Weight"] || item.selectedVariants["weight"];

        const cv = dbProduct.colorVariants?.find(
          (c: any) => c.color.toLowerCase() === selectedColor.toLowerCase()
        ) || dbProduct.colorVariants?.[0];

        if (cv && cv.subVariants) {
          const sv = cv.subVariants.find((s: any) => 
            (!selectedSize || s.size.toLowerCase() === selectedSize.toLowerCase()) && 
            (!selectedWeight || s.weight.toLowerCase() === selectedWeight.toLowerCase())
          ) || cv.subVariants[0];

          if (sv) {
            sv.stock = Math.max(0, sv.stock - item.quantity);
            
            // Recalculate totalStock of product
            dbProduct.totalStock = dbProduct.colorVariants.reduce((sum: number, c: any) => 
              sum + (c.subVariants?.reduce((sSum: number, s: any) => sSum + s.stock, 0) || 0)
            , 0);

            await dbProduct.save();
          }
        }
      } catch (err) {
        console.error("Failed to deduct stock for item during order creation:", item, err);
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

    const newOrder = await Order.create({
      _id: orderId,
      date: orderDate,
      amount,
      status: "Processing",
      statusClass: statusClasses["Processing"],
      itemsCount: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
      customerName,
      shippingAddress,
      items,
      history: [
        {
          status: "Placed",
          timestamp: orderTime,
          description: "Wholesale order generated successfully."
        }
      ]
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to create order" }, { status: 500 });
  }
}

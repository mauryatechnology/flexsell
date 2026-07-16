import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { verifyToken, getTokenFromCookie } from "@/lib/auth";

interface RouteProps {
  params: Promise<{ id: string }>;
}

// GET: Retrieve a specific order by ID
export async function GET(request: Request, { params }: RouteProps) {
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

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const order = await Order.findById(id).lean();
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Verify ownership
    if (payload.role !== "admin" && order.shippingAddress.email.toLowerCase() !== payload.email.toLowerCase()) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch order" }, { status: 500 });
  }
}

// PUT: Modify order details (quantities, items, shipping address) - Restricted to Admin
export async function PUT(request: Request, { params }: RouteProps) {
  try {
    await dbConnect();
    const token = await getTokenFromCookie();
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const body = await request.json();
    const { items, amount, shippingAddress, status } = body;

    // Save previous stock changes if items are modified
    if (items) {
      // Restore previous stock first
      for (const oldItem of order.items) {
        try {
          const dbProduct = await Product.findById(oldItem.product._id);
          if (!dbProduct) continue;

          const color = oldItem.selectedVariants["Color"] || oldItem.selectedVariants["color"] || "Default";
          const size = oldItem.selectedVariants["Pack Sizing"] || oldItem.selectedVariants["Size"] || oldItem.selectedVariants["size"];
          const weight = oldItem.selectedVariants["Weight Unit"] || oldItem.selectedVariants["Weight"] || oldItem.selectedVariants["weight"];

          const cv = dbProduct.colorVariants?.find((c: any) => c.color.toLowerCase() === color.toLowerCase());
          if (cv && cv.subVariants) {
            const sv = cv.subVariants.find((s: any) => 
              (!size || s.size.toLowerCase() === size.toLowerCase()) && 
              (!weight || s.weight.toLowerCase() === weight.toLowerCase())
            );
            if (sv) {
              sv.stock += oldItem.quantity; // Restore
              dbProduct.totalStock = dbProduct.colorVariants.reduce((sum: number, c: any) => 
                sum + (c.subVariants?.reduce((sSum: number, s: any) => sSum + s.stock, 0) || 0)
              , 0);
              await dbProduct.save();
            }
          }
        } catch (err) {
          console.error("Failed to restore stock during order edit:", oldItem, err);
        }
      }

      // Deduct new stock
      for (const newItem of items) {
        try {
          const dbProduct = await Product.findById(newItem.product._id);
          if (!dbProduct) continue;

          const color = newItem.selectedVariants["Color"] || newItem.selectedVariants["color"] || "Default";
          const size = newItem.selectedVariants["Pack Sizing"] || newItem.selectedVariants["Size"] || newItem.selectedVariants["size"];
          const weight = newItem.selectedVariants["Weight Unit"] || newItem.selectedVariants["Weight"] || newItem.selectedVariants["weight"];

          const cv = dbProduct.colorVariants?.find((c: any) => c.color.toLowerCase() === color.toLowerCase());
          if (cv && cv.subVariants) {
            const sv = cv.subVariants.find((s: any) => 
              (!size || s.size.toLowerCase() === size.toLowerCase()) && 
              (!weight || s.weight.toLowerCase() === weight.toLowerCase())
            );
            if (sv) {
              sv.stock = Math.max(0, sv.stock - newItem.quantity); // Deduct
              dbProduct.totalStock = dbProduct.colorVariants.reduce((sum: number, c: any) => 
                sum + (c.subVariants?.reduce((sSum: number, s: any) => sSum + s.stock, 0) || 0)
              , 0);
              await dbProduct.save();
            }
          }
        } catch (err) {
          console.error("Failed to deduct stock during order edit:", newItem, err);
        }
      }

      order.items = items;
      order.itemsCount = items.reduce((sum: number, i: any) => sum + i.quantity, 0);
    }

    if (amount !== undefined) order.amount = amount;
    if (shippingAddress) {
      order.shippingAddress = shippingAddress;
      order.customerName = `${shippingAddress.firstName} ${shippingAddress.lastName}${
        shippingAddress.company ? ` (${shippingAddress.company})` : ""
      }`;
    }
    if (status !== undefined) order.status = status;

    // Log the edit action in history
    order.history.unshift({
      status: order.status,
      timestamp: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      description: "Order items, quantities or shipping address modified by Administrator."
    });

    await order.save();

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update order" }, { status: 500 });
  }
}

// DELETE: Cancel or Delete order permanently
export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    await dbConnect();
    const token = await getTokenFromCookie();
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Restore all items stock upon cancellation/deletion
    for (const oldItem of order.items) {
      try {
        const dbProduct = await Product.findById(oldItem.product._id);
        if (!dbProduct) continue;

        const color = oldItem.selectedVariants["Color"] || oldItem.selectedVariants["color"] || "Default";
        const size = oldItem.selectedVariants["Pack Sizing"] || oldItem.selectedVariants["Size"] || oldItem.selectedVariants["size"];
        const weight = oldItem.selectedVariants["Weight Unit"] || oldItem.selectedVariants["Weight"] || oldItem.selectedVariants["weight"];

        const cv = dbProduct.colorVariants?.find((c: any) => c.color.toLowerCase() === color.toLowerCase());
        if (cv && cv.subVariants) {
          const sv = cv.subVariants.find((s: any) => 
            (!size || s.size.toLowerCase() === size.toLowerCase()) && 
            (!weight || s.weight.toLowerCase() === weight.toLowerCase())
          );
          if (sv) {
            sv.stock += oldItem.quantity; // Restore
            dbProduct.totalStock = dbProduct.colorVariants.reduce((sum: number, c: any) => 
              sum + (c.subVariants?.reduce((sSum: number, s: any) => sSum + s.stock, 0) || 0)
            , 0);
            await dbProduct.save();
          }
        }
      } catch (err) {
        console.error("Failed to restore stock during order deletion:", oldItem, err);
      }
    }

    await Order.findByIdAndDelete(id);

    return NextResponse.json({ message: "Order cancelled and deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to cancel order" }, { status: 500 });
  }
}

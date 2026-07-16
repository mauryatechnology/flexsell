import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { verifyToken, getTokenFromCookie } from "@/lib/auth";

const statusClasses = {
  Processing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
  Shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500",
  Delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500"
};

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const { status } = await request.json();
    
    if (!status || !statusClasses[status as keyof typeof statusClasses]) {
      return NextResponse.json({ message: "Invalid order status" }, { status: 400 });
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

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
    order.statusClass = statusClasses[status as keyof typeof statusClasses];
    order.history.unshift(newEvent); // Add to the beginning of the history logs

    await order.save();
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update order status" }, { status: 500 });
  }
}

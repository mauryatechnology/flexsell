import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Customer from "@/models/Customer";
import { verifyToken, getTokenFromCookie } from "@/lib/auth";
import { dispatchWebhook } from "@/lib/webhookDispatcher";

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
    const shipmentDetails = await request.json();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

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

    // Dispatch Webhook & Notification asynchronously
    const targetCustomerId = (await Customer.findOne({ email: order.shippingAddress.email.toLowerCase() }).select("_id"))?._id || "";
    dispatchWebhook("order.status_updated", order, targetCustomerId, {
      title: "Order Dispatched / Shipped",
      message: `Your wholesale order ${order._id} has been dispatched. Carrier: ${carrierInfo}. Tracking ID: ${shipmentDetails.trackingId}`,
      type: "order"
    }).catch(console.error);

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to ship order" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

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
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to ship order" }, { status: 500 });
  }
}

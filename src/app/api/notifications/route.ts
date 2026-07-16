import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import { verifyToken, getTokenFromCookie } from "@/lib/auth";

// GET: Retrieve all notifications for the logged-in customer
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

    // Return notifications specific to this customer or broadcast to all
    const notifications = await Notification.find({
      customerId: { $in: [payload.userId, "all"] }
    }).sort({ createdAt: -1 }).lean();

    return NextResponse.json(notifications);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch notifications" }, { status: 500 });
  }
}

// PUT: Mark notification as read
export async function PUT(request: Request) {
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

    const body = await request.json();
    const { _id } = body;

    if (!_id) {
      return NextResponse.json({ message: "Notification ID is required" }, { status: 400 });
    }

    const notif = await Notification.findById(_id);
    if (!notif) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    }

    if (notif.customerId !== payload.userId && notif.customerId !== "all") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    notif.isRead = true;
    await notif.save();

    return NextResponse.json(notif);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update notification" }, { status: 500 });
  }
}

// DELETE: Remove notification
export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "Notification ID is required" }, { status: 400 });
    }

    const notif = await Notification.findById(id);
    if (!notif) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    }

    if (notif.customerId !== payload.userId && notif.customerId !== "all") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await Notification.findByIdAndDelete(id);

    return NextResponse.json({ message: "Notification deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to delete notification" }, { status: 500 });
  }
}

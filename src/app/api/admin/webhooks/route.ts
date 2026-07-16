import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import WebhookSubscription from "@/models/WebhookSubscription";
import { verifyToken, getTokenFromCookie } from "@/lib/auth";
import crypto from "crypto";

// GET: Retrieve all subscriptions (restricted to admins)
export async function GET() {
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

    const subs = await WebhookSubscription.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(subs);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch webhooks" }, { status: 500 });
  }
}

// POST: Add a new webhook subscription (restricted to admins)
export async function POST(request: Request) {
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

    const body = await request.json();
    const { url, event, isActive } = body;

    if (!url || !event) {
      return NextResponse.json({ message: "URL and Event are required" }, { status: 400 });
    }

    // Verify combination is unique
    const existing = await WebhookSubscription.findOne({ url, event });
    if (existing) {
      return NextResponse.json({ message: "Subscription for this URL and Event already exists" }, { status: 400 });
    }

    // Generate random secret for verifying payloads
    const secret = "whsec_" + crypto.randomBytes(16).toString("hex");

    const newSub = await WebhookSubscription.create({
      url,
      event,
      secret,
      isActive: isActive !== undefined ? isActive : true
    });

    return NextResponse.json(newSub);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to create webhook" }, { status: 500 });
  }
}

// PUT: Edit webhook subscription (restricted to admins)
export async function PUT(request: Request) {
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

    const body = await request.json();
    const { _id, url, event, isActive } = body;

    if (!_id) {
      return NextResponse.json({ message: "Webhook ID is required" }, { status: 400 });
    }

    const sub = await WebhookSubscription.findById(_id);
    if (!sub) {
      return NextResponse.json({ message: "Webhook subscription not found" }, { status: 404 });
    }

    if (url !== undefined) sub.url = url;
    if (event !== undefined) sub.event = event;
    if (isActive !== undefined) sub.isActive = isActive;

    await sub.save();

    return NextResponse.json(sub);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update webhook" }, { status: 500 });
  }
}

// DELETE: Delete webhook subscription permanently (restricted to admins)
export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "Webhook ID is required" }, { status: 400 });
    }

    const sub = await WebhookSubscription.findById(id);
    if (!sub) {
      return NextResponse.json({ message: "Webhook subscription not found" }, { status: 404 });
    }

    await WebhookSubscription.findByIdAndDelete(id);

    return NextResponse.json({ message: "Webhook subscription deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to delete webhook" }, { status: 500 });
  }
}

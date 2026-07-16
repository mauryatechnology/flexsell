import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Customer from "@/models/Customer";
import { verifyToken, getTokenFromCookie } from "@/lib/auth";

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

    const customer = await Customer.findById(payload.userId).select("-password").lean();
    if (!customer) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch active customer" }, { status: 500 });
  }
}

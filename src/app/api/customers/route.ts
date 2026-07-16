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
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Filter out admin accounts
    const customers = await Customer.find({ role: { $ne: "admin" } });
    return NextResponse.json(customers);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch customers" }, { status: 500 });
  }
}

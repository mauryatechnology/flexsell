import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Customer from "@/models/Customer";

export async function GET() {
  try {
    await dbConnect();
    const customers = await Customer.find({});
    return NextResponse.json(customers);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch customers" }, { status: 500 });
  }
}

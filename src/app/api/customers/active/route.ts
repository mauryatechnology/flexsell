import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Customer from "@/models/Customer";

export async function GET() {
  try {
    await dbConnect();
    // In mock data, activeCustomer is customers[0]. Let's fetch the first customer from db.
    const firstCustomer = await Customer.findOne({});
    if (!firstCustomer) {
      return NextResponse.json({ message: "No customers found" }, { status: 404 });
    }
    return NextResponse.json(firstCustomer);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch active customer" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import StockLog from "@/models/StockLog";

export async function GET() {
  try {
    await dbConnect();
    const logs = await StockLog.find({}).sort({ createdAt: -1 });
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch ledger logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    if (!body._id) {
      body._id = Array.from({ length: 24 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
    }

    const newLog = await StockLog.create(body);
    return NextResponse.json(newLog, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to save stock log" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await dbConnect();
    await StockLog.deleteMany({});
    return NextResponse.json({ message: "Ledger history cleared successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to clear ledger history" },
      { status: 500 }
    );
  }
}

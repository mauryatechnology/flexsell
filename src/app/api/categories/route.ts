import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import { verifyToken, getTokenFromCookie } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({}).sort({ order: 1 });
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch categories" }, { status: 500 });
  }
}

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
    
    // Generate a random ObjectId-like 24-character hex ID if not provided
    if (!body._id) {
      body._id = Array.from({ length: 24 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
    }
    
    const newCategory = await Category.create(body);
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to create category" }, { status: 500 });
  }
}

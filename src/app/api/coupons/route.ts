import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Coupon from "@/models/Coupon";
import { verifyToken, getTokenFromCookie } from "@/lib/auth";

// GET: Retrieve all coupons (for admins) or active ones (for customers)
export async function GET() {
  try {
    await dbConnect();
    const token = await getTokenFromCookie();
    
    let isAdmin = false;
    if (token) {
      const payload = verifyToken(token);
      if (payload && payload.role === "admin") {
        isAdmin = true;
      }
    }

    const todayStr = new Date().toISOString().split("T")[0];

    let query = {};
    if (!isAdmin) {
      query = {
        isActive: true,
        expiryDate: { $gte: todayStr }
      };
    }

    const coupons = await Coupon.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(coupons);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch coupons" }, { status: 500 });
  }
}

// POST: Create a new B2B coupon (restricted to admins)
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
    const { code, discountType, discountValue, minOrderValue, maxDiscount, expiryDate, isActive } = body;

    if (!code || !discountType || discountValue === undefined || !expiryDate) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Check if code already exists
    const uppercaseCode = code.toUpperCase().trim();
    const existing = await Coupon.findOne({ code: uppercaseCode });
    if (existing) {
      return NextResponse.json({ message: `Coupon with code "${uppercaseCode}" already exists` }, { status: 400 });
    }

    const newCoupon = await Coupon.create({
      code: uppercaseCode,
      discountType,
      discountValue: parseFloat(discountValue),
      minOrderValue: parseFloat(minOrderValue) || 0,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
      expiryDate,
      isActive: isActive !== undefined ? isActive : true
    });

    return NextResponse.json(newCoupon);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to create coupon" }, { status: 500 });
  }
}

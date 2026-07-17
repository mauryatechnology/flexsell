import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Coupon from "@/models/Coupon";
import { verifyToken, getTokenFromCookie } from "@/lib/auth";
import { requireAuth } from "@/lib/authGuard";
import { couponSchema } from "@/lib/validators";
import { ZodError } from "zod";

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
    const auth = await requireAuth("admin");
    if (auth.error) return auth.error;

    await dbConnect();
    const body = await request.json();
    
    const validatedData = couponSchema.parse(body);

    // Check if code already exists
    const uppercaseCode = validatedData.code.toUpperCase().trim();
    const existing = await Coupon.findOne({ code: uppercaseCode });
    if (existing) {
      return NextResponse.json({ message: `Coupon with code "${uppercaseCode}" already exists` }, { status: 400 });
    }

    const newCoupon = await Coupon.create({
      code: uppercaseCode,
      discountType: validatedData.discountType,
      discountValue: validatedData.discountValue,
      minOrderValue: validatedData.minOrderValue,
      maxDiscount: validatedData.maxDiscount,
      expiryDate: validatedData.expiryDate,
      isActive: validatedData.isActive
    });

    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ message: error.message || "Failed to create coupon" }, { status: 500 });
  }
}

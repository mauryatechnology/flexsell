import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Coupon from "@/models/Coupon";
import { verifyToken, getTokenFromCookie } from "@/lib/auth";

interface RouteProps {
  params: Promise<{ id: string }>;
}

// PUT: Update coupon parameters (restricted to admins)
export async function PUT(request: Request, { params }: RouteProps) {
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

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const body = await request.json();
    const { code, discountType, discountValue, minOrderValue, maxDiscount, expiryDate, isActive } = body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json({ message: "Coupon not found" }, { status: 404 });
    }

    if (code !== undefined) {
      const uppercaseCode = code.toUpperCase().trim();
      if (uppercaseCode !== coupon.code) {
        // Verify code is unique
        const existing = await Coupon.findOne({ code: uppercaseCode });
        if (existing) {
          return NextResponse.json({ message: `Coupon with code "${uppercaseCode}" already exists` }, { status: 400 });
        }
        coupon.code = uppercaseCode;
      }
    }

    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = parseFloat(discountValue);
    if (minOrderValue !== undefined) coupon.minOrderValue = parseFloat(minOrderValue) || 0;
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount ? parseFloat(maxDiscount) : undefined;
    if (expiryDate !== undefined) coupon.expiryDate = expiryDate;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    return NextResponse.json(coupon);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update coupon" }, { status: 500 });
  }
}

// DELETE: Delete a coupon permanently (restricted to admins)
export async function DELETE(request: Request, { params }: RouteProps) {
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

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json({ message: "Coupon not found" }, { status: 404 });
    }

    await Coupon.findByIdAndDelete(id);

    return NextResponse.json({ message: "Coupon deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to delete coupon" }, { status: 500 });
  }
}

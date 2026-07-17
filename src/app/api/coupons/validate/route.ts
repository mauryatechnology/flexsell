import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Coupon from "@/models/Coupon";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { code, orderValue } = body;

    if (!code || orderValue === undefined) {
      return NextResponse.json({ message: "Code and orderValue are required" }, { status: 400 });
    }

    const uppercaseCode = code.toUpperCase().trim();
    const coupon = await Coupon.findOne({ code: uppercaseCode });

    if (!coupon) {
      return NextResponse.json({ message: `Invalid coupon code "${uppercaseCode}"` }, { status: 400 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ message: "This coupon is no longer active" }, { status: 400 });
    }

    const todayStr = new Date().toISOString().split("T")[0];
    if (coupon.expiryDate < todayStr) {
      return NextResponse.json({ message: "This coupon has expired" }, { status: 400 });
    }

    const value = parseFloat(orderValue);
    if (value < coupon.minOrderValue) {
      return NextResponse.json({
        message: `Minimum purchase amount of ₹${coupon.minOrderValue} is required to use this coupon.`
      }, { status: 400 });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === "flat") {
      discountAmount = coupon.discountValue;
    } else {
      // Percentage discount
      discountAmount = value * (coupon.discountValue / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    }

    // Ensure discount does not exceed order value
    if (discountAmount > value) {
      discountAmount = value;
    }

    const roundedDiscount = parseFloat(discountAmount.toFixed(2));
    const finalAmount = parseFloat((value - roundedDiscount).toFixed(2));

    return NextResponse.json({
      success: true,
      discountAmount: roundedDiscount,
      finalAmount,
      couponCode: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    });
  } catch (error: unknown) {
    return NextResponse.json({ message: (error as any).message || "Failed to validate coupon" }, { status: 500 });
  }
}

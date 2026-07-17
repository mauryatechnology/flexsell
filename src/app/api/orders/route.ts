import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Customer from "@/models/Customer";
import InvoiceModel from "@/models/Invoice";
import CmsContent from "@/models/CmsContent";
import Coupon from "@/models/Coupon";
import { requireAuth } from "@/lib/authGuard";
import { dispatchWebhook } from "@/lib/webhookDispatcher";
import { generateNextId } from "@/lib/idGenerator";
import { orderSchema } from "@/lib/validators";
import { ZodError } from "zod";
import { resolveVariantKeys } from "@/lib/variantMatcher";
import nodemailer from "nodemailer";
import { ORDER_STATUS_CLASSES } from "@/lib/constants";

async function generateInvoiceId(type: "invoice" | "receipt"): Promise<string> {
  const prefix = type === "invoice" ? "INV" : "RCP";
  const year = new Date().getFullYear();
  const regex = new RegExp(`^${prefix}-${year}-`);
  const lastDoc = await InvoiceModel.findOne({ _id: regex })
    .sort({ _id: -1 })
    .select("_id")
    .lean();
  let nextSeq = 1;
  if (lastDoc) {
    const parts = (lastDoc._id as string).split("-");
    const lastSeq = parseInt(parts[2], 10);
    if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
  }
  return `${prefix}-${year}-${String(nextSeq).padStart(5, "0")}`;
}

async function getSellerInfo() {
  const brandCms = await CmsContent.findOne({ key: "brandSettings" }).lean();
  const bs = (brandCms?.value || {}) as any;
  return {
    storeName: bs.storeName || "FlexSell Wholesale",
    gstin: bs.gstin || "",
    address: bs.companyAddress || "",
    email: bs.supportEmail || "",
    phone: bs.supportPhone || "",
    logoUrl: "/Flexsell%20Logo.png",
  };
}

function computeOrderTaxDetails(items: any[], buyerState: string, sellerState: string) {
  const isIntrastate = buyerState.toLowerCase() === sellerState.toLowerCase();
  const hsnMap: Record<string, any> = {};
  let baseSubtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  items.forEach((item: any) => {
    const rate = item.product?.gstRate ?? 18;
    const hsn = item.product?.hsnCode ?? "3924";
    const isIncl = item.product?.priceIncludesGst ?? true;
    const totalAmount = item.pricePerUnit * item.quantity;
    let itemBase = 0;
    let itemTax = 0;

    if (isIncl) {
      itemBase = totalAmount / (1 + rate / 100);
      itemTax = totalAmount - itemBase;
    } else {
      itemBase = totalAmount;
      itemTax = itemBase * (rate / 100);
    }

    baseSubtotal += itemBase;
    let cgst = 0, sgst = 0, igst = 0;
    if (isIntrastate) {
      cgst = itemTax / 2;
      sgst = itemTax / 2;
      totalCgst += cgst;
      totalSgst += sgst;
    } else {
      igst = itemTax;
      totalIgst += igst;
    }

    if (!hsnMap[hsn]) {
      hsnMap[hsn] = { hsnCode: hsn, gstRate: rate, baseAmount: 0, totalTax: 0, cgst: 0, sgst: 0, igst: 0 };
    }
    hsnMap[hsn].baseAmount += itemBase;
    hsnMap[hsn].totalTax += itemTax;
    hsnMap[hsn].cgst += cgst;
    hsnMap[hsn].sgst += sgst;
    hsnMap[hsn].igst += igst;
  });

  return {
    isIntrastate,
    baseSubtotal,
    cgst: totalCgst,
    sgst: totalSgst,
    igst: totalIgst,
    hsnSlabs: Object.values(hsnMap),
  };
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const payload = auth.payload!;

    await dbConnect();
    let query = {};
    if (payload.role !== "admin") {
      // B2B buyer can only fetch their own orders matching their email
      query = { "shippingAddress.email": payload.email.toLowerCase() };
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (startDate || endDate) {
      const dateQuery: any = {};
      if (startDate) {
        dateQuery.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateQuery.$lte = end;
      }
      query = { ...query, createdAt: dateQuery };
    }

    if (page && limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 20;
      const skip = (pageNum - 1) * limitNum;

      const [orders, total] = await Promise.all([
        Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
        Order.countDocuments(query)
      ]);

      return NextResponse.json({
        orders,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      });
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(orders);
  } catch (error: unknown) {
    return NextResponse.json({ message: (error as any).message || "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const payload = auth.payload!;

    await dbConnect();
    const body = await request.json();
    
    // Validate order request with Zod
    const validatedData = orderSchema.parse(body);
    const { items, amount, shippingAddress, paymentDetails, couponCode, couponDiscount } = validatedData;

    // Re-verify coupon validity and discount on backend for security
    let dbCoupon = null;
    if (couponCode) {
      const cleanCode = couponCode.toUpperCase().trim();
      dbCoupon = await Coupon.findOne({ code: cleanCode });
      if (!dbCoupon) {
        return NextResponse.json({ message: `Coupon "${cleanCode}" is invalid.` }, { status: 400 });
      }
      if (!dbCoupon.isActive) {
        return NextResponse.json({ message: "This coupon is no longer active" }, { status: 400 });
      }
      const todayStr = new Date().toISOString().split("T")[0];
      if (dbCoupon.expiryDate < todayStr) {
        return NextResponse.json({ message: "This coupon has expired" }, { status: 400 });
      }
      // Check overall limit
      if (dbCoupon.usageLimit !== null && dbCoupon.usageLimit !== undefined) {
        if ((dbCoupon.usedCount || 0) >= dbCoupon.usageLimit) {
          return NextResponse.json({ message: "This coupon has reached its overall usage limit" }, { status: 400 });
        }
      }
      // Check personalization
      const userEmail = payload.email?.toLowerCase() || "";
      if (dbCoupon.isPersonalized) {
        const isAllowed = dbCoupon.allowedCustomers?.some((email: string) => email.toLowerCase() === userEmail);
        if (!isAllowed) {
          return NextResponse.json({ message: "This coupon is not valid for your account" }, { status: 400 });
        }
      }
      // Check per-customer limit
      const customerUses = dbCoupon.usedBy?.filter((email: string) => email.toLowerCase() === userEmail).length || 0;
      const customerLimit = dbCoupon.usageLimitPerCustomer || 1;
      if (customerUses >= customerLimit) {
        return NextResponse.json({ message: "You have already reached the maximum usage limit for this coupon" }, { status: 400 });
      }

      // Recompute discount
      let calculatedDiscount = 0;
      const orderSubtotal = items.reduce((sum: number, item: any) => sum + (item.pricePerUnit * item.quantity), 0);
      if (dbCoupon.discountType === "flat") {
        calculatedDiscount = dbCoupon.discountValue;
      } else {
        calculatedDiscount = orderSubtotal * (dbCoupon.discountValue / 100);
        if (dbCoupon.maxDiscount && calculatedDiscount > dbCoupon.maxDiscount) {
          calculatedDiscount = dbCoupon.maxDiscount;
        }
      }
      if (calculatedDiscount > orderSubtotal) {
        calculatedDiscount = orderSubtotal;
      }

      const roundedDiscount = parseFloat(calculatedDiscount.toFixed(2));
      if (couponDiscount !== undefined && Math.abs(roundedDiscount - couponDiscount) > 0.05) {
        return NextResponse.json({ message: `Coupon discount calculation mismatch. Expected: ${roundedDiscount}, Got: ${couponDiscount}` }, { status: 400 });
      }
    }

    // Determine the next sequential Order ID (FS-xxxxx or custom format)
    const orderId = await generateNextId("order");

    // Deduct stock for each ordered item in MongoDB atomically
    for (const item of items) {
      const dbProduct = await Product.findById(item.product._id);
      if (!dbProduct) {
        return NextResponse.json({ message: `Product not found: ${item.product.title}` }, { status: 404 });
      }

      const { color: selectedColor, size: selectedSize, weight: selectedWeight } = resolveVariantKeys(item.selectedVariants);

      const cv = dbProduct.colorVariants?.find(
        (c: any) => c.color?.toLowerCase() === selectedColor.toLowerCase()
      );
      if (!cv) {
        return NextResponse.json({ message: `Color variant "${selectedColor}" not found for product "${dbProduct.title}"` }, { status: 400 });
      }

      const sv = cv.subVariants?.find((s: any) => 
        (!selectedSize || s.size?.toLowerCase() === selectedSize.toLowerCase()) && 
        (!selectedWeight || s.weight?.toLowerCase() === selectedWeight.toLowerCase())
      );
      if (!sv) {
        return NextResponse.json({ message: `Variant size/weight option not found for product "${dbProduct.title}"` }, { status: 400 });
      }

      if (sv.stock < item.quantity) {
        return NextResponse.json({ message: `Insufficient stock for product "${dbProduct.title}" (${selectedColor} - ${selectedSize || ""})` }, { status: 400 });
      }

      // Perform atomic decrement
      const updateResult = await Product.updateOne(
        {
          _id: item.product._id,
          "colorVariants.color": cv.color,
          "colorVariants.subVariants": {
            $elemMatch: {
              size: sv.size,
              weight: sv.weight,
              stock: { $gte: item.quantity }
            }
          }
        },
        {
          $inc: {
            "colorVariants.$[cv].subVariants.$[sv].stock": -item.quantity,
            totalStock: -item.quantity
          }
        },
        {
          arrayFilters: [
            { "cv.color": cv.color },
            { "sv.size": sv.size, "sv.weight": sv.weight }
          ]
        }
      );

      if (updateResult.modifiedCount === 0) {
        return NextResponse.json({ message: `Concurrency error: Stock update failed for "${dbProduct.title}"` }, { status: 409 });
      }
    }

    const orderDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });

    const orderTime = new Date().toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const customerName = `${shippingAddress.firstName} ${shippingAddress.lastName}${
      shippingAddress.company ? ` (${shippingAddress.company})` : ""
    }`;

    const newOrder = await Order.create({
      _id: orderId,
      date: orderDate,
      amount,
      status: "Processing",
      statusClass: ORDER_STATUS_CLASSES["Processing"],
      itemsCount: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
      customerName,
      shippingAddress: shippingAddress as any,
      items: items as any,
      paymentMethod: paymentDetails?.paymentMethod,
      paymentStatus: paymentDetails?.paymentStatus,
      transactionId: paymentDetails?.transactionId,
      couponCode,
      couponDiscount,
      history: [
        {
          status: "Placed",
          timestamp: orderTime,
          description: paymentDetails?.paymentMethod === "Razorpay"
            ? `Wholesale order generated successfully. Online Payment verified (Txn ID: ${paymentDetails.transactionId}).`
            : "Wholesale order generated successfully. Payment pending verification."
        }
      ]
    } as any);

    if (dbCoupon) {
      await Coupon.updateOne(
        { _id: dbCoupon._id },
        { 
          $inc: { usedCount: 1 },
          $push: { usedBy: payload.email.toLowerCase() }
        }
      );
    }

    // ═══ AUTO-GENERATE INVOICE / RECEIPT ═══
    const pStatus = paymentDetails?.paymentStatus || "Pending";
    try {
      const docType = pStatus === "Paid" ? "invoice" : "receipt";
        const sellerInfo = await getSellerInfo();
        const sellerState = sellerInfo.address.match(/(?:,\s*)([A-Za-z\s]+?)(?:\s*-\s*\d|$)/)?.[1]?.trim() || "Madhya Pradesh";
        const taxDetails = computeOrderTaxDetails(items, shippingAddress.state, sellerState);
        const invoiceId = await generateInvoiceId(docType);
        const generatedAt = new Date().toLocaleDateString("en-IN", {
          day: "2-digit", month: "long", year: "numeric",
        });

        await InvoiceModel.create({
          _id: invoiceId,
          type: docType,
          orderId,
          customerId: payload.userId,
          customerName,
          customerEmail: shippingAddress.email.toLowerCase(),
          customerGstin: shippingAddress.gstin || "",
          items,
          amount,
          taxDetails,
          shippingAddress,
          paymentMethod: paymentDetails?.paymentMethod,
          paymentStatus: pStatus,
          transactionId: paymentDetails?.transactionId,
          sellerInfo,
          generatedAt,
          generatedBy: "system",
          status: "issued",
        } as any);

        // Link invoice to order
        await Order.findByIdAndUpdate(orderId, { invoiceId });
      } catch (invoiceErr) {
        console.error("Auto-invoice generation failed (non-blocking):", invoiceErr);
      }

    // Fire webhook and in-app notifications asynchronously
    const targetCustomerId = payload.role === "admin"
      ? (await Customer.findOne({ email: shippingAddress.email.toLowerCase() }).select("_id"))?._id || payload.userId
      : payload.userId;

    dispatchWebhook("order.created", newOrder, targetCustomerId, {
      title: "Order Placed Successfully",
      message: `Your wholesale order ${orderId} has been placed. Current status is Processing.`,
      type: "success"
    }).catch(console.error);

    // Asynchronously send confirmation email if SMTP is configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const smtpPass = process.env.SMTP_PASS?.replace(/"/g, "");
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "465", 10),
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: smtpPass,
        },
      });

      const mailOptions = {
        from: `"FlexSell Wholesale Support" <${process.env.SMTP_USER}>`,
        to: shippingAddress.email,
        subject: `FlexSell Wholesale Order Confirmed - ${orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #10b981; text-align: center;">Order Confirmed!</h2>
            <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
            <p>Hello ${shippingAddress.firstName},</p>
            <p>Thank you for sourcing with FlexSell. Your B2B order has been generated successfully.</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Amount:</strong> ₹${amount.toFixed(2)}</p>
            <p><strong>Current Status:</strong> Processing</p>
            <p>Our wholesale team is checking the stock and preparing your packaging details. We will notify you once cargo is dispatched.</p>
            <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">FlexSell Wholesale © 2026. All rights reserved.</p>
          </div>
        `
      };

      transporter.sendMail(mailOptions).catch((mailErr) => {
        console.error("Nodemailer failed to send order confirmation email:", mailErr.message);
      });
    } else {
      console.warn("SMTP config missing, skipping order confirmation email delivery.");
    }

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: unknown) {
    console.error("Orders API POST error details:", error);
    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ message: (error as any).message || "Failed to create order" }, { status: 500 });
  }
}

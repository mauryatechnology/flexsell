import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Customer from "@/models/Customer";
import { requireAuth } from "@/lib/authGuard";
import { dispatchWebhook } from "@/lib/webhookDispatcher";
import { generateNextId } from "@/lib/idGenerator";
import { orderSchema } from "@/lib/validators";
import { ZodError } from "zod";
import { resolveVariantKeys } from "@/lib/variantMatcher";
import nodemailer from "nodemailer";
import { ORDER_STATUS_CLASSES } from "@/lib/constants";

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
    const { items, amount, shippingAddress, paymentDetails } = validatedData;

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
        (c: any) => c.color.toLowerCase() === selectedColor.toLowerCase()
      );
      if (!cv) {
        return NextResponse.json({ message: `Color variant "${selectedColor}" not found for product "${dbProduct.title}"` }, { status: 400 });
      }

      const sv = cv.subVariants?.find((s: any) => 
        (!selectedSize || s.size.toLowerCase() === selectedSize.toLowerCase()) && 
        (!selectedWeight || s.weight.toLowerCase() === selectedWeight.toLowerCase())
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
      shippingAddress,
      items,
      paymentMethod: paymentDetails?.paymentMethod,
      paymentStatus: paymentDetails?.paymentStatus,
      transactionId: paymentDetails?.transactionId,
      history: [
        {
          status: "Placed",
          timestamp: orderTime,
          description: paymentDetails?.paymentMethod === "Razorpay"
            ? `Wholesale order generated successfully. Online Payment verified (Txn ID: ${paymentDetails.transactionId}).`
            : "Wholesale order generated successfully. Payment pending verification."
        }
      ]
    });

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
    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ message: (error as any).message || "Failed to create order" }, { status: 500 });
  }
}

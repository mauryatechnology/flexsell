import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import InvoiceModel from "@/models/Invoice";
import Order from "@/models/Order";
import { requireAuth } from "@/lib/authGuard";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;
    await dbConnect();

    const invoice = await InvoiceModel.findById(id).lean();
    if (!invoice) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    // Non-admin users can only view their own invoices
    const payload = auth.payload!;
    if (payload.role !== "admin" && invoice.customerEmail !== payload.email.toLowerCase()) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(invoice);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const payload = auth.payload!;

    if (payload.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    const body = await request.json();
    const allowedFields = [
      "status", "notes", "items", "amount", "taxDetails",
      "shippingAddress", "paymentStatus", "customerName", "customerGstin",
      "paymentMethod", "transactionId",
    ];

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (updateData.status === "paid") {
      updateData.type = "invoice";
      updateData.paymentStatus = "Paid";
    }

    const updated = await InvoiceModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    // Sync order details if orderId is linked
    if (updated.orderId && updated.status === "paid") {
      await Order.findByIdAndUpdate(updated.orderId, {
        paymentStatus: "Paid",
        paymentMethod: updated.paymentMethod,
        transactionId: updated.transactionId
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to update invoice" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const payload = auth.payload!;

    if (payload.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    const invoice = await InvoiceModel.findById(id).lean();
    if (!invoice) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    // Remove invoiceId reference from linked order
    if (invoice.orderId) {
      await Order.findByIdAndUpdate(invoice.orderId, { $unset: { invoiceId: "" } });
    }

    await InvoiceModel.findByIdAndDelete(id);

    return NextResponse.json({ message: "Invoice deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to delete invoice" },
      { status: 500 }
    );
  }
}

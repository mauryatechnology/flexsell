import mongoose, { Schema, Document } from "mongoose";
import { Invoice as InvoiceType } from "@/types";

const HsnSlabSchema = new Schema({
  hsnCode: { type: String, required: true },
  gstRate: { type: Number, required: true },
  baseAmount: { type: Number, required: true },
  totalTax: { type: Number, required: true },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
}, { _id: false });

const TaxBreakdownSchema = new Schema({
  isIntrastate: { type: Boolean, required: true },
  baseSubtotal: { type: Number, required: true },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  hsnSlabs: [HsnSlabSchema],
}, { _id: false });

const SellerInfoSchema = new Schema({
  storeName: { type: String, required: true },
  gstin: { type: String, default: "" },
  address: { type: String, default: "" },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  logoUrl: { type: String },
}, { _id: false });

const InvoiceSchema = new Schema<InvoiceType & Document>(
  {
    _id: { type: String, required: true },
    type: { type: String, enum: ["invoice", "receipt"], required: true },
    orderId: { type: String, ref: "Order" },
    customerId: { type: String, ref: "Customer" },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerGstin: { type: String },
    items: [{ type: Schema.Types.Mixed, required: true }],
    amount: { type: Number, required: true },
    taxDetails: { type: TaxBreakdownSchema, required: true },
    shippingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      company: { type: String },
      address: { type: String, required: true },
      apartment: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pinCode: { type: String, required: true },
      phone: { type: String, required: true },
      gstin: { type: String },
    },
    paymentMethod: { type: String },
    paymentStatus: { type: String },
    transactionId: { type: String },
    sellerInfo: { type: SellerInfoSchema, required: true },
    notes: { type: String },
    generatedAt: { type: String, required: true },
    generatedBy: { type: String, required: true, default: "system" },
    status: {
      type: String,
      enum: ["draft", "issued", "cancelled", "void"],
      default: "issued",
    },
  },
  { timestamps: true }
);

InvoiceSchema.index({ type: 1 });
InvoiceSchema.index({ orderId: 1 });
InvoiceSchema.index({ customerId: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ createdAt: -1 });

export default mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);

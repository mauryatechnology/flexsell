import mongoose, { Schema, Document } from "mongoose";
import { Order as OrderType } from "@/types";

const ShipmentDetailsSchema = new Schema({
  type: { type: String, enum: ["self", "third-party"], required: true },
  carrierName: { type: String },
  trackingId: { type: String, required: true },
  trackingUrl: { type: String },
  shippedAt: { type: String },
  deliveredAt: { type: String },
  estimatedDelivery: { type: String },
  notes: { type: String },
});

const HistoryEventSchema = new Schema({
  status: { type: String, required: true },
  timestamp: { type: String, required: true },
  description: { type: String, required: true },
});

const OrderSchema = new Schema<OrderType & Document>(
  {
    _id: { type: String, required: true },
    date: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
    statusClass: { type: String, required: true },
    itemsCount: { type: Number, required: true },
    customerName: { type: String, required: true },
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
    },
    items: [{ type: Schema.Types.Mixed, required: true }],
    shipmentDetails: { type: ShipmentDetailsSchema },
    history: [HistoryEventSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);

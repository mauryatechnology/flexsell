import mongoose, { Schema, Document } from "mongoose";
import { Customer as CustomerType } from "@/types";

const CustomerSchema = new Schema<CustomerType & Document>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    company: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },
    phone: { type: String, required: true },
    initials: { type: String, required: true },
    gstin: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);

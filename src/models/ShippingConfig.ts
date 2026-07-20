import mongoose, { Schema, Document } from "mongoose";
import { ShippingConfig as ShippingConfigType } from "@/types";

const WeightSlabSchema = new Schema({
  fromGram: { type: Number, required: true },
  uptoGram: { type: Number, required: true },
  amount: { type: Number, required: true },
}, { _id: true });

const ShippingConfigSchema = new Schema<ShippingConfigType & Document>(
  {
    _id: { type: String, default: "shipping-config" },
    weightSlabs: [WeightSlabSchema],
    b2bFixedCharge: { type: Number, default: 150 },
  },
  { timestamps: true }
);

if (mongoose.models.ShippingConfig) {
  delete mongoose.models.ShippingConfig;
}

export default mongoose.models.ShippingConfig ||
  mongoose.model<ShippingConfigType & Document>("ShippingConfig", ShippingConfigSchema);

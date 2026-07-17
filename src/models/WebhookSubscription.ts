import mongoose, { Schema, Document } from "mongoose";
import { WebhookSubscription as WebhookSubscriptionType } from "@/types";

const WebhookSubscriptionSchema = new Schema<WebhookSubscriptionType & Document>(
  {
    url: { type: String, required: true },
    event: { 
      type: String, 
      enum: ["order.created", "order.status_updated", "customer.created"], 
      required: true 
    },
    secret: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Ensure a URL is only subscribed to an event once
WebhookSubscriptionSchema.index({ url: 1, event: 1 }, { unique: true });

export default mongoose.models.WebhookSubscription || mongoose.model("WebhookSubscription", WebhookSubscriptionSchema);

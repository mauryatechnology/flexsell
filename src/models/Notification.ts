import mongoose, { Schema, Document } from "mongoose";
import { Notification as NotificationType } from "@/types";

const NotificationSchema = new Schema<NotificationType & Document>(
  {
    customerId: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "order", "success", "warning"], default: "info" },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

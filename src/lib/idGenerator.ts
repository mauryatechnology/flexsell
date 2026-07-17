import dbConnect from "./dbConnect";
import CmsContent from "@/models/CmsContent";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import Product from "@/models/Product";
import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

export async function generateNextId(type: "customer" | "order" | "product"): Promise<string> {
  await dbConnect();

  // 1. Fetch ID Settings from CMS Config
  const cmsConfig = await CmsContent.findOne({ key: "idSettings" }).lean();
  const idSettings = (cmsConfig?.value || {}) as any;

  let prefix = "";
  let defaultPrefix = "";
  let Model: any = null;
  let useHex = false;
  let startCount = 1;

  if (type === "customer") {
    prefix = idSettings.customerPrefix || "";
    defaultPrefix = "FSW-";
    Model = Customer;
    useHex = prefix !== "" && prefix !== defaultPrefix;
    startCount = parseInt(idSettings.customerStart, 10) || 1;
  } else if (type === "order") {
    prefix = idSettings.orderPrefix || "";
    defaultPrefix = "FS-";
    Model = Order;
    useHex = prefix !== "" && prefix !== defaultPrefix;
    startCount = parseInt(idSettings.orderStart, 10) || 1;
  } else if (type === "product") {
    prefix = idSettings.productPrefix || "";
    defaultPrefix = "";
    Model = Product;
    useHex = prefix !== "";
    startCount = parseInt(idSettings.productStart, 10) || 1;
  }

  // 2. Thread-safe counter incrementing logic
  if (!useHex) {
    if (type === "customer") {
      const counterExist = await Counter.findById("customer");
      if (!counterExist) {
        const customersList = await Customer.find({}, { _id: 1 }).lean();
        let maxNum = 0;
        for (const c of customersList) {
          const match = c._id.match(/^FSW-(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
          }
        }
        const initialSeq = Math.max(startCount, maxNum + 1);
        await Counter.create({ _id: "customer", seq: initialSeq });
        return `FSW-${String(initialSeq).padStart(4, "0")}`;
      } else {
        const result = await Counter.findByIdAndUpdate(
          "customer",
          { $inc: { seq: 1 } },
          { new: true }
        );
        return `FSW-${String(result.seq).padStart(4, "0")}`;
      }
    } else if (type === "order") {
      const counterExist = await Counter.findById("order");
      const defaultStart = startCount + 10025; // legacy base starts at 10026
      if (!counterExist) {
        const count = await Order.countDocuments();
        const initialSeq = Math.max(defaultStart, 10026 + count);
        await Counter.create({ _id: "order", seq: initialSeq });
        return `FS-${initialSeq}`;
      } else {
        const result = await Counter.findByIdAndUpdate(
          "order",
          { $inc: { seq: 1 } },
          { new: true }
        );
        return `FS-${result.seq}`;
      }
    } else {
      // Default product ID: proper ObjectId
      return new mongoose.Types.ObjectId().toHexString();
    }
  }

  // Customized Hexadecimal sequential generation logic
  const counterId = `${type}_hex_${prefix}`;
  const counterExist = await Counter.findById(counterId);
  if (!counterExist) {
    const escapedPrefix = prefix.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`^${escapedPrefix}`);
    const items = await Model.find({ _id: regex }, { _id: 1 }).lean();
    let maxNum = startCount - 1;
    for (const item of items) {
      const suffix = item._id.substring(prefix.length);
      const num = parseInt(suffix, 16);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
    const initialSeq = maxNum + 1;
    await Counter.create({ _id: counterId, seq: initialSeq });
    return `${prefix}${initialSeq.toString(16)}`;
  } else {
    const result = await Counter.findByIdAndUpdate(
      counterId,
      { $inc: { seq: 1 } },
      { new: true }
    );
    return `${prefix}${result.seq.toString(16)}`;
  }
}

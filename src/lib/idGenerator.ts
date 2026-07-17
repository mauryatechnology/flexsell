import dbConnect from "./dbConnect";
import CmsContent from "@/models/CmsContent";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import Product from "@/models/Product";

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

  // If no custom prefix is set, use the default legacy generation logic
  if (!useHex) {
    if (type === "customer") {
      const customersList = await Customer.find({}, { _id: 1 }).lean();
      let maxNum = 0;
      for (const c of customersList) {
        const match = c._id.match(/^FSW-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
      return `FSW-${String(maxNum + 1).padStart(4, "0")}`;
    } else if (type === "order") {
      const count = await Order.countDocuments();
      return `FS-${10026 + count}`;
    } else {
      // Default product ID: random 24-char hex string
      return Array.from({ length: 24 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
    }
  }

  // Customized Hexadecimal sequential generation logic
  // Find all documents where _id starts with the customized prefix
  const escapedPrefix = prefix.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`^${escapedPrefix}`);

  const items = await Model.find({ _id: regex }, { _id: 1 }).lean();
  let maxNum = startCount - 1;

  for (const item of items) {
    const idStr = item._id;
    // Extract the part after prefix
    const suffix = idStr.substring(prefix.length);
    // Try to parse suffix as hex
    const num = parseInt(suffix, 16);
    if (!isNaN(num) && num > maxNum) {
      maxNum = num;
    }
  }

  const nextNum = maxNum + 1;
  const nextHex = nextNum.toString(16);
  return `${prefix}${nextHex}`;
}

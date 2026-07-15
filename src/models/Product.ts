import mongoose, { Schema, Document } from "mongoose";
import { Product as ProductType } from "@/types";

const SubVariantSchema = new Schema({
  id: { type: String, required: true },
  size: { type: String, required: true },
  weight: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  discount: { type: Number, required: true },
  stock: { type: Number, required: true },
  sku: { type: String, required: true },
  barcode: { type: String },
  isActive: { type: Boolean, default: true },
});

const ColorVariantSchema = new Schema({
  color: { type: String, required: true },
  dimensions: { type: String, required: true },
  images: [{ type: String }],
  subVariants: [SubVariantSchema],
});

const APlusBlockSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ["text", "image", "image-text", "features"], required: true },
  title: { type: String },
  content: { type: String },
  imageUrl: { type: String },
  features: [{ type: String }],
});

const ProductSchema = new Schema<ProductType & Document>(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    categoryId: { type: String, required: true },
    vendorId: { type: String },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    totalStock: { type: Number, default: 0 },
    colorVariants: [ColorVariantSchema],
    aPlusContent: [APlusBlockSchema],
    hsnCode: { type: String },
    gstRate: { type: Number },
    priceIncludesGst: { type: Boolean, default: true },
    moq: { type: Number, default: 1 },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: { type: String },
    fieldVisibility: {
      showDescription: { type: Boolean, default: true },
      showSizes: { type: Boolean, default: true },
      showWeights: { type: Boolean, default: true },
      showDimensions: { type: Boolean, default: true },
      showImages: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);

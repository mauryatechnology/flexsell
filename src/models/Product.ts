import mongoose, { Schema, Document } from "mongoose";
import { Product as ProductType } from "@/types";

const SubVariantSchema = new Schema({
  id: { type: String, required: true },
  size: { type: String, required: true },
  weight: { type: String, required: true },
  mrp: { type: Number, required: true },
  b2cPrice: { type: Number, required: true },
  b2bPrice: { type: Number, default: 0 },
  dropshippingPrice: { type: Number, default: 0 },
  b2bMoq: { type: Number, default: null },
  discount: { type: Number, default: 0 },
  stock: { type: Number, required: true },
  sku: { type: String, required: true },
  barcode: { type: String },
  isActive: { type: Boolean, default: true },
});

const ColorVariantSchema = new Schema({
  color: { type: String, required: true },
  dimensions: { type: String, required: true },
  images: [Schema.Types.Mixed],
  subVariants: [SubVariantSchema],
});

const APlusBlockSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ["text", "image", "image-text", "features"], required: true },
  title: { type: String },
  content: { type: String },
  imageUrl: { type: String },
  alt: { type: String },
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
    cardTags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    totalStock: { type: Number, default: 0 },
    colorVariants: [ColorVariantSchema],
    aPlusContent: [APlusBlockSchema],
    hsnCode: { type: String },
    gstRate: { type: Number },
    priceIncludesGst: { type: Boolean, default: true },
    defaultPriceTier: { type: String, enum: ["B2C", "B2B", "Dropshipping"], default: "B2C" },
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

ProductSchema.index({ slug: 1 });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ "colorVariants.subVariants.sku": 1 });

// Schema-cache buster for Next.js hot-reloading in development
if (mongoose.models.Product) {
  const colorVariantsSchema = mongoose.models.Product.schema.path("colorVariants");
  const imagesSchema = colorVariantsSchema?.schema?.path("images");
  const embeddedType = imagesSchema?.embeddedSchemaType?.instance;
  if (embeddedType && embeddedType !== "Mixed") {
    delete mongoose.models.Product;
  }
}

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);

export interface BaseDocument {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category extends BaseDocument {
  name: string;
  slug: string;
  image: string;
  description?: string;
  parentId?: string | null;
  isActive: boolean;
  order: number;
}

export interface ProductVariant {
  id: string;
  name: string;      // e.g., "Color", "Size", "Weight"
  value: string;     // e.g., "Red", "XL", "500g"
  priceOffset: number; // e.g., +50 or 0
  stock: number;
}

export interface APlusBlock {
  id: string;
  type: "text" | "image" | "image-text" | "features";
  title?: string;
  content?: string;
  imageUrl?: string;
  features?: string[];
}

export interface Product extends BaseDocument {
  title: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
  mrp: number;
  discount: number;
  sku: string;
  fsiNo: string;
  categoryId: string;
  vendorId?: string;
  stock: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  isActive: boolean;
  variants?: ProductVariant[];
  aPlusContent?: APlusBlock[];
}

export interface Banner extends BaseDocument {
  title: string;
  subtitle?: string;
  image: string;
  link: string;
  position: "hero" | "sidebar" | "collection" | "footer";
  isActive: boolean;
  order: number;
}

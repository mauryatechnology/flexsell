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

export interface ColorVariant {
  color: string;
  sizes: string[];
  weights: string[];
  dimensions: string;
  images: string[];
  price: number;
  mrp: number;
  discount: number;
  stock: number;
  sku: string;
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
  categoryId: string;
  vendorId?: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  isActive: boolean;
  totalStock: number;
  colorVariants: ColorVariant[];
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

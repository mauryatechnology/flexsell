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
  barcode?: string; // Short unique code (e.g. FX100A)
}

export interface HsnRecord extends BaseDocument {
  code: string;       // e.g. "3924"
  gstRate: number;    // e.g. 18
  description: string;
  isActive: boolean;
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
  
  // Dynamic B2B Indian Tax, MOQ, and SEO fields
  hsnCode?: string;
  gstRate?: number;
  priceIncludesGst?: boolean;
  moq?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  fieldVisibility?: {
    showDescription: boolean;
    showSizes: boolean;
    showWeights: boolean;
    showDimensions: boolean;
    showImages: boolean;
  };
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

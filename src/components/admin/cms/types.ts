export interface BannerSlide {
  imageUrl: string;
  mobileImageUrl?: string;
  redirectUrl: string;
  altText?: string;
}

export interface TrustStatItem {
  icon: string;
  count: string;
  label: string;
}

export interface BusinessCardItem {
  icon: string;
  title: string;
  desc: string;
  badge?: string;
}

export interface BusinessSectionData {
  heading: string;
  subheading: string;
  cards: BusinessCardItem[];
  ctaText: string;
  ctaLink: string;
}

export interface TestimonialItem {
  name: string;
  business: string;
  location: string;
  rating: number;
  text: string;
  contentType: "text" | "image" | "video";
  mediaUrl?: string;
  mediaUpload?: string;
  avatarUrl?: string;
  avatarUpload?: string;
  isActive?: boolean;
}

export interface BrandPartner {
  name: string;
  logoUrl: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

export interface DropshipPageContent {
  badge?: string;
  heroHeading?: string;
  heroSubheading?: string;
  ctaText?: string;
  formBadge?: string;
  formHeading?: string;
  formSubheading?: string;
  orderVolumeOptions?: string[];
}

export type CmsTabType =
  | "hero"
  | "announcements"
  | "trust"
  | "wholesale_biz"
  | "dropship_biz"
  | "testimonials_wholesale"
  | "testimonials_dropship"
  | "testimonials_client"
  | "partners"
  | "dropship_page"
  | "faqs"
  | "policies"
  | "footer";

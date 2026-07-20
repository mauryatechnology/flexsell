import * as React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AnnouncementBar } from "./AnnouncementBar";
import { categoryService } from "@/services/categoryService";
import dbConnect from "@/lib/dbConnect";
import CmsContent from "@/models/CmsContent";

interface StorefrontLayoutProps {
  children: React.ReactNode;
}

export async function StorefrontLayout({ children }: StorefrontLayoutProps) {
  await dbConnect();

  const allCategories = await categoryService.getCategories();
  const cmsAnnouncements = await CmsContent.findOne({ key: "announcements" });
  const cmsFooter = await CmsContent.findOne({ key: "footer" });

  const messages = cmsAnnouncements?.value || [
    "🎉 Mega B2B Monsoon Sale! Flat 12% OFF on Bulk orders above ₹20,000. Use Code: MEGAMONSOON"
  ];
  const footerData = cmsFooter?.value || undefined;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Announcement Bar Carousel */}
      <AnnouncementBar messages={messages} />

      <Header categories={allCategories} />

      <main className="flex-1">
        {children}
      </main>

      <Footer data={footerData} />
    </div>
  );
}

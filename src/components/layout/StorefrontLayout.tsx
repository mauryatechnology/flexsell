import * as React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AnnouncementBar } from "./AnnouncementBar";
import { pagesContent } from "@/config/pagesContent";
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

  // Use CMS announcements or fallback static text
  const messages = cmsAnnouncements?.value || [pagesContent.announcement.text];
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

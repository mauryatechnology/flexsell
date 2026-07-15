import * as React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { pagesContent } from "@/config/pagesContent";
import { categoryService } from "@/services/categoryService";

interface StorefrontLayoutProps {
  children: React.ReactNode;
}

export async function StorefrontLayout({ children }: StorefrontLayoutProps) {
  const allCategories = await categoryService.getCategories();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Announcement Bar */}
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm font-medium">
        <p>{pagesContent.announcement.text}</p>
      </div>
      
      <Header categories={allCategories} />
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}

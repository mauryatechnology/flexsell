import * as React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { categories } from "@/data/categories";
import { pagesContent } from "@/data/pagesContent";

interface StorefrontLayoutProps {
  children: React.ReactNode;
}

export function StorefrontLayout({ children }: StorefrontLayoutProps) {
  // In a real app, this would be an async fetch from DB/API
  const allCategories = categories;

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

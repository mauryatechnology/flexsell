"use client";

import * as React from "react";
import Link from "next/link";
import { Category } from "@/types";
import { ChevronDown } from "lucide-react";

interface MegaMenuProps {
  categories: Category[];
}

export function MegaMenu({ categories }: MegaMenuProps) {
  // Extract top-level categories and subcategories
  const topLevel = categories.filter(c => !c.parentId).sort((a, b) => a.order - b.order);

  return (
    <nav className="hidden md:flex border-t bg-secondary/30 relative z-40 group">
      <div className="mx-auto max-w-7xl px-4 md:px-6 h-12 flex items-center gap-6 text-sm font-medium w-full">
        
        {/* Categories Dropdown Trigger */}
        <div className="h-full flex items-center hover:text-primary cursor-pointer peer">
          <span className="flex items-center gap-1">All Categories <ChevronDown className="h-4 w-4" /></span>
        </div>

        {/* Mega Menu Dropdown */}
        <div className="absolute top-12 left-0 w-full bg-background border-b shadow-lg hidden peer-hover:block hover:block transition-all">
          <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 w-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
              {topLevel.map((cat) => {
                const subCats = categories.filter(c => c.parentId === cat._id).sort((a, b) => a.order - b.order);
                return (
                  <div key={cat._id} className="space-y-4">
                    <Link href={`/categories/${cat.slug}`} className="font-bold text-base hover:text-primary block">
                      {cat.name}
                    </Link>
                    {subCats.length > 0 && (
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {subCats.map((sub) => (
                          <li key={sub._id}>
                            <Link href={`/categories/${sub.slug}`} className="hover:text-primary block">
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Regular Nav Links */}
        <div className="flex items-center gap-6 ml-6 overflow-x-auto scrollbar-none">
          {topLevel.map(cat => (
             <Link key={cat._id} href={`/categories/${cat.slug}`} className="hover:text-primary whitespace-nowrap">
               {cat.name}
             </Link>
          ))}
          <Link href="/products" className="hover:text-primary whitespace-nowrap text-primary ml-auto font-bold">
            Explore All Products &rarr;
          </Link>
        </div>

      </div>
    </nav>
  );
}

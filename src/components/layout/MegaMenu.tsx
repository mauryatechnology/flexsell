"use client";

import * as React from "react";
import Link from "next/link";
import { Category } from "@/types";
import { ChevronDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MegaMenuProps {
  categories: Category[];
}

export function MegaMenu({ categories }: MegaMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const topLevel = categories.filter(c => !c.parentId).sort((a, b) => a.order - b.order);

  return (
    <nav className="hidden md:flex border-t bg-secondary/30 relative z-40">
      <div className="mx-auto max-w-8xl px-4 md:px-6 h-12 flex items-center gap-7 text-sm font-semibold w-full">

        {/* Categories Dropdown Trigger */}
        <div
          className="h-full flex items-center gap-1 hover:text-primary cursor-pointer transition-colors relative py-2"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <span className="flex items-center gap-1 font-bold text-foreground hover:text-primary text-sm">
            All Categories <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : ""}`} />
          </span>

          {/* Mega Menu Dropdown with Framer Motion */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
                className="absolute top-12 left-0 w-[920px] bg-background border border-border rounded-b-2xl shadow-xl p-6 text-foreground z-50"
              >
                <div className="grid grid-cols-4 gap-6">
                  {topLevel.map((cat) => {
                    const subCats = categories.filter(c => c.parentId === cat._id).sort((a, b) => a.order - b.order);
                    return (
                      <div key={cat._id} className="space-y-2.5">
                        <Link
                          href={`/categories/${cat.slug}`}
                          className="font-bold text-base text-foreground hover:text-primary block transition-colors border-b pb-1"
                        >
                          {cat.name}
                        </Link>
                        {subCats.length > 0 && (
                          <ul className="space-y-1.5 text-sm text-muted-foreground">
                            {subCats.map((sub) => (
                              <li key={sub._id}>
                                <Link
                                  href={`/categories/${sub.slug}`}
                                  className="hover:text-primary block py-0.5 transition-colors"
                                >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Horizontal Category Nav Links */}
        <div className="flex-1 min-w-0 flex items-center justify-between gap-6 ml-4">
          <div className="flex-1 min-w-0 flex items-center gap-6 overflow-x-auto scrollbar-none py-1 text-muted-foreground">
            {topLevel.map(cat => (
              <Link key={cat._id} href={`/categories/${cat.slug}`} className="hover:text-primary whitespace-nowrap transition-colors">
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Independent Channel Links */}
          <div className="flex items-center gap-4 shrink-0 border-l pl-4 border-border">
            <Link href="/products" className="hover:text-primary whitespace-nowrap font-bold text-foreground transition-colors">
              Wholesale Bulk Catalog
            </Link>
            <Link href="/dropshipping" className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-full whitespace-nowrap font-bold transition-colors flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Dropshipping Hub
            </Link>
          </div>
        </div>

      </div>
    </nav>
  );
}

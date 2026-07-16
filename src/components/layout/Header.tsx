"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, Heart, User, Menu } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Drawer } from "@/components/ui/Drawer";
import { MegaMenu } from "./MegaMenu";
import { Category } from "@/types";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";

interface HeaderProps {
  categories: Category[];
}

export function Header({ categories }: HeaderProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const cartItemsCount = useCartStore((state) => state.getCartItemsCount());
  const wishlistItemsCount = useWishlistStore((state) => state.items.length);

  const topLevel = categories.filter(c => !c.parentId);

  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="mx-auto max-w-8xl px-4 md:px-6 h-16 flex items-center justify-between gap-4 w-full">
        {/* Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-6 w-6 text-foreground" />
          </Button>
          <Link href="/" className="flex items-center">
            <Image src="/Flexsell%20Logo.png" alt="Flexsell Logo" width={150} height={40} className="h-8 md:h-10 w-auto object-contain" priority />
          </Link>
        </div>

        {/* Search Bar - Hidden on small screens */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
          <Input
            type="search"
            placeholder="Search for products, categories..."
            className="w-full pr-10 rounded-full text-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-8 w-8 rounded-full"
            onClick={handleSearchSubmit}
          >
            <Search className="h-4 w-4 text-foreground" />
          </Button>
        </div>

        {/* Utility Icons */}
        <div className="flex items-center gap-2">
          <Link href="/client/profile">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5 text-foreground" />
            </Button>
          </Link>
          <Link href="/wishlist">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5 text-foreground" />
              {isMounted && wishlistItemsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground font-bold">
                  {wishlistItemsCount}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5 text-foreground" />
              {isMounted && cartItemsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Category Nav - Desktop Only */}
      <MegaMenu categories={categories} />

      {/* Mobile Nav Drawer */}
      <Drawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} side="left">
        <div className="flex flex-col h-full space-y-6 pt-4">
          <Link href="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
            <Image src="/Flexsell%20Logo.png" alt="Flexsell Logo" width={120} height={32} className="h-8 w-auto object-contain" />
          </Link>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="w-full pl-9 text-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  setIsMobileMenuOpen(false);
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
            />
          </div>
          <nav className="flex flex-col space-y-4">
            <div className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">Categories</div>
            {topLevel.map(cat => (
              <Link key={cat._id} href={`/categories/${cat.slug}`} className="font-medium hover:text-primary pl-2 text-foreground" onClick={() => setIsMobileMenuOpen(false)}>
                {cat.name}
              </Link>
            ))}

            <div className="font-bold text-sm text-muted-foreground uppercase tracking-wider mt-4 mb-2">Quick Links</div>
            <Link href="/products" className="font-medium hover:text-primary pl-2 text-foreground" onClick={() => setIsMobileMenuOpen(false)}>All Products</Link>
            <Link href="/client/orders" className="font-medium hover:text-primary pl-2 text-foreground" onClick={() => setIsMobileMenuOpen(false)}>My Orders</Link>
            <Link href="/wishlist" className="font-medium hover:text-primary pl-2 text-foreground" onClick={() => setIsMobileMenuOpen(false)}>Wishlist</Link>
          </nav>
          <div className="mt-auto pt-6 border-t">
            <Link href="/client/profile" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full" variant="outline">My Account</Button>
            </Link>
          </div>
        </div>
      </Drawer>
    </header>
  );
}

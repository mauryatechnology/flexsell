import * as React from "react";
import Link from "next/link";
import { Package, Heart, MapPin, User, Star, Ticket, Bell, LogOut } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Avatar } from "@/components/ui/Avatar";

import { customerService } from "@/services/customerService";
import { categoryService } from "@/services/categoryService";

export default async function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const activeCustomer = await customerService.getActiveCustomer();
  const allCategories = await categoryService.getCategories();
  const sidebarLinks = [
    { name: "Dashboard", href: "/client", icon: User },
    { name: "My Orders", href: "/client/orders", icon: Package },
    { name: "Wishlist", href: "/client/wishlist", icon: Heart },
    { name: "Addresses", href: "/client/addresses", icon: MapPin },
    { name: "Profile", href: "/client/profile", icon: User },
    { name: "My Reviews", href: "/client/reviews", icon: Star },
    { name: "Coupons", href: "/client/coupons", icon: Ticket },
    { name: "Notifications", href: "/client/notifications", icon: Bell },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-secondary/20">
      <Header categories={allCategories} />
      
      <div className="flex-1 mx-auto max-w-7xl px-4 md:px-6 py-8 flex flex-col md:flex-row gap-8 w-full">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-card border rounded-lg overflow-hidden sticky top-24">
            <div className="p-6 bg-primary text-primary-foreground flex items-center gap-4">
              <Avatar initials={activeCustomer.initials} className="bg-primary-foreground text-primary border border-primary-foreground/20" />
              <div>
                <h2 className="text-xl font-bold">My Account</h2>
                <p className="text-sm opacity-90">Welcome, {activeCustomer.name}</p>
              </div>
            </div>
            <nav className="flex flex-col p-2">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-secondary hover:text-primary transition-colors text-foreground"
                  >
                    <Icon className="h-5 w-5" />
                    {link.name}
                  </Link>
                );
              })}
              <div className="my-2 border-t"></div>
              <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-destructive/10 text-destructive transition-colors w-full text-left">
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
}

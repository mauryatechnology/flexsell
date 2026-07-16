import * as React from "react";
import { Package, Heart, MapPin, User, Star, Ticket, Bell } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ClientSidebar } from "@/components/layout/ClientSidebar";

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

      <div className="flex-1 mx-auto max-w-8xl px-4 md:px-6 py-8 flex flex-col md:flex-row gap-8 w-full">
        {/* Responsive Sidebar Component */}
        <ClientSidebar activeCustomer={activeCustomer} links={sidebarLinks} />

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}

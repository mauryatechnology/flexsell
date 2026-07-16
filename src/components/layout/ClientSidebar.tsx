"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Heart, MapPin, User, Star, Ticket, Bell, LogOut, Menu } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Drawer } from "@/components/ui/Drawer";
import { Customer } from "@/types";

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

interface ClientSidebarProps {
  activeCustomer: Customer;
}

export function ClientSidebar({ activeCustomer }: ClientSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();

  // Auto-close mobile drawer when pathname changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const SidebarContent = () => (
    <div className="bg-card flex flex-col h-full">
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
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                isActive 
                  ? "bg-primary/10 text-primary font-bold" 
                  : "hover:bg-secondary hover:text-primary text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {link.name}
            </Link>
          );
        })}
        <div className="my-2 border-t"></div>
        <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-destructive/10 text-destructive transition-colors w-full text-left cursor-pointer">
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile sub-topbar */}
      <div className="md:hidden flex justify-between items-center bg-card border p-3 rounded-lg mb-4 w-full">
        <span className="font-bold text-sm text-foreground">Dashboard Menu</span>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-xs font-semibold hover:bg-primary/20 cursor-pointer"
        >
          <Menu className="h-4 w-4" /> Open Menu
        </button>
      </div>

      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="w-full md:w-64 flex-shrink-0 hidden md:block">
        <div className="bg-card border rounded-lg overflow-hidden sticky top-24">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Drawer (visible only when toggled) */}
      <Drawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} side="left" className="p-0 max-w-[280px] w-full">
        <SidebarContent />
      </Drawer>
    </>
  );
}

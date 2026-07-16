"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, ShoppingBag, FolderTree, Users, 
  Settings, Palette, Tags, CreditCard, Menu, Percent, FileText, LogOut
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { Avatar } from "@/components/ui/Avatar";
import { Drawer } from "@/components/ui/Drawer";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);

  const sidebarLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: ShoppingBag },
    { name: "Categories", href: "/admin/categories", icon: FolderTree },
    { name: "Orders", href: "/admin/orders", icon: CreditCard },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "HSN Management", href: "/admin/hsn", icon: Percent },
    { name: "Coupons", href: "/admin/coupons", icon: Tags },
    { name: "Website CMS", href: "/admin/cms", icon: FileText },
    { name: "Theme Editor", href: "/admin/theme", icon: Palette },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  // Auto-close mobile drawer when pathname changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Link href="/admin" className="flex flex-col gap-1 items-start">
          <Image src="/Flexsell%20Logo.png" alt="Flexsell Logo" width={150} height={40} className="h-8 md:h-10 w-auto object-contain" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest ml-1">Admin Panel</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col justify-between">
        <nav className="space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
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
        </nav>

        <div className="mt-auto pt-4 border-t">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md hover:bg-destructive/10 text-destructive transition-colors w-full text-left cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-secondary/10">
      {/* Desktop Sidebar (Hidden on mobile) */}
      <aside className="w-64 bg-card border-r hidden md:flex flex-col sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Navigation */}
      <Drawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} side="left" className="p-0 max-w-[280px] w-full">
        <SidebarContent />
      </Drawer>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Admin Topbar */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-6 sticky top-0 z-10">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-1.5 rounded-md hover:bg-secondary text-foreground cursor-pointer"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <Link href="/" target="_blank" className="text-sm font-medium text-primary hover:underline">
              View Storefront &rarr;
            </Link>
            <Avatar initials="A" size="sm" className="bg-primary text-primary-foreground" />
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

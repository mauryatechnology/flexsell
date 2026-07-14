import * as React from "react";
import Link from "next/link";
import { 
  LayoutDashboard, ShoppingBag, FolderTree, Users, 
  Settings, Palette, Tags, CreditCard, Menu, Percent 
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const sidebarLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: ShoppingBag },
    { name: "Categories", href: "/admin/categories", icon: FolderTree },
    { name: "Orders", href: "/admin/orders", icon: CreditCard },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "HSN Management", href: "/admin/hsn", icon: Percent },
    { name: "Coupons", href: "/admin/coupons", icon: Tags },
    { name: "Theme Editor", href: "/admin/theme", icon: Palette },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-secondary/10">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-card border-r hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b">
          <Link href="/admin" className="flex flex-col gap-1 items-start">
            <img src="/Flexsell%20Logo.png" alt="Flexsell Logo" className="h-8 md:h-10 w-auto object-contain" />
            <span className="text-xs text-muted-foreground uppercase tracking-widest ml-1">Admin Panel</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <nav className="space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md hover:bg-secondary hover:text-primary transition-colors text-foreground"
                >
                  <Icon className="h-5 w-5" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Admin Topbar */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-6 sticky top-0 z-10">
          <button className="md:hidden">
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

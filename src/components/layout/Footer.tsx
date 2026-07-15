import * as React from "react";
import Link from "next/link";
import { Globe, Mail, MessageCircle, Phone } from "lucide-react";
import { pagesContent } from "@/data/pagesContent";

import Image from "next/image";

export function Footer() {
  const footerData = pagesContent.footer;
  return (
    <footer className="bg-card border-t pt-16 pb-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="space-y-4">
          <Link href="/" className="flex items-center">
            <Image src="/Flexsell%20Logo.png" alt="Flexsell Logo" width={150} height={40} className="h-8 md:h-10 w-auto object-contain" />
          </Link>
          <p className="text-muted-foreground text-sm">
            {footerData.description}
          </p>
          <div className="flex gap-4 pt-2">
            <Link href="#" className="text-muted-foreground hover:text-primary"><Globe className="h-5 w-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-primary"><MessageCircle className="h-5 w-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-primary"><Mail className="h-5 w-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-primary"><Phone className="h-5 w-5" /></Link>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {footerData.quickLinks.map((link) => (
              <li key={link.label}><Link href={link.href} className="hover:text-primary">{link.label}</Link></li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4 text-foreground">Customer Service</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {footerData.customerCare.map((link) => (
              <li key={link.label}><Link href={link.href} className="hover:text-primary">{link.label}</Link></li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4 text-foreground">Contact Info</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>{footerData.officeAddress}</li>
            <li className="pt-2">Email: {footerData.contactEmail}</li>
            <li>Phone: {footerData.contactPhone}</li>
            <li className="pt-2 text-primary font-medium">Timing: {footerData.timings}</li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-4 border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} FlexSell Wholesale. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/policies/privacy" className="hover:text-primary">Privacy Policy</Link>
          <Link href="/policies/terms" className="hover:text-primary">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}

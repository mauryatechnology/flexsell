import * as React from "react";
import Link from "next/link";
import { Globe, Mail, MessageCircle, Phone } from "lucide-react";
import { pagesContent } from "@/config/pagesContent";
import Image from "next/image";

interface FooterProps {
  data?: {
    description: string;
    officeAddress: string;
    contactEmail: string;
    contactPhone: string;
    timings: string;
  };
}

export function Footer({ data }: FooterProps) {
  const fallback = pagesContent.footer;
  const description = data?.description || fallback.description;
  const officeAddress = data?.officeAddress || fallback.officeAddress;
  const contactEmail = data?.contactEmail || fallback.contactEmail;
  const contactPhone = data?.contactPhone || fallback.contactPhone;
  const timings = data?.timings || fallback.timings;

  return (
    <footer className="bg-card border-t pt-16 pb-8 text-foreground">
      <div className="mx-auto max-w-7xl px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 w-full">
        <div className="space-y-4">
          <Link href="/" className="flex items-center">
            <Image src="/Flexsell%20Logo.png" alt="Flexsell Logo" width={150} height={40} className="h-8 md:h-10 w-auto object-contain" />
          </Link>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
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
            {fallback.quickLinks.map((link) => (
              <li key={link.label}><Link href={link.href} className="hover:text-primary">{link.label}</Link></li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4 text-foreground">Customer Service</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {fallback.customerCare.map((link) => (
              <li key={link.label}><Link href={link.href} className="hover:text-primary">{link.label}</Link></li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4 text-foreground">Contact Info</h4>
          <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <li>{officeAddress}</li>
            <li className="pt-2">Email: {contactEmail}</li>
            <li>Phone: {contactPhone}</li>
            <li className="pt-2 text-primary font-semibold">Timing: {timings}</li>
          </ul>
        </div>
      </div>
      
      <div className="mx-auto max-w-7xl px-4 md:px-6 border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground w-full">
        <p>&copy; {new Date().getFullYear()} FlexSell Wholesale. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/policies/privacy" className="hover:text-primary">Privacy Policy</Link>
          <Link href="/policies/terms" className="hover:text-primary">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}

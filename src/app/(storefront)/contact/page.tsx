import * as React from "react";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, Phone, MapPin } from "lucide-react";
import { pagesContent } from "@/config/pagesContent";

export const metadata: Metadata = {
  title: "Contact Us - B2B Wholesaler Support & Inquiries",
  description: "Get in touch with FlexSell Wholesale's support team. For bulk inquiries, dropshipping onboarding, or franchise queries, submit a sourcing form."
};

export default function ContactPage() {
  const contactData = pagesContent.contact;
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">{contactData.title}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {contactData.subtitle}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="px-0">
            <CardTitle>Get in Touch</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-6">
            <div className="flex gap-4">
              <div className="bg-primary/10 p-3 rounded-full h-fit">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{contactData.addressTitle}</h3>
                <p className="text-muted-foreground mt-1">{contactData.addressText}</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-primary/10 p-3 rounded-full h-fit">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{contactData.phoneTitle}</h3>
                <p className="text-muted-foreground mt-1">{contactData.phoneText}</p>
                <p className="text-sm text-muted-foreground">{contactData.phoneTiming}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 p-3 rounded-full h-fit">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{contactData.emailTitle}</h3>
                <p className="text-muted-foreground mt-1">{contactData.emailText}</p>
                <p className="text-sm text-muted-foreground">{contactData.emailTiming}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{contactData.formHeading}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input placeholder="Doe" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input type="email" placeholder="john@company.com" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {contactData.subjectOptions.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <textarea 
                  className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                  placeholder="How can we help you?"
                />
              </div>

              <Button className="w-full" size="lg">Send Message</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

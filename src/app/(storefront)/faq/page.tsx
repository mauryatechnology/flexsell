import * as React from "react";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { pagesContent } from "@/data/pagesContent";

export const metadata: Metadata = {
  title: "B2B Sourcing FAQ & Help - Bulk Purchases",
  description: "Get answers to frequently asked questions about GST B2B tax invoices, minimum order values, transit cargo insurance, and ground transport rates."
};

export default function FAQPage() {
  const faqData = pagesContent.faq;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">{faqData.title}</h1>
        <p className="text-lg text-muted-foreground">{faqData.subtitle}</p>
      </div>

      <div className="space-y-4">
        {faqData.items.map((faq, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{faq.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{faq.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

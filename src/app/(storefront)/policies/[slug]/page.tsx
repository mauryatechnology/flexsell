import * as React from "react";
import { notFound } from "next/navigation";
import { pagesContent } from "@/config/pagesContent";

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const policyData = pagesContent.policies[slug as keyof typeof pagesContent.policies];

  if (!policyData) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{policyData.title}</h1>
        <p className="text-muted-foreground mt-2 text-sm">Last updated: {policyData.lastUpdated}</p>
      </div>
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        {policyData.sections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h2 className="text-xl font-bold mt-6">{section.heading}</h2>
            <p className="text-muted-foreground">{section.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

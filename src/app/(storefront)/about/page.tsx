import * as React from "react";
import type { Metadata } from "next";
import { pagesContent } from "@/data/pagesContent";

export const metadata: Metadata = {
  title: "About Us - B2B Wholesaler Sourcing Mission",
  description: "Discover FlexSell's factory-direct sourcing network, quality screening lines, and cargo distribution setup in Surat, Gujarat."
};

export default function AboutPage() {
  const aboutData = pagesContent.about;
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">{aboutData.title}</h1>
        <p className="text-lg text-muted-foreground">{aboutData.subtitle}</p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <div className="aspect-video w-full bg-secondary rounded-xl overflow-hidden mb-8">
           <img src={aboutData.warehouseImage} alt="FlexSell Wholesale B2B Sourcing" className="w-full h-full object-cover" />
        </div>

        <h2>{aboutData.missionTitle}</h2>
        <p>{aboutData.missionText}</p>

        <h2>{aboutData.whyChooseUsTitle}</h2>
        <div className="grid md:grid-cols-3 gap-6 my-8">
          {aboutData.whyChooseUsItems.map((item, idx) => (
            <div key={idx} className="p-6 bg-card border rounded-lg">
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <h2>{aboutData.storyTitle}</h2>
        <p>{aboutData.storyText}</p>
      </div>
    </div>
  );
}

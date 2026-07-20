"use client";

import * as React from "react";
import { CmsTabType } from "./types";

interface CmsTabsNavProps {
  activeTab: CmsTabType;
  onSelectTab: (tab: CmsTabType) => void;
}

export function CmsTabsNav({ activeTab, onSelectTab }: CmsTabsNavProps) {
  const tabsList: { id: CmsTabType; label: string }[] = [
    { id: "hero", label: "Hero Banners" },
    { id: "announcements", label: "Announcements" },
    { id: "trust", label: "Trust Stats" },
    { id: "wholesale_biz", label: "Wholesale Business" },
    { id: "dropship_biz", label: "Dropship Business" },
    { id: "testimonials_wholesale", label: "Wholesale Reviews" },
    { id: "testimonials_dropship", label: "Dropship Reviews" },
    { id: "testimonials_client", label: "Client Reviews" },
    { id: "partners", label: "Brand Partners" },
    { id: "dropship_page", label: "Dropshipping Page" },
    { id: "faqs", label: "FAQs Manager" },
    { id: "policies", label: "Policies Manager" },
    { id: "footer", label: "Footer Settings" }
  ];

  return (
    <div className="flex border-b gap-2 overflow-x-auto select-none">
      {tabsList.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelectTab(tab.id)}
          className={`px-4 py-2.5 border-b-2 font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
            activeTab === tab.id
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

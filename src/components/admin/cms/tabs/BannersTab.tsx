"use client";

import * as React from "react";
import { Eye, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BannerSlide } from "../types";

interface BannersTabProps {
  banners: BannerSlide[];
  onView: (banner: BannerSlide) => void;
  onEdit: (idx: number, banner: BannerSlide) => void;
  onDelete: (idx: number) => void;
}

export function BannersTab({ banners, onView, onEdit, onDelete }: BannersTabProps) {
  return (
    <div className="space-y-3">
      {banners.map((banner, idx) => (
        <div
          key={idx}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-xl bg-card hover:border-primary/30 transition-all gap-4 text-foreground"
        >
          <div className="flex items-center gap-4">
            <img src={banner.imageUrl} alt="Banner" className="w-24 h-12 object-cover rounded border bg-secondary" />
            <div>
              <p className="font-bold text-sm text-foreground">Redirect: {banner.redirectUrl}</p>
              <p className="text-xs text-muted-foreground">Alt: {banner.altText || "No alt text"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => onView(banner)} aria-label="View Banner">
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => onEdit(idx, banner)} aria-label="Edit Banner">
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => onDelete(idx)} aria-label="Delete Banner">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

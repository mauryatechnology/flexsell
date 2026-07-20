"use client";

import * as React from "react";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CmsTabType } from "../types";

interface CmsFormModalProps {
  isOpen: boolean;
  activeTab: CmsTabType;
  editingIndex: number | null;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onClose: () => void;
  onSave: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => void;
}

export function CmsFormModal({
  isOpen,
  activeTab,
  editingIndex,
  formData,
  setFormData,
  onClose,
  onSave,
  onFileUpload
}: CmsFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl animate-fade-in text-foreground">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-bold text-base">
            {editingIndex === null ? "Add New CMS Entry" : "Edit CMS Entry"} ({activeTab.toUpperCase()})
          </h3>
          <button type="button" onClick={onClose} className="p-1 hover:bg-secondary rounded">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Hero Banner Fields */}
          {activeTab === "hero" && (
            <>
              <div className="space-y-1">
                <label className="font-bold">Desktop Image URL / Upload *</label>
                <div className="flex gap-2">
                  <Input value={formData.imageUrl || ""} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="text-xs" />
                  <label className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 border rounded cursor-pointer font-bold flex items-center gap-1 shrink-0">
                    <Upload className="h-3.5 w-3.5" /> Upload
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => onFileUpload(e, "imageUrl")} />
                  </label>
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold">Mobile Image URL (Optional)</label>
                <div className="flex gap-2">
                  <Input value={formData.mobileImageUrl || ""} onChange={(e) => setFormData({ ...formData, mobileImageUrl: e.target.value })} className="text-xs" />
                  <label className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 border rounded cursor-pointer font-bold flex items-center gap-1 shrink-0">
                    <Upload className="h-3.5 w-3.5" /> Upload
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => onFileUpload(e, "mobileImageUrl")} />
                  </label>
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold">Same-Tab Redirect URL *</label>
                <Input value={formData.redirectUrl || "/products"} onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })} className="text-xs" />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Alt Text (SEO)</label>
                <Input value={formData.altText || ""} onChange={(e) => setFormData({ ...formData, altText: e.target.value })} className="text-xs" />
              </div>
            </>
          )}

          {/* Announcement Fields */}
          {activeTab === "announcements" && (
            <div className="space-y-1">
              <label className="font-bold">Announcement Text Notice *</label>
              <Input value={formData.text || ""} onChange={(e) => setFormData({ text: e.target.value })} className="text-xs" />
            </div>
          )}

          {/* Trust Stat Fields */}
          {activeTab === "trust" && (
            <>
              <div className="space-y-1">
                <label className="font-bold">Icon Key (package / truck / map-pin / users) *</label>
                <Input value={formData.icon || "package"} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="text-xs" />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Count Display (e.g. 5,000+) *</label>
                <Input value={formData.count || ""} onChange={(e) => setFormData({ ...formData, count: e.target.value })} className="text-xs" />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Label Text *</label>
                <Input value={formData.label || ""} onChange={(e) => setFormData({ ...formData, label: e.target.value })} className="text-xs" />
              </div>
            </>
          )}

          {/* Business Cards */}
          {(activeTab === "wholesale_biz" || activeTab === "dropship_biz") && (
            <>
              <div className="space-y-1">
                <label className="font-bold">Icon Name *</label>
                <Input value={formData.icon || "package"} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="text-xs" />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Card Title *</label>
                <Input value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="text-xs" />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Highlight Badge Text</label>
                <Input value={formData.badge || ""} onChange={(e) => setFormData({ ...formData, badge: e.target.value })} className="text-xs" />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Description *</label>
                <textarea rows={3} className="w-full p-2 text-xs border rounded bg-background" value={formData.desc || ""} onChange={(e) => setFormData({ ...formData, desc: e.target.value })} />
              </div>
            </>
          )}

          {/* Testimonials */}
          {activeTab.startsWith("testimonials") && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold">Reviewer Name *</label>
                  <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Business Name</label>
                  <Input value={formData.business || ""} onChange={(e) => setFormData({ ...formData, business: e.target.value })} className="text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold">Location</label>
                  <Input value={formData.location || ""} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Content Format</label>
                  <select
                    value={formData.contentType || "text"}
                    onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                    className="w-full h-9 rounded border border-input bg-background px-2 text-xs"
                  >
                    <option value="text">Text Only</option>
                    <option value="image">With Image</option>
                    <option value="video">With Video</option>
                  </select>
                </div>
              </div>

              {formData.contentType !== "text" && (
                <div className="space-y-1 border-t pt-2">
                  <label className="font-bold text-primary">Media File Upload / Embed URL</label>
                  <div className="flex gap-2">
                    <Input placeholder="URL..." value={formData.mediaUrl || ""} onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })} className="text-xs" />
                    <label className="px-3 py-1.5 bg-secondary border rounded cursor-pointer font-bold flex items-center gap-1 shrink-0">
                      <Upload className="h-3.5 w-3.5" /> Upload File
                      <input type="file" accept={formData.contentType === "image" ? "image/*" : "video/*"} className="hidden" onChange={(e) => onFileUpload(e, "mediaUrl")} />
                    </label>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold">Review Content *</label>
                <textarea rows={3} className="w-full p-2.5 text-xs border rounded bg-background" value={formData.text || ""} onChange={(e) => setFormData({ ...formData, text: e.target.value })} />
              </div>
            </>
          )}

          {/* Brand Partner */}
          {activeTab === "partners" && (
            <>
              <div className="space-y-1">
                <label className="font-bold">Partner / Brand Name *</label>
                <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="text-xs" />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Logo URL / Upload *</label>
                <div className="flex gap-2">
                  <Input value={formData.logoUrl || ""} onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })} className="text-xs" />
                  <label className="px-3 py-1.5 bg-secondary border rounded cursor-pointer font-bold flex items-center gap-1 shrink-0">
                    <Upload className="h-3.5 w-3.5" /> Upload
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => onFileUpload(e, "logoUrl")} />
                  </label>
                </div>
              </div>
            </>
          )}

          {/* FAQ Fields */}
          {activeTab === "faqs" && (
            <>
              <div className="space-y-1">
                <label className="font-bold">Question *</label>
                <Input value={formData.question || ""} onChange={(e) => setFormData({ ...formData, question: e.target.value })} className="text-xs" />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Category</label>
                <Input value={formData.category || "General"} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="text-xs" />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Answer *</label>
                <textarea rows={4} className="w-full p-2.5 text-xs border rounded bg-background" value={formData.answer || ""} onChange={(e) => setFormData({ ...formData, answer: e.target.value })} />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t pt-3">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={onSave} className="font-bold">Save Changes</Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Upload, Save, Sparkles, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToastStore } from "@/stores/toastStore";

interface HeroSlide {
  title: string;
  highlight: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
}

interface WhyChooseUsItem {
  title: string;
  desc: string;
  icon: string;
}

interface FooterConfig {
  description: string;
  officeAddress: string;
  contactEmail: string;
  contactPhone: string;
  timings: string;
}

export default function AdminCmsPage() {
  const { addToast } = useToastStore();
  const [activeTab, setActiveTab] = React.useState<"announcements" | "hero" | "why" | "footer">("announcements");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  // CMS state values
  const [announcements, setAnnouncements] = React.useState<string[]>([]);
  const [newAnnouncement, setNewAnnouncement] = React.useState("");

  const [heroSlides, setHeroSlides] = React.useState<HeroSlide[]>([]);
  const [whyChooseUs, setWhyChooseUs] = React.useState<WhyChooseUsItem[]>([]);
  const [footer, setFooter] = React.useState<FooterConfig>({
    description: "",
    officeAddress: "",
    contactEmail: "",
    contactPhone: "",
    timings: ""
  });

  // Fetch CMS settings
  React.useEffect(() => {
    fetchCmsData();
  }, []);

  const fetchCmsData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/cms");
      if (!res.ok) throw new Error("Failed to load CMS data");
      const data = await res.json();

      // Populate or set default values
      setAnnouncements(data.announcements || [
        "Mega B2B Monsoon Sale! Flat 12% OFF on Bulk orders above ₹20,000. Use Code: MEGAMONSOON",
        "Free Ground Cargo Sourcing Delivery for purchases exceeding ₹50,000"
      ]);
      setHeroSlides(data.hero_slides || [
        {
          title: "Wholesale Sourcing Made",
          highlight: "Simple",
          subtitle: "Direct from global manufacturers. Unbeatable B2B margins. Fast ground shipping cargo.",
          buttonText: "Explore Catalog",
          buttonLink: "/products",
          imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
        }
      ]);
      setWhyChooseUs(data.why_choose_us || [
        {
          title: "Direct Factory Prices",
          desc: "No middle-man wholesalers. We buy container-loads directly from manufacturers globally and distribute.",
          icon: "price"
        },
        {
          title: "Rigorous Quality Screening",
          desc: "We operate a dedicated sorting and packaging line to check electricals, plastic grades, and silicon seals.",
          icon: "quality"
        },
        {
          title: "Express Cargo Shipping",
          desc: "Partnership with safe transport networks like Delhivery, Gati, and V-Trans to carry heavy B2B shipments.",
          icon: "shipping"
        }
      ]);
      if (data.footer) {
        setFooter(data.footer);
      } else {
        setFooter({
          description: "FlexSell is India's leading wholesale B2B distributor. Directly importing trending kitchen gadgets, household tools, utility items, and home appliances to provide you the lowest manufacturing prices.",
          officeAddress: "Block D-104, B2B Textile Market, Near Ring Road, Surat, Gujarat - 395002",
          contactEmail: "support@flexsellwholesale.in",
          contactPhone: "+91 88877 66655",
          timings: "9:30 AM to 6:30 PM (Sunday Closed)"
        });
      }
    } catch (err: unknown) {
      addToast((err as any).message || "Failed to load Website CMS contents", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSection = async (key: string, value: any) => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value })
      });
      if (!res.ok) throw new Error("Failed to save section config");
      addToast(`CMS Section '${key}' updated successfully!`, "success");
    } catch (err: unknown) {
      addToast((err as any).message || "Failed to update CMS section", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Image upload helper to Vercel Blob
  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slideIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    addToast("Uploading slide image to Vercel Blob...", "info");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload image");
      const data = await res.json();

      setHeroSlides(prev => prev.map((s, idx) => 
        idx === slideIndex ? { ...s, imageUrl: data.url } : s
      ));
      addToast("Slide image updated successfully.", "success");
    } catch (err: unknown) {
      addToast((err as any).message || "Failed to upload image.", "error");
    } finally {
      e.target.value = "";
    }
  };

  // Announcements helpers
  const addAnnouncement = () => {
    if (!newAnnouncement.trim()) return;
    setAnnouncements([...announcements, newAnnouncement.trim()]);
    setNewAnnouncement("");
  };

  const deleteAnnouncement = (index: number) => {
    setAnnouncements(announcements.filter((_, idx) => idx !== index));
  };

  const moveAnnouncement = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === announcements.length - 1) return;
    const target = direction === "up" ? index - 1 : index + 1;
    const copy = [...announcements];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    setAnnouncements(copy);
  };

  // Hero Carousel helpers
  const addHeroSlide = () => {
    if (heroSlides.length >= 5) {
      addToast("Maximum of 5 hero banner slides allowed.", "warning");
      return;
    }
    const newSlide: HeroSlide = {
      title: "Enter Hero Title Prefix",
      highlight: "Highlight Word",
      subtitle: "Enter Subtitle details description",
      buttonText: "Explore Now",
      buttonLink: "/products",
      imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
    };
    setHeroSlides([...heroSlides, newSlide]);
  };

  const deleteHeroSlide = (index: number) => {
    setHeroSlides(heroSlides.filter((_, idx) => idx !== index));
  };

  const moveHeroSlide = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === heroSlides.length - 1) return;
    const target = direction === "up" ? index - 1 : index + 1;
    const copy = [...heroSlides];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    setHeroSlides(copy);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-sm text-muted-foreground">Loading CMS Configs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Website CMS Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage public home pages, announcement carousels, and footer banners.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("announcements")}
          className={`px-4 py-2 border-b-2 font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${activeTab === "announcements" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
        >
          Announcements Carousel
        </button>
        <button
          onClick={() => setActiveTab("hero")}
          className={`px-4 py-2 border-b-2 font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${activeTab === "hero" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
        >
          Hero Banners
        </button>
        <button
          onClick={() => setActiveTab("why")}
          className={`px-4 py-2 border-b-2 font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${activeTab === "why" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
        >
          "Why Choose Us" Grid
        </button>
        <button
          onClick={() => setActiveTab("footer")}
          className={`px-4 py-2 border-b-2 font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${activeTab === "footer" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
        >
          Footer Details
        </button>
      </div>

      {/* Announcements Panel */}
      {activeTab === "announcements" && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-lg">Top Announcement Bar (Rotating Carousel)</h3>
              <Button type="button" onClick={() => handleSaveSection("announcements", announcements)} disabled={isSaving}>
                <Save className="h-4 w-4 mr-1.5" /> Save Announcements
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a sale, coupon, or B2B promo announcement..."
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                />
                <Button type="button" onClick={addAnnouncement} variant="secondary" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Add Notice
                </Button>
              </div>

              {announcements.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                  <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm">No announcements configured. The bar will be hidden.</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden bg-background">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-secondary/20 border-b">
                        <th className="p-2.5 font-bold w-20 text-center">Sequence</th>
                        <th className="p-2.5 font-bold">Announcement Text Notice Message</th>
                        <th className="p-2.5 font-bold w-12 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {announcements.map((text, idx) => (
                        <tr key={idx} className="border-b last:border-0 hover:bg-secondary/5">
                          <td className="p-2.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                className="p-1 rounded bg-secondary/50 hover:bg-secondary disabled:opacity-30 transition-colors"
                                onClick={() => moveAnnouncement(idx, "up")}
                              >
                                <ArrowUp className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === announcements.length - 1}
                                className="p-1 rounded bg-secondary/50 hover:bg-secondary disabled:opacity-30 transition-colors"
                                onClick={() => moveAnnouncement(idx, "down")}
                              >
                                <ArrowDown className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                          <td className="p-2.5">
                            <Input
                              value={text}
                              className="text-xs h-8 px-2"
                              onChange={(e) => {
                                const copy = [...announcements];
                                copy[idx] = e.target.value;
                                setAnnouncements(copy);
                              }}
                            />
                          </td>
                          <td className="p-2.5 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              onClick={() => deleteAnnouncement(idx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hero Banners Panel */}
      {activeTab === "hero" && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-lg">Homepage Hero Slides Carousel</h3>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={addHeroSlide} className="text-xs">
                  <Plus className="h-4 w-4 mr-1" /> Add Carousel Slide
                </Button>
                <Button type="button" onClick={() => handleSaveSection("hero_slides", heroSlides)} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-1.5" /> Save Hero Slides
                </Button>
              </div>
            </div>

            {heroSlides.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                <Sparkles className="h-10 w-10 mx-auto text-primary mb-2 animate-pulse" />
                <p className="text-sm">No hero slides configured. Please add one banner slide to begin.</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden bg-background">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-secondary/20 border-b">
                      <th className="p-2.5 font-bold w-20 text-center">Sequence</th>
                      <th className="p-2.5 font-bold w-28 text-center">Preview</th>
                      <th className="p-2.5 font-bold">Carousel Slide Information Text Details</th>
                      <th className="p-2.5 font-bold">Image & Uploads</th>
                      <th className="p-2.5 font-bold w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heroSlides.map((slide, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover:bg-secondary/5">
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              className="p-1 rounded bg-secondary/50 hover:bg-secondary disabled:opacity-30 transition-colors"
                              onClick={() => moveHeroSlide(idx, "up")}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === heroSlides.length - 1}
                              className="p-1 rounded bg-secondary/50 hover:bg-secondary disabled:opacity-30 transition-colors"
                              onClick={() => moveHeroSlide(idx, "down")}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td className="p-2.5 text-center">
                          {slide.imageUrl ? (
                            <img
                              src={slide.imageUrl}
                              alt="Slide preview"
                              className="h-12 w-24 object-cover rounded border bg-secondary mx-auto"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://placehold.co/400x150/10b981/ffffff?text=Slide";
                              }}
                            />
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">No image</span>
                          )}
                        </td>
                        <td className="p-2.5">
                          <div className="space-y-1.5 max-w-[280px]">
                            <Input
                              placeholder="Title Prefix (e.g. Wholesale Sourcing Made)"
                              value={slide.title}
                              className="text-[10px] h-7 px-2"
                              onChange={(e) => {
                                const copy = [...heroSlides];
                                copy[idx].title = e.target.value;
                                setHeroSlides(copy);
                              }}
                            />
                            <Input
                              placeholder="Highlight Word (e.g. Simple)"
                              value={slide.highlight}
                              className="text-[10px] h-7 px-2"
                              onChange={(e) => {
                                const copy = [...heroSlides];
                                copy[idx].highlight = e.target.value;
                                setHeroSlides(copy);
                              }}
                            />
                            <Input
                              placeholder="Subtitle Description detail"
                              value={slide.subtitle}
                              className="text-[10px] h-7 px-2"
                              onChange={(e) => {
                                const copy = [...heroSlides];
                                copy[idx].subtitle = e.target.value;
                                setHeroSlides(copy);
                              }}
                            />
                            <div className="flex gap-1.5">
                              <Input
                                placeholder="CTA Text (Explore)"
                                value={slide.buttonText}
                                className="text-[10px] h-7 px-2 flex-1"
                                onChange={(e) => {
                                  const copy = [...heroSlides];
                                  copy[idx].buttonText = e.target.value;
                                  setHeroSlides(copy);
                                }}
                              />
                              <Input
                                placeholder="CTA Link (/products)"
                                value={slide.buttonLink}
                                className="text-[10px] h-7 px-2 flex-1"
                                onChange={(e) => {
                                  const copy = [...heroSlides];
                                  copy[idx].buttonLink = e.target.value;
                                  setHeroSlides(copy);
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-2.5">
                          <div className="flex flex-col gap-1.5">
                            <label className="flex items-center justify-center gap-1.5 px-2 py-1 bg-background hover:bg-secondary/50 border rounded cursor-pointer text-[10px] font-medium transition-colors w-max">
                              <Upload className="h-3 w-3 text-muted-foreground" />
                              <span>Upload Slide Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleSlideImageUpload(e, idx)}
                              />
                            </label>
                            <Input
                              placeholder="Or paste absolute image url..."
                              className="text-[10px] h-7 px-2"
                              value={slide.imageUrl}
                              onChange={(e) => {
                                const copy = [...heroSlides];
                                copy[idx].imageUrl = e.target.value;
                                setHeroSlides(copy);
                              }}
                            />
                          </div>
                        </td>
                        <td className="p-2.5 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => deleteHeroSlide(idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Why Choose Us Panel */}
      {activeTab === "why" && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-lg">"Why Choose Us" Grid Section</h3>
              <Button type="button" onClick={() => handleSaveSection("why_choose_us", whyChooseUs)} disabled={isSaving}>
                <Save className="h-4 w-4 mr-1.5" /> Save Changes
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {whyChooseUs.map((item, idx) => (
                <div key={idx} className="p-4 border rounded-lg bg-secondary/15 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-primary">Item #{idx + 1} ({item.icon})</h4>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Heading Title</label>
                      <Input
                        value={item.title}
                        onChange={(e) => {
                          const copy = [...whyChooseUs];
                          copy[idx].title = e.target.value;
                          setWhyChooseUs(copy);
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Description Summary</label>
                      <textarea
                        rows={3}
                        className="w-full p-2 text-xs border rounded bg-background text-foreground focus:ring-1 focus:ring-primary"
                        value={item.desc}
                        onChange={(e) => {
                          const copy = [...whyChooseUs];
                          copy[idx].desc = e.target.value;
                          setWhyChooseUs(copy);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Config Panel */}
      {activeTab === "footer" && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-lg">Website Footer & Corporate Info</h3>
              <Button type="button" onClick={() => handleSaveSection("footer", footer)} disabled={isSaving}>
                <Save className="h-4 w-4 mr-1.5" /> Save Footer Settings
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Corporate Description</label>
                <textarea
                  rows={4}
                  className="w-full p-3 text-xs border rounded bg-background text-foreground focus:ring-1 focus:ring-primary"
                  value={footer.description}
                  onChange={(e) => setFooter({ ...footer, description: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Office & Warehouse Address</label>
                <textarea
                  rows={4}
                  className="w-full p-3 text-xs border rounded bg-background text-foreground focus:ring-1 focus:ring-primary"
                  value={footer.officeAddress}
                  onChange={(e) => setFooter({ ...footer, officeAddress: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">B2B Support Email</label>
                <Input
                  value={footer.contactEmail}
                  className="text-xs"
                  onChange={(e) => setFooter({ ...footer, contactEmail: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">B2B Helpline Phone</label>
                <Input
                  value={footer.contactPhone}
                  className="text-xs"
                  onChange={(e) => setFooter({ ...footer, contactPhone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Support Availability Timings</label>
                <Input
                  value={footer.timings}
                  className="text-xs"
                  onChange={(e) => setFooter({ ...footer, timings: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

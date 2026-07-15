"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("./RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[220px] bg-secondary/10 border border-input rounded-md flex items-center justify-center text-muted-foreground text-sm">
      Loading editor...
    </div>
  ),
});

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ArrowLeft, Plus, Trash2, Eye, Code, Upload, Sparkles, Percent, Download
} from "lucide-react";
import { useProductStore } from "@/stores/productStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { useHsnStore } from "@/stores/hsnStore";
import { useToastStore } from "@/stores/toastStore";
import { Product, Category, ColorVariant, APlusBlock } from "@/types";
import { Barcode } from "@/components/ui/Barcode";
import { getBarcodeSvgString } from "@/lib/barcodeHelper";

interface AdminProductFormProps {
  productId?: string;
  initialProducts: Product[];
  initialCategories: Category[];
}

export function AdminProductForm({ productId, initialProducts, initialCategories }: AdminProductFormProps) {
  const router = useRouter();
  const { products, initializeProducts, addProduct, updateProduct } = useProductStore();
  const { categories, initializeCategories } = useCategoryStore();
  const { hsns, initializeHsns } = useHsnStore();
  const { addToast } = useToastStore();

  React.useEffect(() => {
    initializeProducts(initialProducts);
    initializeCategories(initialCategories);
    initializeHsns();
  }, [initialProducts, initialCategories, initializeProducts, initializeCategories, initializeHsns]);

  const activeProducts = products.length > 0 ? products : initialProducts;
  const activeCategories = categories.length > 0 ? categories : initialCategories;

  // Find product if editing
  const existingProduct = React.useMemo(() => {
    if (!productId) return null;
    return activeProducts.find(p => p._id === productId) || null;
  }, [productId, activeProducts]);

  // Core Form states
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [tagsText, setTagsText] = React.useState("");
  const [cardTagsText, setCardTagsText] = React.useState("");

  // B2B GST, HSN & MOQ States
  const [hsnCode, setHsnCode] = React.useState("3924");
  const [priceIncludesGst, setPriceIncludesGst] = React.useState(true);
  const [moq, setMoq] = React.useState(1);

  // SEO States
  const [seoTitle, setSeoTitle] = React.useState("");
  const [seoDescription, setSeoDescription] = React.useState("");
  const [seoKeywords, setSeoKeywords] = React.useState("");

  // Visibility toggles
  const [fieldVisibility, setFieldVisibility] = React.useState({
    showDescription: true,
    showSizes: true,
    showWeights: true,
    showDimensions: true,
    showImages: true,
  });

  // Color variants states
  const [variantsList, setVariantsList] = React.useState<ColorVariant[]>([
    {
      color: "Default",
      dimensions: "15x12x8 cm",
      images: [""],
      subVariants: [{
        id: "sv-default",
        size: "Standard",
        weight: "250g",
        price: 0,
        mrp: 0,
        discount: 0,
        stock: 100,
        sku: ""
      }]
    }
  ]);

  // Helper strings to bind comma-separated variant lists inside the editor
  const [variantSizes, setVariantSizes] = React.useState<Record<number, string>>({});
  const [variantWeights, setVariantWeights] = React.useState<Record<number, string>>({});
  const [variantImages, setVariantImages] = React.useState<Record<number, string>>({}); // keep to avoid breaking simple references if any, but unused
  const [newImageUrl, setNewImageUrl] = React.useState<Record<number, string>>({});

  // Editor states
  const [editorMode, setEditorMode] = React.useState<"edit" | "preview">("edit");

  // Dynamic A+ Content blocks
  const [aPlusBlocks, setAPlusBlocks] = React.useState<APlusBlock[]>([]);

  // Load existing details
  React.useEffect(() => {
    if (existingProduct) {
      setTitle(existingProduct.title);
      setDescription(existingProduct.description);
      setCategoryId(existingProduct.categoryId);
      setTagsText(existingProduct.tags.join(", "));
      setCardTagsText(existingProduct.cardTags?.join(", ") || "");
      setAPlusBlocks(existingProduct.aPlusContent || []);

      setHsnCode(existingProduct.hsnCode || "3924");
      setPriceIncludesGst(existingProduct.priceIncludesGst ?? true);
      setMoq(existingProduct.moq ?? 1);
      setSeoTitle(existingProduct.seoTitle || "");
      setSeoDescription(existingProduct.seoDescription || "");
      setSeoKeywords(existingProduct.seoKeywords || "");

      setFieldVisibility(existingProduct.fieldVisibility || {
        showDescription: true,
        showSizes: true,
        showWeights: true,
        showDimensions: true,
        showImages: true,
      });

      if (existingProduct.colorVariants && existingProduct.colorVariants.length > 0) {
        // Normalize variant images to [{ url, alt }] objects
        const normalizedVariants = existingProduct.colorVariants.map(v => ({
          ...v,
          images: (v.images || []).map((img, imgIdx) => {
            if (typeof img === "string") {
              return {
                url: img,
                alt: `${existingProduct.title} - ${v.color} - Image ${imgIdx + 1}`
              };
            }
            return {
              url: img.url || "",
              alt: img.alt || `${existingProduct.title} - ${v.color} - Image ${imgIdx + 1}`
            };
          })
        }));
        setVariantsList(normalizedVariants);

        // Populate inputs
        const initialSizes: Record<number, string> = {};
        const initialWeights: Record<number, string> = {};

        normalizedVariants.forEach((v, idx) => {
          const uniqueSizes = Array.from(new Set((v.subVariants || []).map(sv => sv.size))).filter(Boolean);
          const uniqueWeights = Array.from(new Set((v.subVariants || []).map(sv => sv.weight))).filter(Boolean);
          initialSizes[idx] = uniqueSizes.join(", ");
          initialWeights[idx] = uniqueWeights.join(", ");
        });

        setVariantSizes(initialSizes);
        setVariantWeights(initialWeights);
      }
    } else {
      if (activeCategories.length > 0) {
        setCategoryId(activeCategories[0]._id);
      }
    }
  }, [existingProduct, activeCategories]);

  // Add / Remove variant controls
  const addVariant = () => {
    setVariantsList(prev => [
      ...prev,
      {
        color: `New Color ${prev.length + 1}`,
        dimensions: "15x12x8 cm",
        images: [""],
        subVariants: [{
          id: `sv-${Date.now()}`,
          size: "Standard",
          weight: "250g",
          price: 0,
          mrp: 0,
          discount: 0,
          stock: 50,
          sku: ""
        }]
      }
    ]);
  };

  const generateSubVariants = (idx: number, sizesStr: string, weightsStr: string) => {
    const sizes = sizesStr.split(",").map(s => s.trim()).filter(Boolean);
    const weights = weightsStr.split(",").map(w => w.trim()).filter(Boolean);
    if (sizes.length === 0) sizes.push("Standard");
    if (weights.length === 0) weights.push("250g");

    setVariantsList(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const newSubVariants: any[] = [];
      let counter = 1;
      sizes.forEach(size => {
        weights.forEach(weight => {
          const existing = item.subVariants.find(sv => sv.size === size && sv.weight === weight);
          if (existing) {
            newSubVariants.push(existing);
          } else {
            newSubVariants.push({
              id: `sv-${Date.now()}-${counter}`,
              size,
              weight,
              price: item.subVariants[0]?.price || 0,
              mrp: item.subVariants[0]?.mrp || 0,
              discount: item.subVariants[0]?.discount || 0,
              stock: 50,
              sku: `${item.subVariants[0]?.sku || 'SKU'}-${counter}`
            });
          }
          counter++;
        });
      });
      return { ...item, subVariants: newSubVariants };
    }));
  };

  const updateSubVariantField = (colorIdx: number, subId: string, field: string, value: any) => {
    setVariantsList(prev => prev.map((item, idx) => {
      if (idx !== colorIdx) return item;
      const newSubs = item.subVariants.map(sv => {
        if (sv.id !== subId) return sv;
        const updated = { ...sv, [field]: value };
        if (field === "price" || field === "mrp") {
          const p = field === "price" ? Number(value) : sv.price;
          const m = field === "mrp" ? Number(value) : sv.mrp;
          updated.discount = m > 0 ? Math.round(((m - p) / m) * 100) : 0;
        }
        return updated;
      });
      return { ...item, subVariants: newSubs };
    }));
  };

  const removeSubVariant = (colorIdx: number, subId: string) => {
    setVariantsList(prev => prev.map((item, idx) => {
      if (idx !== colorIdx) return item;
      return {
        ...item,
        subVariants: item.subVariants.filter(sv => sv.id !== subId)
      };
    }));
  };

  const removeVariant = (index: number) => {
    if (variantsList.length <= 1) return;
    setVariantsList(prev => prev.filter((_, i) => i !== index));

    // Adjust comma helper caches
    setVariantSizes(prev => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
    setVariantWeights(prev => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
    setVariantImages(prev => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
    setNewImageUrl(prev => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
  };

  // Update variant field
  const updateVariantField = (index: number, field: keyof ColorVariant, value: any) => {
    setVariantsList(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      return { ...item, [field]: value };
    }));
  };

  // Aspect ratio validator for variant images (strictly 1:1)
  const validateImageAspectRatio = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight;
        if (Math.abs(ratio - 1) <= 0.01) {
          resolve(true);
        } else {
          resolve(false);
        }
      };
      img.onerror = () => {
        resolve(false);
      };
      img.src = src;
    });
  };

  // Local Base64 File Uploader for variant images with 1:1 check and alt tag generation
  const handleVariantImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, variantIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const currentImages = variantsList[variantIndex].images || [];
    if (currentImages.length >= 9) {
      addToast("You can only add a maximum of 9 images per color variant.", "error");
      e.target.value = "";
      return;
    }

    // Check aspect ratio first using a temporary object URL to avoid uploading invalid files
    const objectUrl = URL.createObjectURL(file);
    const isValid = await validateImageAspectRatio(objectUrl);
    URL.revokeObjectURL(objectUrl);

    if (!isValid) {
      addToast("Variant images must have an exact 1:1 (square) aspect ratio.", "error");
      e.target.value = "";
      return;
    }

    addToast("Uploading variant image to Vercel Blob...", "info");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to upload to Vercel Blob");
      }

      const { url } = await res.json();

      const currentImages = variantsList[variantIndex].images || [];
      const newImgIndex = currentImages.length + 1;
      const colorName = variantsList[variantIndex].color || "Variant";
      const defaultAlt = `${title || "Product"} - ${colorName} - Image ${newImgIndex}`;
      
      const updatedImages = [...currentImages, { url, alt: defaultAlt }];
      updateVariantField(variantIndex, "images", updatedImages);
      addToast("Variant image uploaded and validated successfully.", "success");
    } catch (err: any) {
      console.error(err);
      addToast(err.message || "Failed to upload image to Vercel Blob.", "error");
    } finally {
      e.target.value = ""; // Reset file input
    }
  };

  // Add Variant image via URL with 1:1 check and alt tag generation
  const handleAddImageUrl = async (variantIndex: number) => {
    const url = newImageUrl[variantIndex]?.trim();
    if (!url) {
      addToast("Please enter a valid image URL.", "error");
      return;
    }

    const currentImages = variantsList[variantIndex].images || [];
    if (currentImages.length >= 9) {
      addToast("You can only add a maximum of 9 images per color variant.", "error");
      return;
    }

    const isValid = await validateImageAspectRatio(url);
    if (!isValid) {
      addToast("Variant images must have an exact 1:1 (square) aspect ratio.", "error");
      return;
    }

    const newImgIndex = currentImages.length + 1;
    const colorName = variantsList[variantIndex].color || "Variant";
    const defaultAlt = `${title || "Product"} - ${colorName} - Image ${newImgIndex}`;

    const updatedImages = [...currentImages, { url, alt: defaultAlt }];
    updateVariantField(variantIndex, "images", updatedImages);
    setNewImageUrl(prev => ({ ...prev, [variantIndex]: "" }));
    addToast("Image URL added and validated successfully.", "success");
  };

  // A+ blocks builder helpers
  const addAPlusBlock = () => {
    if (aPlusBlocks.length >= 7) {
      addToast("You can only add a maximum of 7 A+ content blocks.", "error");
      return;
    }
    const newBlock: APlusBlock = {
      id: `ap_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      type: "image",
      content: "970x600",
      imageUrl: "",
      alt: ""
    };
    setAPlusBlocks([...aPlusBlocks, newBlock]);
  };

  const moveAPlusBlock = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === aPlusBlocks.length - 1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...aPlusBlocks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setAPlusBlocks(updated);
  };

  const removeAPlusBlock = (id: string) => {
    setAPlusBlocks(aPlusBlocks.filter(b => b.id !== id));
  };

  const handleBlockImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, blockId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    addToast("Uploading banner image to Vercel Blob...", "info");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to upload to Vercel Blob");
      }

      const { url } = await res.json();

      setAPlusBlocks(prev => prev.map((b, idx) =>
        b.id === blockId ? { 
          ...b, 
          imageUrl: url, 
          type: "image",
          alt: b.alt || `${title || "Product"} A+ Banner ${idx + 1}`
        } : b
      ));
      addToast("Banner image uploaded successfully.", "success");
    } catch (err: any) {
      console.error(err);
      addToast(err.message || "Failed to upload image to Vercel Blob.", "error");
    } finally {
      e.target.value = ""; // Reset file input
    }
  };

  // Auto-Generate SEO Meta Tags
  const handleGenerateSeo = () => {
    if (!title) {
      addToast("Please provide a product title first.", "error");
      return;
    }
    const catName = activeCategories.find(c => c._id === categoryId)?.name || "Wholesale Cargo";
    setSeoTitle(`${title} | Buy Bulk Online at Wholesale Price`);
    setSeoDescription(`Purchase ${title} in bulk direct from manufacturers. Premium B2B cargo supply. MOQ: ${moq} units. Department: ${catName}. GST claimable tax invoice supplied.`);
    setSeoKeywords(`${title.toLowerCase()}, wholesale ${title.toLowerCase()}, B2B bulk buy, ${catName.toLowerCase()} supply`);
    addToast("SEO metadata tags successfully auto-generated!", "success");
  };

  // Save product details
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      addToast("Product Title is required.", "error");
      return;
    }

    const matchedHsn = hsns.find(h => h.code === hsnCode);
    const gstRateVal = matchedHsn ? matchedHsn.gstRate : 18;

    const finalVariants = variantsList.map((item) => {
      const validImages = (item.images || []).filter((img: any) => img.url && img.url.trim() !== "");
      return {
        ...item,
        images: validImages.length > 0 ? validImages : [{ url: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=600&q=80", alt: `${title || 'Product'} Default Image` }]
      };
    });

    const invalidSku = finalVariants.some(v => v.subVariants.some((sv: any) => !sv.sku));
    if (invalidSku) {
      addToast("Each variant combination must have a unique SKU code.", "error");
      return;
    }

    const totalStock = finalVariants.reduce((sum, v) => sum + v.subVariants.filter((sv: any) => sv.isActive !== false).reduce((s: number, sv: any) => s + sv.stock, 0), 0);
    const tags = tagsText.split(",").map(t => t.trim()).filter(Boolean);
    const cardTags = cardTagsText.split(",").map(t => t.trim()).filter(Boolean);

    const productData: Omit<Product, "_id" | "createdAt"> = {
      title,
      slug: existingProduct ? existingProduct.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4),
      description,
      categoryId,
      rating: existingProduct ? existingProduct.rating : 4.5,
      reviewCount: existingProduct ? existingProduct.reviewCount : 12,
      tags,
      cardTags,
      isActive: existingProduct ? existingProduct.isActive : true,
      totalStock,
      colorVariants: finalVariants,
      aPlusContent: aPlusBlocks.filter(b => b.imageUrl && b.imageUrl.trim() !== ""),

      hsnCode,
      gstRate: gstRateVal,
      priceIncludesGst,
      moq: Number(moq),
      seoTitle,
      seoDescription,
      seoKeywords,
      fieldVisibility
    };

    if (existingProduct) {
      updateProduct(existingProduct._id, productData);
      addToast("Product details updated successfully.", "success");
    } else {
      addProduct(productData);
      addToast("New product published successfully.", "success");
    }

    router.push("/admin/products");
  };

  return (
    <div className="space-y-6 max-w-4xl pb-16 text-foreground">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {existingProduct ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {existingProduct ? `Modify B2B catalogue parameters for ${existingProduct.title}` : "Publish new wholesale inventory item"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Card 1: Basic Info */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <h3 className="font-bold text-lg border-b pb-2">Basic Info</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Title / Name</label>
                <Input
                  placeholder="e.g. Mitti Handi / Clay Cookware"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground"
                >
                  {activeCategories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search & SEO Tags (comma separated)</label>
                <Input
                  placeholder="e.g., clay pots, water cooler, kettle"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Used exclusively for search query matching and SEO metadata keywords index.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Product Card Badges / Tags (comma separated)</label>
                <Input
                  placeholder="e.g., bestseller, new, trending, kitchen"
                  value={cardTagsText}
                  onChange={(e) => setCardTagsText(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Pills/badges shown on website cards (e.g. bestseller, new, trending).
                </p>
              </div>
            </div>

            {/* Rich Text Editor for Description */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Description</label>
                <div className="flex bg-secondary/50 rounded-md p-0.5 border">
                  <button
                    type="button"
                    onClick={() => setEditorMode("edit")}
                    className={`px-3 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1 ${editorMode === "edit" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                  >
                    <Code className="h-3 w-3" /> Edit HTML
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode("preview")}
                    className={`px-3 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1 ${editorMode === "preview" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                  >
                    <Eye className="h-3 w-3" /> Preview
                  </button>
                </div>
              </div>

              {editorMode === "edit" ? (
                <RichTextEditor value={description} onChange={setDescription} />
              ) : (
                <div
                  className="border rounded-md p-4 min-h-[210px] bg-secondary/10 prose prose-sm max-w-none text-foreground overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: description || "<p className='text-muted-foreground italic'>Description preview is empty.</p>" }}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: B2B Taxation, HSN & MOQ Settings */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <h3 className="font-bold text-lg border-b pb-2">B2B Compliance & Taxation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* HSN Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Percent className="h-4 w-4 text-muted-foreground" /> HSN Code
                </label>
                <select
                  value={hsnCode}
                  onChange={(e) => setHsnCode(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground font-semibold"
                >
                  {hsns.map((h) => (
                    <option key={h._id} value={h.code}>
                      HSN {h.code} ({h.gstRate}% GST)
                    </option>
                  ))}
                </select>
              </div>

              {/* GST Inclusive/Exclusive Toggle Button */}
              <div className="space-y-2">
                <label className="text-sm font-medium block">GST Surcharge Setting</label>
                <button
                  type="button"
                  onClick={() => setPriceIncludesGst(!priceIncludesGst)}
                  className={`w-full h-10 px-4 rounded-md border text-sm font-bold transition-all ${priceIncludesGst
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400"
                    }`}
                >
                  {priceIncludesGst ? "Prices INCLUDE GST" : "Prices EXCLUDE GST"}
                </button>
              </div>

              {/* MOQ Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Order Qty (MOQ)</label>
                <Input
                  type="number"
                  min={1}
                  value={moq}
                  onChange={(e) => setMoq(Math.max(1, Number(e.target.value)))}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Storefront Field Visibility Toggles */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">Storefront Field Visibility</h3>
            <p className="text-xs text-muted-foreground">
              Select which fields should be visible to buyers on the public Product Detail Page (PDP).
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2">
              {Object.entries(fieldVisibility).map(([key, isChecked]) => {
                const label = key.replace("show", "").replace(/^\w/, (c) => c.toUpperCase());
                return (
                  <label key={key} className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded text-primary focus:ring-primary bg-background border-border"
                      checked={isChecked}
                      onChange={(e) =>
                        setFieldVisibility((prev) => ({
                          ...prev,
                          [key]: e.target.checked,
                        }))
                      }
                    />
                    <span>Show {label}</span>
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Dynamic Variants */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-extrabold text-xl text-foreground">Dynamic Color Variants</h3>
            <Button type="button" size="sm" onClick={addVariant} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" /> Add Color Variant
            </Button>
          </div>

          <div className="space-y-6">
            {variantsList.map((item, idx) => {
              const derivedSizes = Array.from(new Set((item.subVariants || []).map(sv => sv.size))).filter(Boolean).join(", ");
              const derivedWeights = Array.from(new Set((item.subVariants || []).map(sv => sv.weight))).filter(Boolean).join(", ");
              const currentSizes = variantSizes[idx] !== undefined ? variantSizes[idx] : derivedSizes;
              const currentWeights = variantWeights[idx] !== undefined ? variantWeights[idx] : derivedWeights;
              const currentImages = variantImages[idx] !== undefined ? variantImages[idx] : item.images.join(", ");

              return (
                <Card key={idx} className="border border-border relative bg-card text-foreground group shadow-sm hover:shadow">
                  {variantsList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="absolute top-4 right-4 text-destructive hover:bg-destructive/10 p-1.5 rounded-full transition-colors"
                      title="Delete Variant"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}

                  <CardContent className="p-6 space-y-6">
                    <h4 className="font-bold text-sm text-primary uppercase tracking-wider">Color Line #{idx + 1}</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Color Name</label>
                        <Input
                          placeholder="e.g. Slate Gray"
                          value={item.color}
                          onChange={(e) => updateVariantField(idx, "color", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Cargo Dimensions</label>
                        <Input
                          placeholder="e.g. 15x12x8 cm"
                          value={item.dimensions}
                          onChange={(e) => updateVariantField(idx, "dimensions", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b pb-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Sizes (comma separated)</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g. Standard 1.2L, Pro 2.0L"
                            value={currentSizes}
                            onChange={(e) => setVariantSizes(prev => ({ ...prev, [idx]: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Weights (comma separated)</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g. 250g, 500g"
                            value={currentWeights}
                            onChange={(e) => setVariantWeights(prev => ({ ...prev, [idx]: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="col-span-1 sm:col-span-2">
                        <Button type="button" variant="secondary" size="sm" onClick={() => generateSubVariants(idx, currentSizes, currentWeights)}>
                          Generate Combinations Matrix
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <h5 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Combinations Matrix (Stock & Pricing)</h5>
                      <div className="border rounded-md overflow-hidden overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-secondary/50 text-xs uppercase">
                            <tr>
                              <th className="px-4 py-3">Size / Weight</th>
                              <th className="px-4 py-3">SKU</th>
                              <th className="px-4 py-3">Price (₹)</th>
                              <th className="px-4 py-3">MRP (₹)</th>
                              <th className="px-4 py-3">Stock</th>
                              <th className="px-4 py-3 text-center">Status</th>
                              <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.subVariants.map(sv => (
                              <tr key={sv.id} className="border-b bg-background">
                                <td className="px-4 py-2 font-medium">
                                  {sv.size} - {sv.weight}
                                </td>
                                <td className="px-4 py-2">
                                  <Input className="h-8 text-xs" value={sv.sku} onChange={e => updateSubVariantField(idx, sv.id, "sku", e.target.value)} required />
                                </td>
                                <td className="px-4 py-2">
                                  <Input type="number" className="h-8 text-xs w-24" value={sv.price ?? ""} onChange={e => updateSubVariantField(idx, sv.id, "price", e.target.value === "" ? 0 : Number(e.target.value))} required />
                                </td>
                                <td className="px-4 py-2">
                                  <Input type="number" className="h-8 text-xs w-24" value={sv.mrp ?? ""} onChange={e => updateSubVariantField(idx, sv.id, "mrp", e.target.value === "" ? 0 : Number(e.target.value))} required />
                                </td>
                                <td className="px-4 py-2">
                                  <Input type="number" className="h-8 text-xs w-24" value={sv.stock ?? ""} onChange={e => updateSubVariantField(idx, sv.id, "stock", e.target.value === "" ? 0 : Number(e.target.value))} required />
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={sv.isActive ?? true}
                                    onChange={e => updateSubVariantField(idx, sv.id, "isActive", e.target.checked)}
                                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                                  />
                                  <span className="text-xs ml-1.5 font-medium">{sv.isActive !== false ? "Active" : "Inactive"}</span>
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => removeSubVariant(idx, sv.id)}
                                    disabled={item.subVariants.length <= 1}
                                    title="Remove this combination"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <label className="text-xs font-semibold uppercase text-muted-foreground block">Variant Images (1:1 Ratio Only)</label>
                      
                      {item.images && item.images.length > 0 && item.images[0] !== "" ? (
                        <div className="border rounded-lg overflow-hidden bg-background">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-secondary/20 border-b">
                                <th className="p-2 font-bold w-16 text-center">Preview</th>
                                <th className="p-2 font-bold">Image URL / Data String</th>
                                <th className="p-2 font-bold">Alt Tag (Editable)</th>
                                <th className="p-2 font-bold w-12 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.images.map((img: any, imgIdx: number) => {
                                const imgUrl = typeof img === "string" ? img : img.url || "";
                                const imgAlt = typeof img === "string" ? `${title || 'Product'} - ${item.color || 'Variant'} - Image ${imgIdx + 1}` : img.alt || "";
                                return (
                                  <tr key={imgIdx} className="border-b last:border-0 hover:bg-secondary/5">
                                    <td className="p-2 text-center">
                                      <img
                                        src={imgUrl}
                                        alt={imgAlt}
                                        className="h-10 w-10 object-cover rounded border bg-secondary mx-auto"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=600&q=80";
                                        }}
                                      />
                                    </td>
                                    <td className="p-2 font-mono truncate max-w-[220px]" title={imgUrl}>
                                      {imgUrl}
                                    </td>
                                    <td className="p-2">
                                      <Input
                                        className="h-8 text-xs w-full"
                                        value={imgAlt}
                                        onChange={(e) => {
                                          const updated = [...item.images];
                                          if (typeof updated[imgIdx] === "string") {
                                            updated[imgIdx] = { url: updated[imgIdx], alt: e.target.value };
                                          } else {
                                            updated[imgIdx] = { ...updated[imgIdx], alt: e.target.value };
                                          }
                                          updateVariantField(idx, "images", updated);
                                        }}
                                      />
                                    </td>
                                    <td className="p-2 text-center">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => {
                                          const updated = item.images.filter((_: any, i: number) => i !== imgIdx);
                                          updateVariantField(idx, "images", updated);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No images added yet. Add an image or upload one below.</p>
                      )}

                      {/* Add Image Control Panel */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <Input
                          placeholder="Paste 1:1 image url..."
                          className="text-xs flex-1 h-9"
                          value={newImageUrl[idx] || ""}
                          onChange={(e) => setNewImageUrl(prev => ({ ...prev, [idx]: e.target.value }))}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-9 px-3 text-xs"
                          onClick={() => handleAddImageUrl(idx)}
                        >
                          Add URL
                        </Button>
                        <label className="flex items-center justify-center gap-2 px-3 py-0 h-9 bg-background hover:bg-secondary/50 border border-input rounded-md cursor-pointer text-xs font-medium transition-colors">
                          <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Upload 1:1 Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleVariantImageUpload(e, idx)}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Barcode Preview & Action Panel */}
                    <div className="space-y-3 pt-4 border-t mt-4">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground font-semibold">Variant Barcodes</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {(item.subVariants || []).map((sv) => {
                          const barVal = sv.barcode || sv.sku || "FX0000";
                          return (
                            <div key={sv.id} className="p-2 border rounded bg-secondary/15 flex flex-col items-center gap-1">
                              <span className="text-[10px] font-bold text-center">{sv.size} - {sv.weight}</span>
                              <Barcode sku={barVal} height={18} />
                              <span className="text-[9px] font-mono text-muted-foreground">{sv.sku || "NO SKU"}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-[10px] flex items-center gap-1"
                                onClick={() => {
                                  const printWindow = window.open("", "_blank");
                                  if (!printWindow) {
                                    addToast("Popup blocker prevented printing.", "error");
                                    return;
                                  }
                                  printWindow.document.write(`
                                    <html>
                                      <head>
                                        <title>Barcode Print - ${sv.sku || "Variant"}</title>
                                        <style>
                                          body { display: flex; justify-content: center; align-items: center; height: 90vh; font-family: sans-serif; background: #fff; }
                                          .card { text-align: center; width: 180px; }
                                          @media print { button { display: none; } }
                                        </style>
                                      </head>
                                      <body>
                                        <div style="text-align:center;">
                                          <button onclick="window.print()" style="padding: 6px 12px; margin-bottom: 15px; cursor: pointer; background: #10b981; color: white; border: none; border-radius: 4px; font-weight: bold;">
                                            Print Barcode
                                          </button>
                                          <div class="card">
                                            <div style="display:flex; justify-content:center; margin-bottom:4px;">
                                              ${getBarcodeSvgString(barVal, 0.8, 24)}
                                            </div>
                                            <div style="font-size:10px; font-weight:bold; font-family:monospace; text-transform:uppercase;">${sv.sku}</div>
                                          </div>
                                        </div>
                                      </body>
                                    </html>
                                  `);
                                  printWindow.document.close();
                                }}
                              >
                                <Download className="h-3 w-3" /> Print Label
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Card 5: SEO Metadata Builder */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-lg">Search Engine Optimization (SEO)</h3>
              <Button type="button" size="sm" variant="outline" onClick={handleGenerateSeo} className="flex items-center gap-1.5 text-xs">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Generate SEO Tags
              </Button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Meta Tag Title</label>
                <Input
                  placeholder="Seo friendly browser title tag..."
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Meta Tag Description</label>
                <textarea
                  rows={2}
                  placeholder="Seo description for search index snippets..."
                  className="w-full p-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Meta Keywords (comma separated)</label>
                <Input
                  placeholder="Keywords matching search queries..."
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 6: A+ Content Marketing Section */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-lg">A+ Marketing Content (Manufacturer Banners Only)</h3>
              <Button type="button" size="sm" onClick={addAPlusBlock}>
                <Plus className="h-4 w-4 mr-1" /> Add Image Banner
              </Button>
            </div>

            {aPlusBlocks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No manufacturer A+ marketing banners configured.</p>
            ) : (
              <div className="border rounded-lg overflow-hidden bg-background">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-secondary/20 border-b">
                      <th className="p-2.5 font-bold w-20 text-center">Sequence</th>
                      <th className="p-2.5 font-bold w-28 text-center">Preview</th>
                      <th className="p-2.5 font-bold w-48">Aspect Sizing Format</th>
                      <th className="p-2.5 font-bold">Image Upload or Url</th>
                      <th className="p-2.5 font-bold">Alt Tag (Editable)</th>
                      <th className="p-2.5 font-bold w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aPlusBlocks.map((block, idx) => (
                      <tr key={block.id} className="border-b last:border-0 hover:bg-secondary/5">
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              className="p-1 rounded bg-secondary/50 hover:bg-secondary disabled:opacity-30 disabled:hover:bg-secondary/50 transition-colors cursor-pointer"
                              onClick={() => moveAPlusBlock(idx, "up")}
                              title="Move Banner Up"
                            >
                              <ArrowLeft className="h-3 w-3 rotate-90" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === aPlusBlocks.length - 1}
                              className="p-1 rounded bg-secondary/50 hover:bg-secondary disabled:opacity-30 disabled:hover:bg-secondary/50 transition-colors cursor-pointer"
                              onClick={() => moveAPlusBlock(idx, "down")}
                              title="Move Banner Down"
                            >
                              <ArrowLeft className="h-3 w-3 -rotate-90" />
                            </button>
                          </div>
                        </td>
                        <td className="p-2.5 text-center">
                          {block.imageUrl ? (
                            <img
                              src={block.imageUrl}
                              alt={block.alt || "Banner preview"}
                              className="h-10 w-24 object-cover rounded border bg-secondary mx-auto"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=600&q=80";
                              }}
                            />
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">No image</span>
                          )}
                        </td>
                        <td className="p-2.5">
                          <select
                            className="w-full h-8 px-2 rounded border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            value={block.content}
                            onChange={(e) => setAPlusBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: e.target.value } : b))}
                          >
                            <option value="970x300">970x300 Standard</option>
                            <option value="970x600">970x600 Double-Height</option>
                          </select>
                        </td>
                        <td className="p-2.5">
                          <div className="flex flex-col gap-1.5">
                            <label className="flex items-center justify-center gap-1.5 px-2 py-1 bg-background hover:bg-secondary/50 border rounded cursor-pointer text-[10px] font-medium transition-colors w-max">
                              <Upload className="h-3 w-3 text-muted-foreground" />
                              <span>Upload File</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleBlockImageUpload(e, block.id)}
                              />
                            </label>
                            <Input
                              placeholder="Or paste absolute image url..."
                              className="text-[10px] h-7 px-2"
                              value={block.imageUrl || ""}
                              onChange={(e) => setAPlusBlocks(prev => prev.map((b, bIdx) => {
                                if (b.id === block.id) {
                                  return {
                                    ...b,
                                    imageUrl: e.target.value,
                                    alt: b.alt || `${title || "Product"} A+ Banner ${bIdx + 1}`
                                  };
                                }
                                return b;
                              }))}
                            />
                          </div>
                        </td>
                        <td className="p-2.5">
                          <Input
                            placeholder="Alt description for image..."
                            className="text-[10px] h-8 px-2 w-full"
                            value={block.alt || ""}
                            onChange={(e) => setAPlusBlocks(prev => prev.map(b => b.id === block.id ? { ...b, alt: e.target.value } : b))}
                          />
                        </td>
                        <td className="p-2.5 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeAPlusBlock(block.id)}
                            title="Delete Block"
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

        {/* Fixed Save Bar at the bottom of the screen (no spaces) */}
        <div className="fixed bottom-0 left-0 md:left-64 right-0 z-30  py-4 px-6 flex justify-end gap-3 ">
          <Link href="/admin/products">
            <Button type="button" variant="outline" size="lg" className="h-10 text-sm font-semibold cursor-pointer">Cancel</Button>
          </Link>
          <Button type="submit" size="lg" className="h-10 text-sm font-bold cursor-pointer">
            {existingProduct ? "Save Product Details" : "Publish Product"}
          </Button>
        </div>

        {/* Spacer to prevent the fixed bar from covering the last card content */}
        <div className="h-24" />
      </form>
    </div>
  );
}

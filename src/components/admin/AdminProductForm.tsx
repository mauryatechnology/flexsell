"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ArrowLeft, Plus, Trash2, Bold, Italic, Underline,
  Heading3, List, ListOrdered, Eye, Code, Upload, Sparkles, Percent, Download
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

  // B2B GST, HSN & MOQ States
  const [hsnCode, setHsnCode] = React.useState("3924");
  const [priceIncludesGst, setPriceIncludesGst] = React.useState(true);
  const [moq, setMoq] = React.useState(5);

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
      sizes: ["Standard"],
      weights: ["250g"],
      dimensions: "15x12x8 cm",
      images: [""],
      price: 0,
      mrp: 0,
      discount: 0,
      stock: 100,
      sku: ""
    }
  ]);

  // Helper strings to bind comma-separated variant lists inside the editor
  const [variantSizes, setVariantSizes] = React.useState<Record<number, string>>({});
  const [variantWeights, setVariantWeights] = React.useState<Record<number, string>>({});
  const [variantImages, setVariantImages] = React.useState<Record<number, string>>({});

  // Editor states
  const [editorMode, setEditorMode] = React.useState<"edit" | "preview">("edit");
  const descriptionRef = React.useRef<HTMLTextAreaElement>(null);

  // Dynamic A+ Content blocks
  const [aPlusBlocks, setAPlusBlocks] = React.useState<APlusBlock[]>([]);

  // Load existing details
  React.useEffect(() => {
    if (existingProduct) {
      setTitle(existingProduct.title);
      setDescription(existingProduct.description);
      setCategoryId(existingProduct.categoryId);
      setTagsText(existingProduct.tags.join(", "));
      setAPlusBlocks(existingProduct.aPlusContent || []);

      setHsnCode(existingProduct.hsnCode || "3924");
      setPriceIncludesGst(existingProduct.priceIncludesGst ?? true);
      setMoq(existingProduct.moq ?? 5);
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
        setVariantsList(existingProduct.colorVariants);
        
        // Populate inputs
        const initialSizes: Record<number, string> = {};
        const initialWeights: Record<number, string> = {};
        const initialImages: Record<number, string> = {};
        
        existingProduct.colorVariants.forEach((v, idx) => {
          initialSizes[idx] = v.sizes.join(", ");
          initialWeights[idx] = v.weights.join(", ");
          initialImages[idx] = v.images.join(", ");
        });
        
        setVariantSizes(initialSizes);
        setVariantWeights(initialWeights);
        setVariantImages(initialImages);
      }
    } else {
      if (activeCategories.length > 0) {
        setCategoryId(activeCategories[0]._id);
      }
    }
  }, [existingProduct, activeCategories]);

  // Insert Rich Text Formatting helper
  const insertFormatting = (before: string, after: string = "") => {
    const textarea = descriptionRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = before + (selected || "text") + after;

    setDescription(
      text.substring(0, start) + replacement + text.substring(end)
    );

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selected || "text").length);
    }, 0);
  };

  // Add / Remove variant controls
  const addVariant = () => {
    setVariantsList(prev => [
      ...prev,
      {
        color: `New Color ${prev.length + 1}`,
        sizes: ["Standard"],
        weights: ["250g"],
        dimensions: "15x12x8 cm",
        images: [""],
        price: 0,
        mrp: 0,
        discount: 0,
        stock: 50,
        sku: ""
      }
    ]);
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
  };

  // Update variant field
  const updateVariantField = (index: number, field: keyof ColorVariant, value: any) => {
    setVariantsList(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      
      const updated = { ...item, [field]: value };
      
      // Calculate discount automatically on price/mrp edits
      if (field === "price" || field === "mrp") {
        const p = field === "price" ? Number(value) : item.price;
        const m = field === "mrp" ? Number(value) : item.mrp;
        updated.discount = m > 0 ? Math.round(((m - p) / m) * 100) : 0;
      }
      
      return updated;
    }));
  };

  // Local Base64 File Uploader for variant images
  const handleVariantImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const base64 = event.target.result as string;
        const currentImagesString = variantImages[index] || "";
        const updatedImagesString = currentImagesString 
          ? `${currentImagesString}, ${base64}` 
          : base64;
          
        setVariantImages(prev => ({ ...prev, [index]: updatedImagesString }));
        updateVariantField(index, "images", updatedImagesString.split(",").map(url => url.trim()).filter(Boolean));
      }
    };
    reader.readAsDataURL(file);
  };

  // A+ blocks builder helpers
  const addAPlusBlock = () => {
    const newBlock: APlusBlock = {
      id: `ap_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      type: "image",
      content: "970x600",
      imageUrl: ""
    };
    setAPlusBlocks([...aPlusBlocks, newBlock]);
  };

  const removeAPlusBlock = (id: string) => {
    setAPlusBlocks(aPlusBlocks.filter(b => b.id !== id));
  };

  const handleBlockImageUpload = (e: React.ChangeEvent<HTMLInputElement>, blockId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (result) {
        setAPlusBlocks(prev => prev.map(b => 
          b.id === blockId ? { ...b, imageUrl: result as string, type: "image" } : b
        ));
      }
    };
    reader.readAsDataURL(file);
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

    // Parse comma text fields into variant arrays
    const finalVariants = variantsList.map((item, idx) => {
      const sizes = variantSizes[idx] 
        ? variantSizes[idx].split(",").map(s => s.trim()).filter(Boolean) 
        : item.sizes;
      const weights = variantWeights[idx] 
        ? variantWeights[idx].split(",").map(w => w.trim()).filter(Boolean) 
        : item.weights;
      const images = variantImages[idx] 
        ? variantImages[idx].split(",").map(img => img.trim()).filter(Boolean) 
        : item.images;

      // Assign a unique 6-character short barcode if not already set (e.g. FX100A)
      const barcode = item.barcode || "FX" + Math.random().toString(36).substring(2, 6).toUpperCase();

      return {
        ...item,
        sizes: sizes.length > 0 ? sizes : ["Standard"],
        weights: weights.length > 0 ? weights : ["250g"],
        images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=600&q=80"],
        price: Number(item.price),
        mrp: Number(item.mrp),
        stock: Number(item.stock),
        barcode
      };
    });

    // Check SKU constraints
    const invalidSku = finalVariants.some(v => !v.sku);
    if (invalidSku) {
      addToast("Each variant color must have a unique SKU code.", "error");
      return;
    }

    const totalStock = finalVariants.reduce((sum, v) => sum + v.stock, 0);
    const tags = tagsText.split(",").map(t => t.trim()).filter(Boolean);

    const productData: Omit<Product, "_id" | "createdAt"> = {
      title,
      slug: existingProduct ? existingProduct.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4),
      description,
      categoryId,
      rating: existingProduct ? existingProduct.rating : 4.5,
      reviewCount: existingProduct ? existingProduct.reviewCount : 12,
      tags,
      isActive: existingProduct ? existingProduct.isActive : true,
      totalStock,
      colorVariants: finalVariants,
      aPlusContent: aPlusBlocks,
      
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

      <form onSubmit={handleSave} className="space-y-8">
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags (comma separated)</label>
              <Input
                placeholder="e.g., kitchen, bestseller, kadai"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
              />
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
                <div className="border rounded-md overflow-hidden bg-background">
                  {/* Rich Text Toolbar */}
                  <div className="flex items-center gap-1 p-2 bg-secondary/30 border-b flex-wrap">
                    <button
                      type="button"
                      title="Bold"
                      onClick={() => insertFormatting("<strong>", "</strong>")}
                      className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                    >
                      <Bold className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Italic"
                      onClick={() => insertFormatting("<em>", "</em>")}
                      className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                    >
                      <Italic className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Underline"
                      onClick={() => insertFormatting("<u>", "</u>")}
                      className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                    >
                      <Underline className="h-4 w-4" />
                    </button>
                    <span className="w-px h-5 bg-border mx-1" />
                    <button
                      type="button"
                      title="Heading"
                      onClick={() => insertFormatting("<h3>", "</h3>")}
                      className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                    >
                      <Heading3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Bullet List"
                      onClick={() => insertFormatting("<ul>\n  <li>", "</li>\n</ul>")}
                      className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Numbered List"
                      onClick={() => insertFormatting("<ol>\n  <li>", "</li>\n</ol>")}
                      className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    ref={descriptionRef}
                    className="w-full min-h-[160px] p-3 text-sm focus:outline-none bg-background text-foreground"
                    placeholder="Describe the product features using HTML tags..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
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
                  className={`w-full h-10 px-4 rounded-md border text-sm font-bold transition-all ${
                    priceIncludesGst
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
              const currentSizes = variantSizes[idx] !== undefined ? variantSizes[idx] : item.sizes.join(", ");
              const currentWeights = variantWeights[idx] !== undefined ? variantWeights[idx] : item.weights.join(", ");
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
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Variant SKU Code</label>
                        <Input
                          placeholder="e.g. FS-HK-CHOP12-001-SG"
                          value={item.sku}
                          onChange={(e) => updateVariantField(idx, "sku", e.target.value)}
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Wholesale Unit Price (₹)</label>
                        <Input
                          type="number"
                          value={item.price || ""}
                          onChange={(e) => updateVariantField(idx, "price", Number(e.target.value))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Retail MRP (₹)</label>
                        <Input
                          type="number"
                          value={item.mrp || ""}
                          onChange={(e) => updateVariantField(idx, "mrp", Number(e.target.value))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Variant Stock</label>
                        <Input
                          type="number"
                          value={item.stock || ""}
                          onChange={(e) => updateVariantField(idx, "stock", Number(e.target.value))}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Sizes (comma separated)</label>
                        <Input
                          placeholder="e.g. Standard 1.2L, Pro 2.0L"
                          value={currentSizes}
                          onChange={(e) => {
                            setVariantSizes(prev => ({ ...prev, [idx]: e.target.value }));
                            updateVariantField(idx, "sizes", e.target.value.split(",").map(s => s.trim()).filter(Boolean));
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Weights (comma separated)</label>
                        <Input
                          placeholder="e.g. 250g, 500g"
                          value={currentWeights}
                          onChange={(e) => {
                            setVariantWeights(prev => ({ ...prev, [idx]: e.target.value }));
                            updateVariantField(idx, "weights", e.target.value.split(",").map(w => w.trim()).filter(Boolean));
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Variant Image URLs (comma separated)</label>
                        <Input
                          placeholder="e.g. https://images.com/img1.jpg, https://images.com/img2.jpg"
                          value={currentImages}
                          onChange={(e) => {
                            setVariantImages(prev => ({ ...prev, [idx]: e.target.value }));
                            updateVariantField(idx, "images", e.target.value.split(",").map(img => img.trim()).filter(Boolean));
                          }}
                        />
                      </div>

                      {/* Image Upload Zone */}
                      <div className="flex flex-wrap items-center gap-4">
                        <label className="flex items-center gap-2 px-3 py-1.5 bg-background hover:bg-secondary/50 border rounded-md cursor-pointer text-xs font-medium transition-colors">
                          <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Upload Local Variant Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleVariantImageUpload(e, idx)}
                          />
                        </label>

                        {/* Image Thumbnails */}
                        {item.images && item.images.length > 0 && item.images[0] !== "" && (
                          <div className="flex gap-2">
                            {item.images.map((imgUrl, uIdx) => (
                              <img
                                key={uIdx}
                                src={imgUrl}
                                alt="Variant thumbnail"
                                className="h-10 w-10 object-cover rounded border bg-secondary flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=600&q=80";
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Barcode Preview & Action Panel */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t mt-4 w-full justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Variant Barcode Preview</span>
                        <Barcode sku={item.barcode || item.sku || "FX0000"} height={30} />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1.5 text-xs"
                        onClick={() => {
                          const barVal = item.barcode || item.sku || "FX0000";
                          const printWindow = window.open("", "_blank");
                          if (!printWindow) {
                            addToast("Popup blocker prevented printing.", "error");
                            return;
                          }
                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>Barcode Print - ${item.sku || "Variant"}</title>
                                <style>
                                  body { display: flex; justify-content: center; align-items: center; height: 90vh; font-family: sans-serif; }
                                  .card { text-align: center; width: 220px; }
                                  @media print { button { display: none; } }
                                </style>
                              </head>
                              <body>
                                <div style="text-align:center;">
                                  <button onclick="window.print()" style="padding: 6px 12px; margin-bottom: 15px; cursor: pointer; background: #10b981; color: white; border: none; border-radius: 4px; font-weight: bold;">
                                    Print Barcode
                                  </button>
                                  <div class="card">
                                    <div style="display:flex; justify-content:center; margin-bottom:6px;">
                                      ${getBarcodeSvgString(barVal)}
                                    </div>
                                    <div style="font-size:10px; font-weight:bold; font-family:monospace;">SKU: ${item.sku}</div>
                                  </div>
                                </div>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                        }}
                      >
                        <Download className="h-3.5 w-3.5" /> Download Barcode
                      </Button>
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
              <div className="space-y-4">
                {aPlusBlocks.map((block) => (
                  <div key={block.id} className="p-4 border rounded-lg bg-secondary/20 relative space-y-3">
                    <button
                      type="button"
                      onClick={() => removeAPlusBlock(block.id)}
                      className="absolute top-3 right-3 text-destructive hover:bg-destructive/10 p-1 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold block">Aspect Sizing Format</label>
                        <select
                          className="w-full h-10 px-3 rounded-md border bg-background text-sm text-foreground"
                          value={block.content}
                          onChange={(e) => setAPlusBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: e.target.value } : b))}
                        >
                          <option value="970x300">970x300 Standard Landscape Banner</option>
                          <option value="970x600">970x600 Double-Height Landscape Banner</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold block">Image Upload or Url</label>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 px-3 py-1.5 bg-background hover:bg-secondary/50 border rounded-md cursor-pointer text-xs font-medium transition-colors">
                            <Upload className="h-3.5 w-3.5 text-muted-foreground" />
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
                            className="text-xs"
                            value={block.imageUrl || ""}
                            onChange={(e) => setAPlusBlocks(prev => prev.map(b => b.id === block.id ? { ...b, imageUrl: e.target.value } : b))}
                          />
                        </div>
                      </div>
                    </div>

                    {block.imageUrl && (
                      <div className="border rounded bg-background p-1 w-max mx-auto">
                        <img
                          src={block.imageUrl}
                          alt="Banner preview"
                          className="h-16 object-contain"
                          style={{ aspectRatio: block.content === "970x600" ? "970/600" : "970/300" }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6">
          <Link href="/admin/products">
            <Button type="button" variant="outline" size="lg">Cancel</Button>
          </Link>
          <Button type="submit" size="lg">
            {existingProduct ? "Save Product Details" : "Publish Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}

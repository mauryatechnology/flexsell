"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ArrowLeft, Plus, Trash2, Bold, Italic, Underline,
  Heading3, List, ListOrdered, Eye, Code, Upload
} from "lucide-react";
import { useProductStore } from "@/stores/productStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { Product, Category, ColorVariant, APlusBlock } from "@/types";
import { Barcode } from "@/components/ui/Barcode";

interface AdminProductFormProps {
  productId?: string;
  initialProducts: Product[];
  initialCategories: Category[];
}

export function AdminProductForm({ productId, initialProducts, initialCategories }: AdminProductFormProps) {
  const router = useRouter();
  const { products, initializeProducts, addProduct, updateProduct } = useProductStore();
  const { categories, initializeCategories } = useCategoryStore();

  React.useEffect(() => {
    initializeProducts(initialProducts);
    initializeCategories(initialCategories);
  }, [initialProducts, initialCategories, initializeProducts, initializeCategories]);

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
    const defaultSkuSuffix = `VAR-${variantsList.length + 1}`;
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
      id: `ap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

  // Save product details
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      alert("Product Title is required.");
      return;
    }

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

      return {
        ...item,
        sizes: sizes.length > 0 ? sizes : ["Standard"],
        weights: weights.length > 0 ? weights : ["250g"],
        images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=600&q=80"],
        price: Number(item.price),
        mrp: Number(item.mrp),
        stock: Number(item.stock)
      };
    });

    // Check SKU constraints
    const invalidSku = finalVariants.some(v => !v.sku);
    if (invalidSku) {
      alert("Each variant color must have a unique SKU code.");
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
      isActive: true,
      totalStock,
      colorVariants: finalVariants,
      aPlusContent: aPlusBlocks
    };

    if (existingProduct) {
      updateProduct(existingProduct._id, productData);
    } else {
      addProduct(productData);
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
            {existingProduct ? `Modify catalog properties for ${existingProduct.title}` : "Add cargo lines direct from factory"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Basic Info */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <h3 className="font-bold text-lg border-b pb-2">Basic Info</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Title / Name</label>
                <Input
                  placeholder="e.g., 12-in-1 Vegetable Chopper"
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
                placeholder="e.g., kitchen, bestseller, new"
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
                    placeholder="Describe the product features using the HTML rich editor toolbar..."
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

        {/* Section 2: Dynamic Variants */}
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
              const imagePreviewList = currentImages.split(",").map(url => url.trim()).filter(Boolean);

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
                          placeholder="e.g. Forest Green"
                          value={item.color}
                          onChange={(e) => updateVariantField(idx, "color", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Variant SKU Code</label>
                        <Input
                          placeholder="e.g. FS-HK-CHOP12-001-FG"
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
                        <label className="text-xs font-semibold uppercase text-muted-foreground">B2B Wholesale Price (₹)</label>
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
                      </div>

                      {/* Thumbnail Previews */}
                      {imagePreviewList.length > 0 && (
                        <div className="flex gap-2 flex-wrap pt-2">
                          {imagePreviewList.map((url, imgIdx) => (
                            <div key={imgIdx} className="w-14 h-14 rounded border bg-secondary overflow-hidden flex-shrink-0 relative">
                              <img src={url} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Dynamic Barcode preview per color variant SKU */}
                      {item.sku && (
                        <div className="flex flex-col items-center gap-2 p-2 bg-secondary/15 rounded-lg border w-max mx-auto sm:mx-0">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">Barcode (SKU)</p>
                          <Barcode sku={item.sku} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Section 5: A+ Content Blocks */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-lg"> A+ Content Blocks</h3>
              <Button type="button" size="sm" variant="outline" onClick={addAPlusBlock}>
                <Plus className="h-4 w-4 mr-1" /> Add Block
              </Button>
            </div>

            {aPlusBlocks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center italic">No A+ content blocks added. Add blocks to display premium manufacturer graphics on the PDP.</p>
            ) : (
              <div className="space-y-6">
                {aPlusBlocks.map((block, idx) => (
                  <div key={block.id} className="p-4 border rounded-xl bg-secondary/5 space-y-4 relative text-foreground">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">A+ Image Banner #{idx + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => removeAPlusBlock(block.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold">Banner Aspect Dimension</label>
                        <select
                          value={block.content || "970x600"}
                          onChange={(e) => {
                            setAPlusBlocks(prev => prev.map(b =>
                              b.id === block.id ? { ...b, content: e.target.value, type: "image" } : b
                            ));
                          }}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none"
                        >
                          <option value="970x600">Flexsell Standard (970 x 600 px)</option>
                          <option value="970x300">Flexsell Banner (970 x 300 px)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold">Banner Image URL</label>
                        <Input
                          placeholder="https://example.com/a-plus-graphic.jpg"
                          value={block.imageUrl || ""}
                          onChange={(e) => {
                            setAPlusBlocks(prev => prev.map(b =>
                              b.id === block.id ? { ...b, imageUrl: e.target.value, type: "image" } : b
                            ));
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-6 bg-background/50 p-3 rounded-lg border">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold block">Local File Upload</label>
                        <label className="flex items-center gap-2 w-max px-3 py-1.5 bg-background hover:bg-secondary/50 border rounded-md cursor-pointer text-xs font-medium transition-colors">
                          <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Choose Banner File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleBlockImageUpload(e, block.id)}
                          />
                        </label>
                      </div>

                      {block.imageUrl && (
                        <div
                          className="border bg-secondary overflow-hidden flex-shrink-0 relative rounded-md shadow-sm ml-auto"
                          style={{
                            width: "160px",
                            height: block.content === "970x600" ? "98px" : "49px"
                          }}
                        >
                          <img src={block.imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 6: Action Buttons */}
        <div className="flex gap-4 pt-4 border-t">
          <Button type="submit" className="flex-1 bg-foreground text-background hover:bg-foreground/90">
            {existingProduct ? "Save Product Changes" : "Publish to Catalog"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

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
import { Product, Category, ProductVariant, APlusBlock } from "@/types";
import { Barcode } from "@/components/ui/Barcode";

interface AdminProductFormProps {
  productId?: string;
  initialProducts: Product[];
  initialCategories: Category[];
}

export function AdminProductForm({ productId, initialProducts, initialCategories }: AdminProductFormProps) {
  const router = useRouter();
  const { products, initializeProducts, addProduct, updateProduct, getNextFsiNo } = useProductStore();
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
  const [sku, setSku] = React.useState("");
  const [fsiNo, setFsiNo] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState(0);
  const [mrp, setMrp] = React.useState(0);
  const [categoryId, setCategoryId] = React.useState("");
  const [stock, setStock] = React.useState(100);
  const [tagsText, setTagsText] = React.useState("");

  // Editor states
  const [editorMode, setEditorMode] = React.useState<"edit" | "preview">("edit");
  const descriptionRef = React.useRef<HTMLTextAreaElement>(null);

  // Dynamic Image fields
  const [imageUrls, setImageUrls] = React.useState<string[]>([""]);

  // Dynamic Options (Variants)
  const [colorsText, setColorsText] = React.useState("");
  const [sizesText, setSizesText] = React.useState("");
  const [weightsText, setWeightsText] = React.useState("");

  // Dynamic A+ Content blocks
  const [aPlusBlocks, setAPlusBlocks] = React.useState<APlusBlock[]>([]);

  // Load existing details
  React.useEffect(() => {
    if (existingProduct) {
      setTitle(existingProduct.title);
      setSku(existingProduct.sku);
      setFsiNo(existingProduct.fsiNo || "");
      setDescription(existingProduct.description);
      setPrice(existingProduct.price);
      setMrp(existingProduct.mrp);
      setCategoryId(existingProduct.categoryId);
      setStock(existingProduct.stock);
      setTagsText(existingProduct.tags.join(", "));
      
      // Load images list
      setImageUrls(existingProduct.images.length > 0 ? existingProduct.images : [""]);

      // Load variants lists
      if (existingProduct.variants) {
        const colors = existingProduct.variants.filter(v => v.name === "Color").map(v => v.value);
        const sizes = existingProduct.variants.filter(v => v.name === "Size").map(v => v.value);
        const weights = existingProduct.variants.filter(v => v.name === "Weight").map(v => v.value);
        setColorsText(Array.from(new Set(colors)).join(", "));
        setSizesText(Array.from(new Set(sizes)).join(", "));
        setWeightsText(Array.from(new Set(weights)).join(", "));
      }

      // Load A+ Blocks
      setAPlusBlocks(existingProduct.aPlusContent || []);
    } else {
      if (activeCategories.length > 0) {
        setCategoryId(activeCategories[0]._id);
      }
      // Auto-generate next FSI No in unique hex sequence from store settings!
      setFsiNo(getNextFsiNo());
    }
  }, [existingProduct, activeCategories, getNextFsiNo]);

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

    // Refocus & set selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selected || "text").length);
    }, 0);
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newUrls = [...imageUrls];
        newUrls[index] = event.target.result as string;
        setImageUrls(newUrls);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add/Remove Image fields
  const addImageUrlField = () => setImageUrls([...imageUrls, ""]);
  const removeImageUrlField = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls.length > 0 ? newUrls : [""]);
  };

  // A+ Block upload handler
  const handleBlockImageUpload = (e: React.ChangeEvent<HTMLInputElement>, blockId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAPlusBlocks(prev => prev.map(b =>
          b.id === blockId ? { ...b, imageUrl: event.target?.result as string } : b
        ));
      }
    };
    reader.readAsDataURL(file);
  };

  // Add/Remove A+ Content Blocks
  const addAPlusBlock = () => {
    const newBlock: APlusBlock = {
      id: `ap-${Date.now()}`,
      type: "image",
      content: "970x600",
      imageUrl: ""
    };
    setAPlusBlocks([...aPlusBlocks, newBlock]);
  };

  const removeAPlusBlock = (id: string) => {
    setAPlusBlocks(aPlusBlocks.filter(b => b.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !sku || !categoryId) {
      alert("Please fill in Title, SKU, and Category.");
      return;
    }

    const images = imageUrls
      .map(url => url.trim())
      .filter(url => url !== "");

    if (images.length === 0) {
      images.push("https://placehold.co/600x600/f1f5f9/0f172a?text=Product+Placeholder");
    }

    const tags = tagsText
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag !== "");

    // Generate B2B variants array from Colors, Sizes, and Weights inputs
    const variants: ProductVariant[] = [];

    const colors = colorsText.split(",").map(c => c.trim()).filter(c => c !== "");
    const sizes = sizesText.split(",").map(s => s.trim()).filter(s => s !== "");
    const weights = weightsText.split(",").map(w => w.trim()).filter(w => w !== "");

    colors.forEach((col, idx) => {
      variants.push({
        id: `${sku}-v-col-${idx}`,
        name: "Color",
        value: col,
        priceOffset: idx > 0 ? idx * 25 : 0,
        stock: Math.floor(stock / (colors.length || 1))
      });
    });

    sizes.forEach((sz, idx) => {
      variants.push({
        id: `${sku}-v-sz-${idx}`,
        name: "Size",
        value: sz,
        priceOffset: idx > 0 ? idx * 50 : 0,
        stock: stock
      });
    });

    weights.forEach((wt, idx) => {
      variants.push({
        id: `${sku}-v-wt-${idx}`,
        name: "Weight",
        value: wt,
        priceOffset: idx > 0 ? idx * 100 : 0,
        stock: stock
      });
    });

    const productData = {
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description,
      images,
      price: Number(price),
      mrp: Number(mrp),
      discount: mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0,
      sku,
      fsiNo,
      categoryId,
      stock: Number(stock),
      rating: existingProduct ? existingProduct.rating : 4.5,
      reviewCount: existingProduct ? existingProduct.reviewCount : 12,
      tags,
      variants,
      aPlusContent: aPlusBlocks,
      isActive: true
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
            {existingProduct ? `Modify SKU: ${existingProduct.sku}` : "Add cargo lines direct from factory"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Basic Info */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <h3 className="font-bold text-lg border-b pb-2">Basic Info</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Title</label>
                <Input
                  placeholder="e.g., 12-in-1 Vegetable Chopper"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">SKU Code</label>
                <Input
                  placeholder="e.g., FS-HK-CHOP12"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">FSI Number</label>
                <Input
                  placeholder="e.g., FSI-89012345-67"
                  value={fsiNo}
                  onChange={(e) => setFsiNo(e.target.value)}
                  required
                />
              </div>
            </div>

            {(sku || fsiNo) && (
              <div className="flex flex-col items-center gap-2 p-4 bg-secondary/10 rounded-lg border border-dashed border-border w-max mx-auto">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Live Product Barcode (SKU-FSI)</p>
                <Barcode sku={sku} fsiNo={fsiNo} />
              </div>
            )}

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
                  {/* Rich Text formatting Toolbar */}
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
                    <span className="w-px h-5 bg-border mx-1" />
                    <button
                      type="button"
                      onClick={() => insertFormatting("<p>", "</p>")}
                      className="px-2 py-1 text-xs font-semibold rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                    >
                      Paragraph
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

        {/* Section 2: Pricing & Inventory */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <h3 className="font-bold text-lg border-b pb-2">Pricing & Stock</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">B2B Wholesale Price (₹)</label>
                <Input
                  type="number"
                  value={price || ""}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Retail MRP (₹)</label>
                <Input
                  type="number"
                  value={mrp || ""}
                  onChange={(e) => setMrp(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Stock Quantity</label>
                <Input
                  type="number"
                  value={stock || ""}
                  onChange={(e) => setStock(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma separated)</label>
                <Input
                  placeholder="e.g., kitchen, bestseller, new"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Dynamic Image Manager */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-lg">Product Images</h3>
              <Button type="button" size="sm" variant="outline" onClick={addImageUrlField}>
                <Plus className="h-4 w-4 mr-1" /> Add Image URL
              </Button>
            </div>

            <div className="space-y-4">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="flex gap-4 items-start bg-secondary/10 p-4 rounded-lg border relative">
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Image URL {idx + 1}</label>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={url}
                        onChange={(e) => {
                          const newUrls = [...imageUrls];
                          newUrls[idx] = e.target.value;
                          setImageUrls(newUrls);
                        }}
                      />
                    </div>

                    {/* File Upload Zone */}
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 px-3 py-1.5 bg-background hover:bg-secondary/50 border rounded-md cursor-pointer text-xs font-medium transition-colors">
                        <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, idx)}
                        />
                      </label>
                      {url.startsWith("data:image") ? (
                        <span className="text-[10px] text-success font-medium">Local file loaded (Base64)</span>
                      ) : url ? (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">{url}</span>
                      ) : null}
                    </div>
                  </div>

                  {/* Thumbnail Preview */}
                  {url && (
                    <div className="w-16 h-16 rounded border bg-secondary overflow-hidden flex-shrink-0">
                      <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {imageUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 self-center"
                      onClick={() => removeImageUrlField(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Dynamic Attributes & Variants (Colors, Sizes, Weights) */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <h3 className="font-bold text-lg border-b pb-2">Dynamic Variants (Comma separated)</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Available Colors</label>
                <Input
                  placeholder="e.g., Crimson Red, Matte Black, Aqua"
                  value={colorsText}
                  onChange={(e) => setColorsText(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">Generates individual color variant lines.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Available Sizes</label>
                <Input
                  placeholder="e.g., Small, Medium, Large"
                  value={sizesText}
                  onChange={(e) => setSizesText(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">Generates B2B quantity packing variants.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Available Weights</label>
                <Input
                  placeholder="e.g., 250g, 500g, 1kg"
                  value={weightsText}
                  onChange={(e) => setWeightsText(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">Useful for shipping cargo calculations.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Flexsell-style A+ Content Blocks Builder */}
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
                        {block.imageUrl?.startsWith("data:image") ? (
                          <span className="text-[10px] text-success font-medium block">Loaded local file (Base64)</span>
                        ) : null}
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

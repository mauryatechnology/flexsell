import * as React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Trash2, Upload, Download } from "lucide-react";
import { Barcode } from "@/components/ui/Barcode";
import { getBarcodeSvgString } from "@/lib/barcodeHelper";

interface VariantCardProps {
  idx: number;
  item: any;
  title: string;
  variantsListLength: number;
  currentSizes: string;
  currentWeights: string;
  newImageUrl: string;
  removeVariant: (idx: number) => void;
  updateVariantField: (idx: number, field: any, value: any) => void;
  setVariantSizes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  setVariantWeights: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  setNewImageUrl: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  generateSubVariants: (idx: number, sizes: string, weights: string) => void;
  updateSubVariantField: (idx: number, subId: string, field: string, value: any) => void;
  removeSubVariant: (idx: number, subId: string) => void;
  handleVariantImageUpload: (e: React.ChangeEvent<HTMLInputElement>, idx: number) => void;
  handleAddImageUrl: (idx: number) => void;
  addToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

export function VariantCard({
  idx,
  item,
  title,
  variantsListLength,
  currentSizes,
  currentWeights,
  newImageUrl,
  removeVariant,
  updateVariantField,
  setVariantSizes,
  setVariantWeights,
  setNewImageUrl,
  generateSubVariants,
  updateSubVariantField,
  removeSubVariant,
  handleVariantImageUpload,
  handleAddImageUrl,
  addToast
}: VariantCardProps) {
  return (
    <Card className="border border-border relative bg-card text-foreground group shadow-sm hover:shadow">
      {variantsListLength > 1 && (
        <button
          type="button"
          onClick={() => removeVariant(idx)}
          className="absolute top-4 right-4 text-destructive hover:bg-destructive/10 p-1.5 rounded-full transition-colors cursor-pointer"
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
            <label className="text-xs font-semibold uppercase text-muted-foreground"> Dimensions</label>
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
                onChange={(e) => setVariantSizes((prev: Record<number, string>) => ({ ...prev, [idx]: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Weights (comma separated)</label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. 250g, 500g"
                value={currentWeights}
                onChange={(e) => setVariantWeights((prev: Record<number, string>) => ({ ...prev, [idx]: e.target.value }))}
              />
            </div>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => generateSubVariants(idx, currentSizes, currentWeights)} className="cursor-pointer">
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
                {item.subVariants.map((sv: any) => (
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
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
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
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
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
              value={newImageUrl || ""}
              onChange={(e) => setNewImageUrl((prev: Record<number, string>) => ({ ...prev, [idx]: e.target.value }))}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-9 px-3 text-xs cursor-pointer"
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
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Variant Barcodes</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(item.subVariants || []).map((sv: any) => {
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
                    className="h-6 px-2 text-[10px] flex items-center gap-1 cursor-pointer"
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
}

"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { useProductForm } from "./ProductFormContext";
import { Plus } from "lucide-react";
import { useToastStore } from "@/stores/toastStore";
import { VariantCard } from "./VariantCard";

export function VariantEditor() {
  const { addToast } = useToastStore();
  const {
    variantsList,
    variantSizes,
    setVariantSizes,
    variantWeights,
    setVariantWeights,
    newImageUrl,
    setNewImageUrl,
    addVariant,
    removeVariant,
    generateSubVariants,
    updateSubVariantField,
    removeSubVariant,
    updateVariantField,
    handleVariantImageUpload,
    handleAddImageUrl,
    title
  } = useProductForm();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="font-extrabold text-xl text-foreground">Color Variants</h3>
        <Button type="button" size="sm" onClick={addVariant} className="flex items-center gap-1.5 cursor-pointer">
          <Plus className="h-4 w-4" /> Add Color Variant
        </Button>
      </div>

      <div className="space-y-6">
        {variantsList.map((item, idx) => {
          const derivedSizes = Array.from(new Set((item.subVariants || []).map(sv => sv.size))).filter(Boolean).join(", ");
          const derivedWeights = Array.from(new Set((item.subVariants || []).map(sv => sv.weight))).filter(Boolean).join(", ");
          const currentSizes = variantSizes[idx] !== undefined ? variantSizes[idx] : derivedSizes;
          const currentWeights = variantWeights[idx] !== undefined ? variantWeights[idx] : derivedWeights;

          return (
            <VariantCard
              key={idx}
              idx={idx}
              item={item}
              title={title}
              variantsListLength={variantsList.length}
              currentSizes={currentSizes}
              currentWeights={currentWeights}
              newImageUrl={newImageUrl[idx]}
              removeVariant={removeVariant}
              updateVariantField={updateVariantField}
              setVariantSizes={setVariantSizes}
              setVariantWeights={setVariantWeights}
              setNewImageUrl={setNewImageUrl}
              generateSubVariants={generateSubVariants}
              updateSubVariantField={updateSubVariantField}
              removeSubVariant={removeSubVariant}
              handleVariantImageUpload={handleVariantImageUpload}
              handleAddImageUrl={handleAddImageUrl}
              addToast={addToast}
            />
          );
        })}
      </div>
    </div>
  );
}

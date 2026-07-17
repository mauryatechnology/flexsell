"use client";

import * as React from "react";
import { QuoteDocument } from "@/components/documents/QuoteDocument";
import { useCartStore } from "@/stores/cartStore";
import { useProductStore } from "@/stores/productStore";
import { SellerInfo } from "@/types";

export default function QuotePage() {
  const { items, buyerState, getTaxDetails, hydrateProducts } = useCartStore();
  const [cmsData, setCmsData] = React.useState<any>(null);

  React.useEffect(() => {
    const init = async () => {
      const productState = useProductStore.getState();
      if (productState.products.length === 0) {
        await productState.initializeProducts();
      }
      hydrateProducts();
    };
    init();

    fetch("/api/cms")
      .then(res => res.json())
      .then(data => setCmsData(data))
      .catch(err => console.error("Failed to load CMS data:", err));
  }, [hydrateProducts]);

  const taxDetails = React.useMemo(() => {
    const raw = getTaxDetails();
    return {
      isIntrastate: raw.isIntrastate,
      baseSubtotal: raw.baseSubtotal,
      cgst: raw.totalCgst,
      sgst: raw.totalSgst,
      igst: raw.totalIgst,
      hsnSlabs: Object.values(raw.hsnBreakdown).map((slab: any) => ({
        hsnCode: slab.hsnCode,
        gstRate: slab.gstRate,
        baseAmount: slab.baseAmount,
        totalTax: slab.totalTax,
        cgst: slab.cgst,
        sgst: slab.sgst,
        igst: slab.igst
      }))
    };
  }, [items, buyerState, getTaxDetails]);

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-foreground bg-background min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-xl font-bold mb-2">No Items Found</h1>
        <p className="text-muted-foreground">Add products to your wholesale cart to generate a B2B quote.</p>
      </div>
    );
  }

  const bs = cmsData?.brandSettings || {};
  const sellerInfo: SellerInfo = {
    storeName: bs.storeName || "FlexSell Wholesale",
    gstin: bs.gstin || "24AAACF1001M1Z5",
    address: bs.companyAddress || "Plot No. 12, GIDC Industrial Estate, Sachin, Surat, Gujarat - 394230",
    email: bs.supportEmail || "support@flexsell.in",
    phone: bs.supportPhone || "+91 261 2409000",
  };

  const quoteId = `Q-${Math.floor(Math.random() * 900000 + 100000)}`;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 print:bg-white print:py-0 print:px-0">
      <QuoteDocument
        quoteId={quoteId}
        items={items}
        taxDetails={taxDetails}
        buyerState={buyerState || "Madhya Pradesh"}
        sellerInfo={sellerInfo}
        showActions={true}
      />
    </div>
  );
}

"use client";

import * as React from "react";
import Image from "next/image";
import { CartItem, TaxBreakdown, SellerInfo, HsnSlab } from "@/types";

export interface QuoteDocumentProps {
  quoteId: string;
  items: CartItem[];
  taxDetails: TaxBreakdown;
  buyerState: string;
  sellerInfo: SellerInfo;
  showActions?: boolean;
}

export function QuoteDocument({
  quoteId,
  items,
  taxDetails,
  buyerState,
  sellerInfo,
  showActions = true,
}: QuoteDocumentProps) {
  const handlePrint = () => window.print();

  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const grandTotal = taxDetails.baseSubtotal + taxDetails.cgst + taxDetails.sgst + taxDetails.igst;

  return (
    <div className="quote-document bg-white text-gray-900 max-w-4xl mx-auto">
      {/* Print Controls */}
      {showActions && (
        <div className="no-print flex justify-end gap-3 mb-6 pb-4 border-b border-gray-200">
          <button
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2.5 px-5 rounded-lg shadow cursor-pointer transition-colors"
          >
            Print / Save as PDF
          </button>
          <button
            onClick={() => window.close()}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 px-5 rounded-lg cursor-pointer transition-colors"
          >
            Close Window
          </button>
        </div>
      )}

      {/* Document Container */}
      <div className="border border-gray-200 rounded-xl p-8 print:border-none print:rounded-none print:p-0 print:shadow-none relative">
        {/* ─── HEADER ─── */}
        <div className="flex justify-between items-start pb-6 border-b-2 border-gray-800">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Image
                src="/Flexsell%20Logo.png"
                alt={sellerInfo.storeName}
                width={160}
                height={48}
                className="h-10 w-auto object-contain"
                unoptimized
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {sellerInfo.address || "Wholesale Importers & B2B Distributors"}
            </p>
            {sellerInfo.gstin && (
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                GSTIN: {sellerInfo.gstin}
              </p>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
              B2B Price Quote
            </h2>
            <p className="text-xs font-mono font-bold mt-1 text-gray-600">
              Quote ID: {quoteId}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Date: {dateStr}</p>
            <p className="text-[10px] text-amber-600 font-semibold mt-1">
              Valid for 15 days
            </p>
          </div>
        </div>

        {/* ─── BUYER / WAREHOUSE ─── */}
        <div className="grid grid-cols-2 gap-8 py-6 text-xs border-b border-gray-200">
          <div>
            <h3 className="font-bold text-[10px] text-gray-400 uppercase tracking-widest mb-2">
              Quotation For:
            </h3>
            <p className="font-bold text-gray-800 text-sm">Wholesale Buyer</p>
            <p className="text-gray-500 mt-1">
              Delivery State: <strong className="text-gray-800">{buyerState}</strong>
            </p>
            <p className="text-gray-500">Domestic cargo delivery across India</p>
          </div>
          <div>
            <h3 className="font-bold text-[10px] text-gray-400 uppercase tracking-widest mb-2">
              Issued By:
            </h3>
            <p className="font-semibold text-gray-800">{sellerInfo.storeName}</p>
            {sellerInfo.address && (
              <p className="text-gray-500 mt-1 leading-relaxed">{sellerInfo.address}</p>
            )}
            {sellerInfo.email && (
              <p className="text-gray-500 mt-1">Email: {sellerInfo.email}</p>
            )}
            {sellerInfo.phone && (
              <p className="text-gray-500">Phone: {sellerInfo.phone}</p>
            )}
          </div>
        </div>

        {/* ─── ITEMS TABLE ─── */}
        <div className="py-6">
          <h3 className="font-bold text-[10px] text-gray-400 uppercase tracking-widest mb-3">
            Itemized Price Schedule:
          </h3>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-800 uppercase text-[10px] font-bold text-gray-500 tracking-wider">
                <th className="pb-2">#</th>
                <th className="pb-2">Description</th>
                <th className="pb-2 text-center">Qty</th>
                <th className="pb-2 text-right">Unit Price</th>
                <th className="pb-2 text-center">GST Rate</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const formattedVariants = Object.entries(item.selectedVariants || {})
                  .map(([key, val]) => `${key}: ${val}`)
                  .join(" • ");
                const gstRate = item.product?.gstRate ?? 18;
                const lineTotal = item.pricePerUnit * item.quantity;
                return (
                  <tr key={`${item.product?._id || index}-${index}`} className="border-b border-gray-100 text-xs">
                    <td className="py-3 text-gray-500">{index + 1}</td>
                    <td className="py-3">
                      <span className="font-semibold text-gray-800">{item.product?.title || "Product"}</span>
                      {formattedVariants && (
                        <div className="text-[10px] text-gray-500 font-normal mt-0.5">{formattedVariants}</div>
                      )}
                    </td>
                    <td className="py-3 text-center font-bold">{item.quantity} units</td>
                    <td className="py-3 text-right">₹{item.pricePerUnit.toFixed(2)}</td>
                    <td className="py-3 text-center">{gstRate}%</td>
                    <td className="py-3 text-right font-bold text-gray-800">₹{lineTotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ─── SUMMARY ─── */}
        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-gray-200">
          {/* Terms */}
          <div className="text-xs text-gray-500 space-y-2">
            <p className="font-bold uppercase text-[10px] text-gray-400 tracking-widest">
              Quote Terms & Conditions:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-gray-500 leading-relaxed italic">
              <li>Prices represent verified factory-direct wholesale pricing.</li>
              <li>Quote valid for 15 calendar days from generation date.</li>
              <li>Prices inclusive of GST as per Indian tax norms.</li>
              <li>Free delivery for wholesale volume orders.</li>
              <li>Subject to stock availability at time of order placement.</li>
            </ol>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Taxable Base Value:</span>
              <span className="font-semibold">₹{taxDetails.baseSubtotal.toFixed(2)}</span>
            </div>
            {taxDetails.isIntrastate ? (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>CGST (Central GST):</span>
                  <span>₹{taxDetails.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>SGST (State GST):</span>
                  <span>₹{taxDetails.sgst.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-gray-600">
                <span>IGST (Integrated GST):</span>
                <span>₹{taxDetails.igst.toFixed(2)}</span>
              </div>
            )}

            {/* HSN Slabs */}
            {taxDetails.hsnSlabs.length > 0 && (
              <div className="border-t border-gray-200 pt-2 mt-2 space-y-1.5">
                <span className="font-bold text-[10px] text-gray-400 uppercase tracking-wider block">
                  HSN Summary
                </span>
                {taxDetails.hsnSlabs.map((slab) => (
                  <div key={slab.hsnCode} className="flex justify-between text-gray-600 border-b border-gray-100 pb-1">
                    <span>HSN {slab.hsnCode} ({slab.gstRate}%)</span>
                    <span>Tax: ₹{slab.totalTax.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between border-t-2 border-gray-800 pt-3 mt-3 font-bold text-base text-gray-900">
              <span>Grand Total (Incl. GST):</span>
              <span className="text-emerald-600 text-lg">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ─── SIGNATURE ─── */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex justify-between items-center text-xs">
          <div className="text-gray-400">
            Authorized Distributor • {sellerInfo.storeName} B2B Sourcing
          </div>
          <div className="border-b-2 border-dotted border-gray-300 w-48 h-8" />
        </div>

        {/* Footer */}
        <div className="mt-6 text-[10px] text-gray-400 text-center">
          <p>© {new Date().getFullYear()} {sellerInfo.storeName}. All rights reserved.</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .quote-document, .quote-document * { visibility: visible; }
          .quote-document {
            position: absolute; left: 0; top: 0; width: 100%;
            max-width: 100% !important; padding: 0 !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}

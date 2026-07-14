"use client";

import * as React from "react";

// Code 39 Encoding Table
// 1 = Black Bar (narrow or wide), 0 = White space (narrow or wide)
// Narrow = single unit, Wide = double unit
const CODE39_MAP: Record<string, string> = {
  "0": "101001101101",
  "1": "110100101011",
  "2": "101100101011",
  "3": "110110010101",
  "4": "101001101011",
  "5": "110100110101",
  "6": "101100110101",
  "7": "101001011011",
  "8": "110100101101",
  "9": "101100101101",
  "A": "110101001011",
  "B": "101101001011",
  "C": "110110100101",
  "D": "101011001011",
  "E": "110101100101",
  "F": "101101100101",
  "G": "101010011011",
  "H": "110101001101",
  "I": "101101001101",
  "J": "101011001101",
  "K": "110101010011",
  "L": "101101010011",
  "M": "110110101001",
  "N": "101011010011",
  "O": "110101101001",
  "P": "101101101001",
  "Q": "101010110011",
  "R": "110101011001",
  "S": "101101011001",
  "T": "101011011001",
  "U": "110010101011",
  "V": "100110101011",
  "W": "110011010101",
  "X": "100101101011",
  "Y": "110010110101",
  "Z": "100110110101",
  "-": "100101011011",
  ".": "110010101101",
  " ": "100110101101",
  "*": "100101101101", // Start/Stop
  "$": "100100100101",
  "/": "100100101001",
  "+": "100101001001",
  "%": "100100100101"
};

interface BarcodeProps {
  value?: string;
  sku?: string;
  fsiNo?: string;
  className?: string;
  width?: number;
  height?: number;
}

export function Barcode({ value = "", sku, fsiNo, className = "", width = 1.2, height = 35 }: BarcodeProps) {
  // If sku and fsiNo are provided, combine them for encoding
  const encodeValue = React.useMemo(() => {
    if (sku || fsiNo) {
      return `${sku || ""}-${fsiNo || ""}`;
    }
    return value;
  }, [value, sku, fsiNo]);

  // Normalize value to uppercase and strip invalid characters
  const rawText = React.useMemo(() => {
    return encodeValue
      .toUpperCase()
      .split("")
      .filter(char => char in CODE39_MAP)
      .join("");
  }, [encodeValue]);

  // Wrap with Code 39 start/stop character '*'
  const encodedText = React.useMemo(() => {
    if (!rawText) return "";
    return `*${rawText}*`;
  }, [rawText]);

  // Construct binary representation
  const binaryBars = React.useMemo(() => {
    let result = "";
    for (let i = 0; i < encodedText.length; i++) {
      const char = encodedText[i];
      result += CODE39_MAP[char] + "0"; // 0 separator between characters
    }
    return result;
  }, [encodedText]);

  if (!binaryBars) {
    return <div className="text-xs text-destructive">Invalid Barcode Value</div>;
  }

  const svgWidth = binaryBars.length * width;

  return (
    <div className={`flex flex-col items-center p-2 bg-white rounded border border-gray-200 w-max ${className}`}>
      <svg
        width={svgWidth}
        height={height}
        viewBox={`0 0 ${svgWidth} ${height}`}
        className="w-full"
      >
        {binaryBars.split("").map((bit, idx) => {
          if (bit === "1") {
            return (
              <rect
                key={idx}
                x={idx * width}
                y={0}
                width={width}
                height={height}
                fill="#000000"
              />
            );
          }
          return null;
        })}
      </svg>
      <span className="text-[9px] font-mono font-bold tracking-wider text-black mt-1.5 uppercase">
        {sku || fsiNo ? `${sku || "NO SKU"} | ${fsiNo || "NO FSI"}` : rawText}
      </span>
    </div>
  );
}

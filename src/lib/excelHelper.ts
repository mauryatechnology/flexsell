import ExcelJS from "exceljs";
import { Product, Category, HsnRecord, ColorVariant } from "@/types";

// ─── Description HTML <=> Plain Text Conversion ──────────────────────────
export function htmlToPlainText(html: string): string {
  if (!html) return "";
  let text = html;
  
  // Replace list items
  text = text.replace(/<li>/gi, "\n• ");
  text = text.replace(/<\/li>/gi, "");
  
  // Replace paragraph / block breaks
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<\/div>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  
  // Replace heading tags
  text = text.replace(/<\/h[1-6]>/gi, "\n\n");
  
  // Strip all other HTML tags
  text = text.replace(/<[^>]+>/g, "");
  
  // Replace HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
    
  // Trim leading/trailing whitespace and normalize excessive newlines to double newlines max
  text = text.trim();
  text = text.replace(/\n{3,}/g, "\n\n");
  
  return text;
}

export function plainTextToHtml(text: string): string {
  if (!text) return "";
  
  // Split by double newlines (paragraphs)
  const paragraphs = text.split(/\n\s*\n/);
  
  const htmlParagraphs = paragraphs.map((p) => {
    const trimmed = p.trim();
    if (!trimmed) return "";
    
    // Within paragraph, convert single newlines to <br>
    const lines = trimmed.split("\n");
    const escapedLines = lines.map((line) => {
      return line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    });
    return `<p>${escapedLines.join("<br>")}</p>`;
  });
  
  return htmlParagraphs.filter(Boolean).join("");
}

// ─── Column Layout (A–AB = 28 columns) ──────────────────────────────────
const HEADERS = [
  "Product Name",           // A (0)
  "Description",            // B (1)
  "Category",               // C (2)  — dropdown
  "HSN Code",               // D (3)  — dropdown
  "Price Includes GST",     // E (4)  — dropdown TRUE/FALSE
  "Min Order Qty (MOQ)",    // F (5)
  "Tags",                   // G (6)
  "Card Tags",              // H (7)
  "SEO Title",              // I (8)
  "SEO Description",        // J (9)
  "SEO Keywords",           // K (10)
  "Color",                  // L (11)
  "Dimensions",             // M (12)
  "Image URL 1",            // N (13)
  "Image URL 2",            // O (14)
  "Image URL 3",            // P (15)
  "Image URL 4",            // Q (16)
  "Image URL 5",            // R (17)
  "Image URL 6",            // S (18)
  "Image URL 7",            // T (19)
  "Image URL 8",            // U (20)
  "Image URL 9",            // V (21)
  "Size",                   // W (22)
  "Weight",                 // X (23)
  "Selling Price",          // Y (24)
  "MRP",                    // Z (25)
  "Stock",                  // AA (26)
  "SKU",                    // AB (27)
];

const GUIDELINES = [
  "Required. Max 200 chars. Rows with same name are grouped into one product.",
  "Required. Max 5000 chars. Enter normal plain text (emojis, lists, etc. are supported). Use single newlines for breaks, double newlines for paragraphs.",
  "Required. Select from dropdown.",
  "Required. Select from dropdown.",
  "Optional. Default: TRUE.",
  "Optional. Default: 1. Integer ≥ 1.",
  "Optional. Comma-separated. e.g. premium, kitchen.",
  "Optional. Comma-separated. e.g. Hot, New, Bestseller.",
  "Optional. Max 60 chars. Auto-generated if blank.",
  "Optional. Max 160 chars. Auto-generated if blank.",
  "Optional. Comma-separated. Auto-generated if blank.",
  "Required. e.g. Red, Blue. Use 'Default' for single-color products.",
  "Optional. e.g. 15x12x8 cm.",
  "Required. Min 1 image URL per color variant.",
  "Optional.", "Optional.", "Optional.", "Optional.",
  "Optional.", "Optional.", "Optional.", "Optional.",
  "Required. e.g. Standard, L, XL, 500g.",
  "Optional. e.g. 250g, 1kg.",
  "Required. Number > 0. Wholesale price.",
  "Required. Number ≥ Selling Price.",
  "Required. Integer ≥ 0. Inventory count.",
  "Required. Max 40 chars. Must be unique across all variants.",
];

const COL_WIDTHS = [
  28, // Product Name
  45, // Description
  20, // Category
  14, // HSN Code
  18, // Price Includes GST
  18, // MOQ
  22, // Tags
  20, // Card Tags
  22, // SEO Title
  28, // SEO Description
  22, // SEO Keywords
  14, // Color
  16, // Dimensions
  32, // Image URL 1
  32, 32, 32, 32, 32, 32, 32, 32, // Image URLs 2–9
  14, // Size
  12, // Weight
  14, // Selling Price
  12, // MRP
  10, // Stock
  18, // SKU
];

// ─── Validation Error Interface ──────────────────────────────────────────
export interface ExcelValidationError {
  row: number;
  column: string;
  message: string;
  type: "error" | "warning";
  productId?: string;
  sku?: string;
}

// ─── Instructions Sheet Builder ──────────────────────────────────────────
function buildInstructionsSheet(workbook: ExcelJS.Workbook) {
  const ws = workbook.addWorksheet("Instructions", {
    properties: { tabColor: { argb: "FF4472C4" } },
  });

  // Title
  ws.mergeCells("A1:D1");
  const titleCell = ws.getCell("A1");
  titleCell.value = "Guidelines for Bulk Product Upload / Update";
  titleCell.font = { bold: true, size: 16, color: { argb: "FF1F4E79" } };
  titleCell.alignment = { vertical: "middle" };
  ws.getRow(1).height = 32;

  // Intro
  ws.mergeCells("A3:D3");
  ws.getCell("A3").value = "This workbook lets you add new products or update existing ones in bulk.";
  ws.getCell("A3").font = { size: 11 };

  ws.mergeCells("A4:D4");
  ws.getCell("A4").value =
    "Fill in the 'Products' sheet. Each row = one variant combination. Rows with the same Product Name are grouped into one product.";
  ws.getCell("A4").font = { size: 11 };

  // Section header
  ws.mergeCells("A6:D6");
  const sectionCell = ws.getCell("A6");
  sectionCell.value = "Column Reference";
  sectionCell.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
  sectionCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } };
  ws.getRow(6).height = 26;

  // Table headers
  const tableHeaderRow = ws.getRow(7);
  tableHeaderRow.values = ["Column", "Field Name", "Required / Optional", "Description & Examples"];
  tableHeaderRow.font = { bold: true, size: 10 };
  tableHeaderRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E2F3" } };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF4472C4" } },
    };
  });

  // Column documentation rows
  const colLetters = "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z AA AB".split(" ");
  const requiredCols = new Set([0, 1, 2, 3, 11, 13, 22, 24, 25, 26, 27]); // indices

  const descriptions = [
    "Grouping key. Rows sharing the same Product Name become one product with multiple variants.",
    "Product description. Enter normal plain text (emojis, lists, etc. are supported). Use single newlines for breaks, and double newlines for paragraph spacing. This will be automatically converted to rich text formatting in the application.",
    "Select from the dropdown list. Must match a category configured in your system.",
    "Select from the dropdown list. GST rate is auto-determined from this code.",
    "Whether the Selling Price includes GST. Defaults to TRUE if left blank.",
    "Minimum order quantity. Defaults to 1 if left blank.",
    "Comma-separated product tags. e.g. premium, eco-friendly, kitchen",
    "Comma-separated card badge tags. e.g. Hot, New, Bestseller",
    "Page title for SEO. Auto-generated from Product Name if blank.",
    "Meta description for SEO. Auto-generated if blank.",
    "Comma-separated SEO keywords. Auto-generated if blank.",
    "Color name for this variant group. Use 'Default' for single-color products. Rows with the same Product Name + Color share images.",
    "Physical dimensions of this variant. e.g. 15x12x8 cm",
    "Primary image URL (required). JPG/PNG/WebP. At least 1 image per color variant.",
    "Additional image URL 2.", "Additional image URL 3.", "Additional image URL 4.",
    "Additional image URL 5.", "Additional image URL 6.", "Additional image URL 7.",
    "Additional image URL 8.", "Additional image URL 9.",
    "Size label. e.g. Standard, S, M, L, XL, 500g",
    "Weight specification. e.g. 250g, 1kg, 500ml",
    "Wholesale selling price. Must be a positive number.",
    "Maximum Retail Price. Must be ≥ Selling Price.",
    "Current stock / inventory count. Integer ≥ 0.",
    "Unique SKU code for this specific variant combination. Max 40 chars.",
  ];

  for (let i = 0; i < HEADERS.length; i++) {
    const row = ws.getRow(8 + i);
    row.values = [
      `Column ${colLetters[i]}`,
      HEADERS[i],
      requiredCols.has(i) ? "Required" : "Optional",
      descriptions[i] || "",
    ];
    row.getCell(3).font = {
      bold: requiredCols.has(i),
      color: { argb: requiredCols.has(i) ? "FFC00000" : "FF548235" },
    };
    row.alignment = { wrapText: true, vertical: "top" };
  }

  // Column widths
  ws.getColumn(1).width = 12;
  ws.getColumn(2).width = 22;
  ws.getColumn(3).width = 18;
  ws.getColumn(4).width = 80;

  return ws;
}

// ─── Export Function ─────────────────────────────────────────────────────
export async function exportToExcel(
  products: Product[],
  categories: Category[],
  hsns: HsnRecord[],
  onlyTemplate: boolean = false
): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FlexSell Wholesale";
  workbook.created = new Date();

  // Sheet 1: Instructions
  buildInstructionsSheet(workbook);

  // Sheet 2: Products
  const ws = workbook.addWorksheet("Products", {
    views: [{ state: "frozen", ySplit: 2 }], // Freeze header + guidelines
  });

  // ── Row 1: Headers ────────────────────────────────────────────────────
  const headerRow = ws.getRow(1);
  headerRow.values = HEADERS;
  headerRow.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
  headerRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  headerRow.height = 22;
  headerRow.eachCell((cell, colNumber) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF2F5496" } },
      right: { style: "thin", color: { argb: "FF2F5496" } },
    };
  });

  // ── Row 2: Guidelines ─────────────────────────────────────────────────
  const guideRow = ws.getRow(2);
  guideRow.values = GUIDELINES;
  guideRow.font = { italic: true, size: 8, color: { argb: "FF808080" } };
  guideRow.alignment = { wrapText: true, vertical: "top" };
  guideRow.height = 32;

  // ── Column Widths ─────────────────────────────────────────────────────
  HEADERS.forEach((_, idx) => {
    ws.getColumn(idx + 1).width = COL_WIDTHS[idx] || 14;
  });

  // ── In-Cell Dropdown Validations (rows 3 to 2000) ─────────────────────
  const categoryNames = categories.map((c) => c.name).filter(Boolean);
  const hsnCodes = hsns.map((h) => h.code).filter(Boolean);

  // Category dropdown (Column C)
  if (categoryNames.length > 0) {
    const catFormula = `"${categoryNames.join(",")}"`;
    (ws as any).dataValidations.add("C3:C2000", {
      type: "list",
      allowBlank: false,
      formulae: [catFormula],
      showErrorMessage: true,
      errorTitle: "Invalid Category",
      error: "Please select a valid category from the dropdown list.",
    });
  }

  // HSN Code dropdown (Column D)
  if (hsnCodes.length > 0) {
    const hsnFormula = `"${hsnCodes.join(",")}"`;
    (ws as any).dataValidations.add("D3:D2000", {
      type: "list",
      allowBlank: false,
      formulae: [hsnFormula],
      showErrorMessage: true,
      errorTitle: "Invalid HSN Code",
      error: "Please select a valid HSN code from the dropdown list.",
    });
  }

  // Price Includes GST dropdown (Column E)
  (ws as any).dataValidations.add("E3:E2000", {
    type: "list",
    allowBlank: true,
    formulae: ['"TRUE,FALSE"'],
  });

  // ── Populate Data Rows (for update export) ────────────────────────────
  if (!onlyTemplate && products.length > 0) {
    let rowIdx = 3;

    products.forEach((p) => {
      const category = categories.find((c) => c._id === p.categoryId);
      const categoryText = category ? category.name : "";

      (p.colorVariants || []).forEach((cv) => {
        const imageUrls: string[] = (cv.images || []).map((img) =>
          typeof img === "string" ? img : img.url || ""
        ).filter(Boolean);

        (cv.subVariants || []).forEach((sv) => {
          const row = ws.getRow(rowIdx);
          const values: any[] = [
            p.title || "",
            htmlToPlainText(p.description || ""),                    // Convert rich HTML description to normal plain text with line breaks
            categoryText,
            p.hsnCode || "",
            p.priceIncludesGst !== undefined ? (p.priceIncludesGst ? "TRUE" : "FALSE") : "TRUE",
            p.moq !== undefined ? p.moq : 1,
            (p.tags || []).join(", "),
            (p.cardTags || []).join(", "),
            p.seoTitle || "",
            p.seoDescription || "",
            p.seoKeywords || "",
            cv.color || "Default",
            cv.dimensions || "",
          ];

          // Image URL columns (9 individual columns)
          for (let i = 0; i < 9; i++) {
            values.push(imageUrls[i] || "");
          }

          values.push(
            sv.size || "",
            sv.weight || "",
            sv.price !== undefined ? sv.price : "",
            sv.mrp !== undefined ? sv.mrp : "",
            sv.stock !== undefined ? sv.stock : 0,
            sv.sku || ""
          );

          row.values = values;
          row.alignment = { wrapText: true, vertical: "top" };
          rowIdx++;
        });
      });
    });
  }

  // ── Generate blob ─────────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

// ─── Download Helper ─────────────────────────────────────────────────────
export async function downloadExcel(
  products: Product[],
  categories: Category[],
  hsns: HsnRecord[],
  onlyTemplate: boolean = false
) {
  const blob = await exportToExcel(products, categories, hsns, onlyTemplate);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const timestamp = `${year}${month}${day}_${hours}${minutes}`;

  a.download = onlyTemplate 
    ? `flexsell_add_products_${timestamp}.xlsx` 
    : `flexsell_update_products_${timestamp}.xlsx`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Parse & Validate Uploaded Excel ─────────────────────────────────────
export async function parseAndValidateExcel(
  fileData: ArrayBuffer,
  categories: Category[],
  hsns: HsnRecord[],
  systemProducts: Product[] = []
): Promise<{
  products: Partial<Product>[];
  errors: ExcelValidationError[];
  stats: {
    productsCount: number;
    variantsCount: number;
    combinationsCount: number;
  };
}> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileData);

  // Find the data sheet (first sheet that isn't "Instructions")
  let ws: ExcelJS.Worksheet | undefined;
  for (const sheet of workbook.worksheets) {
    if (sheet.name.toLowerCase() !== "instructions") {
      ws = sheet;
      break;
    }
  }
  if (!ws) ws = workbook.worksheets[0];

  if (!ws || ws.rowCount === 0) {
    return {
      products: [],
      errors: [{ row: 1, column: "File", message: "The sheet is empty", type: "error" }],
      stats: { productsCount: 0, variantsCount: 0, combinationsCount: 0 },
    };
  }

  // Build lookup maps
  const categoryNameMap = new Map<string, string>();
  categories.forEach((c) => {
    categoryNameMap.set(c.name.toLowerCase().trim(), c._id);
    categoryNameMap.set(c._id.toLowerCase().trim(), c._id);
  });

  const hsnCodeMap = new Map<string, number>();
  hsns.forEach((h) => {
    hsnCodeMap.set(h.code.trim(), h.gstRate);
  });

  const systemSkuMap = new Map<string, Product>();
  systemProducts.forEach((p) => {
    p.colorVariants?.forEach((cv) => {
      cv.subVariants?.forEach((sv) => {
        if (sv.sku) systemSkuMap.set(sv.sku.toLowerCase().trim(), p);
      });
    });
  });

  const systemTitleMap = new Map<string, Product>();
  systemProducts.forEach((p) => {
    systemTitleMap.set(p.title.toLowerCase().trim(), p);
  });

  const errors: ExcelValidationError[] = [];
  const productGroups = new Map<
    string,
    {
      productFields: any;
      variants: Map<string, { dimensions: string; images: any[]; subVariants: any[] }>;
    }
  >();
  const skuCounts = new Map<string, number>();

  // Helpers
  const cleanStr = (val: any): string => {
    if (val === undefined || val === null) return "";
    if (typeof val === "object") {
      if (val.text !== undefined) return String(val.text).trim();
      if (val.result !== undefined) return String(val.result).trim();
      if (val.hyperlink !== undefined) return String(val.hyperlink).trim();
    }
    return String(val).trim();
  };
  const cleanBool = (val: any, defaultVal: boolean = true) => {
    if (val === undefined || val === null || val === "") return defaultVal;
    let actualVal = val;
    if (typeof val === "object") {
      if (val.result !== undefined) actualVal = val.result;
      else if (val.text !== undefined) actualVal = val.text;
    }
    const s = String(actualVal).toLowerCase().trim();
    return s === "true" || s === "1" || s === "yes";
  };
  const cleanNum = (val: any, defaultVal: number = 0) => {
    if (val === undefined || val === null || val === "") return defaultVal;
    let actualVal = val;
    if (typeof val === "object") {
      if (val.result !== undefined) actualVal = val.result;
      else if (val.text !== undefined) actualVal = val.text;
    }
    const n = Number(actualVal);
    return isNaN(n) ? defaultVal : n;
  };

  // Determine data start row (skip header + guidelines)
  let startRow = 2; // Default: row 2 is data (1-indexed, row 1 is header)
  const row2 = ws.getRow(2);
  const row2Val = cleanStr(row2.getCell(1).value);
  if (
    row2Val.toLowerCase().includes("required") ||
    row2Val.toLowerCase().includes("optional") ||
    row2Val.toLowerCase().includes("max") ||
    row2Val.toLowerCase().includes("limit")
  ) {
    startRow = 3; // Skip guidelines row
  }

  // Parse data rows
  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber < startRow) return;

    const getCellVal = (colIdx: number) => {
      const cell = row.getCell(colIdx);
      return cell.value;
    };

    const title = cleanStr(getCellVal(1));
    const description = plainTextToHtml(cleanStr(getCellVal(2)));
    const categoryVal = cleanStr(getCellVal(3));
    const hsnCode = cleanStr(getCellVal(4));
    const priceIncludesGst = cleanBool(getCellVal(5), true);
    const moq = cleanNum(getCellVal(6), 1);
    const tags = cleanStr(getCellVal(7)).split(",").map((t) => t.trim()).filter(Boolean);
    const cardTags = cleanStr(getCellVal(8)).split(",").map((t) => t.trim()).filter(Boolean);
    const seoTitle = cleanStr(getCellVal(9));
    const seoDescription = cleanStr(getCellVal(10));
    const seoKeywords = cleanStr(getCellVal(11));

    const color = cleanStr(getCellVal(12)) || "Default";
    const dimensions = cleanStr(getCellVal(13));

    // Parse 9 individual image URL columns (columns 14–22)
    const imageUrls: string[] = [];
    for (let i = 14; i <= 22; i++) {
      const url = cleanStr(getCellVal(i));
      if (url) imageUrls.push(url);
    }

    const size = cleanStr(getCellVal(23)) || "Standard";
    const weight = cleanStr(getCellVal(24));
    const price = cleanNum(getCellVal(25), -1);
    const mrp = cleanNum(getCellVal(26), -1);
    const stock = cleanNum(getCellVal(27), 0);
    const sku = cleanStr(getCellVal(28));

    // ── Validations ──────────────────────────────────────────────────
    if (!title) {
      errors.push({ row: rowNumber, column: "Product Name", message: "Product Name is required.", type: "error" });
      return;
    }

    if (!sku) {
      errors.push({ row: rowNumber, column: "SKU", message: "SKU is required for each variant row.", type: "error" });
      return;
    }

    // SKU uniqueness within sheet
    const skuKey = sku.toLowerCase().trim();
    skuCounts.set(skuKey, (skuCounts.get(skuKey) || 0) + 1);
    if ((skuCounts.get(skuKey) || 0) > 1) {
      errors.push({
        row: rowNumber,
        column: "SKU",
        message: `Duplicate SKU '${sku}' found in the uploaded sheet.`,
        type: "error",
        sku,
      });
    }

    // SKU conflict with database
    if (systemSkuMap.has(skuKey)) {
      const existingProduct = systemSkuMap.get(skuKey)!;
      if (title && existingProduct.title.toLowerCase().trim() !== title.toLowerCase().trim()) {
        errors.push({
          row: rowNumber,
          column: "SKU",
          message: `SKU '${sku}' is already registered to a different product: '${existingProduct.title}'.`,
          type: "error",
          sku,
          productId: existingProduct._id,
        });
      } else {
        errors.push({
          row: rowNumber,
          column: "SKU",
          message: `SKU '${sku}' already exists. Will update existing variant under '${existingProduct.title}'.`,
          type: "warning",
          sku,
          productId: existingProduct._id,
        });
      }
    }

    if (price < 0) {
      errors.push({ row: rowNumber, column: "Selling Price", message: "Selling Price is required.", type: "error", sku });
    }
    if (mrp < 0) {
      errors.push({ row: rowNumber, column: "MRP", message: "MRP is required.", type: "error", sku });
    }
    if (price > mrp && mrp >= 0) {
      errors.push({ row: rowNumber, column: "Price / MRP", message: "Selling Price cannot exceed MRP.", type: "error", sku });
    }

    // Minimum 1 image validation
    if (imageUrls.length === 0) {
      errors.push({
        row: rowNumber,
        column: "Image URL 1",
        message: "At least 1 image URL is required per color variant.",
        type: "error",
        sku,
      });
    }

    // ── Grouping by Product Title ────────────────────────────────────
    const groupKey = title.toLowerCase().trim();

    if (!productGroups.has(groupKey)) {
      if (!description) {
        errors.push({ row: rowNumber, column: "Description", message: "Product Description is required.", type: "error" });
      }

      let categoryId = "";
      if (!categoryVal) {
        errors.push({ row: rowNumber, column: "Category", message: "Category is required.", type: "error" });
      } else {
        categoryId = categoryNameMap.get(categoryVal.toLowerCase().trim()) || "";
        if (!categoryId) {
          errors.push({
            row: rowNumber,
            column: "Category",
            message: `Category '${categoryVal}' not found in system.`,
            type: "warning",
          });
          categoryId = categories[0]?._id || "unknown";
        }
      }

      if (!hsnCode) {
        errors.push({ row: rowNumber, column: "HSN Code", message: "HSN Code is required.", type: "error" });
      } else if (!hsnCodeMap.has(hsnCode)) {
        errors.push({
          row: rowNumber,
          column: "HSN Code",
          message: `HSN Code '${hsnCode}' not recognized in system.`,
          type: "warning",
        });
      }

      // Check if product already exists in DB
      const existingProduct = systemTitleMap.get(groupKey);
      if (existingProduct) {
        errors.push({
          row: rowNumber,
          column: "Product Name",
          message: `Product '${existingProduct.title}' already exists. This sheet will update its fields and merge variants.`,
          type: "warning",
          productId: existingProduct._id,
        });
      }

      productGroups.set(groupKey, {
        productFields: {
          title,
          description,
          categoryId,
          hsnCode,
          priceIncludesGst,
          moq,
          tags,
          cardTags,
          seoTitle,
          seoDescription,
          seoKeywords,
          isActive: true,
        },
        variants: new Map(),
      });
    }

    const productInfo = productGroups.get(groupKey)!;
    const colorKey = color.toLowerCase().trim();

    if (!productInfo.variants.has(colorKey)) {
      const parsedImages = imageUrls.map((url) => ({
        url,
        alt: `${productInfo.productFields.title} - ${color}`,
      }));

      productInfo.variants.set(colorKey, {
        dimensions,
        images: parsedImages,
        subVariants: [],
      });
    }

    const colorGroup = productInfo.variants.get(colorKey)!;
    colorGroup.subVariants.push({
      size,
      weight,
      price,
      mrp,
      discount: mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0,
      stock,
      sku,
      isActive: true,
    });
  });

  // ── Assemble Products ─────────────────────────────────────────────────
  const assembledProducts: Partial<Product>[] = [];
  let totalVariants = 0;
  let totalCombinations = 0;

  productGroups.forEach((group) => {
    const { productFields, variants } = group;
    const colorVariants: ColorVariant[] = [];

    totalVariants += variants.size;

    variants.forEach((cvGroup, colorName) => {
      totalCombinations += cvGroup.subVariants.length;

      const colorLabel = colorName === "default" ? "Default" : colorName;

      colorVariants.push({
        color: colorLabel.charAt(0).toUpperCase() + colorLabel.slice(1),
        dimensions: cvGroup.dimensions,
        images: cvGroup.images,
        subVariants: cvGroup.subVariants.map((sv, svIdx) => ({
          ...sv,
          id: `sv-${Date.now()}-${svIdx}-${Math.random().toString(36).substr(2, 5)}`,
        })),
      });
    });

    assembledProducts.push({
      ...productFields,
      colorVariants,
    });
  });

  return {
    products: assembledProducts,
    errors,
    stats: {
      productsCount: assembledProducts.length,
      variantsCount: totalVariants,
      combinationsCount: totalCombinations,
    },
  };
}

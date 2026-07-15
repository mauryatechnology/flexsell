# FlexSell Wholesale - Premium B2B Wholesale Market

FlexSell Wholesale is a next-generation, premium B2B e-commerce platform designed for direct manufacturer-to-retailer supply chain networks, bulk ordering, and regional tax/logistics distribution. It features advanced variant matrix logic, custom real-time thematic styling, and integrated camera-based barcode scanning for warehouse inventory controls.

---

## ✨ Premium B2B Features & Business Logic

### 1. B2B Bulk Variant Purchase Matrix
Wholesale buyers purchase in volume. FlexSell provides a **Bulk Purchase Grid** on product pages that renders all available color, size, and weight combinations in a tabular matrix. Retailers can input order quantities for multiple variants simultaneously and add them to their cart in a single click, respecting separate stock levels per SKU.

### 2. Integrated Indian GST Taxation Engine
Automated computation of Indian goods and services taxation:
- **Intrastate Split:** Automatically applies **CGST (9%)** and **SGST (9%)** if shipping to the home state (Madhya Pradesh).
- **Interstate Split:** Automatically applies **IGST (18%)** for out-of-state shipping.
- **HSN Codes Support:** Groups and summarizes taxes per HSN slab.
- **Inclusive vs. Exclusive Pricing:** Dynamic toggle calculations based on product configuration schemas.

### 3. Commercial Tax Invoices & Dispatch Logs
- **Commercial PDF Invoicing:** Generates print-ready commercial tax invoices in both admin and client portals.
- **Fulfillment Timeline:** Live visual tracker showing shipping logs, logistics dispatch status, courier carrier information, and AWB tracking URLs.
- **Print Stylesheets:** Automatically hides navigation panels, actions, and controls when printing invoice records.

### 4. Export B2B Commercial Quotes (PDF)
A dedicated quote generator in the cart compiled as a clean HTML invoice layout. It opens in a new print-ready popup window, enabling clients to download premium PDF summaries for commercial approvals without requiring heavy external PDF compilation library packages.

### 5. In-Browser Barcode Scanner & SVG Barcode Generator
- **Code 39 SVG Encoder:** A custom, ultra-lightweight script that encodes SKUs into Code 39 barcode SVG elements directly in the browser.
- **Dynamic Camera Scanner:** Dynamic dynamic import of the `html5-qrcode` package. Activates mobile/desktop cameras on the admin panel, allowing managers to scan physical barcodes, fetch matching products, and adjust stock counts instantly.

### 6. Real-Time Dynamic Theme Editor
A custom configuration editor inside the admin panel. Adjust primary brand colors, border radius parameters, and active logo URLs. These settings dynamically override active CSS variables at the root document level at runtime and are persisted in local storage.

### 7. Search Engine Optimization (SEO) & Performance
- **Dynamic JSON-LD Product Schema:** Injects search engine indexable metadata (Product, AggregateOffer, and AggregateRating schemas) on detail pages for rich search result snippets.
- **XML Sitemap:** Dynamic generation of `sitemap.xml` mapping categories, products, and static landing links.
- **Robots Policies:** `robots.txt` crawler policies separating public store pages from admin/client portal routes.
- **Optimized Image Pipeline:** Migrated standard img tags to Next.js `<Image>` components, achieving automatic LCP reduction, responsive sizes, and WebP generation.

---

## 🛠️ Tech Stack & Architecture

- **Core Framework:** Next.js (App Router, Server Components)
- **Styling:** Tailwind CSS v4 (Modern variable-based styling engine)
- **State Management:** Zustand (Modularized, persistent stores)
- **Utilities:** Lucide React, HTML5-Qrcode, Recharts, Zod, React Hook Form
- **Language:** TypeScript (Fully typed interfaces)

---

## 📂 Codebase Folder Structure

```
├── public/                 # Static assets (Favicons, branding logos)
├── src/
│   ├── app/                # Next.js pages, layouts, sitemaps, and robots configuration
│   │   ├── (dashboard)/    # Admin & Client dashboard route groups
│   │   └── (storefront)/   # Store catalog, product details, cart, and policies
│   ├── components/         # Reusable frontend components
│   │   ├── admin/          # Admin managers, product forms, theme editor
│   │   ├── storefront/     # Catalog views, checkout panels, cart components
│   │   ├── layout/         # Header, footer, mega menu
│   │   └── ui/             # Standardized UI kit elements (Avatar, Button, Barcode, price)
│   ├── config/             # Base configurations and default theme values
│   ├── data/               # Large scale realistic B2B mock dataset files
│   ├── lib/                # apiClient, helper utilities, and price formatting
│   ├── providers/          # Theme context provider
│   ├── stores/             # Zustand state managers (cart, products, toasts)
│   └── types/              # Unified TypeScript definitions
```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root folder based on `.env.example`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_SITE_URL=https://flexsellwholesale.in
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront.

### 4. Build Production Bundle
To compile and test production build assets:
```bash
npm run build
```
```bash
npm run start
```

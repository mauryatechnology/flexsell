import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ToastContainer } from "@/components/ui/ToastContainer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "FlexSell Wholesale - Premium B2B Wholesale Market",
    template: "%s | FlexSell Wholesale"
  },
  description: "India's leading B2B e-commerce platform for sourcing household products, kitchen tools, utilities, fashion accessories, and electronics directly from manufacturers.",
  keywords: ["wholesale B2B", "sourcing India", "Deodap wholesale", "dropshipping Surat", "reselling utilities", "cheap kitchen gadgets", "direct importer India"],
  authors: [{ name: "FlexSell Tech Team" }],
  creator: "FlexSell Wholesale",
  publisher: "FlexSell B2B",
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://flexsellwholesale.in",
    title: "FlexSell Wholesale - Premium B2B Sourcing",
    description: "Source premium quality household utility gadgets directly from manufacturers. Low MOQs, dynamic pricing, and nationwide shipping.",
    siteName: "FlexSell Wholesale"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}

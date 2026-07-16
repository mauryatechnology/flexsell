import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
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
      <head>
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('flexsell-theme-storage');
                  if (stored) {
                    var parsed = JSON.parse(stored);
                    if (parsed && parsed.state && parsed.state.activeTheme) {
                      var theme = parsed.state.activeTheme;
                      var root = document.documentElement;
                      var colors = theme.colors || {};
                      var vars = {
                        '--primary': colors.primary,
                        '--primary-foreground': colors.primaryForeground,
                        '--secondary': colors.secondary,
                        '--secondary-foreground': colors.secondaryForeground,
                        '--accent': colors.accent,
                        '--accent-foreground': colors.accentForeground,
                        '--background': colors.background,
                        '--foreground': colors.foreground,
                        '--muted': colors.muted,
                        '--muted-foreground': colors.mutedForeground,
                        '--card': colors.card,
                        '--card-foreground': colors.cardForeground,
                        '--border': colors.border,
                        '--destructive': colors.destructive,
                        '--radius': theme.borderRadius
                      };
                      for (var key in vars) {
                        if (vars[key]) {
                          root.style.setProperty(key, vars[key]);
                        }
                      }
                    }
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ToastContainer />
          <ConfirmDialog />
        </ThemeProvider>
      </body>
    </html>
  );
}

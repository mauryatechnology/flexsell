"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useThemeStore } from "@/stores/themeStore";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const activeTheme = useThemeStore((state) => state.activeTheme);

  // Inject CSS variables for the active theme dynamically
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      
      // Map theme colors to CSS variables
      // In Tailwind v4, we defined these in globals.css. We can override them inline.
      const vars = {
        "--primary": activeTheme.colors.primary,
        "--primary-foreground": activeTheme.colors.primaryForeground,
        "--secondary": activeTheme.colors.secondary,
        "--secondary-foreground": activeTheme.colors.secondaryForeground,
        "--accent": activeTheme.colors.accent,
        "--accent-foreground": activeTheme.colors.accentForeground,
        "--background": activeTheme.colors.background,
        "--foreground": activeTheme.colors.foreground,
        "--muted": activeTheme.colors.muted,
        "--muted-foreground": activeTheme.colors.mutedForeground,
        "--card": activeTheme.colors.card,
        "--card-foreground": activeTheme.colors.cardForeground,
        "--border": activeTheme.colors.border,
        "--destructive": activeTheme.colors.destructive,
        "--radius": activeTheme.borderRadius,
      };

      Object.entries(vars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }, [activeTheme]);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

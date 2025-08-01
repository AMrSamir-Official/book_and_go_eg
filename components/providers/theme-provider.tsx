"use client";

import type React from "react";

import { useAppStore } from "@/lib/store";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from "react";

export function ThemeProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
}) {
  const { theme, locale, isHydrated, setHydrated } = useAppStore();

  useEffect(() => {
    // Ensure hydration is complete
    if (!isHydrated) {
      setHydrated();
    }
  }, [isHydrated, setHydrated]);

  useEffect(() => {
    // Apply locale settings
    if (typeof window !== "undefined") {
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = locale;
    }
  }, [locale]);

  // Prevent hydration mismatch
  if (!isHydrated) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={theme}
      enableSystem
      disableTransitionOnChange={false}
      storageKey="app-theme"
    >
      {children}
    </NextThemesProvider>
  );
}

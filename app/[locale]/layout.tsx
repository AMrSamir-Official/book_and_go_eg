import { RouteGuard } from "@/components/auth/route-guard";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import type React from "react";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Book & Go Travel Dashboard",
  description: "Complete travel management system",
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  const cookieStore = await cookies();

  // Get theme and locale from cookies for SSR consistency
  const savedTheme = cookieStore.get("theme")?.value || "system";
  const savedLocale = cookieStore.get("locale")?.value || locale;

  return (
    <html
      lang={savedLocale}
      dir={savedLocale === "ar" ? "rtl" : "ltr"}
      className={savedTheme === "system" ? "" : savedTheme}
      suppressHydrationWarning
    >
      <body className={inter.className} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme={savedTheme}
            enableSystem
            disableTransitionOnChange
          >
            <RouteGuard>
              <SidebarProvider>{children}</SidebarProvider>
            </RouteGuard>
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

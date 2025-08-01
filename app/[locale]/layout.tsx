// app/[locale]/layout.tsx (الكود النهائي بعد التصحيح)

import { ThemeProvider } from "@/components/providers/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from "@/lib/session";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import type React from "react";
import "../globals.css";

import AuthProvider from "@/components/AuthProvider"; // تأكد من المسار

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
  const savedTheme = cookieStore.get("theme")?.value || "system";
  const savedLocale = cookieStore.get("locale")?.value || locale;

  const user = await getCurrentUser();
  // 1. قراءة التوكن من الكوكي
  const token = cookieStore.get("token")?.value || null;

  return (
    <html
      lang={savedLocale}
      dir={savedLocale === "ar" ? "rtl" : "ltr"}
      className={savedTheme === "system" ? "" : savedTheme}
      suppressHydrationWarning
    >
      <body
        className={inter.className + " overflow-hidden"}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme={savedTheme}
            enableSystem
            disableTransitionOnChange
            {...({} as any)}
          >
            {/* 2. تمرير المستخدم والتوكن معًا */}
            <AuthProvider user={user} token={token}>
              <SidebarProvider>{children}</SidebarProvider>
            </AuthProvider>
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

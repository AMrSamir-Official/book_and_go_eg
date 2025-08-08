import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

// --- الإعدادات ---
const locales = ["en", "ar"];
const PUBLIC_ROUTES = ["/", "/login"];
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// --- إعداد الـ intl Middleware ---
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: "en",
  localePrefix: "as-needed",
});

// --- كاش للتحقق من التوكن ---
const tokenCache = new Map<string, { valid: boolean; expiresAt: number }>();

async function verifyToken(token: string): Promise<boolean> {
  const now = Date.now();
  const cached = tokenCache.get(token);

  if (cached && cached.expiresAt > now) {
    return cached.valid;
  }

  try {
    const res = await fetch(`${API_URL}/auth/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const isValid = res.ok;
    tokenCache.set(token, {
      valid: isValid,
      expiresAt: now + 60 * 1000, // كاش لمدة 60 ثانية
    });

    return isValid;
  } catch (error) {
    console.error("Error verifying token in middleware:", error);
    return false;
  }
}

// --- Middleware الرئيسي ---
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  // const locale = locales.find((l) => pathname.startsWith(`/${l}`)) || "";
  const locale = request.nextUrl.locale || "en";

  // استخراج الـ path بدون اللغة
  const pathWithoutLocale = pathname
    .split("/")
    .filter((part) => !locales.includes(part) && part !== "")
    .join("/");

  const normalizedPath = "/" + pathWithoutLocale;
  const isPublicPath = PUBLIC_ROUTES.includes(normalizedPath);

  const isTokenValid = token ? await verifyToken(token) : false;

  // إعادة توجيه إذا كان التوكن صالح والمستخدم في صفحة عامة (مثل login)
  if (isTokenValid && isPublicPath) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // إعادة توجيه إذا كان التوكن غير صالح والمستخدم في صفحة محمية
  if (!isTokenValid && !isPublicPath) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    if (normalizedPath !== "/") {
      loginUrl.searchParams.set("from", normalizedPath);
    }
    return NextResponse.redirect(loginUrl);
  }

  // السماح بـ intlMiddleware بالمتابعة
  return intlMiddleware(request);
}

// --- الاستثناءات من التفعيل ---
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|site.webmanifest).*)",
  ],
};

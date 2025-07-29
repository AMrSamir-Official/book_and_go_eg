import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

// --- الإعدادات الأساسية ---
const locales = ["en", "ar"];
const PUBLIC_ROUTES = ["/login"];
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// --- middleware الخاص بالترجمة ---
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: "en",
  localePrefix: "as-needed",
});

// --- الـ Middleware الرئيسي (يجب أن يكون async) ---
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const pathWithoutLocale =
    pathname.replace(new RegExp(^/(${locales.join("|")})), "") || "/";
  const isPublicPath = PUBLIC_ROUTES.includes(pathWithoutLocale);

  let isTokenValid = false;

  // التحقق من صلاحية التوكن فقط إذا كان موجودًا
  if (token) {
    try {
      // إرسال طلب إلى الـ Backend للتحقق من التوكن
      const response = await fetch(${API_URL}/auth/verify, {
        method: "GET",
        headers: {
          Authorization: Bearer ${token},
        },
      });
      // إذا كانت الاستجابة ناجحة (status 200)، فالتوكن صالح
      if (response.ok) {
        isTokenValid = true;
      }
    } catch (error) {
      // في حال وجود خطأ في الشبكة، نعتبر التوكن غير صالح
      console.error("Error verifying token in middleware:", error);
      isTokenValid = false;
    }
  }

  // --- منطق إعادة التوجيه بناءً على صلاحية التوكن ---

  // الحالة (أ): التوكن صالح والمستخدم يحاول زيارة صفحة عامة (مثل /login)
  if (isTokenValid && isPublicPath) {
    const locale = locales.find((l) => pathname.startsWith(/${l})) || "";
    return NextResponse.redirect(new URL(${locale}/dashboard, request.url));
  }

  // الحالة (ب): التوكن غير صالح والمستخدم يحاول زيارة صفحة محمية
  if (!isTokenValid && !isPublicPath) {
    const locale = locales.find((l) => pathname.startsWith(/${l})) || "";
    const loginUrl = new URL(${locale}/login, request.url);
    // حفظ الصفحة التي كان المستخدم يحاول الوصول إليها
    if (pathWithoutLocale !== "/") {
      loginUrl.searchParams.set("from", pathWithoutLocale);
    }
    return NextResponse.redirect(loginUrl);
  }

  // في جميع الحالات الأخرى، اسمح لـ middleware الترجمة بالعمل
  return intlMiddleware(request);
}

// --- إعدادات الـ Matcher ---
export const config = {
  // هذا يضمن أن الـ middleware لن يعمل على مسارات الـ API أو الملفات الثابتة
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
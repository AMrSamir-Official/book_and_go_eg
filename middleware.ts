// middleware.ts

// ✅ استيراد jose
import * as jose from "jose";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const locales = ["en", "ar"];
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: "en",
  localePrefix: "as-needed",
});
const PUBLIC_ROUTES = ["/login"];
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || "fake-dev-secret";

// ✅ يجب أن تصبح الدالة async
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const pathWithoutLocale =
    pathname.replace(new RegExp(`^/(${locales.join("|")})`), "") || "/";
  const isPublicPath = PUBLIC_ROUTES.includes(pathWithoutLocale);

  let isTokenValid = false;
  if (token) {
    try {
      // ✅ استخدام jose للتحقق من التوكن
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jose.jwtVerify(token, secret);
      isTokenValid = true;
    } catch (error) {
      isTokenValid = false;
    }
  }

  if (isTokenValid && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isTokenValid && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    if (pathWithoutLocale !== "/") {
      loginUrl.searchParams.set("from", pathWithoutLocale);
    }
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

import Cookies from "js-cookie";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
// ✅ الخطوة 1: استيراد المكتبة الجديدة 'jose'
import * as jose from "jose";

// --- Interfaces (تبقى كما هي) ---
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  avatar?: string;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  hasPermission: (permission: string) => boolean;
  canAccessRoute: (route: string) => boolean;
}

// --- الثوابت ---
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || "fake-dev-secret";
const secretKey = new TextEncoder().encode(JWT_SECRET);

// --- Zustand Store (useAuthStore) ---
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true, // ابدأ بـ true حتى تتم عملية التحقق الأولية

      login: (user) => {
        // ✅ تم التبسيط: فقط قم بتحديث الحالة. لا تضع أي كوكيز هنا.
        set({ user, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        // ✅ تم التبسيط: فقط قم بإزالة الكوكي الصحيح.
        Cookies.remove("token", { path: "/" });
        set({ user: null, isAuthenticated: false, isLoading: false });
      },

      updateUser: (user) => set({ user }),
      setLoading: (loading) => set({ isLoading: loading }),

      // --- دوال الصلاحيات (تبقى كما هي) ---
      hasPermission: (permission) => {
        const { user } = get();
        return (
          user?.permissions?.includes(permission) ||
          user?.role === "admin" ||
          false
        );
      },
      canAccessRoute: (route) => {
        const { user, isAuthenticated } = get();
        if (!isAuthenticated) return false;
        if (route.startsWith("/admin")) {
          return user?.role === "admin";
        }
        const protectedRoutes = [
          "/dashboard",
          "/bookings",
          "/invoices",
          "/profile",
          "/notifications",
          "/dues",
        ];
        if (protectedRoutes.some((r) => route.startsWith(r))) {
          return isAuthenticated;
        }
        return true;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // ✅ تم تحديث onRehydrateStorage لاستخدام 'jose'
      onRehydrateStorage: () => (state) => {
        const token = Cookies.get("token");
        if (token) {
          jose
            .jwtVerify(token, secretKey)
            .then((result) => {
              // ✅ تم إصلاح خطأ TypeScript هنا
              // إذا نجح التحقق، قم بتسجيل دخول المستخدم بالبيانات من التوكن
              state?.login(result.payload as unknown as User);
            })
            .catch(() => {
              // إذا فشل التحقق (توكن غير صالح)، احذف الكوكي
              Cookies.remove("token", { path: "/" });
              state?.setLoading(false);
            });
        } else {
          state?.setLoading(false);
        }
      },
    }
  )
);

// --- دالة المصادقة (authenticateUser) ---
export const authenticateUser = async (
  email: string,
  password: string
): Promise<User | null> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  let user: User | null = null;

  // --- منطق التحقق من بيانات المستخدم (يبقى كما هو) ---
  if (email === "admin@bookandgo.com" && password === "admin123") {
    user = {
      id: "1",
      name: "Admin User",
      email,
      role: "admin",
      permissions: ["all"],
      avatar: "/placeholder.svg?text=AU",
    };
  }
  if (email === "user@bookandgo.com" && password === "user123") {
    user = {
      id: "2",
      name: "Regular User",
      email,
      role: "user",
      permissions: ["bookings", "invoices"],
      avatar: "/placeholder.svg?text=RU",
    };
  }
  // --- نهاية منطق التحقق ---

  if (user) {
    try {
      // ✅ استخدام 'jose' لإنشاء التوكن
      const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        avatar: user.avatar,
      };

      const token = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d") // مدة الصلاحية
        .sign(secretKey);

      console.log("JWT Token generated successfully with 'jose'.");

      // حفظ التوكن في الكوكي
      Cookies.set("token", token, {
        expires: 7,
        path: "/",
        sameSite: "Lax",
        secure: process.env.NODE_ENV === "production",
      });
    } catch (e) {
      console.error(
        "!!! ERROR during JWT signing or cookie setting with 'jose':",
        e
      );
    }
  }

  return user;
};

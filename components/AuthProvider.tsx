"use client";

import { useAuthStore } from "@/lib/auth";
import { User } from "@/lib/session";
import { useRef } from "react";

// 1. أضف "token" إلى الواجهة
interface AuthProviderProps {
  user: User | null;
  token: string | null; // <-- الإضافة هنا
  children: React.ReactNode;
}

/**
 * هذا المكون يقوم بتهيئة مخزن Zustand
 * ببيانات المستخدم والتوكن القادمين من الخادم.
 */
export default function AuthProvider({
  user,
  token,
  children,
}: AuthProviderProps) {
  const initialized = useRef(false);

  if (!initialized.current) {
    // 2. قم بتمرير المستخدم والتوكن إلى دالة التهيئة
    useAuthStore.getState().initialize(user, token);
    initialized.current = true;
  }

  // 3. اعرض باقي التطبيق
  return <>{children}</>;
}

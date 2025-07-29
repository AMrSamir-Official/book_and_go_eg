// lib/session.ts

import { cookies } from "next/headers";
import "server-only"; // يضمن أن هذا الكود يعمل على الخادم فقط

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// واجهة لبيانات المستخدم لتسهيل التعامل معها
export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "admin" | "user";
  isActive: boolean; // من ملف الواجهة
  lastLogin?: string; // اختياري لأنه قد لا يكون موجودًا دائمًا
  createdAt: string; // مطلوب حسب رسالة الخطأ
  avatar?: string;
  // أضف أي خصائص أخرى تحتاجها
  //   bookingsCount: number;
  //   invoicesCount: number;
}

export async function getCurrentUser(): Promise<User | null> {
  // 1. قراءة التوكن من الكوكي الآمن
  const token = (await cookies()).get("token")?.value;

  // إذا لم يكن هناك توكن، فالمستخدم غير مسجل دخوله
  if (!token) {
    return null;
  }

  try {
    // 2. استدعاء الـ Backend للتحقق من التوكن وجلب بيانات المستخدم
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // cache: 'no-store' يضمن جلب أحدث بيانات للمستخدم مع كل طلب
      cache: "no-store",
    });

    if (!response.ok) {
      // إذا فشل التحقق، فالتوكن غير صالح
      return null;
    }

    const data = await response.json();

    // 3. إرجاع بيانات المستخدم إذا كان كل شيء على ما يرام
    return data.data.user as User;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null; // في حالة وجود أي خطأ، نعتبر المستخدم غير مسجل
  }
}

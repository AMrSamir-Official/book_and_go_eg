"use server"; // <-- هذا السطر يخبر Next.js أن الكود في هذا الملف يعمل على الخادم فقط

import { cookies } from "next/headers";

// تأكد من وضع رابط الـ Backend API في متغيرات البيئة في ملف .env.local
// مثال: NEXT_PUBLIC_API_URL=http://localhost:5000/api
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// يمكن استخدام interface لتحديد شكل الحالة التي يتم إرجاعها
interface ActionState {
  message?: string;
  success?: boolean;
  redirectTo?: string;
}

export async function loginAction(
  previousState: ActionState | undefined,
  formData: FormData
) {
  // 1. قراءة البيانات مباشرة من الفورم
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const locale = (formData.get("locale") as string) || "en";
  // التحقق المبدئي من المدخلات
  if (!email || !password) {
    return { message: "البريد الإلكتروني وكلمة المرور مطلوبان." };
  }

  try {
    // 2. إرسال طلب إلى الـ Express Backend من خادم Next.js (أكثر أمانًا)
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    // 3. التعامل مع الردود غير الناجحة من الـ API
    if (!response.ok || !data.success) {
      // إرجاع رسالة الخطأ لعرضها للمستخدم في الفورم
      return { message: data.message || "فشل تسجيل الدخول. تحقق من بياناتك." };
    }

    // 4. عند النجاح، استخراج التوكن وتخزينه في كوكي آمن
    const { token } = data.data;
    (await cookies()).set("token", token, {
      httpOnly: true, // <-- أهم ميزة: لا يمكن الوصول للكوكي من خلال JavaScript في المتصفح
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 أيام
      path: "/",
      sameSite: "lax",
    });
  } catch (error) {
    console.error("Login Action Error:", error);
    return { message: "حدث خطأ في الشبكة أو في الخادم. حاول مرة أخرى." };
  }

  // 5. إذا نجحت كل الخطوات، قم بإعادة توجيه المستخدم إلى لوحة التحكم
  return {
    success: true,
    redirectTo: `/${locale}/dashboard`,
  };
}

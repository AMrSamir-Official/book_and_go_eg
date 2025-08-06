// src/actions/bookingActions.ts

"use server";

import { BookingTypes } from "@/types/bookingData";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// تأكد من أن هذا المسار صحيح لملف صفحتك

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://45.151.142.147:5000/api";

export async function createBookingAction(data: BookingTypes) {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return { success: false, message: "Authentication failed. Please log in." };
  }

  // التأكد من أن الحقول الرقمية هي أرقام بالفعل
  const cleanedData = {
    ...data,
    paxCount: Number(data.paxCount) || 0,
    numberOfNights: Number(data.numberOfNights) || 0,
    dailyProgram: data.dailyProgram.map((p) => ({
      ...p,
      day: Number(p.day) || 0,
    })),
    cairoTransfer: {
      ...data.cairoTransfer,
      paxCount: Number(data.cairoTransfer.paxCount) || 0,
      days: data.cairoTransfer.days.map((d) => ({
        ...d,
        day: Number(d.day) || 0,
      })),
    },
    aswanLuxorTransfer: {
      ...data.aswanLuxorTransfer,
      paxCount: Number(data.aswanLuxorTransfer.paxCount) || 0,
      days: data.aswanLuxorTransfer.days.map((d) => ({
        ...d,
        day: Number(d.day) || 0,
      })),
    },
    meetingAssist: {
      ...data.meetingAssist,
      paxCount: Number(data.meetingAssist.paxCount) || 0,
    },
    guides: data.guides.map((g) => ({
      ...g,
      paxAdults: Number(g.paxAdults) || 0,
      paxChildren: Number(g.paxChildren) || 0,
      days: g.days.map((d) => ({ ...d, day: Number(d.day) || 0 })),
    })),
  };

  try {
    const response = await fetch(`${API_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cleanedData),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Failed to create booking.",
      };
    }

    revalidatePath("/bookings");
  } catch (error) {
    console.error("Server Action Error:", error);
    return { success: false, message: "An unexpected network error occurred." };
  }

  redirect(`/bookings`);
}
// أضف هذا الكود في ملف src/actions/bookingActions.ts

export async function deleteBookingAction(bookingId: string) {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return { success: false, message: "Authentication failed." };
  }

  try {
    const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const result = await response.json();
      return {
        success: false,
        message: result.message || "Failed to delete booking.",
      };
    }

    revalidatePath("/bookings"); // لتحديث قائمة الحجوزات تلقائياً
    return { success: true, message: "Booking deleted successfully." };
  } catch (error) {
    return { success: false, message: "An unexpected error occurred." };
  }
}
// أضف هذا الكود في نهاية ملف: src/actions/bookingActions.ts

export async function getBookingByIdAction(bookingId: string) {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    // لا يوجد مستخدم مسجل الدخول
    return { success: false, message: "Authentication failed." };
  }

  try {
    const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // مهم جداً: لمنع Next.js من تخزين النتائج بشكل دائم (caching)
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      // هذا يعالج أخطاء "Not Found" و "Access Denied" من الباك إند
      return {
        success: false,
        message: result.message || "Failed to fetch booking.",
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Get Booking Action Error:", error);
    return { success: false, message: "An unexpected server error occurred." };
  }
}
///new things
// أضف هذا الكود في نهاية ملف: src/actions/bookingActions.ts

export async function updateBookingAction(
  bookingId: string,
  data: BookingTypes
) {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return { success: false, message: "Authentication failed." };
  }

  // تنظيف البيانات والتأكد من أنواعها الصحيحة
  const cleanedData = {
    ...data,
    paxCount: Number(data.paxCount) || 0,
    numberOfNights: Number(data.numberOfNights) || 0,
    // ... (باقي عمليات التنظيف كما في دالة الإنشاء)
  };

  try {
    const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
      method: "PUT", // استخدام PUT للتحديث
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cleanedData),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Failed to update booking.",
      };
    }

    // تحديث الكاش لصفحة التفاصيل وصفحة القائمة
    revalidatePath(`/bookings/${bookingId}`);
    revalidatePath("/bookings");
  } catch (error) {
    console.error("Update Booking Action Error:", error);
    return { success: false, message: "An unexpected server error occurred." };
  }

  // إعادة التوجيه إلى صفحة التفاصيل بعد التحديث
  redirect(`/bookings/${bookingId}`);
}
//
// أضف هاتين الدالتين في نهاية ملف bookingActions.ts

// دالة لجلب كل الحجوزات
export async function getAllBookingsAction() {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return { success: false, message: "Authentication failed." };
  }

  try {
    const response = await fetch(`${API_URL}/bookings`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Failed to fetch bookings.",
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Get All Bookings Action Error:", error);
    return { success: false, message: "An unexpected server error occurred." };
  }
}

// دالة لجلب إحصائيات الحجوزات
export async function getBookingStatsAction() {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return { success: false, message: "Authentication failed." };
  }

  try {
    const response = await fetch(`${API_URL}/bookings/stats/summary`, {
      // <-- استدعاء الرابط الجديد
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Failed to fetch booking stats.",
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Get Booking Stats Action Error:", error);
    return { success: false, message: "An unexpected server error occurred." };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// دالة مساعدة للحصول على التوكن
async function getAuthHeader() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}

// Action لجلب كل الإشعارات
export async function getAllNotificationsAction() {
  const headers = await getAuthHeader();
  if (!headers) return { success: false, message: "Authentication failed." };

  try {
    // تأكد من أن الرابط يطلب البيانات المرتبطة (populate)
    const response = await fetch(
      `${API_URL}/notifications?populate=dueId,invoiceId`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );
    const result = await response.json();
    if (!response.ok)
      return {
        success: false,
        message: result.message || "Failed to fetch notifications.",
      };
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, message: "A server error occurred." };
  }
}

// Action لوضع علامة "مقروء" على إشعار واحد
export async function markNotificationAsReadAction(id: string) {
  const headers = await getAuthHeader();
  if (!headers) return { success: false, message: "Authentication failed." };

  try {
    const response = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: "POST",
      headers,
    });
    if (!response.ok)
      return { success: false, message: "Failed to mark as read." };
    revalidatePath("/notifications"); // تحديث البيانات في الصفحة
    return { success: true, message: "Notification marked as read." };
  } catch (error) {
    return { success: false, message: "A server error occurred." };
  }
}

// Action لوضع علامة "مقروء" على كل الإشعارات
export async function markAllNotificationsAsReadAction() {
  const headers = await getAuthHeader();
  if (!headers) return { success: false, message: "Authentication failed." };

  try {
    const response = await fetch(`${API_URL}/notifications/read-all`, {
      method: "POST",
      headers,
    });
    if (!response.ok)
      return { success: false, message: "Failed to mark all as read." };
    revalidatePath("/notifications");
    return { success: true, message: "All notifications marked as read." };
  } catch (error) {
    return { success: false, message: "A server error occurred." };
  }
}
// أضف هذه الدالة إلى نهاية الملف
export async function deleteNotificationAction(id: string) {
  const headers = await getAuthHeader();
  if (!headers) return { success: false, message: "Authentication failed." };

  try {
    const response = await fetch(`${API_URL}/notifications/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!response.ok)
      return { success: false, message: "Failed to delete notification." };
    revalidatePath("/notifications");
    return { success: true, message: "Notification deleted." };
  } catch (error) {
    return { success: false, message: "A server error occurred." };
  }
}
// أضف هذه الدالة لجلب آخر 10 إشعارات
export async function getLatestNotificationsAction() {
  const headers = await getAuthHeader();
  if (!headers) return { success: false, message: "Auth failed." };

  try {
    const response = await fetch(
      `${API_URL}/notifications?limit=10&populate=dueId,invoiceId`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );
    const result = await response.json();
    if (!response.ok) return { success: false, data: [] };
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, data: [] };
  }
}

// أضف هذه الدالة لجلب عدد الإشعارات غير المقروءة
export async function getUnreadNotificationsCountAction() {
  const headers = await getAuthHeader();
  if (!headers) return { success: false, message: "Auth failed." };

  try {
    const response = await fetch(`${API_URL}/notifications/unread-count`, {
      method: "GET",
      headers,
      cache: "no-store",
    });
    const result = await response.json();
    if (!response.ok) return { success: false, data: { count: 0 } };
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, data: { count: 0 } };
  }
}

// app/admin/users/page.tsx

import { cookies } from "next/headers";
import "server-only";
import { AdminUsersContent } from "./admin-users-content"; // افترضت أن هذا هو مسار المكون

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://45.151.142.147:5000/api";
// app/admin/users/page.tsx

async function getUsers() {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    console.error("[DEBUG] No token found in cookies.");
    return [];
  }

  try {
    const response = await fetch(`${API_URL}/admin/users?limit=50`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      // هذا هو السجل الأهم الذي سيكشف المشكلة
      const errorBody = await response.text(); // نقرأ الخطأ كنص لتجنب مشاكل JSON
      console.error(
        `[DEBUG] API Error: Status ${response.status}. Body:`,
        errorBody
      );
      return [];
    }

    const data = await response.json();
    return data.data.users || [];
  } catch (error) {
    console.error("[DEBUG] Network or fetch error:", error);
    return [];
  }
}

export default async function AdminUsersPage() {
  // جلب البيانات على الخادم قبل عرض الصفحة
  const initialUsers = await getUsers();

  // تمرير البيانات الأولية كمـ prop إلى مكون العميل
  return <AdminUsersContent initialUsers={initialUsers} />;
}

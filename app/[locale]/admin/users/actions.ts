"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://45.151.142.147:5000/api";

// واجهة لبيانات المستخدم لتسهيل التعامل معها
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  isActive: boolean;
}

// دالة لإنشاء مستخدم جديد
export async function createUserAction(formData: FormData) {
  const token = (await cookies()).get("token")?.value;
  if (!token) return { success: false, message: "Authentication failed." };

  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  };

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(rawData),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Failed to create user.",
      };
    }

    revalidatePath("/admin/users");
    return { success: true, message: "User created successfully!" };
  } catch (error) {
    return { success: false, message: "An unexpected error occurred." };
  }
}

// دالة لحذف مستخدم
export async function deleteUserAction(userId: string) {
  const token = (await cookies()).get("token")?.value;
  if (!token) return { success: false, message: "Authentication failed." };

  try {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const result = await response.json();
      return {
        success: false,
        message: result.message || "Failed to delete user.",
      };
    }

    revalidatePath("/admin/users");
    return { success: true, message: "User deleted." };
  } catch (error) {
    return { success: false, message: "An unexpected error occurred." };
  }
}

// ✅ الكود الناقص: دالة لتحديث بيانات المستخدم
export async function updateUserAction(
  userId: string,
  dataToUpdate: Partial<User>
) {
  const token = (await cookies()).get("token")?.value;
  if (!token) return { success: false, message: "Authentication failed." };

  try {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataToUpdate),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Failed to update user.",
      };
    }

    revalidatePath("/admin/users");
    // إرجاع البيانات المحدثة لتحديث الواجهة فورًا
    return {
      success: true,
      data: result.data.user as User,
      message: "User updated successfully.",
    };
  } catch (error) {
    return { success: false, message: "An unexpected error occurred." };
  }
}

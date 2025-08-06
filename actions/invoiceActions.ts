// src/actions/invoiceActions.ts

"use server";

import { InvoiceFormData } from "@/app/[locale]/invoices/new/new-invoice-client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// سنقوم بتصدير هذا النوع من ملف العميل لاحقاً

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://45.151.142.147:5000/api";

export async function createInvoiceAction(data: InvoiceFormData) {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return {
      success: false,
      message: "Authentication failed. Admin access required.",
    };
  }

  try {
    const response = await fetch(`${API_URL}/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Failed to create invoice.",
      };
    }

    revalidatePath("/invoices"); // تحديث الكاش لقائمة الفواتير
    revalidatePath("/bookings"); // تحديث الكاش لقائمة الحجوزات (لإظهار أن الحجز أصبح له فاتورة)
  } catch (error) {
    console.error("Create Invoice Action Error:", error);
    return { success: false, message: "An unexpected server error occurred." };
  }

  // إعادة التوجيه إلى صفحة الفواتير الرئيسية عند النجاح
  redirect(`/invoices`);
}
// أضف هذا الكود في نهاية ملف: src/actions/invoiceActions.ts

export async function getInvoiceByIdAction(invoiceId: string) {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return {
      success: false,
      message: "Authentication failed. Admin access required.",
    };
  }

  // The backend API already protects this route for admins
  try {
    const response = await fetch(`${API_URL}/invoices/${invoiceId}`, {
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
        message: result.message || "Failed to fetch invoice.",
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, message: "An unexpected server error occurred." };
  }
}
// أضف هذه الدالة إلى نهاية ملف invoiceActions.ts

export async function updateInvoiceAction(
  invoiceId: string,
  data: InvoiceFormData
) {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return { success: false, message: "Authentication failed." };
  }

  try {
    const response = await fetch(`${API_URL}/invoices/${invoiceId}`, {
      method: "PUT", // استخدام PUT للتحديث
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Failed to update invoice.",
      };
    }

    revalidatePath(`/invoices`);
    revalidatePath(`/invoices/${invoiceId}`);
  } catch (error) {
    return { success: false, message: "An unexpected server error occurred." };
  }

  redirect(`/invoices/${invoiceId}`);
}
// أضف هذه الدوال في نهاية ملفك

// دالة جديدة لجلب كل الفواتير
export async function getAllInvoicesAction() {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return { success: false, message: "Authentication failed." };
  }

  try {
    const response = await fetch(`${API_URL}/invoices`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store", // لضمان جلب أحدث البيانات دائماً
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Failed to fetch invoices.",
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Get All Invoices Action Error:", error);
    return { success: false, message: "An unexpected server error occurred." };
  }
}

// دالة جديدة لحذف فاتورة
export async function deleteInvoiceAction(invoiceId: string) {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return { success: false, message: "Authentication failed." };
  }

  try {
    const response = await fetch(`${API_URL}/invoices/${invoiceId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const result = await response.json();
      return {
        success: false,
        message: result.message || "Failed to delete invoice.",
      };
    }

    revalidatePath("/invoices"); // تحديث الكاش بعد الحذف
    return { success: true, message: "Invoice deleted successfully." };
  } catch (error) {
    console.error("Delete Invoice Action Error:", error);
    return { success: false, message: "An unexpected server error occurred." };
  }
}
//

// أضف هذه الدالة في نهاية ملف invoiceActions.ts

export async function getInvoiceStatsAction() {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return { success: false, message: "Authentication failed." };
  }

  try {
    const response = await fetch(`${API_URL}/invoices/stats/summary`, {
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
        message: result.message || "Failed to fetch invoice stats.",
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Get Invoice Stats Action Error:", error);
    return { success: false, message: "An unexpected server error occurred." };
  }
}
// أضف هذا الكود في نهاية ملف src/actions/invoiceActions.ts

// دالة لجلب كل المستحقات المالية المعلقة
export async function getAllPendingFinancialsAction() {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return { success: false, message: "Authentication failed." };
  }

  try {
    const response = await fetch(`${API_URL}/invoices/financials/pending`, {
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
        message: result.message || "Failed to fetch pending financials.",
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Get Pending Financials Action Error:", error);
    return { success: false, message: "An unexpected server error occurred." };
  }
}

// دالة لتحديث حالة الفاتورة إلى "مدفوعة"
export async function markInvoiceAsPaidAction(invoiceId: string) {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return { success: false, message: "Authentication failed." };
  }

  try {
    const response = await fetch(`${API_URL}/invoices/${invoiceId}/mark-paid`, {
      method: "PATCH", // استخدام PATCH لتحديث جزئي
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Failed to update invoice status.",
      };
    }

    revalidatePath("/pending-financials"); // تحديث الكاش لهذه الصفحة
    revalidatePath("/invoices"); // تحديث الكاش لصفحة الفواتير أيضاً
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Mark Invoice As Paid Action Error:", error);
    return { success: false, message: "An unexpected server error occurred." };
  }
}

// أضف هذه الدالة الجديدة في نهاية ملفك

// دالة لجلب كل البنود المفردة المعلقة من كل الفواتير
export async function getPendingInvoiceItemsAction() {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return { success: false, message: "Authentication failed." };
  }

  try {
    const response = await fetch(`${API_URL}/invoices/items/pending`, {
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
        message: result.message || "Failed to fetch pending items.",
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Get Pending Invoice Items Action Error:", error);
    return { success: false, message: "An unexpected server error occurred." };
  }
}
//new

// أضف هذه الدالة الجديدة في نهاية ملف invoiceActions.ts

export async function markInvoiceItemAsPaidAction(
  invoiceId: string,
  itemId: string,
  itemType: string
) {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return { success: false, message: "Authentication failed." };
  }

  try {
    const response = await fetch(`${API_URL}/invoices/items/mark-paid`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ invoiceId, itemId, itemType }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Failed to update item status.",
      };
    }

    revalidatePath("/pending-items"); // تحديث الكاش لهذه الصفحة
    return { success: true, message: "Item marked as paid." };
  } catch (error) {
    console.error("Mark Invoice Item As Paid Action Error:", error);
    return { success: false, message: "An unexpected server error occurred." };
  }
}

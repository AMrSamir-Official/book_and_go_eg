"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// You can define this in a central place if you use it often
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Helper to get the token
async function getAuthHeader() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}

// Action to GET all dues
export async function getAllDuesAction() {
  const headers = await getAuthHeader();
  if (!headers) return { success: false, message: "Authentication failed." };

  try {
    const response = await fetch(`${API_URL}/dues`, {
      method: "GET",
      headers,
      cache: "no-store",
    });
    const result = await response.json();
    if (!response.ok)
      return {
        success: false,
        message: result.message || "Failed to fetch dues.",
      };
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, message: "A server error occurred." };
  }
}

// Action to POST a new due
export async function createDueAction(formData: any) {
  const headers = await getAuthHeader();
  if (!headers) return { success: false, message: "Authentication failed." };

  try {
    const response = await fetch(`${API_URL}/dues`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
      const result = await response.json();
      return {
        success: false,
        message: result.message || "Failed to create entry.",
      };
    }
    revalidatePath("/dues");
    return { success: true, message: "Entry created successfully." };
  } catch (error) {
    return { success: false, message: "A server error occurred." };
  }
}

// Action to PUT (update) a due
export async function updateDueAction(id: string, formData: any) {
  const headers = await getAuthHeader();
  if (!headers) return { success: false, message: "Authentication failed." };

  try {
    const response = await fetch(`${API_URL}/dues/${id}`, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
      const result = await response.json();
      return {
        success: false,
        message: result.message || "Failed to update entry.",
      };
    }
    revalidatePath("/dues");
    return { success: true, message: "Entry updated successfully." };
  } catch (error) {
    return { success: false, message: "A server error occurred." };
  }
}

// Action to DELETE a due
export async function deleteDueAction(id: string) {
  const headers = await getAuthHeader();
  if (!headers) return { success: false, message: "Authentication failed." };

  try {
    const response = await fetch(`${API_URL}/dues/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) {
      const result = await response.json();
      return {
        success: false,
        message: result.message || "Failed to delete entry.",
      };
    }
    revalidatePath("/dues");
    return { success: true, message: "Entry deleted successfully." };
  } catch (error) {
    return { success: false, message: "A server error occurred." };
  }
}

// Action to PATCH (mark as paid) a due
export async function markDueAsPaidAction(id: string) {
  const headers = await getAuthHeader();
  if (!headers) return { success: false, message: "Authentication failed." };

  try {
    const response = await fetch(`${API_URL}/dues/${id}/pay`, {
      method: "PATCH",
      headers,
    });
    if (!response.ok) {
      const result = await response.json();
      return {
        success: false,
        message: result.message || "Failed to update status.",
      };
    }
    revalidatePath("/dues");
    return { success: true, message: "Entry marked as paid." };
  } catch (error) {
    return { success: false, message: "A server error occurred." };
  }
}

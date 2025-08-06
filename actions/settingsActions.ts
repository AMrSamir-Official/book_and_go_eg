"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const API_URL_app =
  process.env.NEXT_PUBLIC_API_URL || "http://45.151.142.147:5000/api";
const API_URL = API_URL_app + "/settings";
// UPDATED: The Resource type now includes the new models
type Resource =
  | "cities"
  | "hotels"
  | "vans"
  | "guides"
  | "nationalities"
  | "sites"
  | "extraIncomingTypes"
  | "nileCruises"
  | "vendors"
  | "supplier"
  | "domesticAirlines"
  | "internationalAirlines";

async function getAuthHeaders() {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    throw new Error("Authentication token not found.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchData(resource: Resource) {
  const fullUrl = `${API_URL}/${resource}`;
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(fullUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch data.");
    }
    const data = await response.json();
    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function saveItem(resource: Resource, data: any, id?: string) {
  try {
    const headers = await getAuthHeaders();
    const url = id ? `${API_URL}/${resource}/${id}` : `${API_URL}/${resource}`;
    const method = id ? "PUT" : "POST";
    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to save ${resource}.`);
    }
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteItem(resource: Resource, id: string) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/${resource}/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!response.ok && response.status !== 204) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to delete ${resource}.`);
    }
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// UPDATED: This function now fetches the new specific data lists
export async function fetchAllBookingFormData() {
  try {
    const resources: Resource[] = [
      "cities",
      "vans",
      "nationalities",
      "nileCruises",
      "hotels",
      "guides",
      "sites",
      "extraIncomingTypes",
      "vendors",
      "supplier",
      "domesticAirlines",
      "internationalAirlines",
    ];
    const results = await Promise.all(
      resources.map((resource) => fetchData(resource))
    );
    const data: { [key: string]: any[] } = {};
    for (let i = 0; i < resources.length; i++) {
      const resourceName = resources[i];
      const result = results[i];
      if (result.error) {
        throw new Error(`Failed to fetch ${resourceName}: ${result.error}`);
      }
      data[resourceName] = result.data;
    }
    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}

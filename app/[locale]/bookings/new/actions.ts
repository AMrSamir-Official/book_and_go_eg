// src/actions/bookingActions.ts

"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// تأكد من أن هذا المسار صحيح لملف صفحتك

import { BookingTypes } from "@/types/bookingData";

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
      paxCount: Number(data.meetingAssist.paxAdults) || 0,
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

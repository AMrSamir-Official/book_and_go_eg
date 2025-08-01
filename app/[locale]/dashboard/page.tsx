// src/app/[locale]/dashboard/page.tsx

import {
  getAllBookingsAction,
  getBookingStatsAction,
} from "@/actions/bookingActions";
import {
  getAllInvoicesAction,
  getInvoiceStatsAction,
} from "@/actions/invoiceActions";
import type { Metadata } from "next";
import { DashboardContent } from "./dashboard-content"; // سنقوم بتعديل هذا الملف تالياً

export const metadata: Metadata = {
  title: "Dashboard - Book & Go Travel",
  description: "Travel management dashboard overview",
};

export default async function DashboardPage() {
  // جلب كل البيانات والإحصائيات المطلوبة في نفس الوقت لتحسين الأداء
  const [
    invoiceStatsResult,
    bookingStatsResult,
    recentInvoicesResult,
    recentBookingsResult,
  ] = await Promise.all([
    getInvoiceStatsAction(),
    getBookingStatsAction(),
    getAllInvoicesAction(),
    getAllBookingsAction(),
  ]);

  // تمرير البيانات إلى مكون العرض
  return (
    <DashboardContent
      invoiceStats={invoiceStatsResult.data}
      bookingStats={bookingStatsResult.data}
      recentInvoices={recentInvoicesResult.data}
      recentBookings={recentBookingsResult.data}
    />
  );
}

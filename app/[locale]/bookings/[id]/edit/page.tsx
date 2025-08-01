// src/app/[locale]/bookings/[id]/edit/page.tsx

import { getBookingByIdAction } from "@/actions/bookingActions";
import type { Metadata } from "next";
import { EditBookingPageClient } from "./edit-booking-page-client";

export const metadata: Metadata = {
  title: "Edit Booking - Book & Go Travel",
  description: "Modify booking information",
};

export default async function EditBookingPage({
  params,
}: {
  params: { id: string };
}) {
  // جلب بيانات الحجز الحالية من السيرفر
  const result = await getBookingByIdAction(params.id);

  const bookingData = result.success ? result.data : null;

  if (!bookingData) {
    return (
      <div className="text-center p-8">
        Booking not found or you do not have permission to edit it.
      </div>
    );
  }

  // تمرير البيانات إلى المكون العميل
  return <EditBookingPageClient booking={bookingData} />;
}

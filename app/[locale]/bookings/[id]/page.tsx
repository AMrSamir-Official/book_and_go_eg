import { getBookingByIdAction } from "@/actions/bookingActions"; // تأكد من صحة المسار
import type { Metadata } from "next";
import { BookingViewPageClient } from "./booking-view-page-client";
export const metadata: Metadata = {
  title: "Booking Details - Book & Go Travel",
  description: "View detailed booking information",
};

export default async function BookingViewPage({
  params,
}: {
  params: { id: string };
}) {
  // جلب البيانات على السيرفر
  const result = await getBookingByIdAction(params.id);

  // استخراج البيانات أو رسالة الخطأ
  const bookingData = result.success ? result.data : null;
  const errorMessage = result.success ? null : result.message;

  // تمرير البيانات إلى المكون العميل
  return (
    <BookingViewPageClient booking={bookingData} errorMessage={errorMessage} />
  );
}

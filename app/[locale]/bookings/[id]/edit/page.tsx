// المسار: /app/[locale]/bookings/[id]/edit/page.tsx

import { getBookingByIdAction } from "@/actions/bookingActions";
import { fetchAllBookingFormData } from "@/actions/settingsActions";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  // جلب بيانات الحجز الحالية وقوائم النموذج في نفس الوقت لتحسين الأداء
  const [bookingResult, formDataResult] = await Promise.all([
    getBookingByIdAction(params.id),
    fetchAllBookingFormData(),
  ]);

  // التحقق من وجود أخطاء في جلب البيانات
  if (bookingResult.error || formDataResult.error) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">
                Error Loading Page Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Could not load required data. Please try again later.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {bookingResult.error && `Booking Error: ${bookingResult.error}`}
                {formDataResult.error &&
                  `Form Data Error: ${formDataResult.error}`}
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const bookingData = bookingResult.data;
  const allFormData = formDataResult.data;

  // تمرير البيانات إلى المكون العميل
  return (
    <EditBookingPageClient booking={bookingData} initialData={allFormData} />
  );
}

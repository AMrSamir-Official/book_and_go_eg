import { getAllBookingsAction } from "@/actions/bookingActions";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ShieldAlert } from "lucide-react";
import { BookingsClientPage } from "./bookings-client"; // سنقوم بإنشاء هذا الملف في الخطوة التالية

export default async function BookingsPage() {
  // 1. جلب البيانات على الخادم باستخدام Server Action
  const result = await getAllBookingsAction();

  // 2. في حالة فشل جلب البيانات، اعرض رسالة خطأ
  if (!result.success) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">
            {result.message || "You do not have permission to view bookings."}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // 3. في حالة النجاح، مرر البيانات إلى مكون العميل
  return <BookingsClientPage initialBookings={result.data} />;
}

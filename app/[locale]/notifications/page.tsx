import { getAllNotificationsAction } from "@/actions/notificationsActions";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ShieldAlert } from "lucide-react";
import NotificationsClientPage from "./notifications-client"; // سنقوم بتعديل هذا الملف لاحقاً

// حول الدالة إلى async
export default async function NotificationsPage() {
  // جلب البيانات على الخادم
  const result = await getAllNotificationsAction();

  // التعامل مع حالة الفشل
  if (!result.success) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold">Error Fetching Data</h2>
          <p className="text-muted-foreground">{result.message}</p>
        </div>
      </DashboardLayout>
    );
  }

  // تمرير البيانات إلى مكون العميل
  return <NotificationsClientPage initialNotifications={result.data} />;
}

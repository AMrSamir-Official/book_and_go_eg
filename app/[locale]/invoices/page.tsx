// src/app/[locale]/invoices/page.tsx

import { getAllInvoicesAction } from "@/actions/invoiceActions";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ShieldAlert } from "lucide-react";
import { InvoicesClientPage } from "./invoices-client"; // سنقوم بإنشاء هذا الملف في الخطوة التالية

export default async function InvoicesPage() {
  const result = await getAllInvoicesAction();

  // في حالة فشل جلب البيانات، اعرض رسالة خطأ
  if (!result.success) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">You do not have permission.</p>
        </div>
      </DashboardLayout>
    );
  }

  // في حالة النجاح، مرر البيانات إلى مكون العميل
  return <InvoicesClientPage initialInvoices={result.data} />;
}

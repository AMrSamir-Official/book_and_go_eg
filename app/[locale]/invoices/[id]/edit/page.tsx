// src/app/[locale]/invoices/[id]/edit/page.tsx

import { getInvoiceByIdAction } from "@/actions/invoiceActions"; // استيراد دالة جلب الفاتورة
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EditInvoicePageClient } from "./edit-invoice-client"; // سنقوم بتغيير اسم الملف العميل

export default async function EditInvoicePage({
  params,
}: {
  params: { id: string };
}) {
  // جلب بيانات الفاتورة الحالية باستخدام ID من الرابط
  const result = await getInvoiceByIdAction(params.id);

  if (!result.success || !result.data) {
    return (
      <DashboardLayout>
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-2 text-destructive">Error</h2>
          <p className="text-muted-foreground">
            {result.message || "Could not find the invoice to edit."}
          </p>
          <Button asChild className="mt-4">
            <Link href="/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Invoices
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // تمرير بيانات الفاتورة الكاملة إلى المكون العميل
  return <EditInvoicePageClient invoice={result.data} />;
}

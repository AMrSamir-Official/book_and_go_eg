// src/app/[locale]/invoices/[id]/edit/page.tsx

import { getInvoiceByIdAction } from "@/actions/invoiceActions";
import { fetchAllBookingFormData } from "@/actions/settingsActions"; // <-- إضافة جديدة
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EditInvoicePageClient } from "./edit-invoice-client";

export default async function EditInvoicePage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch invoice data and form dropdown data concurrently
  const [invoiceResult, formDataResult] = await Promise.all([
    getInvoiceByIdAction(params.id),
    fetchAllBookingFormData(), // <-- إضافة جديدة لجلب بيانات القوائم
  ]);

  // Handle errors for either fetch operation
  if (!invoiceResult.success || formDataResult.error) {
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
                {invoiceResult.message &&
                  `Invoice Error: ${invoiceResult.message}`}
                {formDataResult.error &&
                  `Form Data Error: ${formDataResult.error}`}
              </p>
              <Button asChild className="mt-4">
                <Link href="/invoices">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Invoices
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Pass both invoice data and dropdown data to the client component
  return (
    <EditInvoicePageClient
      invoice={invoiceResult.data}
      initialData={formDataResult.data} // <-- إضافة جديدة
    />
  );
}

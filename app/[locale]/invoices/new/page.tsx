// src/app/[locale]/invoices/new/page.tsx

import { getBookingByIdAction } from "@/actions/bookingActions"; // تأكد أن المجلد actions بحرف صغير
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { NewInvoicePageClient } from "./new-invoice-client"; // سننشئ هذا الملف تالياً

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: { bookingId?: string };
}) {
  const bookingId = searchParams.bookingId;

  if (!bookingId) {
    return (
      <DashboardLayout>
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-2 text-destructive">Error</h2>
          <p className="text-muted-foreground">
            Booking ID is missing. Please create an invoice from the bookings
            page.
          </p>
          <Button asChild className="mt-4">
            <Link href="/bookings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const result = await getBookingByIdAction(bookingId);

  if (!result.success || !result.data) {
    return (
      <DashboardLayout>
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-2 text-destructive">Error</h2>
          <p className="text-muted-foreground">
            {result.message || "Could not find the specified booking."}
          </p>
          <Button asChild className="mt-4">
            <Link href="/bookings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return <NewInvoicePageClient bookingId={bookingId} booking={result.data} />;
}

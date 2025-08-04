// src/app/[locale]/invoices/new/page.tsx

import { getBookingByIdAction } from "@/actions/bookingActions";
import { fetchAllBookingFormData } from "@/actions/settingsActions";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { NewInvoicePageClient } from "./new-invoice-client";

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

  // Fetch booking data and form dropdown data concurrently
  const [bookingResult, formDataResult] = await Promise.all([
    getBookingByIdAction(bookingId),
    fetchAllBookingFormData(),
  ]);

  // Handle errors for either fetch operation
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

  return (
    <NewInvoicePageClient
      bookingId={bookingId}
      booking={bookingResult.data}
      initialData={formDataResult.data}
    />
  );
}

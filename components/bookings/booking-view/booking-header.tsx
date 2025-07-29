"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Edit,
  FileText,
  MessageSquare,
  Printer,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo } from "react";

interface BookingHeaderProps {
  booking: any;
  onPrint: () => void;
  onWhatsApp: () => void;
}

export const BookingHeader = memo(function BookingHeader({
  booking,
  onPrint,
  onWhatsApp,
}: BookingHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex-wrap flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Booking Details</h1>
          <p className="text-muted-foreground">
            File Number: {booking.fileNumber}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        <Button variant="outline" size="sm" onClick={onWhatsApp}>
          <MessageSquare className="mr-2 h-4 w-4" />
          WhatsApp
        </Button>
        <Link href={`/invoices/new?booking=${booking.id}`}>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Create Accounting
          </Button>
        </Link>
        <Link href={`/bookings/${booking.id}/edit`}>
          <Button size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>
    </div>
  );
});

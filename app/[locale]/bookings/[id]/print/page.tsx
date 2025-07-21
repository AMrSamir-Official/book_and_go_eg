import type { Metadata } from "next"
import { BookingPrintView } from "./booking-print-view"

export const metadata: Metadata = {
  title: "Print Booking - Book & Go Travel",
  description: "Print booking details",
}

export default function BookingPrintPage({ params }: { params: { id: string } }) {
  return <BookingPrintView bookingId={params.id} />
}

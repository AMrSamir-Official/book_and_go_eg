import type { Metadata } from "next"
import { BookingViewPageClient } from "./booking-view-page-client"

export const metadata: Metadata = {
  title: "Booking Details - Book & Go Travel",
  description: "View detailed booking information",
}

export default function BookingViewPage({ params }: { params: { id: string } }) {
  return <BookingViewPageClient bookingId={params.id} />
}

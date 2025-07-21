"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users } from "lucide-react"

interface BookingInfoCardProps {
  booking: any
}

export const BookingInfoCard = memo(function BookingInfoCard({ booking }: BookingInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-muted-foreground">File Number</label>
            <p className="text-lg font-semibold">{booking.fileNumber}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Supplier</label>
            <p className="text-lg">{booking.supplier}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Number of Pax</label>
            <p className="text-lg flex items-center">
              <Users className="mr-2 h-4 w-4" />
              {booking.paxCount}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nationality</label>
            <p className="text-lg">{booking.nationality}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Arrival Date</label>
            <p className="text-lg">{booking.arrivalDate}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Departure Date</label>
            <p className="text-lg">{booking.departureDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

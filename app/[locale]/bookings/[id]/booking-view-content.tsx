"use client"

import { memo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BookingHeader } from "@/components/bookings/booking-view/booking-header"
import { BookingInfoCard } from "@/components/bookings/booking-view/booking-info-card"
import { BookingSidebar } from "@/components/bookings/booking-view/booking-sidebar"
import { sampleBookings } from "@/lib/fake-data"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface BookingViewContentProps {
  bookingId: string
}

export const BookingViewContent = memo(function BookingViewContent({ bookingId }: BookingViewContentProps) {
  const router = useRouter()
  const booking = sampleBookings.find((b) => b.id === bookingId)

  const handlePrint = useCallback(() => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Booking Details - ${booking?.fileNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              color: #333;
              line-height: 1.6;
            }
            .header { 
              display: flex; 
              align-items: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
            }
            .logo { 
              font-size: 24px; 
              font-weight: bold; 
              color: #2563eb;
              margin-right: 20px;
            }
            .company-info {
              flex: 1;
              text-align: right;
              font-size: 12px;
              color: #6b7280;
            }
            .title { 
              font-size: 28px; 
              font-weight: bold; 
              margin-bottom: 20px;
              color: #1f2937;
            }
            .section { 
              margin-bottom: 25px; 
              page-break-inside: avoid;
            }
            .section-title { 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 15px;
              color: #374151;
              border-bottom: 1px solid #d1d5db;
              padding-bottom: 5px;
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: repeat(2, 1fr); 
              gap: 15px; 
              margin-bottom: 20px;
            }
            .info-item { 
              display: flex; 
              flex-direction: column;
            }
            .info-label { 
              font-weight: bold; 
              color: #6b7280; 
              font-size: 12px;
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            .info-value { 
              font-size: 14px;
              color: #1f2937;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">✈️ Book & Go Travel</div>
            <div class="company-info">
              <div><strong>Book & Go Travel Agency</strong></div>
              <div>Phone: +20 112 263 6253</div>
              <div>Email: info@bookandgo.com</div>
              <div>Cairo, Egypt</div>
            </div>
          </div>
          
          <div class="title">Travel Operation Form</div>
          
          <div class="section">
            <div class="section-title">Basic Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">File Number</div>
                <div class="info-value">${booking?.fileNumber}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Supplier</div>
                <div class="info-value">${booking?.supplier}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Number of Pax</div>
                <div class="info-value">${booking?.paxCount}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Nationality</div>
                <div class="info-value">${booking?.nationality}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Arrival Date</div>
                <div class="info-value">${booking?.arrivalDate}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Departure Date</div>
                <div class="info-value">${booking?.departureDate}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }
  }, [booking])

  const handleWhatsApp = useCallback(() => {
    if (!booking) return

    const message = `🎫 *BOOKING DETAILS*

📋 *File Number:* ${booking.fileNumber}
🏢 *Supplier:* ${booking.supplier}
👥 *Number of Pax:* ${booking.paxCount}
🌍 *Nationality:* ${booking.nationality}

📅 *Travel Dates:*
✈️ Arrival: ${booking.arrivalDate}
🛫 Departure: ${booking.departureDate}

📊 *Status:* ${booking.status.toUpperCase()}

📞 *Contact:* +20 112 263 6253
🏢 *Book & Go Travel Agency*`

    const url = `https://wa.me/201122636253?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }, [booking])

  if (!booking) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-2xl font-bold mb-4">Booking Not Found</h2>
          <p className="text-muted-foreground mb-6">The booking you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/bookings")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bookings
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <BookingHeader booking={booking} onPrint={handlePrint} onWhatsApp={handleWhatsApp} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <BookingInfoCard booking={booking} />
          </div>
          <BookingSidebar booking={booking} onPrint={handlePrint} onWhatsApp={handleWhatsApp} />
        </div>
      </div>
    </DashboardLayout>
  )
})

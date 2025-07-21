"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Printer, MessageSquare, Calendar, MapPin, Users, Plane, Hotel, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BookingData {
  id: string
  fileNumber: string
  supplier: string
  paxCount: number
  nationality: string
  arrivalDate: string
  departureDate: string
  numberOfNights: number
  status: "pending" | "confirmed" | "cancelled"
  createdAt: string
  arrivalFlight: {
    date: string
    time: string
    airlineName: string
    flightNo: string
  }
  departureFlight: {
    date: string
    time: string
    airlineName: string
    flightNo: string
  }
  domesticFlights: Array<{
    id: string
    departure: string
    arrival: string
    date: string
    time: string
    airlineName: string
    flightNo: string
  }>
  hotels: Array<{
    id: string
    name: string
    checkIn: string
    checkOut: string
    status: "pending" | "confirmed"
    roomType: string
    nights: number
  }>
  nileCruise: {
    name: string
    checkIn: string
    checkOut: string
    status: "pending" | "confirmed"
    cabinType: string
  }
  include: string
  exclude: string
  specialNotice: string
  dailyProgram: Array<{
    day: number
    date: string
    city: string
    details: string
  }>
  guides: Array<{
    id: string
    city: string
    guideName: string
    guestNationality: string
    paxAdults: number
    paxChildren: number
    pickupHotelLocation: string
    language: string
  }>
  meetingAssist: {
    paxCount: number
    name: string
    nationality: string
    flightDetails: string
  }
  transportation: Array<{
    id: string
    type: "Airport Transfer" | "City Transport" | "Inter-city"
    from: string
    to: string
    date: string
    vehicleType: string
    status: "pending" | "confirmed"
  }>
}

export function BookingViewPageClient({ bookingId }: { bookingId: string }) {
  const t = useTranslations("common")
  const router = useRouter()
  const { toast } = useToast()
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading booking data
    const loadBooking = async () => {
      setIsLoading(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockBooking: BookingData = {
        id: bookingId,
        fileNumber: `BG-2024-${bookingId.padStart(3, "0")}`,
        supplier: "Book & Go Travel",
        paxCount: 4,
        nationality: "American",
        arrivalDate: "2024-02-15",
        departureDate: "2024-02-22",
        numberOfNights: 7,
        status: "confirmed",
        createdAt: "2024-01-20T10:00:00Z",
        arrivalFlight: {
          date: "2024-02-15",
          time: "14:30",
          airlineName: "EgyptAir",
          flightNo: "MS123",
        },
        departureFlight: {
          date: "2024-02-22",
          time: "10:15",
          airlineName: "EgyptAir",
          flightNo: "MS456",
        },
        domesticFlights: [
          {
            id: "1",
            departure: "Cairo",
            arrival: "Aswan",
            date: "2024-02-16",
            time: "08:00",
            airlineName: "EgyptAir",
            flightNo: "MS789",
          },
          {
            id: "2",
            departure: "Luxor",
            arrival: "Cairo",
            date: "2024-02-21",
            time: "16:30",
            airlineName: "EgyptAir",
            flightNo: "MS790",
          },
        ],
        hotels: [
          {
            id: "1",
            name: "Four Seasons Cairo",
            checkIn: "2024-02-15",
            checkOut: "2024-02-17",
            status: "confirmed",
            roomType: "Deluxe Room",
            nights: 2,
          },
          {
            id: "2",
            name: "Old Cataract Aswan",
            checkIn: "2024-02-17",
            checkOut: "2024-02-20",
            status: "confirmed",
            roomType: "Nile View Suite",
            nights: 3,
          },
          {
            id: "3",
            name: "Winter Palace Luxor",
            checkIn: "2024-02-20",
            checkOut: "2024-02-22",
            status: "confirmed",
            roomType: "Superior Room",
            nights: 2,
          },
        ],
        nileCruise: {
          name: "MS Nile Premium",
          checkIn: "2024-02-18",
          checkOut: "2024-02-21",
          status: "confirmed",
          cabinType: "Standard Cabin",
        },
        include:
          "All meals, Entrance fees to all mentioned sites, Professional English-speaking guide, All transfers and transportation, Domestic flights as mentioned",
        exclude:
          "International flights, Personal expenses, Tips and gratuities, Optional tours, Travel insurance, Visa fees",
        specialNotice:
          "Vegetarian meals available upon request. Please inform us of any dietary restrictions or allergies in advance.",
        dailyProgram: [
          {
            day: 1,
            date: "2024-02-15",
            city: "Cairo",
            details:
              "Arrival at Cairo International Airport, meet and assist, transfer to hotel, welcome dinner at hotel restaurant",
          },
          {
            day: 2,
            date: "2024-02-16",
            city: "Cairo",
            details:
              "Visit Pyramids of Giza and Sphinx, Egyptian Museum, Khan El Khalili Bazaar, flight to Aswan in the evening",
          },
          {
            day: 3,
            date: "2024-02-17",
            city: "Aswan",
            details: "Visit High Dam, Philae Temple, Unfinished Obelisk, felucca ride around Elephantine Island",
          },
          {
            day: 4,
            date: "2024-02-18",
            city: "Aswan",
            details: "Optional Abu Simbel tour (extra cost), embark on Nile cruise, sail to Kom Ombo",
          },
          {
            day: 5,
            date: "2024-02-19",
            city: "Edfu/Luxor",
            details: "Visit Kom Ombo Temple, sail to Edfu, visit Edfu Temple, continue sailing to Luxor",
          },
          {
            day: 6,
            date: "2024-02-20",
            city: "Luxor",
            details:
              "Visit Valley of the Kings, Hatshepsut Temple, Colossi of Memnon, disembark cruise, check into hotel",
          },
          {
            day: 7,
            date: "2024-02-21",
            city: "Luxor",
            details: "Visit Karnak Temple, Luxor Temple, free time for shopping, flight to Cairo",
          },
          {
            day: 8,
            date: "2024-02-22",
            city: "Cairo",
            details: "Transfer to Cairo International Airport for departure",
          },
        ],
        guides: [
          {
            id: "1",
            city: "Cairo",
            guideName: "Ahmed Hassan",
            guestNationality: "American",
            paxAdults: 3,
            paxChildren: 1,
            pickupHotelLocation: "Four Seasons Cairo",
            language: "English",
          },
          {
            id: "2",
            city: "Aswan",
            guideName: "Fatma Ali",
            guestNationality: "American",
            paxAdults: 3,
            paxChildren: 1,
            pickupHotelLocation: "Old Cataract Aswan",
            language: "English",
          },
          {
            id: "3",
            city: "Luxor",
            guideName: "Mohamed Saeed",
            guestNationality: "American",
            paxAdults: 3,
            paxChildren: 1,
            pickupHotelLocation: "Winter Palace Luxor",
            language: "English",
          },
        ],
        meetingAssist: {
          paxCount: 4,
          name: "John Smith",
          nationality: "American",
          flightDetails: "EgyptAir MS123 arriving 14:30",
        },
        transportation: [
          {
            id: "1",
            type: "Airport Transfer",
            from: "Cairo Airport",
            to: "Four Seasons Cairo",
            date: "2024-02-15",
            vehicleType: "Private Van",
            status: "confirmed",
          },
          {
            id: "2",
            type: "City Transport",
            from: "Hotel",
            to: "Pyramids",
            date: "2024-02-16",
            vehicleType: "Private Car",
            status: "confirmed",
          },
          {
            id: "3",
            type: "Airport Transfer",
            from: "Hotel",
            to: "Cairo Airport",
            date: "2024-02-22",
            vehicleType: "Private Van",
            status: "confirmed",
          },
        ],
      }

      setBooking(mockBooking)
      setIsLoading(false)
    }

    loadBooking()
  }, [bookingId])

  const handlePrint = () => {
    router.push(`/bookings/${bookingId}/print`)
  }

  const handleEdit = () => {
    router.push(`/bookings/${bookingId}/edit`)
  }

  const handleViewAccounting = () => {
    router.push(`/admin/accounting?booking=${bookingId}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "pending":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading booking details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!booking) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
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
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Booking Details</h1>
              <p className="text-muted-foreground">
                {booking.fileNumber} • Created {new Date(booking.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={getStatusColor(booking.status)} className="capitalize">
              {booking.status}
            </Badge>
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleViewAccounting}>
              <MessageSquare className="mr-2 h-4 w-4" />
              View Accounting
            </Button>
          </div>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">File Number</p>
                <p className="text-lg font-semibold">{booking.fileNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Supplier</p>
                <p className="text-lg font-semibold">{booking.supplier}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">No. of Pax</p>
                <p className="text-lg font-semibold">{booking.paxCount}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nationality</p>
                <p className="text-lg font-semibold">{booking.nationality}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Arrival Date</p>
                <p className="text-lg font-semibold">{booking.arrivalDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Departure Date</p>
                <p className="text-lg font-semibold">{booking.departureDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">No. of Nights</p>
                <p className="text-lg font-semibold">{booking.numberOfNights}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={getStatusColor(booking.status)} className="capitalize">
                  {booking.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flight Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plane className="mr-2 h-5 w-5" />
              Flight Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">International Flights</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h5 className="font-medium text-green-600 mb-2">Arrival Flight</h5>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Date:</strong> {booking.arrivalFlight.date}
                    </p>
                    <p>
                      <strong>Time:</strong> {booking.arrivalFlight.time}
                    </p>
                    <p>
                      <strong>Airline:</strong> {booking.arrivalFlight.airlineName}
                    </p>
                    <p>
                      <strong>Flight No:</strong> {booking.arrivalFlight.flightNo}
                    </p>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h5 className="font-medium text-red-600 mb-2">Departure Flight</h5>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Date:</strong> {booking.departureFlight.date}
                    </p>
                    <p>
                      <strong>Time:</strong> {booking.departureFlight.time}
                    </p>
                    <p>
                      <strong>Airline:</strong> {booking.departureFlight.airlineName}
                    </p>
                    <p>
                      <strong>Flight No:</strong> {booking.departureFlight.flightNo}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {booking.domesticFlights.length > 0 && (
              <div>
                <h4 className="font-semibold text-lg mb-3">Domestic Flights</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Route</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Airline</TableHead>
                        <TableHead>Flight No</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {booking.domesticFlights.map((flight) => (
                        <TableRow key={flight.id}>
                          <TableCell className="font-medium">
                            {flight.departure} → {flight.arrival}
                          </TableCell>
                          <TableCell>{flight.date}</TableCell>
                          <TableCell>{flight.time}</TableCell>
                          <TableCell>{flight.airlineName}</TableCell>
                          <TableCell>{flight.flightNo}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accommodation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Hotel className="mr-2 h-5 w-5" />
              Accommodation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Hotels</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {booking.hotels.map((hotel) => (
                  <div key={hotel.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{hotel.name}</h5>
                      <Badge variant={getStatusColor(hotel.status)} className="text-xs">
                        {hotel.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        <strong>Check-in:</strong> {hotel.checkIn}
                      </p>
                      <p>
                        <strong>Check-out:</strong> {hotel.checkOut}
                      </p>
                      <p>
                        <strong>Room Type:</strong> {hotel.roomType}
                      </p>
                      <p>
                        <strong>Nights:</strong> {hotel.nights}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {booking.nileCruise.name && (
              <div>
                <h4 className="font-semibold text-lg mb-3">Nile Cruise</h4>
                <div className="border rounded-lg p-4 max-w-md">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{booking.nileCruise.name}</h5>
                    <Badge variant={getStatusColor(booking.nileCruise.status)} className="text-xs">
                      {booking.nileCruise.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <strong>Check-in:</strong> {booking.nileCruise.checkIn}
                    </p>
                    <p>
                      <strong>Check-out:</strong> {booking.nileCruise.checkOut}
                    </p>
                    <p>
                      <strong>Cabin Type:</strong> {booking.nileCruise.cabinType}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Itinerary & Cities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Itinerary & Cities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Include</h4>
                <p className="text-sm text-muted-foreground">{booking.include}</p>
              </div>
              <div>
                <h4 className="font-semibold text-red-600 mb-2">Exclude</h4>
                <p className="text-sm text-muted-foreground">{booking.exclude}</p>
              </div>
            </div>

            {booking.specialNotice && (
              <div>
                <h4 className="font-semibold text-blue-600 mb-2">Special Notice</h4>
                <p className="text-sm text-muted-foreground">{booking.specialNotice}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Program */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Daily Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {booking.dailyProgram.map((day) => (
                <div key={day.day} className="border-l-4 border-primary pl-4 py-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h4 className="font-semibold text-lg">
                      Day {day.day} - {day.city}
                    </h4>
                    <p className="text-sm text-muted-foreground">{day.date}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{day.details}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Meeting & Assist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Meeting & Assist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">No. of Pax</p>
                <p className="text-lg font-semibold">{booking.meetingAssist.paxCount}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-lg font-semibold">{booking.meetingAssist.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nationality</p>
                <p className="text-lg font-semibold">{booking.meetingAssist.nationality}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">Flight Details</p>
              <p className="text-lg font-semibold">{booking.meetingAssist.flightDetails}</p>
            </div>
          </CardContent>
        </Card>

        {/* Guide Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Guide Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {booking.guides.map((guide) => (
                <div key={guide.id} className="border rounded-lg p-4">
                  <h5 className="font-medium text-lg mb-3">{guide.city} Guide</h5>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Guide Name:</strong> {guide.guideName}
                    </p>
                    <p>
                      <strong>Language:</strong> {guide.language}
                    </p>
                    <p>
                      <strong>Guest Nationality:</strong> {guide.guestNationality}
                    </p>
                    <p>
                      <strong>Adults:</strong> {guide.paxAdults}
                    </p>
                    <p>
                      <strong>Children:</strong> {guide.paxChildren}
                    </p>
                    <p>
                      <strong>Pickup Location:</strong> {guide.pickupHotelLocation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transportation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Transportation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {booking.transportation.map((transport) => (
                    <TableRow key={transport.id}>
                      <TableCell className="font-medium">{transport.type}</TableCell>
                      <TableCell>
                        {transport.from} → {transport.to}
                      </TableCell>
                      <TableCell>{transport.date}</TableCell>
                      <TableCell>{transport.vehicleType}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(transport.status)} className="text-xs">
                          {transport.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

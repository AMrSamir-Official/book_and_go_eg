"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import {
//   downloadBookingPDF,
//   downloadGuidePDF,
//   downloadMeetingAssistPDF,
//   shareBookingPDF,
//   shareGuidePDF,
//   shareMeetingAssistPDF,
// } from "@/lib/podf-utils/booking"; // Import all new functions
import {
  downloadAswanLuxorTransferPDF,
  downloadBookingPDF,
  // --- ADD THESE NEW IMPORTS ---
  downloadCairoTransferPDF,
  downloadGuidePDF,
  downloadMeetingAssistPDF,
  shareAswanLuxorTransferPDF,
  shareBookingPDF,
  shareCairoTransferPDF,
  shareGuidePDF,
  shareMeetingAssistPDF,
} from "@/lib/podf-utils/booking";
import { BookingTypes } from "@/types/bookingData";
import {
  ArrowLeft,
  Car,
  FileDown,
  Hotel,
  MapPin,
  Plane,
  Printer,
  Share2,
  User,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
// import { BookingTypes } from "./print/booking-print-view"; // Assuming you move the interface to a types file
export function BookingViewPageClient({
  booking,
  errorMessage,
}: {
  booking: BookingTypes | null;
  errorMessage?: string | null;
}) {
  const t = useTranslations("common");
  const router = useRouter();
  // --- ADD THESE NEW HANDLERS ---
  const handlePrintCairoTransfer = () => {
    if (booking) downloadCairoTransferPDF(booking);
  };

  const handleShareCairoTransfer = async () => {
    if (booking) {
      try {
        await shareCairoTransferPDF(
          booking,
          `Cairo Transfer order for ${booking.fileNumber}`
        );
      } catch (error) {
        console.error(error);
        alert((error as Error).message);
      }
    }
  };

  const handlePrintAswanLuxorTransfer = () => {
    if (booking) downloadAswanLuxorTransferPDF(booking);
  };

  const handleShareAswanLuxorTransfer = async () => {
    if (booking) {
      try {
        await shareAswanLuxorTransferPDF(
          booking,
          `Aswan/Luxor Transfer order for ${booking.fileNumber}`
        );
      } catch (error) {
        console.error(error);
        alert((error as Error).message);
      }
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  // --- Handlers for Printing and Sharing ---
  const handlePrint = () => {
    if (booking) downloadBookingPDF(booking);
  };
  // --- ADD THESE NEW HANDLERS ---

  const handleShare = async () => {
    if (booking) {
      try {
        await shareBookingPDF(
          booking,
          `Details for booking: ${booking.fileNumber}`
        );
      } catch (error) {
        console.error(error);
        alert((error as Error).message);
      }
    }
  };

  const handlePrintMeetingAssist = () => {
    if (booking)
      downloadMeetingAssistPDF(booking.meetingAssist, booking.fileNumber);
  };

  const handleShareMeetingAssist = async () => {
    if (booking) {
      try {
        await shareMeetingAssistPDF(
          booking.meetingAssist,
          booking.fileNumber,
          `Meeting & Assist order for ${booking.fileNumber}`
        );
      } catch (error) {
        console.error(error);
        alert((error as Error).message);
      }
    }
  };

  const handlePrintGuide = (guide: BookingTypes["guides"][0]) => {
    if (booking) downloadGuidePDF(guide, booking.fileNumber);
  };

  const handleShareGuide = async (guide: BookingTypes["guides"][0]) => {
    if (booking) {
      try {
        await shareGuidePDF(
          guide,
          booking.fileNumber,
          `Guide details for ${guide.city} - File: ${booking.fileNumber}`
        );
      } catch (error) {
        console.error(error);
        alert((error as Error).message);
      }
    }
  };

  // if (isLoading) {
  //   return (
  //     <DashboardLayout>
  //       <div className="flex items-center justify-center min-h-[400px]">
  //         <div className="text-center">
  //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
  //           <p className="text-muted-foreground">Loading booking details...</p>
  //         </div>
  //       </div>
  //     </DashboardLayout>
  //   );
  // }

  if (!booking) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Booking Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {errorMessage ||
              "Could not load booking data. It may have been deleted or you may not have permission to view it."}
          </p>
          <Button onClick={() => router.push("/bookings")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bookings
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">
                Booking Details
              </h1>
              <p className="text-muted-foreground">
                {booking.fileNumber} • Created{" "}
                {new Date(booking.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <FileDown className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" /> Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  File Number
                </p>
                <p className="text-lg font-semibold">{booking.fileNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Vendor
                </p>
                <p className="text-lg font-semibold">{booking.vendor}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  No. of Pax
                </p>
                <p className="text-lg font-semibold">{booking.paxCount}</p>
              </div>
              {typeof booking.childCount === "number" && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Child
                  </p>
                  <p className="text-lg font-semibold">{booking.childCount}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Nationality
                </p>
                <p className="text-lg font-semibold">{booking.nationality}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Arrival Date
                </p>
                <p className="text-lg font-semibold">{booking.arrivalDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Departure Date
                </p>
                <p className="text-lg font-semibold">{booking.departureDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  No. of Nights
                </p>
                <p className="text-lg font-semibold">
                  {booking.numberOfNights}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        {booking.guests && booking.guests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" /> Guest Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>First Name</TableHead>
                      <TableHead>Last Name</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {booking.guests.map((guest, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{guest.title}</TableCell>
                        <TableCell>{guest.firstName}</TableCell>
                        <TableCell>{guest.lastName}</TableCell>
                        <TableCell className="capitalize">
                          {guest.type}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
        {/* --- Meeting & Assist --- */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" /> Meeting & Assist
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShareMeetingAssist}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrintMeetingAssist}
              >
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Guest Name
                </p>
                <p className="text-lg font-semibold">
                  {booking.meetingAssist.name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pax Count
                </p>
                <p className="text-lg font-semibold">
                  {booking.meetingAssist.paxAdults || 0} Adults,{" "}
                  {booking.meetingAssist.paxChildren || 0} Children
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Nationality
                </p>
                <p className="text-lg font-semibold">
                  {booking.meetingAssist.nationality}
                </p>
              </div>
            </div>
            {booking.meetingAssist.note && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Note
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {booking.meetingAssist.note}
                  </p>
                </div>
              </>
            )}
            <Separator className="my-4" />
            <h4 className="font-semibold text-md mb-2">Arrival Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Driver Name
                </p>
                <p className="text-lg font-semibold">
                  {booking.meetingAssist.driver.name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Driver Contact
                </p>
                <p className="text-lg font-semibold">
                  {booking.meetingAssist.driver.contact}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Flight
                </p>
                <p className="text-lg font-semibold">
                  {booking.meetingAssist.arrivalFlight.airlineName}{" "}
                  {booking.meetingAssist.arrivalFlight.flightNo}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Guide Details --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" /> Guide Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {booking.guides.map((guide, index) => (
                <div
                  key={guide._id}
                  className="border rounded-lg p-4 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-lg">{guide.city} Guide</h5>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShareGuide(guide)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePrintGuide(guide)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm mb-4 flex-grow">
                    <p>
                      <strong>Guide Name:</strong> {guide.guideName}
                    </p>
                    <p>
                      <strong>Guest Nationality:</strong>{" "}
                      {guide.guestNationality}
                    </p>
                    <p>
                      <strong>Pax:</strong> {guide.paxAdults} Adults,{" "}
                      {guide.paxChildren} Children
                    </p>
                    <p>
                      <strong>Pickup:</strong> {guide.pickupHotelLocation}
                    </p>
                    {guide.note && (
                      <p>
                        <strong>Note:</strong> {guide.note}
                      </p>
                    )}
                  </div>
                  <div>
                    <h6 className="font-semibold text-md mb-2 mt-3">
                      Daily Schedule
                    </h6>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Day</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Include</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {guide.days.map((day, dayIndex) => (
                            <TableRow key={dayIndex}>
                              <TableCell>{day.day}</TableCell>
                              <TableCell>{day.date}</TableCell>
                              <TableCell>{day.time}</TableCell>
                              <TableCell>{day.include}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* --- Flight Details --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plane className="mr-2 h-5 w-5" /> Flight Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">
                International Flights
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4 bg-gray-50/50">
                  <h5 className="font-medium text-green-600 mb-2">
                    Arrival Flight
                  </h5>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Date:</strong> {booking.arrivalFlight.date}
                    </p>
                    <p>
                      <strong>Time:</strong> {booking.arrivalFlight.time}
                    </p>
                    <p>
                      <strong>Airline:</strong>{" "}
                      {booking.arrivalFlight.airlineName}
                    </p>
                    <p>
                      <strong>Flight No:</strong>{" "}
                      {booking.arrivalFlight.flightNo}
                    </p>
                  </div>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50/50">
                  <h5 className="font-medium text-red-600 mb-2">
                    Departure Flight
                  </h5>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Date:</strong> {booking.departureFlight.date}
                    </p>
                    <p>
                      <strong>Time:</strong> {booking.departureFlight.time}
                    </p>
                    <p>
                      <strong>Airline:</strong>{" "}
                      {booking.departureFlight.airlineName}
                    </p>
                    <p>
                      <strong>Flight No:</strong>{" "}
                      {booking.departureFlight.flightNo}
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
                      {booking.domesticFlights.map((flight, index) => (
                        <TableRow key={index}>
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

        {/* --- Accommodation --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Hotel className="mr-2 h-5 w-5" /> Accommodation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Hotels</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {booking.hotels.map((hotel, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">
                        {hotel.name}{" "}
                        <span className="text-sm text-muted-foreground">
                          ({hotel.city})
                        </span>
                      </h5>
                      <Badge
                        variant={getStatusColor(hotel.status)}
                        className="text-xs"
                      >
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
                    <Badge
                      variant={getStatusColor(booking.nileCruise.status)}
                      className="text-xs"
                    >
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
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* --- Itinerary & Program --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" /> Itinerary & Program
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Include</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {booking.include}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-red-600 mb-2">Exclude</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {booking.exclude}
                </p>
              </div>
            </div>
            {booking.specialNotice && (
              <div>
                <h4 className="font-semibold text-blue-600 mb-2">
                  Special Notice
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {booking.specialNotice}
                </p>
              </div>
            )}
            <Separator />
            <div>
              <h4 className="font-semibold text-lg mb-3">Daily Program</h4>
              <div className="space-y-4">
                {booking.dailyProgram.map((day) => (
                  <div
                    key={day.day}
                    className="border-l-4 border-primary pl-4 py-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                      <h4 className="font-semibold text-lg">
                        Day {day.day} - {day.city}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {day.date}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {day.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Transportation --- */}
        {/* --- Transportation --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="mr-2 h-5 w-5" /> Transportation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* --- CAIRO TRANSFER SECTION --- */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl">Cairo Transfer Order</h3>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShareCairoTransfer}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrintCairoTransfer}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pax Count</p>
                  <p className="font-semibold">
                    {booking.cairoTransfer.paxCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Van Type</p>
                  <p className="font-semibold">
                    {booking.cairoTransfer.vanType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Driver Name</p>
                  <p className="font-semibold">
                    {booking.cairoTransfer.driver.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Driver Contact
                  </p>
                  <p className="font-semibold">
                    {booking.cairoTransfer.driver.contact}
                  </p>
                </div>
              </div>
              <div className="text-sm">
                <p className="font-medium text-muted-foreground">Description</p>
                <p>{booking.cairoTransfer.driver.description}</p>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold text-md mb-2">Daily Schedule</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Day</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {booking.cairoTransfer.days.map((day, index) => (
                        <TableRow key={index}>
                          <TableCell>{day.day}</TableCell>
                          <TableCell>{day.date}</TableCell>
                          <TableCell>{day.city}</TableCell>
                          <TableCell>{day.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
            <Separator />
            {/* --- ASWAN/LUXOR TRANSFER SECTION --- */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl">
                  Aswan & Luxor & Hurghada Transfer
                </h3>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShareAswanLuxorTransfer}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrintAswanLuxorTransfer}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pax Count</p>
                  <p className="font-semibold">
                    {booking.aswanLuxorTransfer.paxCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Van Type</p>
                  <p className="font-semibold">
                    {booking.aswanLuxorTransfer.vanType}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold text-md mb-2">Daily Schedule</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Day</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {booking.aswanLuxorTransfer.days.map((day, index) => (
                        <TableRow key={index}>
                          <TableCell>{day.day}</TableCell>
                          <TableCell>{day.date}</TableCell>
                          <TableCell>{day.city}</TableCell>
                          <TableCell>{day.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

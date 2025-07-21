"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, MessageSquare } from "lucide-react"
import { downloadPDF, shareToWhatsApp } from "@/lib/pdf-utils"
import { useToast } from "@/hooks/use-toast"

interface BookingData {
  fileNumber: string
  supplier: string
  paxCount: number
  nationality: string
  arrivalDate: string
  departureDate: string
  numberOfNights: number
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
    departure: string
    arrival: string
    date: string
    time: string
    airlineName: string
    flightNo: string
  }>
  hotels: Array<{
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
    type: string
    from: string
    to: string
    date: string
    vehicleType: string
    status: string
  }>
}

export function BookingPrintView({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    // Load booking data - in real app this would come from API
    const mockBooking: BookingData = {
      fileNumber: `BG-2024-${bookingId.padStart(3, "0")}`,
      supplier: "Book & Go Travel",
      paxCount: 4,
      nationality: "American",
      arrivalDate: "2024-02-15",
      departureDate: "2024-02-22",
      numberOfNights: 7,
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
          departure: "Cairo",
          arrival: "Aswan",
          date: "2024-02-16",
          time: "08:00",
          airlineName: "EgyptAir",
          flightNo: "MS789",
        },
        {
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
          name: "Four Seasons Cairo",
          checkIn: "2024-02-15",
          checkOut: "2024-02-17",
          status: "confirmed",
          roomType: "Deluxe Room",
          nights: 2,
        },
        {
          name: "Old Cataract Aswan",
          checkIn: "2024-02-17",
          checkOut: "2024-02-20",
          status: "confirmed",
          roomType: "Nile View Suite",
          nights: 3,
        },
        {
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
        "All meals, Entrance fees to all mentioned sites, Professional English-speaking guide, All transfers and transportation, Domestic flights as mentioned, Meet and assist at airports",
      exclude:
        "International flights, Personal expenses, Tips and gratuities, Optional tours not mentioned in the itinerary, Travel insurance, Visa fees, Any services not mentioned in the inclusions",
      specialNotice:
        "Vegetarian meals available upon request. Please inform us of any dietary restrictions or allergies in advance. Comfortable walking shoes recommended for site visits.",
      dailyProgram: [
        {
          day: 1,
          date: "2024-02-15",
          city: "Cairo",
          details:
            "Arrival at Cairo International Airport, meet and assist by our representative, transfer to hotel in air-conditioned vehicle, welcome dinner at hotel restaurant with traditional Egyptian cuisine",
        },
        {
          day: 2,
          date: "2024-02-16",
          city: "Cairo",
          details:
            "After breakfast, visit the iconic Pyramids of Giza and the Great Sphinx, explore the Egyptian Museum with its vast collection of ancient artifacts including Tutankhamun's treasures, afternoon visit to Khan El Khalili Bazaar for shopping and cultural experience, evening flight to Aswan",
        },
        {
          day: 3,
          date: "2024-02-17",
          city: "Aswan",
          details:
            "Morning visit to the High Dam, one of the world's largest embankment dams, explore the beautiful Philae Temple dedicated to the goddess Isis, visit the Unfinished Obelisk to learn about ancient Egyptian stone-cutting techniques, relaxing felucca ride around Elephantine Island at sunset",
        },
        {
          day: 4,
          date: "2024-02-18",
          city: "Aswan",
          details:
            "Optional early morning excursion to Abu Simbel temples (additional cost), afternoon embarkation on luxury Nile cruise, welcome cocktail and dinner on board, sail towards Kom Ombo while enjoying the scenic Nile views",
        },
        {
          day: 5,
          date: "2024-02-19",
          city: "Edfu/Luxor",
          details:
            "Morning visit to the unique Kom Ombo Temple dedicated to two gods, sail to Edfu and visit the well-preserved Edfu Temple dedicated to Horus, continue sailing towards Luxor, evening entertainment on board with traditional Nubian show",
        },
        {
          day: 6,
          date: "2024-02-20",
          city: "Luxor",
          details:
            "Cross to the West Bank to explore the Valley of the Kings with its royal tombs, visit the magnificent Hatshepsut Temple, see the Colossi of Memnon statues, disembark from cruise and check into hotel, farewell dinner at local restaurant",
        },
        {
          day: 7,
          date: "2024-02-21",
          city: "Luxor",
          details:
            "Visit the impressive Karnak Temple complex, the largest religious building ever constructed, explore Luxor Temple with its beautiful evening illumination, free time for last-minute shopping at local markets, evening flight back to Cairo",
        },
        {
          day: 8,
          date: "2024-02-22",
          city: "Cairo",
          details:
            "Final breakfast at hotel, check-out and transfer to Cairo International Airport for departure, assistance with check-in procedures, end of services",
        },
      ],
      guides: [
        {
          city: "Cairo",
          guideName: "Ahmed Hassan",
          guestNationality: "American",
          paxAdults: 3,
          paxChildren: 1,
          pickupHotelLocation: "Four Seasons Cairo",
          language: "English",
        },
        {
          city: "Aswan",
          guideName: "Fatma Ali",
          guestNationality: "American",
          paxAdults: 3,
          paxChildren: 1,
          pickupHotelLocation: "Old Cataract Aswan",
          language: "English",
        },
        {
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
        flightDetails: "EgyptAir MS123 arriving at 14:30 from New York JFK",
      },
      transportation: [
        {
          type: "Airport Transfer",
          from: "Cairo International Airport",
          to: "Four Seasons Cairo Hotel",
          date: "2024-02-15",
          vehicleType: "Private Air-conditioned Van",
          status: "confirmed",
        },
        {
          type: "City Transport",
          from: "Hotel",
          to: "Pyramids of Giza",
          date: "2024-02-16",
          vehicleType: "Private Air-conditioned Car",
          status: "confirmed",
        },
        {
          type: "Airport Transfer",
          from: "Hotel",
          to: "Cairo International Airport",
          date: "2024-02-22",
          vehicleType: "Private Air-conditioned Van",
          status: "confirmed",
        },
      ],
    }
    setBooking(mockBooking)
  }, [bookingId])

  const handleDownloadPDF = async () => {
    const printElement = document.getElementById("booking-print-content")
    if (!printElement || !booking) return

    setIsGenerating(true)
    try {
      await downloadPDF(printElement, `booking-${booking.fileNumber}.pdf`)
      toast({
        title: "PDF Downloaded",
        description: "Booking details have been downloaded successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleWhatsAppShare = async () => {
    const printElement = document.getElementById("booking-print-content")
    if (!printElement || !booking) return

    setIsGenerating(true)
    try {
      const message = `🎫 *BOOKING DETAILS - ${booking.fileNumber}*\n\n📋 Supplier: ${booking.supplier}\n👥 Pax: ${booking.paxCount}\n🌍 Nationality: ${booking.nationality}\n📅 ${booking.arrivalDate} - ${booking.departureDate}\n🏨 ${booking.numberOfNights} nights\n\n📄 Complete booking details attached.`

      await shareToWhatsApp(printElement, message)
      toast({
        title: "Shared to WhatsApp",
        description: "Booking details have been shared successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share to WhatsApp. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  if (!booking) {
    return <div className="flex items-center justify-center min-h-screen bg-white">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Print Controls - Hidden in print */}
      <div className="no-print bg-gray-50 border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleDownloadPDF} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Download className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleWhatsAppShare} disabled={isGenerating}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Share WhatsApp
            </Button>
            <Button onClick={() => window.print()}>Print</Button>
          </div>
        </div>
      </div>

      {/* Printable Content */}
      <div id="booking-print-content" className="max-w-4xl mx-auto p-8 bg-white text-black">
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-blue-600 pb-6">
          <div className="mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold text-xl">B&G</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Book & Go Travel</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Complete Travel Operation Form</h2>
          <div className="text-lg text-gray-600">
            <p>
              File Number: <span className="font-semibold">{booking.fileNumber}</span>
            </p>
            <p>Generated on: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Basic Information */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            1. Basic Booking Information
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p>
                <strong>File Number:</strong> {booking.fileNumber}
              </p>
              <p>
                <strong>Supplier:</strong> {booking.supplier}
              </p>
              <p>
                <strong>No. of Pax:</strong> {booking.paxCount}
              </p>
            </div>
            <div>
              <p>
                <strong>Nationality:</strong> {booking.nationality}
              </p>
              <p>
                <strong>Arrival Date:</strong> {booking.arrivalDate}
              </p>
              <p>
                <strong>Departure Date:</strong> {booking.departureDate}
              </p>
              <p>
                <strong>No. of Nights:</strong> {booking.numberOfNights}
              </p>
            </div>
          </div>
        </div>

        {/* Flight Details */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">Flight Details</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Arrival Flight Details:</h4>
              <p>
                Date: {booking.arrivalFlight.date} | Time: {booking.arrivalFlight.time} | Airline:{" "}
                {booking.arrivalFlight.airlineName} | Flight No: {booking.arrivalFlight.flightNo}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Departure Flight Details:</h4>
              <p>
                Date: {booking.departureFlight.date} | Time: {booking.departureFlight.time} | Airline:{" "}
                {booking.departureFlight.airlineName} | Flight No: {booking.departureFlight.flightNo}
              </p>
            </div>
            {booking.domesticFlights.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Domestic Flight Details:</h4>
                {booking.domesticFlights.map((flight, index) => (
                  <p key={index}>
                    Flight {index + 1}: {flight.departure} → {flight.arrival} | Date: {flight.date} | Time:{" "}
                    {flight.time} | Airline: {flight.airlineName} | Flight No: {flight.flightNo}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Accommodation */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">2. Accommodation</h3>
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 mb-2">Hotels:</h4>
            {booking.hotels.map((hotel, index) => (
              <div key={index} className="border border-gray-200 p-4 rounded">
                <h5 className="font-semibold text-gray-700">
                  Hotel {index + 1}: {hotel.name}
                </h5>
                <p>
                  Check-in: {hotel.checkIn} | Check-out: {hotel.checkOut}
                </p>
                <p>
                  Room Type: {hotel.roomType} | Nights: {hotel.nights}
                </p>
                <p>
                  Status:{" "}
                  <span
                    className={`font-medium ${hotel.status === "confirmed" ? "text-green-600" : "text-orange-600"}`}
                  >
                    {hotel.status}
                  </span>
                </p>
              </div>
            ))}
            {booking.nileCruise.name && (
              <div className="border border-gray-200 p-4 rounded">
                <h5 className="font-semibold text-gray-700">Nile Cruise: {booking.nileCruise.name}</h5>
                <p>
                  Check-in: {booking.nileCruise.checkIn} | Check-out: {booking.nileCruise.checkOut}
                </p>
                <p>Cabin Type: {booking.nileCruise.cabinType}</p>
                <p>
                  Status:{" "}
                  <span
                    className={`font-medium ${booking.nileCruise.status === "confirmed" ? "text-green-600" : "text-orange-600"}`}
                  >
                    {booking.nileCruise.status}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Itinerary & Cities */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">3. Itinerary & Cities</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-green-600 mb-2">Include:</h4>
              <p className="text-gray-600">{booking.include}</p>
            </div>
            <div>
              <h4 className="font-semibold text-red-600 mb-2">Exclude:</h4>
              <p className="text-gray-600">{booking.exclude}</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">Special Notice:</h4>
              <p className="text-gray-600">{booking.specialNotice}</p>
            </div>
          </div>
        </div>

        {/* Daily Program */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">Daily Program</h3>
          <div className="space-y-3">
            {booking.dailyProgram.map((day) => (
              <div key={day.day} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-700">
                  Day {day.day} - {day.date} - {day.city}
                </h4>
                <p className="text-gray-600">{day.details}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Meeting & Assist */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">4. Meeting & Assist</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p>
                <strong>No. of Pax:</strong> {booking.meetingAssist.paxCount}
              </p>
              <p>
                <strong>Name:</strong> {booking.meetingAssist.name}
              </p>
            </div>
            <div>
              <p>
                <strong>Nationality:</strong> {booking.meetingAssist.nationality}
              </p>
              <p>
                <strong>Flight Details:</strong> {booking.meetingAssist.flightDetails}
              </p>
            </div>
          </div>
        </div>

        {/* Guide Details */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">5. Guide Details</h3>
          {booking.guides.map((guide, index) => (
            <div key={index} className="border border-gray-200 p-4 rounded mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">
                Guide {index + 1} - {guide.city}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>
                    <strong>Guide Name:</strong> {guide.guideName}
                  </p>
                  <p>
                    <strong>Language:</strong> {guide.language}
                  </p>
                  <p>
                    <strong>Guest Nationality:</strong> {guide.guestNationality}
                  </p>
                </div>
                <div>
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
            </div>
          ))}
          <div className="bg-gray-50 p-4 rounded mt-4">
            <h4 className="font-semibold text-gray-700 mb-2">Notes for the Guide</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>- Be on time at pickup location.</li>
              <li>- Follow the program strictly unless client requests changes.</li>
              <li>- Any extra service requested must be reported to operations team.</li>
              <li>- Kindly send daily feedback or updates to [Operations Contact / WhatsApp].</li>
            </ul>
          </div>
        </div>

        {/* Transportation */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">6. Transportation</h3>
          <div className="space-y-3">
            {booking.transportation.map((transport, index) => (
              <div key={index} className="border border-gray-200 p-3 rounded">
                <p>
                  <strong>Type:</strong> {transport.type}
                </p>
                <p>
                  <strong>Route:</strong> {transport.from} → {transport.to}
                </p>
                <p>
                  <strong>Date:</strong> {transport.date}
                </p>
                <p>
                  <strong>Vehicle:</strong> {transport.vehicleType}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`font-medium ${transport.status === "confirmed" ? "text-green-600" : "text-orange-600"}`}
                  >
                    {transport.status}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-6 border-t border-gray-300">
          <p className="text-gray-600 font-semibold">Book & Go Travel - Your trusted travel partner</p>
          <p className="text-sm text-gray-500 mt-2">This document was generated on {new Date().toLocaleDateString()}</p>
          <p className="text-xs text-gray-400 mt-1">For any inquiries, please contact our operations team</p>
        </div>
      </div>
    </div>
  )
}

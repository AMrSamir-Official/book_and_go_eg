export const cities = [
  { id: "1", name: "Cairo", nameAr: "القاهرة" },
  { id: "2", name: "Aswan", nameAr: "أسوان" },
  { id: "3", name: "Luxor", nameAr: "الأقصر" },
  { id: "4", name: "Hurghada", nameAr: "الغردقة" },
  { id: "5", name: "Sharm El Sheikh", nameAr: "شرم الشيخ" },
  { id: "6", name: "Alexandria", nameAr: "الإسكندرية" },
]

export const hotels = [
  { id: "1", name: "Marriott Cairo", city: "Cairo", rating: 5 },
  { id: "2", name: "Sofitel Aswan", city: "Aswan", rating: 5 },
  { id: "3", name: "Hilton Luxor", city: "Luxor", rating: 4 },
  { id: "4", name: "Steigenberger Hurghada", city: "Hurghada", rating: 5 },
  { id: "5", name: "Four Seasons Sharm", city: "Sharm El Sheikh", rating: 5 },
]

export const guides = [
  { id: "1", name: "Ahmed Hassan", city: "Cairo", languages: ["English", "Arabic"] },
  { id: "2", name: "Mohamed Ali", city: "Aswan", languages: ["English", "Arabic", "French"] },
  { id: "3", name: "Sara Ahmed", city: "Luxor", languages: ["English", "Arabic", "German"] },
  { id: "4", name: "Omar Mahmoud", city: "Hurghada", languages: ["English", "Arabic", "Russian"] },
]

export const suppliers = [
  { id: "1", name: "Egypt Travel Co.", type: "Hotel" },
  { id: "2", name: "Nile Cruise Lines", type: "Cruise" },
  { id: "3", name: "Desert Safari Tours", type: "Transportation" },
  { id: "4", name: "Red Sea Diving", type: "Activities" },
]

export const vanTypes = [
  { id: "1", name: "Limousine", capacity: 3 },
  { id: "2", name: "H1", capacity: 7 },
  { id: "3", name: "Hiace", capacity: 12 },
  { id: "4", name: "Coaster", capacity: 25 },
]

export const nationalities = [
  "American",
  "British",
  "German",
  "French",
  "Italian",
  "Spanish",
  "Russian",
  "Chinese",
  "Japanese",
  "Australian",
]

export const paymentMethods = [
  { id: "cash", name: "Cash upon arrival" },
  { id: "bank", name: "Bank remittance" },
  { id: "online", name: "Online payment" },
]

export const currencies = [
  { id: "USD", name: "US Dollar", symbol: "$" },
  { id: "EGP", name: "Egyptian Pound", symbol: "LE" },
]

export const bookingStatuses = [
  { id: "pending", name: "Pending", color: "yellow" },
  { id: "confirmed", name: "Confirmed", color: "green" },
  { id: "cancelled", name: "Cancelled", color: "red" },
]

export const invoiceStatuses = [
  { id: "pending", name: "Pending", color: "yellow" },
  { id: "paid", name: "Paid", color: "green" },
  { id: "cancelled", name: "Cancelled", color: "red" },
]

// Sample bookings data
export const sampleBookings = [
  {
    id: "1",
    fileNumber: "BG-2024-001",
    supplier: "Egypt Travel Co.",
    paxCount: 4,
    arrivalDate: "2024-02-15",
    departureDate: "2024-02-22",
    nationality: "American",
    status: "confirmed",
    userId: "user1",
    createdAt: "2024-01-15",
    arrivalFlight: {
      date: "2024-02-15",
      time: "14:30",
      airline: "EgyptAir",
      flightNo: "MS123",
    },
    departureFlight: {
      date: "2024-02-22",
      time: "16:45",
      airline: "EgyptAir",
      flightNo: "MS456",
    },
    hotels: [
      {
        name: "Marriott Cairo",
        checkIn: "2024-02-15",
        checkOut: "2024-02-18",
        status: "confirmed",
      },
      {
        name: "Sofitel Aswan",
        checkIn: "2024-02-18",
        checkOut: "2024-02-22",
        status: "confirmed",
      },
    ],
    dailyProgram: [
      {
        day: 1,
        date: "2024-02-15",
        city: "Cairo",
        details: "Arrival and hotel check-in",
      },
      {
        day: 2,
        date: "2024-02-16",
        city: "Cairo",
        details: "Pyramids and Sphinx tour",
      },
    ],
  },
]

// Sample invoices data
export const sampleInvoices = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    bookingId: "1",
    title: "Egypt Tour Package - Smith Family",
    amount: 2500,
    currency: "USD",
    dueDate: "2024-02-10",
    paymentMethod: "bank",
    status: "paid",
    notes: "Payment received via bank transfer",
    userId: "user1",
    createdAt: "2024-01-20",
    expenses: {
      accommodation: [
        { hotel: "Marriott Cairo", amount: 800, currency: "USD", status: "paid" },
        { hotel: "Sofitel Aswan", amount: 600, currency: "USD", status: "paid" },
      ],
      flights: [{ details: "Cairo-Aswan", cost: 200, currency: "USD", status: "paid" }],
      transportation: [
        { city: "Cairo", supplier: "Desert Safari Tours", amount: 300, currency: "USD", status: "paid" },
      ],
      guide: 400,
      tickets: 200,
    },
  },
]

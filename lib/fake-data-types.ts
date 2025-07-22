// types.ts
export interface City {
  id: string;
  name: string;
  nameAr: string;
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  rating: number;
}

export interface Guide {
  id: string;
  name: string;
  city: string;
  languages: string[];
}

export interface Supplier {
  id: string;
  name: string;
  type: string;
}

export interface VanType {
  id: string;
  name: string;
  capacity: number;
}

export type Nationality =
  | "American"
  | "British"
  | "German"
  | "French"
  | "Italian"
  | "Spanish"
  | "Russian"
  | "Chinese"
  | "Japanese"
  | "Australian";

export interface PaymentMethod {
  id: string;
  name: string;
}

export interface Currency {
  id: string;
  name: string;
  symbol: string;
}

export interface Status {
  id: string;
  name: string;
  color: string;
}

// Flight related interfaces
export interface FlightInfo {
  date: string;
  time: string;
  airline: string;
  flightNo: string;
}

export interface HotelStay {
  name: string;
  checkIn: string;
  checkOut: string;
  status: "paid" | "pending" | "cancelled" | "confirmed";
}

export interface DailyProgram {
  day: number;
  date: string;
  city: string;
  details: string;
}

export interface Booking {
  id: string;
  fileNumber: string;
  supplier: string;
  paxCount: number;
  arrivalDate: string;
  departureDate: string;
  nationality: Nationality;
  status: "paid" | "pending" | "cancelled" | "confirmed";
  userId: string;
  createdAt: string;
  arrivalFlight: FlightInfo;
  departureFlight: FlightInfo;
  hotels: HotelStay[];
  dailyProgram: DailyProgram[];
}

export interface AccommodationExpense {
  hotel: string;
  amount: number;
  currency: "USD" | "EGP";
  status: "paid" | "pending" | "cancelled";
}

export interface FlightExpense {
  details: string;
  cost: number;
  currency: "USD" | "EGP";
  status: "paid" | "pending" | "cancelled";
}

export interface TransportationExpense {
  city: string;
  supplier: string;
  amount: number;
  currency: "USD" | "EGP";
  status: "paid" | "pending" | "cancelled";
}

export interface Expenses {
  accommodation: AccommodationExpense[];
  flights: FlightExpense[];
  transportation: TransportationExpense[];
  guide: number;
  tickets: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  title: string;
  amount: number;
  currency: "USD" | "EGP";
  dueDate: string;
  paymentMethod: "bank" | "cash" | "card";
  status: "paid" | "pending" | "cancelled";
  notes: string;
  userId: string;
  createdAt: string;
  expenses: Expenses;
}

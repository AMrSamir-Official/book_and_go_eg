export interface BookingTypes {
  id?: string;
  _id?: string;
  createdAt: string;
  fileNumber: string;
  vendor: string;
  hasInvoice?: boolean;
  paxCount: number;
  childCount?: number;
  arrivalDate: string;
  departureDate: string;
  numberOfNights: number;
  nationality: string;
  arrivalFlight: {
    date: string;
    time: string;
    airlineName: string;
    flightNo: string;
  };
  guests?: {
    firstName: string;
    lastName: string;
    type: "adult" | "child";
    title: "Mr" | "Mrs" | "Ms";
  }[];
  departureFlight: {
    date: string;
    time: string;
    airlineName: string;
    flightNo: string;
  };
  domesticFlights: Array<{
    departure: string;
    arrival: string;
    date: string;
    time: string;
    airlineName: string;
    flightNo: string;
  }>;
  hotels: Array<{
    city: string;
    name: string;
    checkIn: string;
    checkOut: string;
    status: "pending" | "confirmed";
  }>;
  nileCruise: {
    name: string;
    checkIn: string;
    checkOut: string;
    status: "pending" | "confirmed";
  };
  include: string;
  exclude: string;
  specialNotice: string;
  dailyProgram: Array<{
    day: number;
    date: string;
    city: string;
    details: string;
  }>;
  cairoTransfer: {
    paxCount: number;
    vanType: string;
    driver: {
      name: string;
      contact: string;
      description: string;
    };
    days: Array<{
      day: number;
      date: string;
      city: string;
      description: string;
    }>;
  };
  aswanLuxorTransfer: {
    paxCount: number;
    vanType: string;
    days: Array<{
      day: number;
      date: string;
      city: string;
      description: string;
    }>;
  };
  meetingAssist: {
    paxAdults: number;
    paxChildren?: number;
    name: string;
    note?: string;
    driver: {
      name: string;
      contact: string;
    };
    arrivalFlight: {
      date: string;
      time: string;
      airlineName: string;
      flightNo: string;
    };
    nationality: string;
  };

  guides: Array<{
    _id?: string;
    city: string;
    guideName: string;
    guestNationality: string;
    paxAdults: number;
    paxChildren: number;
    pickupHotelLocation: string;
    note?: string;
    days: Array<{
      day: number;
      date: string;
      time: string;
      include: string;
      exclude: string;
    }>;
  }>;
}

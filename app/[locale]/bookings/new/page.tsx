"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useBookingFormStore } from "@/lib/store";
// import { downloadPDF, shareToWhatsApp } from "@/lib/pdf-utils";
import {
  ArrowLeft,
  Hotel,
  MapPin,
  Minus,
  Plane,
  Plus,
  Save,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

export interface BookingFormData {
  // Basic Information
  fileNumber: string;
  supplier: string;
  paxCount: number;
  arrivalDate: string;
  departureDate: string;
  numberOfNights: number;
  nationality: string;

  // Flight Details
  arrivalFlight: {
    date: string;
    time: string;
    airlineName: string;
    flightNo: string;
  };
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

  // Accommodation
  hotels: Array<{
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

  // Itinerary & Cities
  include: string;
  exclude: string;
  specialNotice: string;
  dailyProgram: Array<{
    day: number;
    date: string;
    city: string;
    details: string;
  }>;

  // Transportation - Cairo
  cairoTransfer: {
    paxCount: number;
    vanType: string;
    days: Array<{
      day: number;
      date: string;
      city: string;
      description: string;
    }>;
    sendBy: string[];
  };

  // Transportation - Aswan/Luxor/Hurghada
  aswanLuxorTransfer: {
    paxCount: number;
    vanType: string;
    days: Array<{
      day: number;
      date: string;
      city: string;
      description: string;
    }>;
    sendBy: string[];
  };

  // Meeting & Assist
  meetingAssist: {
    paxCount: number;
    name: string;
    arrivalFlight: {
      date: string;
      time: string;
      airlineName: string;
      flightNo: string;
    };
    nationality: string;
  };

  // Guide Details
  guides: Array<{
    city: string;
    guideName: string;
    guestNationality: string;
    paxAdults: number;
    paxChildren: number;
    pickupHotelLocation: string;
    days: Array<{
      day: number;
      date: string;
      time: string;
      include: string;
      exclude: string;
    }>;
  }>;
}

export const vanTypes = [
  { id: "limousine", name: "Limousine", capacity: 3 },
  { id: "h1", name: "H1", capacity: 7 },
  { id: "hiace", name: "Hiace", capacity: 12 },
  { id: "coaster", name: "Coaster", capacity: 25 },
];

const cities = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Luxor",
  "Aswan",
  "Hurghada",
  "Sharm El Sheikh",
  "Dahab",
  "Marsa Alam",
  "Abu Simbel",
  "Edfu",
  "Kom Ombo",
  "Esna",
];

const nationalities = [
  "American",
  "British",
  "German",
  "French",
  "Italian",
  "Spanish",
  "Canadian",
  "Australian",
  "Japanese",
  "Chinese",
  "Russian",
  "Brazilian",
  "Other",
];

export default function NewBookingPage() {
  const t = useTranslations("bookings");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    defaultValues: {
      fileNumber: `BG-${new Date().getFullYear()}-${String(Date.now()).slice(
        -3
      )}`,
      supplier: "Book & Go Travel",
      paxCount: 2,
      numberOfNights: 7,
      nationality: "",
      arrivalDate: "",
      departureDate: "",
      arrivalFlight: { date: "", time: "", airlineName: "", flightNo: "" },
      departureFlight: { date: "", time: "", airlineName: "", flightNo: "" },
      domesticFlights: [
        {
          departure: "",
          arrival: "",
          date: "",
          time: "",
          airlineName: "",
          flightNo: "",
        },
      ],
      hotels: [{ name: "", checkIn: "", checkOut: "", status: "pending" }],
      nileCruise: { name: "", checkIn: "", checkOut: "", status: "pending" },
      include: "",
      exclude: "",
      specialNotice: "",
      dailyProgram: [{ day: 1, date: "", city: "", details: "" }],
      cairoTransfer: {
        paxCount: 2,
        vanType: "",
        days: [{ day: 1, date: "", city: "", description: "" }],
        sendBy: [],
      },
      aswanLuxorTransfer: {
        paxCount: 2,
        vanType: "",
        days: [{ day: 1, date: "", city: "", description: "" }],
        sendBy: [],
      },
      meetingAssist: {
        paxCount: 2,
        name: "",
        arrivalFlight: { date: "", time: "", airlineName: "", flightNo: "" },
        nationality: "",
      },
      guides: [
        {
          city: "",
          guideName: "",
          guestNationality: "",
          paxAdults: 0,
          paxChildren: 0,
          pickupHotelLocation: "",
          days: [{ day: 1, date: "", time: "", include: "", exclude: "" }],
        },
      ],
    },
  });

  const {
    fields: domesticFlightFields,
    append: appendDomesticFlight,
    remove: removeDomesticFlight,
  } = useFieldArray({ control, name: "domesticFlights" });

  const {
    fields: hotelFields,
    append: appendHotel,
    remove: removeHotel,
  } = useFieldArray({ control, name: "hotels" });

  const {
    fields: dailyProgramFields,
    append: appendDailyProgram,
    remove: removeDailyProgram,
  } = useFieldArray({ control, name: "dailyProgram" });

  const {
    fields: cairoDayFields,
    append: appendCairoDay,
    remove: removeCairoDay,
  } = useFieldArray({ control, name: "cairoTransfer.days" });

  const {
    fields: aswanDayFields,
    append: appendAswanDay,
    remove: removeAswanDay,
  } = useFieldArray({ control, name: "aswanLuxorTransfer.days" });

  const {
    fields: guideFields,
    append: appendGuide,
    remove: removeGuide,
  } = useFieldArray({ control, name: "guides" });
  const { setBookingData } = useBookingFormStore();
  const onSubmit = (data: BookingFormData) => {
    console.log("Booking Data saved ");
    setBookingData(data);
    toast({
      title: "you now will add Accounting data",
      description: "Please Complet the next Step ...",
    });

    // Redirect to accounting page for this booking
    setTimeout(() => {
      router.push(`/bookings/new/accounting`);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex items-center space-x-4 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                Complete Travel Operation Form
              </h1>
              <p className="text-muted-foreground">Book & Go Travel</p>
            </div>
          </div>
          {/* <div className="flex space-x-2 no-print flex-wrap">
            <Button
              variant="outline"
              onClick={handlePrintBooking}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <>
                  <Download className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Printer className="mr-2 h-4 w-4" />
                  Make PDF
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleWhatsAppShare}
              disabled={isGeneratingPDF}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Send WhatsApp
            </Button>
          </div> */}
        </div>

        {/* Printable Content */}
        <div ref={printRef} className="print-content ">
          {/* Logo and Header for Print */}
          <div className="hidden print:block text-center mb-8 p-6 border-b">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">
              Book & Go Travel
            </h1>
            <h2 className="text-2xl font-semibold mb-4">
              Complete Travel Operation Form
            </h2>
            <p className="text-lg">File Number: {watch("fileNumber")}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* 1. Basic Booking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Users className="mr-2 h-6 w-6" />
                  1. Basic Booking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <Label
                      htmlFor="fileNumber"
                      className="text-base font-medium"
                    >
                      File Number:
                    </Label>
                    <Input
                      id="fileNumber"
                      {...register("fileNumber", {
                        required: "File number is required",
                      })}
                      className="mt-1"
                    />
                    {errors.fileNumber && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.fileNumber.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="supplier" className="text-base font-medium">
                      Supplier:
                    </Label>
                    <Input
                      id="supplier"
                      {...register("supplier", {
                        required: "Supplier is required",
                      })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="paxCount" className="text-base font-medium">
                      No. of Pax:
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        setValue("paxCount", Number.parseInt(value))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select pax count" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 15 }, (_, i) => i + 1).map(
                          (num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor="arrivalDate"
                      className="text-base font-medium"
                    >
                      Arrival Date:
                    </Label>
                    <Input
                      id="arrivalDate"
                      type="date"
                      {...register("arrivalDate", {
                        required: "Arrival date is required",
                      })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="departureDate"
                      className="text-base font-medium"
                    >
                      Departure Date:
                    </Label>
                    <Input
                      id="departureDate"
                      type="date"
                      {...register("departureDate", {
                        required: "Departure date is required",
                      })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="numberOfNights"
                      className="text-base font-medium"
                    >
                      No. of Nights:
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        setValue("numberOfNights", Number.parseInt(value))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select nights" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(
                          (num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor="nationality"
                      className="text-base font-medium"
                    >
                      Nationality:
                    </Label>
                    <Select
                      onValueChange={(value) => setValue("nationality", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent>
                        {nationalities.map((nationality) => (
                          <SelectItem key={nationality} value={nationality}>
                            {nationality}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Flight Details */}
                <Separator />
                <h3 className="text-lg font-semibold">Flight Details</h3>

                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">
                      Arrival Flight Details:
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                      <div>
                        <Label className="text-sm">Date</Label>
                        <Input
                          type="date"
                          {...register("arrivalFlight.date")}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Time</Label>
                        <Input
                          type="time"
                          {...register("arrivalFlight.time")}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Airline Name</Label>
                        <Input
                          {...register("arrivalFlight.airlineName")}
                          placeholder="EgyptAir"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Flight No</Label>
                        <Input
                          {...register("arrivalFlight.flightNo")}
                          placeholder="MS123"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">
                      Departure Flight Details:
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                      <div>
                        <Label className="text-sm">Date</Label>
                        <Input
                          type="date"
                          {...register("departureFlight.date")}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Time</Label>
                        <Input
                          type="time"
                          {...register("departureFlight.time")}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Airline Name</Label>
                        <Input
                          {...register("departureFlight.airlineName")}
                          placeholder="EgyptAir"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Flight No</Label>
                        <Input
                          {...register("departureFlight.flightNo")}
                          placeholder="MS456"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Domestic Flights */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">
                      Domestic Flight Details
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendDomesticFlight({
                          departure: "",
                          arrival: "",
                          date: "",
                          time: "",
                          airlineName: "",
                          flightNo: "",
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Flight
                    </Button>
                  </div>

                  {domesticFlightFields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium">
                          Flight Details {index + 1}
                        </h5>
                        {domesticFlightFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeDomesticFlight(index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div>
                          <Label className="text-sm">Departure</Label>
                          <Select
                            onValueChange={(value) =>
                              setValue(
                                `domesticFlights.${index}.departure`,
                                value
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                            <SelectContent>
                              {cities.map((city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm">Arrival</Label>
                          <Select
                            onValueChange={(value) =>
                              setValue(
                                `domesticFlights.${index}.arrival`,
                                value
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                            <SelectContent>
                              {cities.map((city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm">Date</Label>
                          <Input
                            type="date"
                            {...register(`domesticFlights.${index}.date`)}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Time</Label>
                          <Input
                            type="time"
                            {...register(`domesticFlights.${index}.time`)}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Airline Name</Label>
                          <Input
                            {...register(
                              `domesticFlights.${index}.airlineName`
                            )}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Flight No</Label>
                          <Input
                            {...register(`domesticFlights.${index}.flightNo`)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 2. Accommodation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Hotel className="mr-2 h-6 w-6" />
                  2. Accommodation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Hotels</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendHotel({
                          name: "",
                          checkIn: "",
                          checkOut: "",
                          status: "pending",
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Hotel
                    </Button>
                  </div>

                  {hotelFields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium">Hotel Name {index + 1}</h5>
                        {hotelFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeHotel(index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm">Hotel Name</Label>
                          <Input
                            {...register(`hotels.${index}.name`)}
                            placeholder="Hotel name"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Check-in</Label>
                          <Input
                            type="date"
                            {...register(`hotels.${index}.checkIn`)}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Check-out</Label>
                          <Input
                            type="date"
                            {...register(`hotels.${index}.checkOut`)}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Status</Label>
                          <RadioGroup
                            defaultValue="pending"
                            onValueChange={(value) =>
                              setValue(
                                `hotels.${index}.status`,
                                value as "pending" | "confirmed"
                              )
                            }
                          >
                            <div className="flex items-center space-x-4 flex-wrap">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="pending"
                                  id={`pending-${index}`}
                                />
                                <Label htmlFor={`pending-${index}`}>
                                  Pending
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="confirmed"
                                  id={`confirmed-${index}`}
                                />
                                <Label htmlFor={`confirmed-${index}`}>
                                  Confirmed
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Nile Cruise */}
                <Separator />
                <div>
                  <Label className="text-base font-medium">Nile Cruise</Label>
                  <div className="border rounded-lg p-4 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm">Nile Cruise Name</Label>
                        <Input
                          {...register("nileCruise.name")}
                          placeholder="Cruise name"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Check-in</Label>
                        <Input
                          type="date"
                          {...register("nileCruise.checkIn")}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Check-out</Label>
                        <Input
                          type="date"
                          {...register("nileCruise.checkOut")}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Status</Label>
                        <RadioGroup
                          defaultValue="pending"
                          onValueChange={(value) =>
                            setValue(
                              "nileCruise.status",
                              value as "pending" | "confirmed"
                            )
                          }
                        >
                          <div className="flex items-center space-x-4 flex-wrap">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="pending"
                                id="cruise-pending"
                              />
                              <Label htmlFor="cruise-pending">Pending</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="confirmed"
                                id="cruise-confirmed"
                              />
                              <Label htmlFor="cruise-confirmed">
                                Confirmed
                              </Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Itinerary & Cities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <MapPin className="mr-2 h-6 w-6" />
                  3. Itinerary & Cities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="include" className="text-base font-medium">
                      Include:
                    </Label>
                    <Textarea
                      id="include"
                      {...register("include")}
                      placeholder="What's included in the package..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="exclude" className="text-base font-medium">
                      Exclude:
                    </Label>
                    <Textarea
                      id="exclude"
                      {...register("exclude")}
                      placeholder="What's excluded from the package..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="specialNotice"
                      className="text-base font-medium"
                    >
                      Special Notice:
                    </Label>
                    <Textarea
                      id="specialNotice"
                      {...register("specialNotice")}
                      placeholder="Any special notices or requirements..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>

                <Separator />

                {/* Daily Program */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">
                      Daily Program
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendDailyProgram({
                          day: dailyProgramFields.length + 1,
                          date: "",
                          city: "",
                          details: "",
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add More Days
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Day</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dailyProgramFields.map((field, index) => (
                          <TableRow key={field.id}>
                            <TableCell>
                              <Input
                                type="number"
                                {...register(`dailyProgram.${index}.day`)}
                                className="w-20"
                                defaultValue={index + 1}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="date"
                                {...register(`dailyProgram.${index}.date`)}
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                onValueChange={(value) =>
                                  setValue(`dailyProgram.${index}.city`, value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select city" />
                                </SelectTrigger>
                                <SelectContent>
                                  {cities.map((city) => (
                                    <SelectItem key={city} value={city}>
                                      {city}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Textarea
                                {...register(`dailyProgram.${index}.details`)}
                                placeholder="Day activities and details..."
                                rows={2}
                              />
                            </TableCell>
                            <TableCell>
                              {dailyProgramFields.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeDailyProgram(index)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* <div className="flex justify-end no-print">
                  <Button variant="outline" onClick={handlePrintBooking}>
                    <Printer className="mr-2 h-4 w-4" />
                    Make PDF
                  </Button>
                </div> */}
              </CardContent>
            </Card>

            {/* 5. Transportation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Plane className="mr-2 h-6 w-6" />
                  5. Transportation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Cairo Transfer Order */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">
                    Cairo Transfer Order
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-base font-medium">
                        No. of Pax (1-15):
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          setValue(
                            "cairoTransfer.paxCount",
                            Number.parseInt(value)
                          )
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select pax count" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 15 }, (_, i) => i + 1).map(
                            (num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Van Type:</Label>
                      <Select
                        onValueChange={(value) =>
                          setValue("cairoTransfer.vanType", value)
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select van type" />
                        </SelectTrigger>
                        <SelectContent>
                          {vanTypes.map((van) => (
                            <SelectItem key={van.id} value={van.name}>
                              {van.name} (Capacity: {van.capacity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">
                        Daily Schedule
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendCairoDay({
                            day: cairoDayFields.length + 1,
                            date: "",
                            city: "",
                            description: "",
                          })
                        }
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add More Day
                      </Button>
                    </div>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Day</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cairoDayFields.map((field, index) => (
                            <TableRow key={field.id}>
                              <TableCell>
                                <Input
                                  type="number"
                                  {...register(
                                    `cairoTransfer.days.${index}.day`
                                  )}
                                  className="w-20"
                                  defaultValue={index + 1}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="date"
                                  {...register(
                                    `cairoTransfer.days.${index}.date`
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  onValueChange={(value) =>
                                    setValue(
                                      `cairoTransfer.days.${index}.city`,
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select city" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {cities.map((city) => (
                                      <SelectItem key={city} value={city}>
                                        {city}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Textarea
                                  {...register(
                                    `cairoTransfer.days.${index}.description`
                                  )}
                                  placeholder="Transportation details..."
                                  rows={2}
                                />
                              </TableCell>
                              <TableCell>
                                {cairoDayFields.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeCairoDay(index)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* <div>
                    <Label className="text-base font-medium">
                      Send Service Order by:
                    </Label>
                    <div className="flex space-x-4 mt-2 flex-wrap gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="cairo-whatsapp" />
                        <Label htmlFor="cairo-whatsapp">WhatsApp</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="cairo-text" />
                        <Label htmlFor="cairo-text">Text Message</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="cairo-email" />
                        <Label htmlFor="cairo-email">Email</Label>
                      </div>
                    </div>
                  </div> */}
                </div>

                <Separator />

                {/* Aswan Luxor Nile cruise & Hurghada Transfer Order */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">
                    Aswan Luxor Nile cruise & Hurghada Transfer Order
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-base font-medium">
                        No. of Pax (1-15):
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          setValue(
                            "aswanLuxorTransfer.paxCount",
                            Number.parseInt(value)
                          )
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select pax count" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 15 }, (_, i) => i + 1).map(
                            (num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Van Type:</Label>
                      <Select
                        onValueChange={(value) =>
                          setValue("aswanLuxorTransfer.vanType", value)
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select van type" />
                        </SelectTrigger>
                        <SelectContent>
                          {vanTypes.map((van) => (
                            <SelectItem key={van.id} value={van.name}>
                              {van.name} (Capacity: {van.capacity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">
                        Daily Schedule
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendAswanDay({
                            day: aswanDayFields.length + 1,
                            date: "",
                            city: "",
                            description: "",
                          })
                        }
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add More Day
                      </Button>
                    </div>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Day</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {aswanDayFields.map((field, index) => (
                            <TableRow key={field.id}>
                              <TableCell>
                                <Input
                                  type="number"
                                  {...register(
                                    `aswanLuxorTransfer.days.${index}.day`
                                  )}
                                  className="w-20"
                                  defaultValue={index + 1}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="date"
                                  {...register(
                                    `aswanLuxorTransfer.days.${index}.date`
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  onValueChange={(value) =>
                                    setValue(
                                      `aswanLuxorTransfer.days.${index}.city`,
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select city" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {cities.map((city) => (
                                      <SelectItem key={city} value={city}>
                                        {city}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Textarea
                                  {...register(
                                    `aswanLuxorTransfer.days.${index}.description`
                                  )}
                                  placeholder="Transportation details..."
                                  rows={2}
                                />
                              </TableCell>
                              <TableCell>
                                {aswanDayFields.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeAswanDay(index)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* <div>
                    <Label className="text-base font-medium">
                      Send Service Order by:
                    </Label>
                    <div className="flex space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="aswan-whatsapp" />
                        <Label htmlFor="aswan-whatsapp">WhatsApp</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="aswan-text" />
                        <Label htmlFor="aswan-text">Text Message</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="aswan-email" />
                        <Label htmlFor="aswan-email">Email</Label>
                      </div>
                    </div>
                  </div> */}
                </div>
              </CardContent>
            </Card>

            {/* 4. Meeting & Assist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Users className="mr-2 h-6 w-6" />
                  4. Meeting & Assist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="meetingPax"
                      className="text-base font-medium"
                    >
                      No. of Pax:
                    </Label>
                    <Input
                      id="meetingPax"
                      type="number"
                      {...register("meetingAssist.paxCount")}
                      placeholder="Number of passengers"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="meetingName"
                      className="text-base font-medium"
                    >
                      Name:
                    </Label>
                    <Input
                      id="meetingName"
                      {...register("meetingAssist.name")}
                      placeholder="Contact person name"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    Arrival Flight Details:
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm">Date</Label>
                      <Input
                        type="date"
                        {...register("meetingAssist.arrivalFlight.date")}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Time</Label>
                      <Input
                        type="time"
                        {...register("meetingAssist.arrivalFlight.time")}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Airline Name</Label>
                      <Input
                        {...register("meetingAssist.arrivalFlight.airlineName")}
                        placeholder="EgyptAir"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Flight No</Label>
                      <Input
                        {...register("meetingAssist.arrivalFlight.flightNo")}
                        placeholder="MS123"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="meetingNationality"
                    className="text-base font-medium"
                  >
                    Nationality:
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("meetingAssist.nationality", value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      {nationalities.map((nationality) => (
                        <SelectItem key={nationality} value={nationality}>
                          {nationality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* <div className="flex space-x-4 no-print flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleWhatsAppShare}
                    className="gap-3"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send WhatsApp
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrintBooking}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print service order
                  </Button>
                </div> */}
              </CardContent>
            </Card>

            {/* 5. Guide Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Users className="mr-2 h-6 w-6" />
                  5. Guide Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {guideFields.map((field, guideIndex) => (
                  <div key={field.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-semibold">
                        Guide {guideIndex + 1}
                      </h4>
                      {guideFields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeGuide(guideIndex)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <Label className="text-base font-medium">City:</Label>
                        <Select
                          onValueChange={(value) =>
                            setValue(`guides.${guideIndex}.city`, value)
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-base font-medium">
                          Guide Name:
                        </Label>
                        <Input
                          {...register(`guides.${guideIndex}.guideName`)}
                          placeholder="Guide name"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <Label className="text-base font-medium">
                          Guest Nationality:
                        </Label>
                        <Select
                          onValueChange={(value) =>
                            setValue(
                              `guides.${guideIndex}.guestNationality`,
                              value
                            )
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select nationality" />
                          </SelectTrigger>
                          <SelectContent>
                            {nationalities.map((nationality) => (
                              <SelectItem key={nationality} value={nationality}>
                                {nationality}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-base font-medium">
                          Pickup Hotel Location:
                        </Label>
                        <Input
                          {...register(
                            `guides.${guideIndex}.pickupHotelLocation`
                          )}
                          placeholder="Hotel location"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <Label className="text-base font-medium">
                          No. of Pax - Adults:
                        </Label>
                        <Input
                          type="number"
                          {...register(`guides.${guideIndex}.paxAdults`)}
                          placeholder="Number of adults"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-base font-medium">
                          No. of Pax - Children:
                        </Label>
                        <Input
                          type="number"
                          {...register(`guides.${guideIndex}.paxChildren`)}
                          placeholder="Number of children"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Guide Daily Schedule */}
                    <div className="space-y-4">
                      <Label className="text-base font-medium">
                        Daily Schedule
                      </Label>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Day</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Time</TableHead>
                              <TableHead>Include</TableHead>
                              <TableHead>Exclude</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Array.from({ length: 4 }, (_, dayIndex) => (
                              <TableRow key={dayIndex}>
                                <TableCell>
                                  <Input
                                    type="number"
                                    {...register(
                                      `guides.${guideIndex}.days.${dayIndex}.day`
                                    )}
                                    defaultValue={dayIndex + 1}
                                    className="w-20"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="date"
                                    {...register(
                                      `guides.${guideIndex}.days.${dayIndex}.date`
                                    )}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="time"
                                    {...register(
                                      `guides.${guideIndex}.days.${dayIndex}.time`
                                    )}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Textarea
                                    {...register(
                                      `guides.${guideIndex}.days.${dayIndex}.include`
                                    )}
                                    placeholder="What's included..."
                                    rows={2}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Textarea
                                    {...register(
                                      `guides.${guideIndex}.days.${dayIndex}.exclude`
                                    )}
                                    placeholder="What's excluded..."
                                    rows={2}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    appendGuide({
                      city: "",
                      guideName: "",
                      guestNationality: "",
                      paxAdults: 0,
                      paxChildren: 0,
                      pickupHotelLocation: "",
                      days: [
                        {
                          day: 1,
                          date: "",
                          time: "",
                          include: "",
                          exclude: "",
                        },
                      ],
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Guide {guideFields.length + 1}
                </Button>

                {/* Notes for the Guide */}
                {/* <div className="bg-muted p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Notes for the Guide</h5>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>- Be on time at pickup location.</li>
                    <li>
                      - Follow the program strictly unless client requests
                      changes.
                    </li>
                    <li>
                      - Any extra service requested must be reported to
                      operations team.
                    </li>
                    <li>
                      - Kindly send daily feedback or updates to [Operations
                      Contact / WhatsApp].
                    </li>
                  </ul>
                </div> */}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center no-print">
              <Button type="submit" size="lg" className="px-8">
                <Save className="mr-2 h-5 w-5" />
                <Link href="/bookings/new/accounting">
                  Create Booking & Go to Accounting
                </Link>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

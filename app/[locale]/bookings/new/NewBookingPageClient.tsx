// المسار: /app/[locale]/bookings/new/NewBookingPageClient.tsx
"use client";

import { createBookingAction } from "@/actions/bookingActions";
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
import { BookingTypes } from "@/types/bookingData";
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
import { useRouter } from "next/navigation";
// START: MODIFICATION - 1. استيراد useEffect
import { useEffect, useMemo, useRef, useTransition } from "react";
// END: MODIFICATION - 1
import {
  Control,
  useFieldArray,
  UseFieldArrayRemove,
  useForm,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";

// --- Interfaces ---

// واجهة تصف شكل كل عنصر قادم من الخادم
interface DataItem {
  id: string;
  name: string;
  [key: string]: any; // للسماح بخصائص إضافية مثل 'city' في الفنادق
}

// واجهة تصف شكل كل البيانات المجمعة القادمة من الخادم
interface BookingDataProps {
  cities: DataItem[];
  hotels: DataItem[];
  vans: DataItem[];
  guides: DataItem[];
  nationalities: DataItem[];
  nileCruises: DataItem[];
  vendors: DataItem[];
  domesticAirlines: DataItem[];
  internationalAirlines: DataItem[];
}

// واجهة لمكون المرشد الفرعي
interface GuideItemProps {
  guideItem: { id: string };
  guideIndex: number;
  control: Control<BookingTypes>;
  register: UseFormRegister<BookingTypes>;
  setValue: UseFormSetValue<BookingTypes>;
  removeGuide: UseFieldArrayRemove;
  guideFields: { id: string }[];
  cities: DataItem[];
  guides: DataItem[];
  nationalities: DataItem[];
}

// --- مكون المرشد الفرعي ---
function GuideItem({
  guideItem,
  guideIndex,
  control,
  register,
  setValue,
  removeGuide,
  guideFields,
  cities,
  guides,
  nationalities,
}: GuideItemProps) {
  const {
    fields: guideDayFields,
    append: appendGuideDay,
    remove: removeGuideDay,
  } = useFieldArray({
    control,
    name: `guides.${guideIndex}.days`,
  });

  return (
    <div key={guideItem.id} className="border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-semibold">Guide {guideIndex + 1}</h4>
        {guideFields.length > 1 && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => removeGuide(guideIndex)}
          >
            <Minus className="h-4 w-4 mr-2" />
            Remove Guide
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
                <SelectItem key={city.id} value={city.name}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-base font-medium">Guide Name:</Label>
          <Select
            onValueChange={(value) =>
              setValue(`guides.${guideIndex}.guideName`, value)
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select guide" />
            </SelectTrigger>
            <SelectContent>
              {guides.map((guide) => (
                <SelectItem key={guide.id} value={guide.name}>
                  {guide.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label className="text-base font-medium">Guest Nationality:</Label>
          <Select
            onValueChange={(value) =>
              setValue(`guides.${guideIndex}.guestNationality`, value)
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select nationality" />
            </SelectTrigger>
            <SelectContent>
              {nationalities.map((nationality) => (
                <SelectItem key={nationality.id} value={nationality.name}>
                  {nationality.name}
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
            {...register(`guides.${guideIndex}.pickupHotelLocation`)}
            placeholder="Hotel location"
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label className="text-base font-medium">No. of Pax - Adults:</Label>
          <Input
            type="number"
            {...register(`guides.${guideIndex}.paxAdults`)}
            placeholder="Number of adults"
            className="mt-1"
            readOnly
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
            readOnly
          />
        </div>
      </div>
      <div className="mb-6">
        <Label className="text-base font-medium">Note:</Label>
        <Textarea
          {...register(`guides.${guideIndex}.note`)}
          placeholder="Any special notes for this guide..."
          className="mt-1"
          rows={2}
        />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Daily Schedule</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendGuideDay({
                day: guideDayFields.length + 1,
                date: "",
                time: "",
                include: "",
                exclude: "",
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Day
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Include</TableHead>
                <TableHead>Exclude</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guideDayFields.map((dayItem, dayIndex) => (
                <TableRow key={dayItem.id}>
                  <TableCell>
                    <Input
                      type="number"
                      {...register(`guides.${guideIndex}.days.${dayIndex}.day`)}
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
                  <TableCell>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeGuideDay(dayIndex)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

// --- المكون الرئيسي للصفحة ---
export function NewBookingPageClient({
  initialData,
}: {
  initialData: BookingDataProps;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  // --- استخراج البيانات من الـ props ---
  const {
    cities = [],
    hotels = [],
    vans = [],
    guides = [],
    nationalities = [],
    nileCruises = [],
    vendors = [],
    domesticAirlines = [],
    internationalAirlines = [],
  } = initialData || {};

  // --- معالجة بيانات الفنادق لفرزها حسب المدينة ---
  const hotelsByCity = useMemo(() => {
    if (!hotels || hotels.length === 0) return {};
    return hotels.reduce(
      (acc: { [key: string]: DataItem[] }, hotel: DataItem) => {
        const cityName = hotel.city?.name;
        if (!acc[cityName]) {
          acc[cityName] = [];
        }
        acc[cityName].push(hotel);
        return acc;
      },
      {}
    );
  }, [hotels]);

  const citiesWithHotels = useMemo(
    () => Object.keys(hotelsByCity),
    [hotelsByCity]
  ); 
  // React Hook Form setup
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingTypes>({
    defaultValues: {
      fileNumber: `BG-${new Date().getFullYear()}-${String(Date.now()).slice(
        -3
      )}`,
      guests: [{ firstName: "", lastName: "", type: "adult", title: "Mr" }],
      vendor: "",
      paxCount: 2,
      childCount: 0,
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
      hotels: [
        { city: "", name: "", checkIn: "", checkOut: "", status: "pending" },
      ],
      nileCruise: { name: "", checkIn: "", checkOut: "", status: "pending" },
      include: "",
      exclude: "",
      specialNotice: "",
      dailyProgram: [{ day: 1, date: "", city: "", details: "" }],
      cairoTransfer: {
        paxCount: 2,
        vanType: "",
        driver: { name: "", contact: "", description: "" },
        days: [{ day: 1, date: "", city: "", description: "" }],
      },
      aswanLuxorTransfer: {
        paxCount: 2,
        vanType: "",
        days: [{ day: 1, date: "", city: "", description: "" }],
      },
      meetingAssist: {
        paxAdults: 2,
        paxChildren: 0,
        note: "",
        name: "",
        driver: { name: "", contact: "" },
        arrivalFlight: { date: "", time: "", airlineName: "", flightNo: "" },
        nationality: "",
      },
      guides: [
        {
          city: "",
          guideName: "",
          guestNationality: "",
          paxAdults: 2, // قيمة مبدئية
          paxChildren: 0, // قيمة مبدئية
          pickupHotelLocation: "",
          note: "",
          days: [{ day: 1, date: "", time: "", include: "", exclude: "" }],
        },
      ],
    },
  });

  // useFieldArray hooks
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
  const {
    fields: guestFields,
    append: appendGuest,
    remove: removeGuest,
  } = useFieldArray({ control, name: "guests" });

  // START: MODIFICATION - 2. إضافة مراقبة و useEffects
  // مراقبة الحقول الرئيسية لعدد البالغين والأطفال
  const paxCount = watch("paxCount");
  const childCount = watch("childCount");

  // Effect لمزامنة عدد البالغين
  useEffect(() => {
    if (paxCount !== undefined) {
      const numValue = Number(paxCount);
      // تحديث الأقسام الأخرى
      setValue("cairoTransfer.paxCount", numValue);
      setValue("aswanLuxorTransfer.paxCount", numValue);
      setValue("meetingAssist.paxAdults", numValue);

      // تحديث كل المرشدين الحاليين
      guideFields.forEach((_, index) => {
        setValue(`guides.${index}.paxAdults`, numValue);
      });
    }
  }, [paxCount, guideFields, setValue]);

  // Effect لمزامنة عدد الأطفال
  useEffect(() => {
    if (childCount !== undefined) {
      const numValue = Number(childCount);
      // تحديث الأقسام الأخرى
      setValue("meetingAssist.paxChildren", numValue);

      // تحديث كل المرشدين الحاليين
      guideFields.forEach((_, index) => {
        setValue(`guides.${index}.paxChildren`, numValue);
      });
    }
  }, [childCount, guideFields, setValue]);
  // END: MODIFICATION - 2

  const onSubmit = (data: BookingTypes) => {
    startTransition(async () => {
      const result = await createBookingAction(data);
      if (result && !result.success) {
        toast({
          title: "Error Creating Booking",
          description: result.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Booking Created Successfully!",
          description: "You are being redirected...",
        });
      }
    });
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
        </div>

        {/* Printable Content */}
        <div ref={printRef} className="print-content ">
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
                      {...register(
                        "fileNumber"
                        //  , {
                        //  required: "File number is required",
                        // }
                      )}
                      className="mt-1"
                    />
                    {errors.fileNumber && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.fileNumber.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="vendor">Vendor:</Label>
                    <Select
                      onValueChange={(value) => setValue("vendor", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map((vendor) => (
                          <SelectItem
                            key={vendor.id || vendor._id}
                            value={vendor.name}
                          >
                            {vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="paxCount" className="text-base font-medium">
                      No. of Pax:
                    </Label>
                    <Select
                      value={watch("paxCount")?.toString()}
                      // START: MODIFICATION - 3. تبسيط onValueChange
                      onValueChange={(value) => {
                        const numValue = Number.parseInt(value);
                        setValue("paxCount", numValue);
                      }}
                      // END: MODIFICATION - 3
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
                      htmlFor="childCount"
                      className="text-base font-medium"
                    >
                      No. of Pax Child:
                    </Label>
                    <Select
                      value={watch("childCount")?.toString()}
                      // START: MODIFICATION - 4. تبسيط onValueChange
                      onValueChange={(value) => {
                        setValue("childCount", Number.parseInt(value));
                      }}
                      // END: MODIFICATION - 4
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select child count" />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
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
                      {...register(
                        "arrivalDate"
                        //  , {
                        //  required: "Arrival date is required",
                        // }
                      )}
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
                      {...register(
                        "departureDate"

                        //,  {
                        //  required: "Departure date is required",
                        // }
                      )}
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
                          <SelectItem
                            key={nationality.id}
                            value={nationality.name}
                          >
                            {nationality.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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
                        <Select
                          onValueChange={(value) =>
                            setValue("arrivalFlight.airlineName", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Airline" />
                          </SelectTrigger>
                          <SelectContent>
                            {internationalAirlines.map((airline) => (
                              <SelectItem key={airline.id} value={airline.name}>
                                {airline.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Select
                          onValueChange={(value) =>
                            setValue("departureFlight.airlineName", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Airline" />
                          </SelectTrigger>
                          <SelectContent>
                            {internationalAirlines.map((airline) => (
                              <SelectItem key={airline.id} value={airline.name}>
                                {airline.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                      <Plus className="mr-2 h-4 w-4" /> Add Flight
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
                        <div className="space-y-1">
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
                                <SelectItem key={city.id} value={city.name}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
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
                                <SelectItem key={city.id} value={city.name}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm">Airline Name</Label>
                          <Select
                            onValueChange={(value) =>
                              setValue(
                                `domesticFlights.${index}.airlineName`,
                                value
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Airline" />
                            </SelectTrigger>
                            <SelectContent>
                              {domesticAirlines.map((airline) => (
                                <SelectItem
                                  key={airline.id}
                                  value={airline.name}
                                >
                                  {airline.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm">Date</Label>
                          <Input
                            type="date"
                            {...register(`domesticFlights.${index}.date`)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm">Time</Label>
                          <Input
                            type="time"
                            {...register(`domesticFlights.${index}.time`)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm">Flight No</Label>
                          <Input
                            placeholder="Flight No"
                            {...register(`domesticFlights.${index}.flightNo`)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* 2. Guest Information (NEW SECTION) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Users className="mr-2 h-6 w-6" />
                  2. Guest Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* We will map over the guestFields from useFieldArray */}
                {guestFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium">Guest {index + 1}</h5>
                      {/* Show remove button only if there is more than one guest */}
                      {guestFields.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeGuest(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Title Select */}
                      <div>
                        <Label className="text-sm">Title</Label>
                        <Select
                          onValueChange={(value) =>
                            setValue(
                              `guests.${index}.title`,
                              value as "Mr" | "Mrs" | "Ms"
                            )
                          }
                          defaultValue={field.title}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select title" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mr">Mr.</SelectItem>
                            <SelectItem value="Mrs">Mrs.</SelectItem>
                            <SelectItem value="Ms">Ms.</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* First Name Input */}
                      <div>
                        <Label className="text-sm">First Name</Label>
                        <Input
                          {...register(`guests.${index}.firstName`)}
                          placeholder="First Name"
                          className="mt-1"
                        />
                      </div>

                      {/* Last Name Input */}
                      <div>
                        <Label className="text-sm">Last Name</Label>
                        <Input
                          {...register(`guests.${index}.lastName`)}
                          placeholder="Last Name"
                          className="mt-1"
                        />
                      </div>

                      {/* Type Select (Adult/Child) */}
                      <div>
                        <Label className="text-sm">Type</Label>
                        <Select
                          onValueChange={(value) =>
                            setValue(
                              `guests.${index}.type`,
                              value as "adult" | "child"
                            )
                          }
                          defaultValue={field.type}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="adult">Adult</SelectItem>
                            <SelectItem value="child">Child</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Button to add a new guest */}
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() =>
                    appendGuest({
                      title: "Mr",
                      firstName: "",
                      lastName: "",
                      type: "adult",
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Guest
                </Button>
              </CardContent>
            </Card>
            {/* 2. Accommodation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Hotel className="mr-2 h-6 w-6" /> 2. Accommodation
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
                          city: "",
                          name: "",
                          checkIn: "",
                          checkOut: "",
                          status: "pending",
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Hotel
                    </Button>
                  </div>
                  {hotelFields.map((field, index) => {
                    const selectedCity = watch(`hotels.${index}.city`);
                    return (
                      <div key={field.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="font-medium">Hotel {index + 1}</h5>
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
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div>
                            <Label className="text-sm">City</Label>
                            <Select
                              onValueChange={(value) => {
                                setValue(`hotels.${index}.city`, value);
                                setValue(`hotels.${index}.name`, "");
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select city" />
                              </SelectTrigger>
                              <SelectContent>
                                {citiesWithHotels.map((city) => (
                                  <SelectItem key={city} value={city}>
                                    {city}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-sm">Hotel Name</Label>
                            <Select
                              disabled={!selectedCity}
                              value={watch(`hotels.${index}.name`)}
                              onValueChange={(value) =>
                                setValue(`hotels.${index}.name`, value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select hotel" />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedCity && hotelsByCity[selectedCity] ? (
                                  hotelsByCity[selectedCity].map((hotel) => (
                                    <SelectItem
                                      key={hotel.id}
                                      value={hotel.name}
                                    >
                                      {hotel.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="null" disabled>
                                    No city selected
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
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
                              className="flex items-center space-x-4 pt-2"
                            >
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
                            </RadioGroup>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator />
                <div>
                  <Label className="text-base font-medium">Nile Cruise</Label>
                  <div className="border rounded-lg p-4 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm">Nile Cruise Name</Label>
                        <Select
                          onValueChange={(value) =>
                            setValue("nileCruise.name", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Cruise" />
                          </SelectTrigger>
                          <SelectContent>
                            {nileCruises.map((cruise) => (
                              <SelectItem key={cruise.id} value={cruise.name}>
                                {cruise.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                      <Plus className="mr-2 h-4 w-4" /> Add More Days
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
                          <TableHead />
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
                                    <SelectItem key={city.id} value={city.name}>
                                      {city.name}
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
              </CardContent>
            </Card>

            {/* 4. Transportation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Plane className="mr-2 h-6 w-6" />
                  4. Transportation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">
                    Cairo Transfer Order
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-base font-medium">
                        No. of Pax:
                      </Label>
                      <Select
                        disabled
                        value={watch("cairoTransfer.paxCount")?.toString()}
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
                          {vans.map((van) => (
                            <SelectItem key={van.id} value={van.name}>
                              {van.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-base font-medium">
                        Driver name:
                      </Label>
                      <Input
                        {...register("cairoTransfer.driver.name")}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-base font-medium">
                        Driver Contact:
                      </Label>
                      <Input
                        {...register("cairoTransfer.driver.contact")}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-base font-medium">
                        Driver Description:
                      </Label>
                      <Input
                        {...register("cairoTransfer.driver.description")}
                        className="mt-1"
                      />
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
                        <Plus className="mr-2 h-4 w-4" /> Add More Day
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
                            <TableHead />
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
                                      <SelectItem
                                        key={city.id}
                                        value={city.name}
                                      >
                                        {city.name}
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
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">
                    Aswan/Luxor/Hurghada Transfer Order
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-base font-medium">
                        No. of Pax:
                      </Label>
                      <Select
                        disabled
                        value={watch("aswanLuxorTransfer.paxCount")?.toString()}
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
                          {vans.map((van) => (
                            <SelectItem key={van.id} value={van.name}>
                              {van.name}
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
                        <Plus className="mr-2 h-4 w-4" /> Add More Day
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
                            <TableHead />
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
                                      <SelectItem
                                        key={city.id}
                                        value={city.name}
                                      >
                                        {city.name}
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
                </div>
              </CardContent>
            </Card>

            {/* 5. Meeting & Assist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Users className="mr-2 h-6 w-6" />
                  4. Meeting & Assist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-base font-medium">
                      No. of Pax: Adults
                    </Label>
                    <Select
                      disabled
                      value={watch("meetingAssist.paxAdults")?.toString()}
                      onValueChange={(value) =>
                        setValue(
                          "meetingAssist.paxAdults",
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
                    <Label className="text-base font-medium">
                      No. of Pax - Children:
                    </Label>
                    <Input
                      type="number"
                      readOnly
                      {...register("meetingAssist.paxChildren")}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-base font-medium">Name:</Label>
                    <Input
                      {...register("meetingAssist.name")}
                      placeholder="Contact person name"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base font-medium">
                      Driver name:
                    </Label>
                    <Input
                      {...register("meetingAssist.driver.name")}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-base font-medium">
                      Driver Contact:
                    </Label>
                    <Input
                      {...register("meetingAssist.driver.contact")}
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
                      <Select
                        onValueChange={(value) =>
                          setValue(
                            "meetingAssist.arrivalFlight.airlineName",
                            value
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Airline" />
                        </SelectTrigger>
                        <SelectContent>
                          {internationalAirlines.map((name) => (
                            <SelectItem key={name.id} value={name.name}>
                              {name.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                  <Label className="text-base font-medium">Nationality:</Label>
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
                        <SelectItem
                          key={nationality.id}
                          value={nationality.name}
                        >
                          {nationality.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-base font-medium">Note:</Label>
                  <Textarea
                    {...register("meetingAssist.note")}
                    placeholder="Any special notes for the meeting and assist service..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 6. Guide Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Users className="mr-2 h-6 w-6" />
                  4. Guide Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {guideFields.map((guideItem, guideIndex) => (
                  <GuideItem
                    key={guideItem.id}
                    guideItem={guideItem}
                    guideIndex={guideIndex}
                    control={control}
                    register={register}
                    setValue={setValue}
                    removeGuide={removeGuide}
                    guideFields={guideFields}
                    cities={cities}
                    guides={guides}
                    nationalities={nationalities}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  // START: MODIFICATION - 5. تحديث القيم عند إضافة مرشد جديد
                  onClick={() =>
                    appendGuide({
                      city: "",
                      guideName: "",
                      guestNationality: "",
                      paxAdults: paxCount || 0, // استخدام القيمة المراقبة
                      paxChildren: childCount || 0, // استخدام القيمة المراقبة
                      pickupHotelLocation: "",
                      note: "",
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
                  // END: MODIFICATION - 5
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Guide
                </Button>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center no-print">
              <Button
                type="submit"
                size="lg"
                className="px-8"
                disabled={isPending}
              >
                {isPending ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Create Booking
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

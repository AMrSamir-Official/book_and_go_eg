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
import {
  invoiceStatuses,
  paymentMethods,
  sampleBookings,
} from "@/lib/fake-data";
import { useBookingFormStore } from "@/lib/store";
import { DollarSign, Minus, Plus, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { TransportationItem } from "./TransportationItem"; // تأكد من صحة المسار

interface InvoiceFormData {
  // Basic Information
  title: string;
  invoiceNumber: string;
  bookingId: string;
  bookingDate: string;
  fileNumber: string;
  supplierName: string;
  arrivalFileDate: string;

  // Main Invoice
  totalInvoiceAmount: number;
  totalInvoiceCurrency: "EGP" | "USD";
  totalInvoiceExchangeRate?: number;
  paidAmount: number;
  restAmount: number;
  restAmountCurrency: "EGP" | "USD";
  restAmountExchangeRate?: number;
  wayOfPayment: string;
  paymentDate: string;

  // Extra Incoming
  extraIncoming: Array<{
    type: string;
    amount: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
    note: string;
    status: "pending" | "paid";
    date: string;
  }>;

  // Expenses
  accommodation: Array<{
    name: string;
    totalAmount: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
    paymentDate: string;
    status: "pending" | "paid";
  }>;

  domesticFlights: Array<{
    details: string;
    cost: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
    paymentDate: string;
    status: "pending" | "paid";
  }>;

  entranceTickets: Array<{
    site: string;
    cost: number;
    no: number;
    total: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
  }>;

  guide: Array<{
    name: string;
    cost: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
    paymentDate: string;
    status: "pending" | "paid";
  }>;

  transportation: Array<{
    city: string;
    supplierName: string;
    amount: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
    status: "pending" | "paid";
    siteCostNo: string;
    guides: Array<{
      guideNumber: string;
      date: string;
      note: string;
      totalCost: number;
    }>;
  }>;

  // Totals
  grandTotalIncomeEGP: number;
  grandTotalExpensesEGP: number;
  restProfitEGP: number;

  // Additional fields
  dueDate: string;
  paymentMethod: string;
  status: string;
  notes: string;
  dynamicFields: Array<{
    label: string;
    value: string;
  }>;
}

export default function NewAccounting() {
  const t = useTranslations("invoices");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const bookingId = searchParams.get("booking");

  const { data } = useBookingFormStore();

  console.log("file number from the booking data ", data?.fileNumber); // تطبع BG1234 مثلاً
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    defaultValues: {
      title: "",
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(
        Date.now()
      ).slice(-3)}`,
      bookingId: bookingId || "",
      bookingDate: "",
      fileNumber: "",
      supplierName: "",
      arrivalFileDate: "",
      totalInvoiceAmount: 0,
      totalInvoiceCurrency: "EGP",
      totalInvoiceExchangeRate: 0,
      paidAmount: 0,
      restAmount: 0,
      restAmountCurrency: "EGP",
      restAmountExchangeRate: 0,
      wayOfPayment: "",
      paymentDate: "",
      extraIncoming: [
        {
          type: "Tipping",
          amount: 0,
          currency: "EGP",
          exchangeRate: 0,
          note: "",
          status: "pending",
          date: "",
        },
      ],
      accommodation: [
        {
          name: "Hotel 1",
          totalAmount: 0,
          currency: "EGP",
          exchangeRate: 0,
          paymentDate: "",
          status: "pending",
        },
      ],
      domesticFlights: [
        {
          details: "Flight 1 Details",
          cost: 0,
          currency: "EGP",
          exchangeRate: 0,
          paymentDate: "",
          status: "pending",
        },
      ],
      entranceTickets: [
        {
          site: "",
          cost: 0,
          no: 1,
          total: 0,
          currency: "EGP",
          exchangeRate: 0,
        },
      ],
      guide: [
        {
          name: "Guide 1",
          cost: 0,
          currency: "EGP",
          exchangeRate: 0,
          paymentDate: "",
          status: "pending",
        },
      ],
      transportation: [
        {
          city: "Cairo",
          supplierName: "",
          amount: 0,
          currency: "EGP",
          exchangeRate: 0,
          status: "pending",
          siteCostNo: "",
          guides: [
            { guideNumber: "Guide 1", date: "", note: "", totalCost: 0 },
          ],
        },
      ],
      grandTotalIncomeEGP: 0,
      grandTotalExpensesEGP: 0,
      restProfitEGP: 0,
      dueDate: "",
      paymentMethod: "",
      status: "",
      notes: "",
      dynamicFields: [],
    },
  });

  const {
    fields: extraIncomingFields,
    append: appendExtraIncoming,
    remove: removeExtraIncoming,
  } = useFieldArray({ control, name: "extraIncoming" });
  const {
    fields: entranceTicketsFields,
    append: appendEntranceTicket,
    remove: removeEntranceTicket,
  } = useFieldArray({ control, name: "entranceTickets" });
  const {
    fields: guideFields,
    append: appendGuide,
    remove: removeGuide,
  } = useFieldArray({ control, name: "guide" });
  const {
    fields: accommodationFields,
    append: appendAccommodation,
    remove: removeAccommodation,
  } = useFieldArray({ control, name: "accommodation" });

  const {
    fields: flightFields,
    append: appendFlight,
    remove: removeFlight,
  } = useFieldArray({ control, name: "domesticFlights" });

  const {
    fields: transportationFields,
    append: appendTransportation,
    remove: removeTransportation,
  } = useFieldArray({ control, name: "transportation" });

  const {
    fields: dynamicFields,
    append: appendDynamicField,
    remove: removeDynamicField,
  } = useFieldArray({ control, name: "dynamicFields" });

  // Load booking data if bookingId is provided
  // State variables to display totals for each section in the UI
  const [totalExtraIncome, setTotalExtraIncome] = useState(0);
  const [totalAccommodation, setTotalAccommodation] = useState(0);
  const [totalDomesticFlights, setTotalDomesticFlights] = useState(0);
  const [totalEntranceTickets, setTotalEntranceTickets] = useState(0);
  const [totalGuide, setTotalGuide] = useState(0);
  const [totalTransportation, setTotalTransportation] = useState(0);

  const [totalOwedToSuppliers, setTotalOwedToSuppliers] = useState(0);
  // Watch all form values for changes

  // This useEffect will run calculations whenever any form value changes
  // This useEffect sets up a subscription to watch for form changes.
  // It runs only once on component mount.
  // This useEffect sets up a subscription to watch for form changes.
  useEffect(() => {
    const subscription = watch((formValues, { name }) => {
      // We get the current form values to compare against new calculations
      const currentValues = control._formValues;

      // Helper function to convert any amount to EGP
      const convertToEGP = (
        amount?: number,
        currency?: "EGP" | "USD",
        rate?: number
      ) => {
        if (currency === "USD" && rate && rate > 0) {
          return (amount || 0) * rate;
        }
        return amount || 0;
      };

      // 1. Calculate Total Income
      const mainInvoiceEGP = convertToEGP(
        formValues.totalInvoiceAmount,
        formValues.totalInvoiceCurrency,
        formValues.totalInvoiceExchangeRate
      );

      const extraIncomingTotal = (formValues.extraIncoming || []).reduce(
        (sum, item) => {
          if (!item) return sum; // TypeScript fix
          return (
            sum + convertToEGP(item.amount, item.currency, item.exchangeRate)
          );
        },
        0
      );

      const grandTotalIncome = mainInvoiceEGP + extraIncomingTotal;

      // --- بداية الكود الذي ستضيفه ---

      // 1. قم بتحويل المبلغ المدفوع إلى جنيه مصري
      // ملاحظة: نفترض أن عملة المبلغ المدفوع هي نفس عملة الفاتورة الرئيسية
      const paidAmountEGP = convertToEGP(
        formValues.paidAmount,
        formValues.totalInvoiceCurrency,
        formValues.totalInvoiceExchangeRate
      );

      // 2. احسب المبلغ المتبقي بالجنيه المصري
      const calculatedRestEGP = grandTotalIncome - paidAmountEGP;

      // 3. قم بتحديث حقل المبلغ المتبقي تلقائيًا
      if (currentValues.restAmount !== calculatedRestEGP) {
        setValue("restAmount", calculatedRestEGP);
        setValue("restAmountCurrency", "EGP"); // نجعل العملة EGP دائمًا
      }

      // --- نهاية الكود الذي ستضيفه ---

      // Only update if the value has actually changed
      if (currentValues.grandTotalIncomeEGP !== grandTotalIncome) {
        setValue("grandTotalIncomeEGP", grandTotalIncome);
      }
      setTotalExtraIncome(extraIncomingTotal);

      // 2. Calculate Total Expenses
      const accommodationTotal = (formValues.accommodation || []).reduce(
        (sum, item) => {
          if (!item) return sum; // TypeScript fix
          return (
            sum +
            convertToEGP(item.totalAmount, item.currency, item.exchangeRate)
          );
        },
        0
      );
      const domesticFlightsTotal = (formValues.domesticFlights || []).reduce(
        (sum, item) => {
          if (!item) return sum; // TypeScript fix
          return (
            sum + convertToEGP(item.cost, item.currency, item.exchangeRate)
          );
        },
        0
      );

      // --- بداية الكود المُصحح ---
      // حساب إجمالي المبالغ المستحقة للموردين (التي حالتها pending)

      const pendingAccommodation = (formValues.accommodation || [])
        .filter((item) => item?.status === "pending" && item?.totalAmount > 0)
        .reduce(
          (sum, item) =>
            sum +
            convertToEGP(item?.totalAmount, item?.currency, item?.exchangeRate),
          0
        );

      const pendingFlights = (formValues.domesticFlights || [])
        .filter((item) => item?.status === "pending" && item?.cost > 0)
        .reduce(
          (sum, item) =>
            sum + convertToEGP(item?.cost, item?.currency, item?.exchangeRate),
          0
        );

      const pendingGuides = (formValues.guide || [])
        .filter((item) => item?.status === "pending" && item?.cost > 0)
        .reduce(
          (sum, item) =>
            sum + convertToEGP(item?.cost, item?.currency, item?.exchangeRate),
          0
        );

      const pendingTransportation = (formValues.transportation || [])
        .filter((item) => {
          if (!item) return false;
          const hasMainAmount = item.amount > 0;
          const hasGuideCost = (item.guides || []).some(
            (g) => g?.totalCost > 0
          );
          return item.status === "pending" && (hasMainAmount || hasGuideCost);
        })
        .reduce((sum, item) => {
          const mainAmount = convertToEGP(
            item?.amount,
            item?.currency,
            item?.exchangeRate
          );
          const guidesAmount = (item?.guides || []).reduce(
            (gSum, g) => gSum + (g?.totalCost || 0),
            0
          );
          return sum + mainAmount + guidesAmount;
        }, 0);

      const totalOwed =
        pendingAccommodation +
        pendingFlights +
        pendingGuides +
        pendingTransportation;
      setTotalOwedToSuppliers(totalOwed);
      // --- نهاية الكود المُصحح ---

      const entranceTicketsTotal = (formValues.entranceTickets || []).reduce(
        (sum, item) => {
          if (!item) return sum;
          return (
            sum + convertToEGP(item.total, item.currency, item.exchangeRate)
          );
        },
        0
      );
      const guideTotal = (formValues.guide || []).reduce((sum, item) => {
        if (!item) return sum; // TypeScript fix
        return sum + convertToEGP(item.cost, item.currency, item.exchangeRate);
      }, 0);
      const transportationTotal = (formValues.transportation || []).reduce(
        (sum, item) => {
          if (!item) return sum;

          // 1. Calculate the main amount for the transportation item
          const mainAmountEGP = convertToEGP(
            item.amount,
            item.currency,
            item.exchangeRate
          );

          // 2. Calculate the total cost for all nested guides in this item
          const guidesTotalEGP = (item.guides || []).reduce(
            (guideSum, guide) => {
              // Note: Assuming guide cost is always in EGP as there's no currency selector there
              return guideSum + (guide?.totalCost || 0);
            },
            0
          );

          // 3. Add them together
          return sum + mainAmountEGP + guidesTotalEGP;
        },
        0
      );
      const grandTotalExpenses =
        accommodationTotal +
        domesticFlightsTotal +
        entranceTicketsTotal +
        guideTotal +
        transportationTotal;

      if (currentValues.grandTotalExpensesEGP !== grandTotalExpenses) {
        setValue("grandTotalExpensesEGP", grandTotalExpenses);
      }

      // Update states for UI display
      setTotalAccommodation(accommodationTotal);
      setTotalDomesticFlights(domesticFlightsTotal);
      setTotalEntranceTickets(entranceTicketsTotal);
      setTotalGuide(guideTotal);
      setTotalTransportation(transportationTotal);

      // 3. Calculate Rest Profit
      const restProfit = grandTotalIncome - grandTotalExpenses;
      if (currentValues.restProfitEGP !== restProfit) {
        setValue("restProfitEGP", restProfit);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue, control]); // Add control to the dependency array
  useEffect(() => {
    if (bookingId) {
      const booking = sampleBookings.find((b) => b.id === bookingId);
      if (booking) {
        setValue("title", `${booking.fileNumber} - Invoice`);
        setValue("fileNumber", booking.fileNumber);
        setValue("supplierName", booking.supplier);
        setValue("arrivalFileDate", booking.arrivalDate);
        setValue("bookingDate", booking.createdAt);
      }
    }
  }, [bookingId, setValue]);

  const onSubmit = (data: InvoiceFormData) => {
    // Object to hold all items that are pending payment
    const pendingItems = {
      extraIncoming: data.extraIncoming
        .filter((item) => item.status === "pending" && item.amount > 0)
        .map((item) => item.type),
      accommodation: data.accommodation
        .filter((item) => item.status === "pending" && item.totalAmount > 0)
        .map((item) => item.name),
      domesticFlights: data.domesticFlights
        .filter((item) => item.status === "pending" && item.cost > 0)
        .map((item) => item.details),
      // --- الكود الجديد (الصحيح) ---
      transportation: data.transportation
        .filter((item) => {
          if (item.status !== "pending") {
            return false;
          }

          const hasMainAmount = item.amount > 0;

          const hasGuideCost = (item.guides || []).some(
            (guide) => guide.totalCost > 0
          );

          return hasMainAmount || hasGuideCost;
        })
        .map(
          (item) => `${item.supplierName || "Transportation"} in ${item.city}`
        ),
    };

    console.log("--- FINAL CALCULATED INVOICE DATA ---");
    console.log(data);

    console.log("--- PENDING ITEMS TO BE PAID ---");
    console.log(pendingItems);

    toast({
      title: "Invoice Ready",
      description: "Data logged to console. Check before final submission.",
    });
    // I've commented this out so you can check the console without being redirected // router.push("/invoices");
  };

  const extraIncomingTypes = [
    "Tipping",
    "Optional tours",
    "Hotel extension",
    "Shopping",
    "Tickets",
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">{t("createInvoice")}</h1>
            <p className="text-muted-foreground">
              Accounting File - Book & Go Travel
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Invoice Title</Label>
                  <Input
                    id="title"
                    {...register("title", { required: "Title is required" })}
                    placeholder="Egypt Tour Package - Smith Family"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    {...register("invoiceNumber", {
                      required: "Invoice number is required",
                    })}
                    placeholder="INV-2024-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bookingDate">Booking Date</Label>
                  <Input
                    id="bookingDate"
                    type="date"
                    {...register("bookingDate")}
                  />
                </div>

                <div>
                  <Label htmlFor="fileNumber">File Number</Label>
                  <Input
                    id="fileNumber"
                    {...register("fileNumber")}
                    placeholder="BG-2024-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplierName">Supplier Name</Label>
                  <Input
                    id="supplierName"
                    {...register("supplierName")}
                    placeholder="Egypt Travel Co."
                  />
                </div>

                <div>
                  <Label htmlFor="arrivalFileDate">Arrival File Date</Label>
                  <Input
                    id="arrivalFileDate"
                    type="date"
                    {...register("arrivalFileDate")}
                  />
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Additional Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        {...register("dueDate")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select
                        onValueChange={(value) =>
                          setValue("paymentMethod", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        onValueChange={(value) => setValue("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {invoiceStatuses.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      {...register("notes")}
                      placeholder="Additional notes or comments..."
                      rows={4}
                    />
                  </div>

                  {/* Dynamic Fields */}
                  {/* <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-md font-semibold">Dynamic Fields</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendDynamicField({ label: "", value: "" })
                        }
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Field
                      </Button>
                    </div>

                    {dynamicFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-center space-x-4"
                      >
                        <div className="flex-1">
                          <Input
                            {...register(`dynamicFields.${index}.label`)}
                            placeholder="Field label"
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            {...register(`dynamicFields.${index}.value`)}
                            placeholder="Field value"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeDynamicField(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div> */}
                </CardContent>
              </Card>
              {bookingId && (
                <div>
                  <Label htmlFor="bookingId">Booking ID</Label>
                  <Select
                    onValueChange={(value) => setValue("bookingId", value)}
                    defaultValue={bookingId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select booking" />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleBookings.map((booking) => (
                        <SelectItem key={booking.id} value={booking.id}>
                          {booking.fileNumber} - {booking.supplier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Invoice */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Main Invoice</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <div>
                    <Label>Total Invoice Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("totalInvoiceAmount", {
                        valueAsNumber: true,
                      })}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label>Currency</Label>
                    <RadioGroup
                      defaultValue={watch("totalInvoiceCurrency") || "EGP"}
                      className="flex items-center space-x-4 pt-2"
                      onValueChange={(value) =>
                        setValue("totalInvoiceCurrency", value as "EGP" | "USD")
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="EGP" id="main-inv-egp" />
                        <Label htmlFor="main-inv-egp">EGP</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="USD" id="main-inv-usd" />
                        <Label htmlFor="main-inv-usd">USD</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {watch("totalInvoiceCurrency") === "USD" && (
                    <div>
                      <Label>Exchange Rate ($ to E£)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register("totalInvoiceExchangeRate", {
                          valueAsNumber: true,
                        })}
                        placeholder="e.g., 47.50"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <div>
                    <Label>Paid Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("paidAmount", { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      <div>
                        <Label>Rest Amount</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register("restAmount", { valueAsNumber: true })}
                          placeholder="0.00"
                          readOnly
                        />
                      </div>
                      <div>
                        <Label>Currency</Label>
                        <RadioGroup
                          defaultValue={watch("restAmountCurrency") || "EGP"}
                          className="flex items-center space-x-4 pt-2"
                          onValueChange={(value) =>
                            setValue(
                              "restAmountCurrency",
                              value as "EGP" | "USD"
                            )
                          }
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="EGP" id="rest-inv-egp" />
                            <Label htmlFor="rest-inv-egp">EGP</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="USD" id="rest-inv-usd" />
                            <Label htmlFor="rest-inv-usd">USD</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {watch("restAmountCurrency") === "USD" && (
                        <div>
                          <Label>Exchange Rate ($ to E£)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            {...register("restAmountExchangeRate", {
                              valueAsNumber: true,
                            })}
                            placeholder="e.g., 47.50"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Way of Payment</Label>
                    <Select
                      onValueChange={(value) => setValue("wayOfPayment", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash upon arrival</SelectItem>
                        <SelectItem value="bank">Bank remittance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Payment Date</Label>
                    <Input type="date" {...register("paymentDate")} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Extra Incoming */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap">
                  <h4 className="text-lg font-semibold">Extra Incoming</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendExtraIncoming({
                        type: "Tipping",
                        amount: 0,
                        currency: "EGP",
                        exchangeRate: 0,
                        note: "",
                        status: "pending",
                        date: "",
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Extra Income
                  </Button>
                </div>

                {extraIncomingFields.map((field, index) => {
                  const watchedCurrency = watch(
                    `extraIncoming.${index}.currency`
                  );
                  return (
                    <div key={field.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium">
                          Extra Income {index + 1}
                        </h5>
                        {extraIncomingFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeExtraIncoming(index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                        <div>
                          <Label>Type</Label>
                          <Select
                            onValueChange={(value) =>
                              setValue(`extraIncoming.${index}.type`, value)
                            }
                            defaultValue={field.type}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {extraIncomingTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Amount</Label>
                          <Input
                            type="number"
                            step="0.01"
                            {...register(`extraIncoming.${index}.amount`, {
                              valueAsNumber: true,
                            })}
                            placeholder="0.00"
                          />
                        </div>

                        <div>
                          <Label>Currency</Label>
                          <RadioGroup
                            defaultValue={field.currency || "EGP"}
                            className="flex items-center space-x-4 pt-2"
                            onValueChange={(value) =>
                              setValue(
                                `extraIncoming.${index}.currency`,
                                value as "EGP" | "USD"
                              )
                            }
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="EGP"
                                id={`extra-egp-${index}`}
                              />
                              <Label htmlFor={`extra-egp-${index}`}>EGP</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="USD"
                                id={`extra-usd-${index}`}
                              />
                              <Label htmlFor={`extra-usd-${index}`}>USD</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {watchedCurrency === "USD" && (
                          <div>
                            <Label>Exchange Rate ($ to E£)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              {...register(
                                `extraIncoming.${index}.exchangeRate`,
                                { valueAsNumber: true }
                              )}
                              placeholder="e.g., 47.50"
                            />
                          </div>
                        )}

                        <div>
                          <Label>Date</Label>
                          <Input
                            type="date"
                            {...register(`extraIncoming.${index}.date`)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label>Status</Label>
                          <RadioGroup
                            defaultValue={field.status || "pending"}
                            onValueChange={(value) =>
                              setValue(
                                `extraIncoming.${index}.status`,
                                value as "pending" | "paid"
                              )
                            }
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="pending"
                                id={`extra-pending-${index}`}
                              />
                              <Label htmlFor={`extra-pending-${index}`}>
                                Pending
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="paid"
                                id={`extra-paid-${index}`}
                              />
                              <Label htmlFor={`extra-paid-${index}`}>
                                Paid
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <div>
                          <Label>Note</Label>
                          <Textarea
                            {...register(`extraIncoming.${index}.note`)}
                            placeholder="Additional notes..."
                            rows={1}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Extra Income:</span>
                    <div className="text-right font-semibold text-lg">
                      {totalExtraIncome.toLocaleString("en-US", {
                        style: "currency",
                        currency: "EGP",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expenses */}
          <Card>
            <CardHeader>
              <CardTitle>Expenses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* 1- Accommodation */}
              {/* 1- Accommodation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap">
                  <h4 className="text-lg font-semibold">1- Accommodation</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendAccommodation({
                        name: `Hotel ${accommodationFields.length + 1}`,
                        totalAmount: 0,
                        currency: "EGP",
                        exchangeRate: 0,
                        paymentDate: "",
                        status: "pending",
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Accommodation
                  </Button>
                </div>

                {accommodationFields.map((field, index) => {
                  const watchedCurrency = watch(
                    `accommodation.${index}.currency`
                  );
                  return (
                    <div key={field.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium">
                          Accommodation Item {index + 1}
                        </h5>
                        {accommodationFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeAccommodation(index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <div>
                          <Label>Name</Label>
                          <Input
                            {...register(`accommodation.${index}.name`)}
                            placeholder="Hotel name"
                          />
                        </div>

                        <div>
                          <Label>Total Amount</Label>
                          <Input
                            type="number"
                            step="0.01"
                            {...register(`accommodation.${index}.totalAmount`, {
                              valueAsNumber: true,
                            })}
                            placeholder="0.00"
                          />
                        </div>

                        <div>
                          <Label>Currency</Label>
                          <RadioGroup
                            defaultValue={field.currency || "EGP"}
                            className="flex items-center space-x-4 pt-2"
                            onValueChange={(value) =>
                              setValue(
                                `accommodation.${index}.currency`,
                                value as "EGP" | "USD"
                              )
                            }
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="EGP"
                                id={`acc-egp-${index}`}
                              />
                              <Label htmlFor={`acc-egp-${index}`}>EGP</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="USD"
                                id={`acc-usd-${index}`}
                              />
                              <Label htmlFor={`acc-usd-${index}`}>USD</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {watchedCurrency === "USD" && (
                          <div>
                            <Label>Exchange Rate ($ to E£)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              {...register(
                                `accommodation.${index}.exchangeRate`,
                                { valueAsNumber: true }
                              )}
                              placeholder="e.g., 47.50"
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label>Payment Date</Label>
                          <Input
                            type="date"
                            {...register(`accommodation.${index}.paymentDate`)}
                          />
                        </div>

                        <div>
                          <Label>Status</Label>
                          <RadioGroup
                            defaultValue={field.status || "pending"}
                            onValueChange={(value) =>
                              setValue(
                                `accommodation.${index}.status`,
                                value as "pending" | "paid"
                              )
                            }
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="pending"
                                  id={`acc-pending-${index}`}
                                />
                                <Label htmlFor={`acc-pending-${index}`}>
                                  Pending
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="paid"
                                  id={`acc-paid-${index}`}
                                />
                                <Label htmlFor={`acc-paid-${index}`}>
                                  Paid
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Accommodation:</span>
                    <div className="text-right font-semibold text-lg">
                      {totalAccommodation.toLocaleString("en-US", {
                        style: "currency",
                        currency: "EGP",
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 2- Domestic Flight */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">2- Domestic Flight</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendFlight({
                        details: `Flight ${flightFields.length + 1} Details`,
                        cost: 0,
                        currency: "EGP",
                        exchangeRate: 0,
                        paymentDate: "",
                        status: "pending",
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Flight
                  </Button>
                </div>

                {flightFields.map((field, index) => {
                  const watchedCurrency = watch(
                    `domesticFlights.${index}.currency`
                  );
                  return (
                    <div key={field.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium">Flight {index + 1}</h5>
                        {flightFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeFlight(index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <div>
                          <Label>Flight Details</Label>
                          <Input
                            {...register(`domesticFlights.${index}.details`)}
                            placeholder="Flight details"
                          />
                        </div>

                        <div>
                          <Label>Cost</Label>
                          <Input
                            type="number"
                            step="0.01"
                            {...register(`domesticFlights.${index}.cost`, {
                              valueAsNumber: true,
                            })}
                            placeholder="0.00"
                          />
                        </div>

                        <div>
                          <Label>Currency</Label>
                          <RadioGroup
                            defaultValue={field.currency || "EGP"}
                            className="flex items-center space-x-4 pt-2"
                            onValueChange={(value) =>
                              setValue(
                                `domesticFlights.${index}.currency`,
                                value as "EGP" | "USD"
                              )
                            }
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="EGP"
                                id={`flight-egp-${index}`}
                              />
                              <Label htmlFor={`flight-egp-${index}`}>EGP</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="USD"
                                id={`flight-usd-${index}`}
                              />
                              <Label htmlFor={`flight-usd-${index}`}>USD</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {watchedCurrency === "USD" && (
                          <div>
                            <Label>Exchange Rate ($ to E£)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              {...register(
                                `domesticFlights.${index}.exchangeRate`,
                                { valueAsNumber: true }
                              )}
                              placeholder="e.g., 47.50"
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label>Payment Date</Label>
                          <Input
                            type="date"
                            {...register(
                              `domesticFlights.${index}.paymentDate`
                            )}
                          />
                        </div>
                        <div>
                          <Label>Status</Label>
                          <RadioGroup
                            defaultValue={field.status || "pending"}
                            onValueChange={(value) =>
                              setValue(
                                `domesticFlights.${index}.status`,
                                value as "pending" | "paid"
                              )
                            }
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="pending"
                                  id={`flight-pending-${index}`}
                                />
                                <Label htmlFor={`flight-pending-${index}`}>
                                  Pending
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="paid"
                                  id={`flight-paid-${index}`}
                                />
                                <Label htmlFor={`flight-paid-${index}`}>
                                  Paid
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">
                      Total Domestic Flights:
                    </span>
                    <div className="text-right font-semibold text-lg">
                      {totalDomesticFlights.toLocaleString("en-US", {
                        style: "currency",
                        currency: "EGP",
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Entrance Tickets */}
              {/* Entrance Tickets */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap">
                  <h4 className="text-lg font-semibold">3- Entrance Tickets</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendEntranceTicket({
                        site: "",
                        cost: 0,
                        no: 1,
                        total: 0,
                        currency: "EGP",
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Ticket
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Site</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>No.</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Ex. Rate</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entranceTicketsFields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <Input
                            {...register(`entranceTickets.${index}.site`)}
                            placeholder="Site name"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            {...register(`entranceTickets.${index}.cost`, {
                              valueAsNumber: true,
                            })}
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            {...register(`entranceTickets.${index}.no`, {
                              valueAsNumber: true,
                            })}
                            placeholder="1"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            defaultValue={field.currency}
                            onValueChange={(value) =>
                              setValue(
                                `entranceTickets.${index}.currency`,
                                value as "EGP" | "USD"
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EGP">EGP</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {watch(`entranceTickets.${index}.currency`) ===
                            "USD" && (
                            <Input
                              type="number"
                              {...register(
                                `entranceTickets.${index}.exchangeRate`,
                                { valueAsNumber: true }
                              )}
                              placeholder="Rate"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            {...register(`entranceTickets.${index}.total`, {
                              valueAsNumber: true,
                            })}
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          {entranceTicketsFields.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeEntranceTicket(index)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">
                      Total Entrance Tickets:
                    </span>
                    <div className="text-right font-semibold text-lg">
                      {totalEntranceTickets.toLocaleString("en-US", {
                        style: "currency",
                        currency: "EGP",
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Guide */}
              {/* Guide */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap">
                  <h4 className="text-lg font-semibold">Guide</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendGuide({
                        name: `Guide ${guideFields.length + 1}`,
                        cost: 0,
                        currency: "EGP",
                        exchangeRate: 0,
                        paymentDate: "",
                        status: "pending",
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Guide
                  </Button>
                </div>

                {guideFields.map((field, index) => {
                  const watchedCurrency = watch(`guide.${index}.currency`);
                  return (
                    <div key={field.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium">Guide Entry {index + 1}</h5>
                        {guideFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeGuide(index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <div>
                          <Label>Name</Label>
                          <Input
                            {...register(`guide.${index}.name`)}
                            placeholder="Guide name"
                          />
                        </div>

                        <div>
                          <Label>Cost</Label>
                          <Input
                            type="number"
                            step="0.01"
                            {...register(`guide.${index}.cost`, {
                              valueAsNumber: true,
                            })}
                            placeholder="0.00"
                          />
                        </div>

                        <div>
                          <Label>Currency</Label>
                          <RadioGroup
                            defaultValue={field.currency || "EGP"}
                            className="flex items-center space-x-4 pt-2"
                            onValueChange={(value) =>
                              setValue(
                                `guide.${index}.currency`,
                                value as "EGP" | "USD"
                              )
                            }
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="EGP"
                                id={`guide-egp-${index}`}
                              />
                              <Label htmlFor={`guide-egp-${index}`}>EGP</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="USD"
                                id={`guide-usd-${index}`}
                              />
                              <Label htmlFor={`guide-usd-${index}`}>USD</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {watchedCurrency === "USD" && (
                          <div>
                            <Label>Exchange Rate ($ to E£)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              {...register(`guide.${index}.exchangeRate`, {
                                valueAsNumber: true,
                              })}
                              placeholder="e.g., 47.50"
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label>Payment Date</Label>
                          <Input
                            type="date"
                            {...register(`guide.${index}.paymentDate`)}
                          />
                        </div>
                        <div>
                          <Label>Status</Label>
                          <RadioGroup
                            defaultValue={field.status || "pending"}
                            onValueChange={(value) =>
                              setValue(
                                `guide.${index}.status`,
                                value as "pending" | "paid"
                              )
                            }
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="pending"
                                  id={`guide-pending-${index}`}
                                />
                                <Label htmlFor={`guide-pending-${index}`}>
                                  Pending
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="paid"
                                  id={`guide-paid-${index}`}
                                />
                                <Label htmlFor={`guide-paid-${index}`}>
                                  Paid
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Guide:</span>
                    <div className="text-right font-semibold text-lg">
                      {totalGuide.toLocaleString("en-US", {
                        style: "currency",
                        currency: "EGP",
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Transportation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap">
                  <h4 className="text-lg font-semibold">Transportation</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendTransportation({
                        city: "Cairo",
                        supplierName: "",
                        amount: 0,
                        currency: "EGP",
                        exchangeRate: 0,
                        status: "pending",
                        siteCostNo: "",
                        guides: [
                          {
                            guideNumber: "Guide 1",
                            date: "",
                            note: "",
                            totalCost: 0,
                          },
                        ],
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Transportation
                  </Button>
                </div>

                {transportationFields.map((field, index) => (
                  <TransportationItem
                    key={field.id}
                    control={control}
                    transportIndex={index}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    removeTransportation={removeTransportation}
                  />
                ))}

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Transportation:</span>
                    <div className="text-right font-semibold text-lg">
                      {totalTransportation.toLocaleString("en-US", {
                        style: "currency",
                        currency: "EGP",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grand Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Grand Totals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Grand Total Income (EGP)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    readOnly
                    {...register("grandTotalIncomeEGP", {
                      valueAsNumber: true,
                    })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Grand Total Expenses (EGP)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    readOnly
                    {...register("grandTotalExpensesEGP", {
                      valueAsNumber: true,
                    })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Rest Profit (EGP)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    readOnly
                    {...register("restProfitEGP", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
                {/* --- هذا هو الحقل الجديد الذي تمت إضافته --- */}
                <div>
                  <Label>Total Owed to Suppliers (EGP)</Label>
                  <Input
                    type="number"
                    value={totalOwedToSuppliers.toFixed(2)}
                    readOnly
                    className="font-bold text-blue-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 no-print">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Create Accounting
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

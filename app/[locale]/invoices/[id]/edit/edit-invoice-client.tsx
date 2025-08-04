"use client";
import { updateInvoiceAction } from "@/actions/invoiceActions";
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
import { invoiceStatuses, paymentMethods } from "@/lib/fake-data";
import { DollarSign, Minus, Plus, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useTransition } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

export interface InvoiceFormData {
  id: string;
  _id: string;
  title: string;
  invoiceNumber: string;
  bookingId: string;
  bookingDate: string;
  fileNumber: string;
  supplierName: string;
  arrivalFileDate: string;
  totalInvoiceAmount: number;
  totalInvoiceCurrency: "EGP" | "USD";
  totalInvoiceExchangeRate?: number;
  paidAmount: number;
  restAmount: number;
  restAmountCurrency: "EGP" | "USD";
  restAmountExchangeRate?: number;
  wayOfPayment: string;
  paymentDate: string;
  extraIncoming: Array<{
    incomeType: string;
    amount: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
    note: string;
    status: "pending" | "paid";
    date: string;
  }>;
  accommodation: Array<{
    city: string; // NEW
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
    city: string; // NEW
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
  }>;
  grandTotalIncomeEGP: number;
  grandTotalExpensesEGP: number;
  restProfitEGP: number;
  dueDate: string;
  paymentMethod: string;
  status: string;
  notes: string;
  dynamicFields: Array<{ label: string; value: string }>;
}

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

const calculateTotals = (formValues: Partial<InvoiceFormData>) => {
  const mainInvoiceEGP = convertToEGP(
    formValues.totalInvoiceAmount,
    formValues.totalInvoiceCurrency,
    formValues.totalInvoiceExchangeRate
  );
  const totalExtraIncome = (formValues.extraIncoming || []).reduce(
    (sum, item) =>
      sum + convertToEGP(item?.amount, item?.currency, item?.exchangeRate),
    0
  );
  const grandTotalIncomeEGP = mainInvoiceEGP + totalExtraIncome;
  const totalAccommodation = (formValues.accommodation || []).reduce(
    (sum, item) =>
      sum + convertToEGP(item?.totalAmount, item?.currency, item?.exchangeRate),
    0
  );
  const totalDomesticFlights = (formValues.domesticFlights || []).reduce(
    (sum, item) =>
      sum + convertToEGP(item?.cost, item?.currency, item?.exchangeRate),
    0
  );
  const totalEntranceTickets = (formValues.entranceTickets || []).reduce(
    (sum, item) =>
      sum + convertToEGP(item?.total, item?.currency, item?.exchangeRate),
    0
  );
  const totalGuide = (formValues.guide || []).reduce(
    (sum, item) =>
      sum + convertToEGP(item?.cost, item?.currency, item?.exchangeRate),
    0
  );
  const totalTransportation = (formValues.transportation || []).reduce(
    (sum, item) =>
      sum + convertToEGP(item?.amount, item?.currency, item?.exchangeRate),
    0
  );
  const grandTotalExpensesEGP =
    totalAccommodation +
    totalDomesticFlights +
    totalEntranceTickets +
    totalGuide +
    totalTransportation;
  const restProfitEGP = grandTotalIncomeEGP - grandTotalExpensesEGP;
  const pendingAccommodation = (formValues.accommodation || [])
    .filter((i) => i.status === "pending")
    .reduce(
      (s, i) => s + convertToEGP(i.totalAmount, i.currency, i.exchangeRate),
      0
    );
  const pendingFlights = (formValues.domesticFlights || [])
    .filter((i) => i.status === "pending")
    .reduce((s, i) => s + convertToEGP(i.cost, i.currency, i.exchangeRate), 0);
  const pendingGuides = (formValues.guide || [])
    .filter((i) => i.status === "pending")
    .reduce((s, i) => s + convertToEGP(i.cost, i.currency, i.exchangeRate), 0);
  const pendingTransportation = (formValues.transportation || [])
    .filter((i) => i.status === "pending")
    .reduce(
      (s, i) => s + convertToEGP(i.amount, i.currency, i.exchangeRate),
      0
    );
  const totalOwedToSuppliers =
    pendingAccommodation +
    pendingFlights +
    pendingGuides +
    pendingTransportation;
  return {
    grandTotalIncomeEGP,
    grandTotalExpensesEGP,
    restProfitEGP,
    totalExtraIncome,
    totalAccommodation,
    totalDomesticFlights,
    totalEntranceTickets,
    totalGuide,
    totalTransportation,
    totalOwedToSuppliers,
  };
};
const formatDateForInput = (dateString: string | undefined) => {
  if (!dateString) return "";
  // ستقوم هذه الدالة بأخذ الجزء الأول من النص قبل حرف T
  // "2025-08-15T00:00:00.000Z" -> "2025-08-15"
  return new Date(dateString).toISOString().split("T")[0];
};
export function EditInvoicePageClient({
  invoice,
  initialData,
}: {
  invoice: InvoiceFormData;
  initialData: any;
}) {
  const {
    sites = [],
    extraIncomingTypes = [],
    guides = [],
    hotels = [],
    supplier = [],
    cities = [],
  } = initialData || {};
  const t = useTranslations("invoices");
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  console.log("invoice : ", invoice);
  const formattedInvoice = {
    ...invoice,
    bookingDate: formatDateForInput(invoice.bookingDate),
    arrivalFileDate: formatDateForInput(invoice.arrivalFileDate),
    paymentDate: formatDateForInput(invoice.paymentDate),
    dueDate: formatDateForInput(invoice.dueDate),
    // ... قم بتنسيق أي حقول تاريخ أخرى هنا، بما في ذلك تلك الموجودة داخل المصفوفات
    extraIncoming: invoice.extraIncoming.map((item) => ({
      ...item,
      date: formatDateForInput(item.date),
    })),
    accommodation: invoice.accommodation.map((item) => ({
      ...item,
      paymentDate: formatDateForInput(item.paymentDate),
    })),
    domesticFlights: invoice.domesticFlights.map((item) => ({
      ...item,
      paymentDate: formatDateForInput(item.paymentDate),
    })),
    guide: invoice.guide.map((item) => ({
      ...item,
      paymentDate: formatDateForInput(item.paymentDate),
    })),
  };
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({ defaultValues: formattedInvoice });

  const formValues = watch();
  const totals = useMemo(() => calculateTotals(formValues), [formValues]);

  useEffect(() => {
    const mainInvoiceEGP = convertToEGP(
      formValues.totalInvoiceAmount,
      formValues.totalInvoiceCurrency,
      formValues.totalInvoiceExchangeRate
    );
    const extraIncomingTotal = (formValues.extraIncoming || []).reduce(
      (sum, item) =>
        sum + convertToEGP(item?.amount, item?.currency, item?.exchangeRate),
      0
    );
    const paidAmountEGP = convertToEGP(
      formValues.paidAmount,
      formValues.totalInvoiceCurrency,
      formValues.totalInvoiceExchangeRate
    );
    // const calculatedRestEGP =
    //   mainInvoiceEGP + extraIncomingTotal - paidAmountEGP;
    const calculatedRestEGP = mainInvoiceEGP - paidAmountEGP;
    if (formValues.restAmount !== calculatedRestEGP) {
      setValue("restAmount", calculatedRestEGP);
    }
  }, [
    formValues.totalInvoiceAmount,
    formValues.totalInvoiceCurrency,
    formValues.totalInvoiceExchangeRate,
    formValues.paidAmount,
    formValues.extraIncoming,
    formValues.restAmount,
    setValue,
  ]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && name.startsWith("entranceTickets")) {
        const parts = name.split(".");
        if (parts.length === 3 && (parts[2] === "cost" || parts[2] === "no")) {
          const index = parseInt(parts[1], 10);
          const ticket = value.entranceTickets?.[index];
          if (ticket) {
            const newTotal = (ticket.cost || 0) * (ticket.no || 1);
            if (ticket.total !== newTotal) {
              setValue(`entranceTickets.${index}.total`, newTotal);
            }
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

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

  const onSubmit = (data: InvoiceFormData) => {
    const finalTotals = calculateTotals(data);
    const finalData = {
      ...data,
      grandTotalIncomeEGP: finalTotals.grandTotalIncomeEGP,
      grandTotalExpensesEGP: finalTotals.grandTotalExpensesEGP,
      restProfitEGP: finalTotals.restProfitEGP,
      bookingId: (data.bookingId as any)._id || data.bookingId,
    };
    if (typeof (finalData as any).createdBy === "object") {
      delete (finalData as any).createdBy;
    }
    console.log("finalData : ", finalData);
    startTransition(async () => {
      const result = await updateInvoiceAction(invoice.id, finalData);
      if (result?.success === false) {
        toast({
          title: "Error Updating Invoice",
          description: result.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Invoice Updated Successfully!" });
        router.push("/invoices");
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">{t("editInvoice")}</h1>
            <p className="text-muted-foreground">
              Update the accounting file details.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                    placeholder="Egypt Tour Package"
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
                  <Controller
                    name="supplierName"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        // استخدم defaultValue هنا لضمان عرض القيمة الحالية عند فتح الصفحة
                        defaultValue={field.value}
                      >
                        <SelectTrigger id="supplierName">
                          <SelectValue placeholder="Select a supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* تأكد أن متغير "supplier" متاح من الـ props */}
                          {supplier.map((s: any) => (
                            <SelectItem key={s._id} value={s.name}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
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
                      <Controller
                        name="paymentMethod"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
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
                        )}
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
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
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      {...register("notes")}
                      placeholder="Additional notes..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                    <Controller
                      name="totalInvoiceCurrency"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex items-center space-x-4 pt-2"
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
                      )}
                    />
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
                        <Controller
                          name="restAmountCurrency"
                          control={control}
                          render={({ field }) => (
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex items-center space-x-4 pt-2"
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
                          )}
                        />
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
                    <Controller
                      name="wayOfPayment"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">
                              Cash upon arrival
                            </SelectItem>
                            <SelectItem value="bank">
                              Bank remittance
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div>
                    <Label>Payment Date</Label>
                    <Input type="date" {...register("paymentDate")} />
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap">
                  <h4 className="text-lg font-semibold">Extra Incoming</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendExtraIncoming({
                        incomeType: "Tipping",
                        amount: 0,
                        currency: "EGP",
                        exchangeRate: 0,
                        note: "",
                        status: "pending",
                        date: "",
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Extra Income
                  </Button>
                </div>
                {extraIncomingFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">Extra Income {index + 1}</h5>
                      {extraIncomingFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
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
                        <Controller
                          name={`extraIncoming.${index}.incomeType`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {extraIncomingTypes.map((type) => (
                                  <SelectItem key={type._id} value={type.name}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
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
                        <Controller
                          name={`extraIncoming.${index}.currency`}
                          control={control}
                          render={({ field }) => (
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex items-center space-x-4 pt-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="EGP"
                                  id={`extra-egp-${index}`}
                                />
                                <Label htmlFor={`extra-egp-${index}`}>
                                  EGP
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="USD"
                                  id={`extra-usd-${index}`}
                                />
                                <Label htmlFor={`extra-usd-${index}`}>
                                  USD
                                </Label>
                              </div>
                            </RadioGroup>
                          )}
                        />
                      </div>
                      {watch(`extraIncoming.${index}.currency`) === "USD" && (
                        <div>
                          <Label>Exchange Rate</Label>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Status</Label>
                        <Controller
                          name={`extraIncoming.${index}.status`}
                          control={control}
                          render={({ field }) => (
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex items-center space-x-4 pt-2"
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
                          )}
                        />
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
                ))}
                <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
                  <span className="font-semibold">Total Extra Income:</span>
                  <div className="text-right font-semibold text-lg">
                    {totals.totalExtraIncome.toLocaleString("en-US", {
                      style: "currency",
                      currency: "EGP",
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expenses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap">
                  <h4 className="text-lg font-semibold">1- Accommodation</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendAccommodation({
                        city: "",
                        name: "",
                        totalAmount: 0,
                        currency: "EGP",
                        exchangeRate: 0,
                        paymentDate: "",
                        status: "pending",
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Accommodation
                  </Button>
                </div>
                {accommodationFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">
                        Accommodation Item {index + 1}
                      </h5>
                      {accommodationFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAccommodation(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                      <div>
                        <Label>Hotel City</Label>
                        <Controller
                          name={`accommodation.${index}.city`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select City" />
                              </SelectTrigger>
                              <SelectContent>
                                {cities.map((city: any) => (
                                  <SelectItem key={city._id} value={city.name}>
                                    {city.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div>
                        <Label>Hotel Name</Label>
                        <Controller
                          name={`accommodation.${index}.name`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Hotel" />
                              </SelectTrigger>
                              <SelectContent>
                                {hotels.map((hotel: any) => (
                                  <SelectItem key={hotel.id} value={hotel.name}>
                                    {hotel.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
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
                        <Controller
                          name={`accommodation.${index}.currency`}
                          control={control}
                          render={({ field }) => (
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex items-center space-x-4 pt-2"
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
                          )}
                        />
                      </div>
                      {watch(`accommodation.${index}.currency`) === "USD" && (
                        <div>
                          <Label>Exchange Rate</Label>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Payment Date</Label>
                        <Input
                          type="date"
                          {...register(`accommodation.${index}.paymentDate`)}
                        />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Controller
                          name={`accommodation.${index}.status`}
                          control={control}
                          render={({ field }) => (
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex items-center space-x-4 pt-2"
                            >
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
                            </RadioGroup>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
                  <span className="font-semibold">Total Accommodation:</span>
                  <div className="text-right font-semibold text-lg">
                    {totals.totalAccommodation.toLocaleString("en-US", {
                      style: "currency",
                      currency: "EGP",
                    })}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">2- Domestic Flight</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendFlight({
                        details: "",
                        cost: 0,
                        currency: "EGP",
                        exchangeRate: 0,
                        paymentDate: "",
                        status: "pending",
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Flight
                  </Button>
                </div>
                {flightFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">Flight {index + 1}</h5>
                      {flightFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
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
                        <Controller
                          name={`domesticFlights.${index}.currency`}
                          control={control}
                          render={({ field }) => (
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex items-center space-x-4 pt-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="EGP"
                                  id={`flight-egp-${index}`}
                                />
                                <Label htmlFor={`flight-egp-${index}`}>
                                  EGP
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="USD"
                                  id={`flight-usd-${index}`}
                                />
                                <Label htmlFor={`flight-usd-${index}`}>
                                  USD
                                </Label>
                              </div>
                            </RadioGroup>
                          )}
                        />
                      </div>
                      {watch(`domesticFlights.${index}.currency`) === "USD" && (
                        <div>
                          <Label>Exchange Rate</Label>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Payment Date</Label>
                        <Input
                          type="date"
                          {...register(`domesticFlights.${index}.paymentDate`)}
                        />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Controller
                          name={`domesticFlights.${index}.status`}
                          control={control}
                          render={({ field }) => (
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex items-center space-x-4 pt-2"
                            >
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
                            </RadioGroup>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
                  <span className="font-semibold">Total Domestic Flights:</span>
                  <div className="text-right font-semibold text-lg">
                    {totals.totalDomesticFlights.toLocaleString("en-US", {
                      style: "currency",
                      currency: "EGP",
                    })}
                  </div>
                </div>
              </div>
              <Separator />
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
                        exchangeRate: 0,
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Ticket
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
                          <Controller
                            name={`entranceTickets.${index}.site`}
                            control={control}
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Site" />
                                </SelectTrigger>
                                <SelectContent>
                                  {sites.map((site: any) => (
                                    <SelectItem key={site.id} value={site.name}>
                                      {site.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
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
                          <Controller
                            name={`entranceTickets.${index}.currency`}
                            control={control}
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="EGP">EGP</SelectItem>
                                  <SelectItem value="USD">USD</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          {watch(`entranceTickets.${index}.currency`) ===
                            "USD" && (
                            <Input
                              type="number"
                              step="0.01"
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
                            readOnly
                          />
                        </TableCell>
                        <TableCell>
                          {entranceTicketsFields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
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
                <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
                  <span className="font-semibold">Total Entrance Tickets:</span>
                  <div className="text-right font-semibold text-lg">
                    {totals.totalEntranceTickets.toLocaleString("en-US", {
                      style: "currency",
                      currency: "EGP",
                    })}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap">
                  <h4 className="text-lg font-semibold">4- Guide</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendGuide({
                        city: "",
                        name: "",
                        cost: 0,
                        currency: "EGP",
                        exchangeRate: 0,
                        paymentDate: "",
                        status: "pending",
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Guide
                  </Button>
                </div>
                {guideFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">Guide Entry {index + 1}</h5>
                      {guideFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGuide(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                      <div>
                        <Label>Guide City</Label>
                        <Controller
                          name={`guide.${index}.city`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select City" />
                              </SelectTrigger>
                              <SelectContent>
                                {cities.map((city: any) => (
                                  <SelectItem key={city.id} value={city.name}>
                                    {city.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div>
                        <Label>Guide Name</Label>
                        <Controller
                          name={`guide.${index}.name`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Guide" />
                              </SelectTrigger>
                              <SelectContent>
                                {guides.map((guide: any) => (
                                  <SelectItem key={guide.id} value={guide.name}>
                                    {guide.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
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
                        <Controller
                          name={`guide.${index}.currency`}
                          control={control}
                          render={({ field }) => (
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex items-center space-x-4 pt-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="EGP"
                                  id={`guide-egp-${index}`}
                                />
                                <Label htmlFor={`guide-egp-${index}`}>
                                  EGP
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="USD"
                                  id={`guide-usd-${index}`}
                                />
                                <Label htmlFor={`guide-usd-${index}`}>
                                  USD
                                </Label>
                              </div>
                            </RadioGroup>
                          )}
                        />
                      </div>
                      {watch(`guide.${index}.currency`) === "USD" && (
                        <div>
                          <Label>Exchange Rate</Label>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Payment Date</Label>
                        <Input
                          type="date"
                          {...register(`guide.${index}.paymentDate`)}
                        />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Controller
                          name={`guide.${index}.status`}
                          control={control}
                          render={({ field }) => (
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex items-center space-x-4 pt-2"
                            >
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
                            </RadioGroup>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
                  <span className="font-semibold">Total Guide:</span>
                  <div className="text-right font-semibold text-lg">
                    {totals.totalGuide.toLocaleString("en-US", {
                      style: "currency",
                      currency: "EGP",
                    })}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap">
                  <h4 className="text-lg font-semibold">5- Transportation</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendTransportation({
                        city: "",
                        supplierName: "",
                        amount: 0,
                        currency: "EGP",
                        exchangeRate: 0,
                        status: "pending",
                        siteCostNo: "",
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Transportation
                  </Button>
                </div>
                {transportationFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">
                        Transportation Item {index + 1}
                      </h5>
                      {transportationFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTransportation(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                      <div>
                        <Label>City</Label>
                        <Controller
                          name={`transportation.${index}.city`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select City" />
                              </SelectTrigger>
                              <SelectContent>
                                {cities.map((city: any) => (
                                  <SelectItem key={city.id} value={city.name}>
                                    {city.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div>
                        <Label>Supplier Name</Label>
                        <Controller
                          name={`transportation.${index}.supplierName`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Supplier" />
                              </SelectTrigger>
                              <SelectContent>
                                {supplier.map((supplier: any) => (
                                  <SelectItem
                                    key={supplier.id}
                                    value={supplier.name}
                                  >
                                    {supplier.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div>
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`transportation.${index}.amount`, {
                            valueAsNumber: true,
                          })}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>Currency</Label>
                        <Controller
                          name={`transportation.${index}.currency`}
                          control={control}
                          render={({ field }) => (
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex items-center space-x-4 pt-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="EGP"
                                  id={`trans-egp-${index}`}
                                />
                                <Label htmlFor={`trans-egp-${index}`}>
                                  EGP
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="USD"
                                  id={`trans-usd-${index}`}
                                />
                                <Label htmlFor={`trans-usd-${index}`}>
                                  USD
                                </Label>
                              </div>
                            </RadioGroup>
                          )}
                        />
                      </div>
                      {watch(`transportation.${index}.currency`) === "USD" && (
                        <div>
                          <Label>Exchange Rate</Label>
                          <Input
                            type="number"
                            step="0.01"
                            {...register(
                              `transportation.${index}.exchangeRate`,
                              { valueAsNumber: true }
                            )}
                            placeholder="e.g., 47.50"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Controller
                        name={`transportation.${index}.status`}
                        control={control}
                        render={({ field }) => (
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex items-center space-x-4 pt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="pending"
                                id={`trans-pending-${index}`}
                              />
                              <Label htmlFor={`trans-pending-${index}`}>
                                Pending
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="paid"
                                id={`trans-paid-${index}`}
                              />
                              <Label htmlFor={`trans-paid-${index}`}>
                                Paid
                              </Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                    </div>
                  </div>
                ))}
                <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
                  <span className="font-semibold">Total Transportation:</span>
                  <div className="text-right font-semibold text-lg">
                    {totals.totalTransportation.toLocaleString("en-US", {
                      style: "currency",
                      currency: "EGP",
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
                    value={totals.grandTotalIncomeEGP.toFixed(2)}
                  />
                </div>
                <div>
                  <Label>Grand Total Expenses (EGP)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    readOnly
                    value={totals.grandTotalExpensesEGP.toFixed(2)}
                  />
                </div>
                <div>
                  <Label>Rest Profit (EGP)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    readOnly
                    value={totals.restProfitEGP.toFixed(2)}
                  />
                </div>
                <div>
                  <Label>Total Owed to Suppliers (EGP)</Label>
                  <Input
                    type="number"
                    value={totals.totalOwedToSuppliers.toFixed(2)}
                    readOnly
                    className="font-bold text-blue-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4 no-print">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                "Saving..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

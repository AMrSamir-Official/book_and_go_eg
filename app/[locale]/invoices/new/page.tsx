"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useForm, useFieldArray } from "react-hook-form"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Minus, Save, MessageSquare, Printer, DollarSign } from "lucide-react"
import { sampleBookings, paymentMethods, invoiceStatuses } from "@/lib/fake-data"
import { useToast } from "@/hooks/use-toast"

interface InvoiceFormData {
  // Basic Information
  title: string
  invoiceNumber: string
  bookingId: string
  bookingDate: string
  fileNumber: string
  supplierName: string
  arrivalFileDate: string

  // Main Invoice
  totalInvoiceUSD: number
  totalInvoiceEGP: number
  paidAmount: number
  restAmountUSD: number
  restAmountEGP: number
  wayOfPayment: string
  paymentDate: string

  // Extra Incoming
  extraIncoming: Array<{
    type: string // Tipping, Optional tours, Hotel extension, Shopping, Tickets
    amountUSD: number
    amountEGP: number
    note: string
    status: "pending" | "paid"
    date: string
  }>

  // Expenses
  accommodation: Array<{
    name: string // Hotel 1, Hotel 2, Nile Cruise
    totalAmountUSD: number
    totalAmountEGP: number
    paymentDate: string
    status: "pending" | "paid"
  }>

  domesticFlights: Array<{
    details: string
    costUSD: number
    costEGP: number
    paymentDate: string
    status: "pending" | "paid"
  }>

  entranceTickets: {
    totalUSD: number
    totalEGP: number
  }

  guide: {
    totalUSD: number
    totalEGP: number
  }

  transportation: Array<{
    city: string // Cairo, Aswan & Luxor
    supplierName: string
    amountUSD: number
    amountEGP: number
    status: "pending" | "paid"
    siteCostNo: string
    guides: Array<{
      guideNumber: string // Guide 1, Guide 2, Guide 3
      date: string
      note: string
      totalCost: number
    }>
  }>

  // Totals
  grandTotalIncomeEGP: number
  grandTotalExpensesEGP: number
  restProfitEGP: number

  // Additional fields
  dueDate: string
  paymentMethod: string
  status: string
  notes: string
  dynamicFields: Array<{
    label: string
    value: string
  }>
}

export default function NewInvoicePage() {
  const t = useTranslations("invoices")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const bookingId = searchParams.get("booking")

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    defaultValues: {
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      bookingId: bookingId || "",
      extraIncoming: [{ type: "Tipping", amountUSD: 0, amountEGP: 0, note: "", status: "pending", date: "" }],
      accommodation: [{ name: "Hotel 1", totalAmountUSD: 0, totalAmountEGP: 0, paymentDate: "", status: "pending" }],
      domesticFlights: [{ details: "Flight 1 Details", costUSD: 0, costEGP: 0, paymentDate: "", status: "pending" }],
      transportation: [
        {
          city: "Cairo",
          supplierName: "",
          amountUSD: 0,
          amountEGP: 0,
          status: "pending",
          siteCostNo: "",
          guides: [{ guideNumber: "Guide 1", date: "", note: "", totalCost: 0 }],
        },
      ],
      dynamicFields: [],
    },
  })

  const {
    fields: extraIncomingFields,
    append: appendExtraIncoming,
    remove: removeExtraIncoming,
  } = useFieldArray({ control, name: "extraIncoming" })

  const {
    fields: accommodationFields,
    append: appendAccommodation,
    remove: removeAccommodation,
  } = useFieldArray({ control, name: "accommodation" })

  const {
    fields: flightFields,
    append: appendFlight,
    remove: removeFlight,
  } = useFieldArray({ control, name: "domesticFlights" })

  const {
    fields: transportationFields,
    append: appendTransportation,
    remove: removeTransportation,
  } = useFieldArray({ control, name: "transportation" })

  const {
    fields: dynamicFields,
    append: appendDynamicField,
    remove: removeDynamicField,
  } = useFieldArray({ control, name: "dynamicFields" })

  // Load booking data if bookingId is provided
  useEffect(() => {
    if (bookingId) {
      const booking = sampleBookings.find((b) => b.id === bookingId)
      if (booking) {
        setValue("title", `${booking.fileNumber} - Invoice`)
        setValue("fileNumber", booking.fileNumber)
        setValue("supplierName", booking.supplier)
        setValue("arrivalFileDate", booking.arrivalDate)
        setValue("bookingDate", booking.createdAt)
      }
    }
  }, [bookingId, setValue])

  const onSubmit = (data: InvoiceFormData) => {
    console.log("Invoice Data:", data)
    toast({
      title: "Invoice Created",
      description: "Your invoice has been created successfully!",
    })
    router.push("/invoices")
  }

  const handleWhatsApp = () => {
    const message = "New invoice created - Book & Go Travel"
    const url = `https://wa.me/201122636253?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  const handlePrint = () => {
    window.print()
  }

  const extraIncomingTypes = ["Tipping", "Optional tours", "Hotel extension", "Shopping", "Tickets"]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("createInvoice")}</h1>
            <p className="text-muted-foreground">Accounting File - Book & Go Travel</p>
          </div>
          <div className="flex space-x-2 no-print">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleWhatsApp}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Send WhatsApp
            </Button>
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
                  {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    {...register("invoiceNumber", { required: "Invoice number is required" })}
                    placeholder="INV-2024-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bookingDate">Booking Date</Label>
                  <Input id="bookingDate" type="date" {...register("bookingDate")} />
                </div>

                <div>
                  <Label htmlFor="fileNumber">File Number</Label>
                  <Input id="fileNumber" {...register("fileNumber")} placeholder="BG-2024-001" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplierName">Supplier Name</Label>
                  <Input id="supplierName" {...register("supplierName")} placeholder="Egypt Travel Co." />
                </div>

                <div>
                  <Label htmlFor="arrivalFileDate">Arrival File Date</Label>
                  <Input id="arrivalFileDate" type="date" {...register("arrivalFileDate")} />
                </div>
              </div>

              {bookingId && (
                <div>
                  <Label htmlFor="bookingId">Booking ID</Label>
                  <Select onValueChange={(value) => setValue("bookingId", value)} defaultValue={bookingId}>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Total Invoice (USD)</Label>
                    <Input type="number" step="0.01" {...register("totalInvoiceUSD")} placeholder="0.00" />
                  </div>
                  <div>
                    <Label>Total Invoice (EGP)</Label>
                    <Input type="number" step="0.01" {...register("totalInvoiceEGP")} placeholder="0.00" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Paid Amount</Label>
                    <Input type="number" step="0.01" {...register("paidAmount")} placeholder="0.00" />
                  </div>
                  <div>
                    <Label>Rest Amount (USD)</Label>
                    <Input type="number" step="0.01" {...register("restAmountUSD")} placeholder="0.00" />
                  </div>
                  <div>
                    <Label>Rest Amount (EGP)</Label>
                    <Input type="number" step="0.01" {...register("restAmountEGP")} placeholder="0.00" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Way of Payment</Label>
                    <Select onValueChange={(value) => setValue("wayOfPayment", value)}>
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
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">Extra Incoming</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendExtraIncoming({
                        type: "Tipping",
                        amountUSD: 0,
                        amountEGP: 0,
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

                {extraIncomingFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium">Extra Income {index + 1}</h5>
                      {extraIncomingFields.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeExtraIncoming(index)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <Label>Type</Label>
                        <Select onValueChange={(value) => setValue(`extraIncoming.${index}.type`, value)}>
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
                        <Label>Amount (USD)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`extraIncoming.${index}.amountUSD`)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>Amount (EGP)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`extraIncoming.${index}.amountEGP`)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>Date</Label>
                        <Input type="date" {...register(`extraIncoming.${index}.date`)} />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <RadioGroup
                          defaultValue="pending"
                          onValueChange={(value) =>
                            setValue(`extraIncoming.${index}.status`, value as "pending" | "paid")
                          }
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pending" id={`extra-pending-${index}`} />
                            <Label htmlFor={`extra-pending-${index}`}>Pending</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="paid" id={`extra-paid-${index}`} />
                            <Label htmlFor={`extra-paid-${index}`}>Paid</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label>Note</Label>
                      <Textarea
                        {...register(`extraIncoming.${index}.note`)}
                        placeholder="Additional notes..."
                        rows={2}
                      />
                    </div>
                  </div>
                ))}

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Extra Income:</span>
                    <div className="text-right">
                      <div>1500 USD</div>
                      <div>EGP</div>
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">1- Accommodation</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendAccommodation({
                        name: `Hotel ${accommodationFields.length + 1}`,
                        totalAmountUSD: 0,
                        totalAmountEGP: 0,
                        paymentDate: "",
                        status: "pending",
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Accommodation
                  </Button>
                </div>

                {accommodationFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium">{field.name || `Hotel ${index + 1}`}</h5>
                      {accommodationFields.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeAccommodation(index)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input {...register(`accommodation.${index}.name`)} placeholder="Hotel name" />
                      </div>
                      <div>
                        <Label>Total Amount (USD)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`accommodation.${index}.totalAmountUSD`)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>Total Amount (EGP)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`accommodation.${index}.totalAmountEGP`)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>Payment Date</Label>
                        <Input type="date" {...register(`accommodation.${index}.paymentDate`)} />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label>Status</Label>
                      <RadioGroup
                        defaultValue="pending"
                        onValueChange={(value) =>
                          setValue(`accommodation.${index}.status`, value as "pending" | "paid")
                        }
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pending" id={`acc-pending-${index}`} />
                            <Label htmlFor={`acc-pending-${index}`}>Pending</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="paid" id={`acc-paid-${index}`} />
                            <Label htmlFor={`acc-paid-${index}`}>Paid</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                ))}

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Accommodation:</span>
                    <div className="text-right">
                      <div>800 USD</div>
                      <div>EGP</div>
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
                        costUSD: 0,
                        costEGP: 0,
                        paymentDate: "",
                        status: "pending",
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Flight
                  </Button>
                </div>

                {flightFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium">Flight {index + 1}</h5>
                      {flightFields.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeFlight(index)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Flight Details</Label>
                        <Input {...register(`domesticFlights.${index}.details`)} placeholder="Flight details" />
                      </div>
                      <div>
                        <Label>Cost (USD)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`domesticFlights.${index}.costUSD`)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>Cost (EGP)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`domesticFlights.${index}.costEGP`)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>Payment Date</Label>
                        <Input type="date" {...register(`domesticFlights.${index}.paymentDate`)} />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label>Status</Label>
                      <RadioGroup
                        defaultValue="pending"
                        onValueChange={(value) =>
                          setValue(`domesticFlights.${index}.status`, value as "pending" | "paid")
                        }
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pending" id={`flight-pending-${index}`} />
                            <Label htmlFor={`flight-pending-${index}`}>Pending</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="paid" id={`flight-paid-${index}`} />
                            <Label htmlFor={`flight-paid-${index}`}>Paid</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                ))}

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Domestic Flights:</span>
                    <div className="text-right">
                      <div>800 USD</div>
                      <div>EGP</div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Entrance Tickets */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Entrance Tickets</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Total (USD)</Label>
                    <Input type="number" step="0.01" {...register("entranceTickets.totalUSD")} placeholder="0.00" />
                  </div>
                  <div>
                    <Label>Total (EGP)</Label>
                    <Input type="number" step="0.01" {...register("entranceTickets.totalEGP")} placeholder="0.00" />
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Entrance Tickets:</span>
                    <div className="text-right">
                      <div>800 USD</div>
                      <div>EGP</div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Guide */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Guide</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Total (USD)</Label>
                    <Input type="number" step="0.01" {...register("guide.totalUSD")} placeholder="0.00" />
                  </div>
                  <div>
                    <Label>Total (EGP)</Label>
                    <Input type="number" step="0.01" {...register("guide.totalEGP")} placeholder="0.00" />
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Guide:</span>
                    <div className="text-right">
                      <div>800 USD</div>
                      <div>EGP</div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Transportation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">Transportation</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendTransportation({
                        city: "Cairo",
                        supplierName: "",
                        amountUSD: 0,
                        amountEGP: 0,
                        status: "pending",
                        siteCostNo: "",
                        guides: [{ guideNumber: "Guide 1", date: "", note: "", totalCost: 0 }],
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Transportation
                  </Button>
                </div>

                {transportationFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium">Transportation {index + 1}</h5>
                      {transportationFields.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeTransportation(index)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label>City</Label>
                        <Select onValueChange={(value) => setValue(`transportation.${index}.city`, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cairo">Cairo</SelectItem>
                            <SelectItem value="Aswan">Aswan</SelectItem>
                            <SelectItem value="Luxor">Luxor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Supplier Name</Label>
                        <Input {...register(`transportation.${index}.supplierName`)} placeholder="Supplier name" />
                      </div>
                      <div>
                        <Label>Site Cost No</Label>
                        <Input {...register(`transportation.${index}.siteCostNo`)} placeholder="Site cost number" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label>Amount (USD)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`transportation.${index}.amountUSD`)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>Amount (EGP)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`transportation.${index}.amountEGP`)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <Label>Status</Label>
                      <RadioGroup
                        defaultValue="pending"
                        onValueChange={(value) =>
                          setValue(`transportation.${index}.status`, value as "pending" | "paid")
                        }
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pending" id={`trans-pending-${index}`} />
                            <Label htmlFor={`trans-pending-${index}`}>Pending</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="paid" id={`trans-paid-${index}`} />
                            <Label htmlFor={`trans-paid-${index}`}>Paid</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Guide Details Table */}
                    <div className="space-y-4">
                      <h6 className="font-medium">Guide Details</h6>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Guide</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Note</TableHead>
                            <TableHead>Total Cost</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>Guide 1</TableCell>
                            <TableCell>
                              <Input type="date" className="w-full" />
                            </TableCell>
                            <TableCell>
                              <Input placeholder="Note" className="w-full" />
                            </TableCell>
                            <TableCell>
                              <Input type="number" step="0.01" placeholder="0.00" className="w-full" />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Guide 2</TableCell>
                            <TableCell>
                              <Input type="date" className="w-full" />
                            </TableCell>
                            <TableCell>
                              <Input placeholder="Note" className="w-full" />
                            </TableCell>
                            <TableCell>
                              <Input type="number" step="0.01" placeholder="0.00" className="w-full" />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Guide 3</TableCell>
                            <TableCell>
                              <Input type="date" className="w-full" />
                            </TableCell>
                            <TableCell>
                              <Input placeholder="Note" className="w-full" />
                            </TableCell>
                            <TableCell>
                              <Input type="number" step="0.01" placeholder="0.00" className="w-full" />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Transportation:</span>
                    <div className="text-right">
                      <div>800 USD</div>
                      <div>EGP</div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Grand Total Income (EGP)</Label>
                  <Input type="number" step="0.01" {...register("grandTotalIncomeEGP")} placeholder="0.00" />
                </div>
                <div>
                  <Label>Grand Total Expenses (EGP)</Label>
                  <Input type="number" step="0.01" {...register("grandTotalExpensesEGP")} placeholder="0.00" />
                </div>
                <div>
                  <Label>Rest Profit (EGP)</Label>
                  <Input type="number" step="0.01" {...register("restProfitEGP")} placeholder="0.00" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" type="date" {...register("dueDate")} />
                </div>

                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select onValueChange={(value) => setValue("paymentMethod", value)}>
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
                  <Select onValueChange={(value) => setValue("status", value)}>
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
                <Textarea id="notes" {...register("notes")} placeholder="Additional notes or comments..." rows={4} />
              </div>

              {/* Dynamic Fields */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-semibold">Dynamic Fields</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendDynamicField({ label: "", value: "" })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Field
                  </Button>
                </div>

                {dynamicFields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input {...register(`dynamicFields.${index}.label`)} placeholder="Field label" />
                    </div>
                    <div className="flex-1">
                      <Input {...register(`dynamicFields.${index}.value`)} placeholder="Field value" />
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => removeDynamicField(index)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 no-print">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

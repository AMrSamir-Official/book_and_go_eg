"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Calculator,
  Edit,
  Eye,
  Plus,
  Printer,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

interface BasicInfo {
  bookingDate: string;
  fileNumber: string;
  supplierName: string;
  arrivalFileDate: string;
}

interface Transaction {
  id: string;
  description: string;
  totalInvoice: number;
  currency: "USD" | "EGP";
  paidAmount: number;
  restAmount: number;
  wayOfPayment: "Cash upon arrival" | "Bank remittance";
  date: string;
}

interface ExtraIncoming {
  id: string;
  type:
    | "Tipping"
    | "Optional tours"
    | "Hotel extension"
    | "Shopping"
    | "Tickets";
  amount: number;
  currency: "USD" | "EGP";
  note: string;
  status: "pending" | "paid";
  date: string;
}

interface Accommodation {
  id: string;
  hotelName: string;
  totalAmount: number;
  currency: "USD" | "EGP";
  paymentDate: string;
  status: "pending" | "paid";
}

interface DomesticFlight {
  id: string;
  flightDetails: string;
  cost: number;
  currency: "USD" | "EGP";
  paymentDate: string;
  status: "pending" | "paid";
}

interface Guide {
  id: string;
  guideName: string;
  date: string;
  note: string;
  totalCost: number;
  currency: "USD" | "EGP";
}

interface Transportation {
  id: string;
  city: "Cairo" | "Aswan & Luxor";
  supplierName: string;
  amount: number;
  currency: "USD" | "EGP";
  status: "pending" | "paid";
}

export function AccountingPageClient() {
  const t = useTranslations("accounting");
  const tCommon = useTranslations("common");
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "EGP">(
    "USD"
  );
  const [exchangeRate, setExchangeRate] = useState(50);

  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    bookingDate: new Date().toISOString().split("T")[0],
    fileNumber: bookingId || "BG-2024-001",
    supplierName: "Book & Go Travel",
    arrivalFileDate: "",
  });

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      description: "Main Invoice",
      totalInvoice: 5000,
      currency: "USD",
      paidAmount: 3000,
      restAmount: 2000,
      wayOfPayment: "Cash upon arrival",
      date: "2024-01-20",
    },
  ]);

  const [extraIncoming, setExtraIncoming] = useState<ExtraIncoming[]>([
    {
      id: "1",
      type: "Tipping",
      amount: 200,
      currency: "USD",
      note: "Guide tips",
      status: "pending",
      date: "2024-01-21",
    },
  ]);

  const [accommodation, setAccommodation] = useState<Accommodation[]>([
    {
      id: "1",
      hotelName: "Four Seasons Cairo",
      totalAmount: 1200,
      currency: "USD",
      paymentDate: "2024-01-20",
      status: "paid",
    },
  ]);

  const [domesticFlights, setDomesticFlights] = useState<DomesticFlight[]>([
    {
      id: "1",
      flightDetails: "CAI to ASW - MS789",
      cost: 300,
      currency: "USD",
      paymentDate: "2024-01-20",
      status: "paid",
    },
  ]);

  const [guides, setGuides] = useState<Guide[]>([
    {
      id: "1",
      guideName: "Ahmed Hassan",
      date: "2024-01-21",
      note: "Cairo tour guide",
      totalCost: 150,
      currency: "USD",
    },
  ]);

  const [transportation, setTransportation] = useState<Transportation[]>([
    {
      id: "1",
      city: "Cairo",
      supplierName: "Cairo Transport Co.",
      amount: 400,
      currency: "USD",
      status: "paid",
    },
  ]);

  const [entranceTickets] = useState({ total: 200, currency: "USD" as const });

  const convertAmount = (amount: number, fromCurrency: "USD" | "EGP") => {
    if (selectedCurrency === fromCurrency) return amount;
    if (selectedCurrency === "USD" && fromCurrency === "EGP")
      return amount / exchangeRate;
    if (selectedCurrency === "EGP" && fromCurrency === "USD")
      return amount * exchangeRate;
    return amount;
  };

  const calculateTotals = () => {
    const totalIncome = transactions.reduce(
      (sum, t) => sum + convertAmount(t.totalInvoice, t.currency),
      0
    );
    const totalExtraIncome = extraIncoming.reduce(
      (sum, e) => sum + convertAmount(e.amount, e.currency),
      0
    );

    const totalAccommodation = accommodation.reduce(
      (sum, a) => sum + convertAmount(a.totalAmount, a.currency),
      0
    );
    const totalFlights = domesticFlights.reduce(
      (sum, f) => sum + convertAmount(f.cost, f.currency),
      0
    );
    const totalGuides = guides.reduce(
      (sum, g) => sum + convertAmount(g.totalCost, g.currency),
      0
    );
    const totalTransportation = transportation.reduce(
      (sum, t) => sum + convertAmount(t.amount, t.currency),
      0
    );
    const totalEntranceTickets = convertAmount(
      entranceTickets.total,
      entranceTickets.currency
    );

    const grandTotalIncome = totalIncome + totalExtraIncome;
    const grandTotalExpenses =
      totalAccommodation +
      totalFlights +
      totalGuides +
      totalTransportation +
      totalEntranceTickets;
    const restProfit = grandTotalIncome - grandTotalExpenses;

    return {
      totalIncome,
      totalExtraIncome,
      grandTotalIncome,
      totalAccommodation,
      totalFlights,
      totalGuides,
      totalTransportation,
      totalEntranceTickets,
      grandTotalExpenses,
      restProfit,
    };
  };

  const totals = calculateTotals();

  const handlePrintAccounting = () => {
    router.push(`/admin/accounting/${basicInfo.fileNumber}/print`);
  };

  const handleViewBooking = () => {
    if (bookingId) {
      router.push(`/bookings/${bookingId}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  const addTransaction = () => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description: "New Invoice",
      totalInvoice: 0,
      currency: selectedCurrency,
      paidAmount: 0,
      restAmount: 0,
      wayOfPayment: "Cash upon arrival",
      date: new Date().toISOString().split("T")[0],
    };
    setTransactions([...transactions, newTransaction]);
  };

  const addExtraIncoming = () => {
    const newExtra: ExtraIncoming = {
      id: Date.now().toString(),
      type: "Tipping",
      amount: 0,
      currency: selectedCurrency,
      note: "",
      status: "pending",
      date: new Date().toISOString().split("T")[0],
    };
    setExtraIncoming([...extraIncoming, newExtra]);
  };

  const addAccommodation = () => {
    const newAccommodation: Accommodation = {
      id: Date.now().toString(),
      hotelName: "",
      totalAmount: 0,
      currency: selectedCurrency,
      paymentDate: new Date().toISOString().split("T")[0],
      status: "pending",
    };
    setAccommodation([...accommodation, newAccommodation]);
  };

  const addDomesticFlight = () => {
    const newFlight: DomesticFlight = {
      id: Date.now().toString(),
      flightDetails: "",
      cost: 0,
      currency: selectedCurrency,
      paymentDate: new Date().toISOString().split("T")[0],
      status: "pending",
    };
    setDomesticFlights([...domesticFlights, newFlight]);
  };

  const addGuide = () => {
    const newGuide: Guide = {
      id: Date.now().toString(),
      guideName: "",
      date: new Date().toISOString().split("T")[0],
      note: "",
      totalCost: 0,
      currency: selectedCurrency,
    };
    setGuides([...guides, newGuide]);
  };

  const addTransportation = () => {
    const newTransport: Transportation = {
      id: Date.now().toString(),
      city: "Cairo",
      supplierName: "",
      amount: 0,
      currency: selectedCurrency,
      status: "pending",
    };
    setTransportation([...transportation, newTransport]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Accounting</h1>
              <p className="text-muted-foreground">
                Financial management for booking {basicInfo.fileNumber}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="currency">Currency:</Label>
              <Select
                value={selectedCurrency}
                onValueChange={(value: "USD" | "EGP") =>
                  setSelectedCurrency(value)
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EGP">EGP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedCurrency === "USD" && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="exchangeRate">1 USD =</Label>
                <Input
                  id="exchangeRate"
                  type="number"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(Number(e.target.value))}
                  className="w-20"
                  placeholder="50"
                />
                <span className="text-sm">EGP</span>
              </div>
            )}
            {bookingId && (
              <Button variant="outline" onClick={handleViewBooking}>
                <Eye className="mr-2 h-4 w-4" />
                View Booking
              </Button>
            )}
            <Button
              className={` ${editMode ? "bg-blue-700" : ""}`}
              variant="outline"
              onClick={() => setEditMode(!editMode)}
            >
              <Edit className="mr-2 h-4 w-4" />
              {editMode
                ? "Save Changes"
                : "Edit Mode text-white hover:text-blue-600"}
            </Button>
            <Button
              variant="outline"
              onClick={handlePrintAccounting}
              disabled={isGeneratingPDF}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Report
            </Button>
          </div>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="bookingDate" className="text-base font-medium">
                  Booking Date
                </Label>
                <Input
                  id="bookingDate"
                  type="date"
                  value={basicInfo.bookingDate}
                  onChange={(e) =>
                    setBasicInfo({ ...basicInfo, bookingDate: e.target.value })
                  }
                  disabled={!editMode}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="fileNumber" className="text-base font-medium">
                  File Number
                </Label>
                <Input
                  id="fileNumber"
                  value={basicInfo.fileNumber}
                  onChange={(e) =>
                    setBasicInfo({ ...basicInfo, fileNumber: e.target.value })
                  }
                  disabled={!editMode}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="supplierName" className="text-base font-medium">
                  Supplier Name
                </Label>
                <Input
                  id="supplierName"
                  value={basicInfo.supplierName}
                  onChange={(e) =>
                    setBasicInfo({ ...basicInfo, supplierName: e.target.value })
                  }
                  disabled={!editMode}
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="arrivalFileDate"
                  className="text-base font-medium"
                >
                  Arrival File Date
                </Label>
                <Input
                  id="arrivalFileDate"
                  type="date"
                  value={basicInfo.arrivalFileDate}
                  onChange={(e) =>
                    setBasicInfo({
                      ...basicInfo,
                      arrivalFileDate: e.target.value,
                    })
                  }
                  disabled={!editMode}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Transactions</CardTitle>
              {editMode && (
                <Button variant="outline" size="sm" onClick={addTransaction}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Transaction
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Main Invoice</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Total Invoice</TableHead>
                      <TableHead>Paid Amount</TableHead>
                      <TableHead>Rest Amount</TableHead>
                      <TableHead>Way of Payment</TableHead>
                      <TableHead>Date</TableHead>
                      {editMode && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction, index) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Input
                            value={transaction.description}
                            onChange={(e) => {
                              const updated = [...transactions];
                              updated[index].description = e.target.value;
                              setTransactions(updated);
                            }}
                            disabled={!editMode}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={transaction.totalInvoice}
                              onChange={(e) => {
                                const updated = [...transactions];
                                updated[index].totalInvoice = Number(
                                  e.target.value
                                );
                                updated[index].restAmount =
                                  updated[index].totalInvoice -
                                  updated[index].paidAmount;
                                setTransactions(updated);
                              }}
                              disabled={!editMode}
                              className="w-24"
                            />
                            <Select
                              value={transaction.currency}
                              onValueChange={(value: "USD" | "EGP") => {
                                const updated = [...transactions];
                                updated[index].currency = value;
                                setTransactions(updated);
                              }}
                              disabled={!editMode}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EGP">EGP</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={transaction.paidAmount}
                            onChange={(e) => {
                              const updated = [...transactions];
                              updated[index].paidAmount = Number(
                                e.target.value
                              );
                              updated[index].restAmount =
                                updated[index].totalInvoice -
                                updated[index].paidAmount;
                              setTransactions(updated);
                            }}
                            disabled={!editMode}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {transaction.restAmount.toLocaleString()}{" "}
                            {transaction.currency}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={transaction.wayOfPayment}
                            onValueChange={(
                              value: "Cash upon arrival" | "Bank remittance"
                            ) => {
                              const updated = [...transactions];
                              updated[index].wayOfPayment = value;
                              setTransactions(updated);
                            }}
                            disabled={!editMode}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cash upon arrival">
                                Cash upon arrival
                              </SelectItem>
                              <SelectItem value="Bank remittance">
                                Bank remittance
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={transaction.date}
                            onChange={(e) => {
                              const updated = [...transactions];
                              updated[index].date = e.target.value;
                              setTransactions(updated);
                            }}
                            disabled={!editMode}
                          />
                        </TableCell>
                        {editMode && (
                          <TableCell>
                            {transactions.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setTransactions(
                                    transactions.filter((_, i) => i !== index)
                                  )
                                }
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">
                  Total: {totals.totalIncome.toLocaleString()}{" "}
                  {selectedCurrency}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Extra Incoming */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Extra Incoming</CardTitle>
              {editMode && (
                <Button variant="outline" size="sm" onClick={addExtraIncoming}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Extra Income
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    {editMode && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extraIncoming.map((extra, index) => (
                    <TableRow key={extra.id}>
                      <TableCell>
                        <Select
                          value={extra.type}
                          onValueChange={(value: ExtraIncoming["type"]) => {
                            const updated = [...extraIncoming];
                            updated[index].type = value;
                            setExtraIncoming(updated);
                          }}
                          disabled={!editMode}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Tipping">Tipping</SelectItem>
                            <SelectItem value="Optional tours">
                              Optional tours
                            </SelectItem>
                            <SelectItem value="Hotel extension">
                              Hotel extension
                            </SelectItem>
                            <SelectItem value="Shopping">Shopping</SelectItem>
                            <SelectItem value="Tickets">Tickets</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={extra.amount}
                            onChange={(e) => {
                              const updated = [...extraIncoming];
                              updated[index].amount = Number(e.target.value);
                              setExtraIncoming(updated);
                            }}
                            disabled={!editMode}
                            className="w-24"
                          />
                          <Select
                            value={extra.currency}
                            onValueChange={(value: "USD" | "EGP") => {
                              const updated = [...extraIncoming];
                              updated[index].currency = value;
                              setExtraIncoming(updated);
                            }}
                            disabled={!editMode}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EGP">EGP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={extra.note}
                          onChange={(e) => {
                            const updated = [...extraIncoming];
                            updated[index].note = e.target.value;
                            setExtraIncoming(updated);
                          }}
                          disabled={!editMode}
                          placeholder="Note"
                        />
                      </TableCell>
                      <TableCell>
                        {editMode ? (
                          <RadioGroup
                            value={extra.status}
                            onValueChange={(value: "pending" | "paid") => {
                              const updated = [...extraIncoming];
                              updated[index].status = value;
                              setExtraIncoming(updated);
                            }}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="pending"
                                  id={`pending-extra-${index}`}
                                />
                                <Label htmlFor={`pending-extra-${index}`}>
                                  Pending
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="paid"
                                  id={`paid-extra-${index}`}
                                />
                                <Label htmlFor={`paid-extra-${index}`}>
                                  Paid
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>
                        ) : (
                          <Badge
                            variant={getStatusColor(extra.status)}
                            className="capitalize"
                          >
                            {extra.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={extra.date}
                          onChange={(e) => {
                            const updated = [...extraIncoming];
                            updated[index].date = e.target.value;
                            setExtraIncoming(updated);
                          }}
                          disabled={!editMode}
                        />
                      </TableCell>
                      {editMode && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setExtraIncoming(
                                extraIncoming.filter((_, i) => i !== index)
                              )
                            }
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 text-right">
              <div className="text-lg font-semibold">
                Total: {totals.totalExtraIncome.toLocaleString()}{" "}
                {selectedCurrency}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 1- Accommodation */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">1- Accommodation</h3>
                {editMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addAccommodation}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Hotel
                  </Button>
                )}
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hotel Name</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Status</TableHead>
                      {editMode && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accommodation.map((hotel, index) => (
                      <TableRow key={hotel.id}>
                        <TableCell>
                          <Input
                            value={hotel.hotelName}
                            onChange={(e) => {
                              const updated = [...accommodation];
                              updated[index].hotelName = e.target.value;
                              setAccommodation(updated);
                            }}
                            disabled={!editMode}
                            placeholder="Hotel name"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={hotel.totalAmount}
                              onChange={(e) => {
                                const updated = [...accommodation];
                                updated[index].totalAmount = Number(
                                  e.target.value
                                );
                                setAccommodation(updated);
                              }}
                              disabled={!editMode}
                              className="w-24"
                            />
                            <Select
                              value={hotel.currency}
                              onValueChange={(value: "USD" | "EGP") => {
                                const updated = [...accommodation];
                                updated[index].currency = value;
                                setAccommodation(updated);
                              }}
                              disabled={!editMode}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EGP">EGP</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={hotel.paymentDate}
                            onChange={(e) => {
                              const updated = [...accommodation];
                              updated[index].paymentDate = e.target.value;
                              setAccommodation(updated);
                            }}
                            disabled={!editMode}
                          />
                        </TableCell>
                        <TableCell>
                          {editMode ? (
                            <RadioGroup
                              value={hotel.status}
                              onValueChange={(value: "pending" | "paid") => {
                                const updated = [...accommodation];
                                updated[index].status = value;
                                setAccommodation(updated);
                              }}
                            >
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="pending"
                                    id={`pending-hotel-${index}`}
                                  />
                                  <Label htmlFor={`pending-hotel-${index}`}>
                                    Pending
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="paid"
                                    id={`paid-hotel-${index}`}
                                  />
                                  <Label htmlFor={`paid-hotel-${index}`}>
                                    Paid
                                  </Label>
                                </div>
                              </div>
                            </RadioGroup>
                          ) : (
                            <Badge
                              variant={getStatusColor(hotel.status)}
                              className="capitalize"
                            >
                              {hotel.status}
                            </Badge>
                          )}
                        </TableCell>
                        {editMode && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setAccommodation(
                                  accommodation.filter((_, i) => i !== index)
                                )
                              }
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 text-right">
                <div className="text-lg font-semibold">
                  Total: {totals.totalAccommodation.toLocaleString()}{" "}
                  {selectedCurrency}
                </div>
              </div>
            </div>

            <Separator />

            {/* 2 - Domestic Flight */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">2 - Domestic Flight</h3>
                {editMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addDomesticFlight}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Flight
                  </Button>
                )}
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Flight Details</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Status</TableHead>
                      {editMode && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {domesticFlights.map((flight, index) => (
                      <TableRow key={flight.id}>
                        <TableCell>
                          <Input
                            value={flight.flightDetails}
                            onChange={(e) => {
                              const updated = [...domesticFlights];
                              updated[index].flightDetails = e.target.value;
                              setDomesticFlights(updated);
                            }}
                            disabled={!editMode}
                            placeholder="Flight details"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={flight.cost}
                              onChange={(e) => {
                                const updated = [...domesticFlights];
                                updated[index].cost = Number(e.target.value);
                                setDomesticFlights(updated);
                              }}
                              disabled={!editMode}
                              className="w-24"
                            />
                            <Select
                              value={flight.currency}
                              onValueChange={(value: "USD" | "EGP") => {
                                const updated = [...domesticFlights];
                                updated[index].currency = value;
                                setDomesticFlights(updated);
                              }}
                              disabled={!editMode}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EGP">EGP</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={flight.paymentDate}
                            onChange={(e) => {
                              const updated = [...domesticFlights];
                              updated[index].paymentDate = e.target.value;
                              setDomesticFlights(updated);
                            }}
                            disabled={!editMode}
                          />
                        </TableCell>
                        <TableCell>
                          {editMode ? (
                            <RadioGroup
                              value={flight.status}
                              onValueChange={(value: "pending" | "paid") => {
                                const updated = [...domesticFlights];
                                updated[index].status = value;
                                setDomesticFlights(updated);
                              }}
                            >
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="pending"
                                    id={`pending-flight-${index}`}
                                  />
                                  <Label htmlFor={`pending-flight-${index}`}>
                                    Pending
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="paid"
                                    id={`paid-flight-${index}`}
                                  />
                                  <Label htmlFor={`paid-flight-${index}`}>
                                    Paid
                                  </Label>
                                </div>
                              </div>
                            </RadioGroup>
                          ) : (
                            <Badge
                              variant={getStatusColor(flight.status)}
                              className="capitalize"
                            >
                              {flight.status}
                            </Badge>
                          )}
                        </TableCell>
                        {editMode && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setDomesticFlights(
                                  domesticFlights.filter((_, i) => i !== index)
                                )
                              }
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 text-right">
                <div className="text-lg font-semibold">
                  Total: {totals.totalFlights.toLocaleString()}{" "}
                  {selectedCurrency}
                </div>
              </div>
            </div>

            <Separator />

            {/* Entrance Tickets */}
            <div>
              <h3 className="text-lg font-semibold">Entrance Tickets</h3>
              <div className="mt-4 text-right">
                <div className="text-lg font-semibold">
                  Total: {totals.totalEntranceTickets.toLocaleString()}{" "}
                  {selectedCurrency}
                </div>
              </div>
            </div>

            <Separator />

            {/* Guide */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Guide</h3>
                {editMode && (
                  <Button variant="outline" size="sm" onClick={addGuide}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Guide
                  </Button>
                )}
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guide</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead>Total Cost</TableHead>
                      {editMode && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guides.map((guide, index) => (
                      <TableRow key={guide.id}>
                        <TableCell>
                          <Input
                            value={guide.guideName}
                            onChange={(e) => {
                              const updated = [...guides];
                              updated[index].guideName = e.target.value;
                              setGuides(updated);
                            }}
                            disabled={!editMode}
                            placeholder="Guide name"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={guide.date}
                            onChange={(e) => {
                              const updated = [...guides];
                              updated[index].date = e.target.value;
                              setGuides(updated);
                            }}
                            disabled={!editMode}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={guide.note}
                            onChange={(e) => {
                              const updated = [...guides];
                              updated[index].note = e.target.value;
                              setGuides(updated);
                            }}
                            disabled={!editMode}
                            placeholder="Note"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={guide.totalCost}
                              onChange={(e) => {
                                const updated = [...guides];
                                updated[index].totalCost = Number(
                                  e.target.value
                                );
                                setGuides(updated);
                              }}
                              disabled={!editMode}
                              className="w-24"
                            />
                            <Select
                              value={guide.currency}
                              onValueChange={(value: "USD" | "EGP") => {
                                const updated = [...guides];
                                updated[index].currency = value;
                                setGuides(updated);
                              }}
                              disabled={!editMode}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EGP">EGP</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        {editMode && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setGuides(guides.filter((_, i) => i !== index))
                              }
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 text-right">
                <div className="text-lg font-semibold">
                  Total: {totals.totalGuides.toLocaleString()}{" "}
                  {selectedCurrency}
                </div>
              </div>
            </div>

            <Separator />

            {/* Transportation */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Transportation</h3>
                {editMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addTransportation}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Transportation
                  </Button>
                )}
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>City</TableHead>
                      <TableHead>Supplier Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      {editMode && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transportation.map((transport, index) => (
                      <TableRow key={transport.id}>
                        <TableCell>
                          <Select
                            value={transport.city}
                            onValueChange={(
                              value: "Cairo" | "Aswan & Luxor"
                            ) => {
                              const updated = [...transportation];
                              updated[index].city = value;
                              setTransportation(updated);
                            }}
                            disabled={!editMode}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cairo">Cairo</SelectItem>
                              <SelectItem value="Aswan & Luxor">
                                Aswan & Luxor
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={transport.supplierName}
                            onChange={(e) => {
                              const updated = [...transportation];
                              updated[index].supplierName = e.target.value;
                              setTransportation(updated);
                            }}
                            disabled={!editMode}
                            placeholder="Supplier name"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={transport.amount}
                              onChange={(e) => {
                                const updated = [...transportation];
                                updated[index].amount = Number(e.target.value);
                                setTransportation(updated);
                              }}
                              disabled={!editMode}
                              className="w-24"
                            />
                            <Select
                              value={transport.currency}
                              onValueChange={(value: "USD" | "EGP") => {
                                const updated = [...transportation];
                                updated[index].currency = value;
                                setTransportation(updated);
                              }}
                              disabled={!editMode}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EGP">EGP</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell>
                          {editMode ? (
                            <RadioGroup
                              value={transport.status}
                              onValueChange={(value: "pending" | "paid") => {
                                const updated = [...transportation];
                                updated[index].status = value;
                                setTransportation(updated);
                              }}
                            >
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="pending"
                                    id={`pending-transport-${index}`}
                                  />
                                  <Label htmlFor={`pending-transport-${index}`}>
                                    Pending
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="paid"
                                    id={`paid-transport-${index}`}
                                  />
                                  <Label htmlFor={`paid-transport-${index}`}>
                                    Paid
                                  </Label>
                                </div>
                              </div>
                            </RadioGroup>
                          ) : (
                            <Badge
                              variant={getStatusColor(transport.status)}
                              className="capitalize"
                            >
                              {transport.status}
                            </Badge>
                          )}
                        </TableCell>
                        {editMode && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setTransportation(
                                  transportation.filter((_, i) => i !== index)
                                )
                              }
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 text-right">
                <div className="text-lg font-semibold">
                  Total: {totals.totalTransportation.toLocaleString()}{" "}
                  {selectedCurrency}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Calculator className="mr-2 h-6 w-6" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <Label className="text-base font-medium">
                    Grand Total Income
                  </Label>
                  <span className="font-bold text-green-600 text-lg">
                    {totals.grandTotalIncome.toLocaleString()}{" "}
                    {selectedCurrency}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <Label className="text-base font-medium">
                    Grand Total Expenses
                  </Label>
                  <span className="font-bold text-red-600 text-lg">
                    {totals.grandTotalExpenses.toLocaleString()}{" "}
                    {selectedCurrency}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-t-2 border-primary">
                  <Label className="text-xl font-bold">Rest Profit</Label>
                  <span
                    className={`text-2xl font-bold ${
                      totals.restProfit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {totals.restProfit.toLocaleString()} {selectedCurrency}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Profit Margin</span>
                    <span className="font-medium">
                      {totals.grandTotalIncome > 0
                        ? (
                            (totals.restProfit / totals.grandTotalIncome) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            totals.grandTotalIncome > 0
                              ? (totals.restProfit / totals.grandTotalIncome) *
                                  100
                              : 0
                          )
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Expense Ratio</span>
                    <span className="font-medium">
                      {totals.grandTotalIncome > 0
                        ? (
                            (totals.grandTotalExpenses /
                              totals.grandTotalIncome) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div
                      className="bg-red-600 h-3 rounded-full"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            totals.grandTotalIncome > 0
                              ? (totals.grandTotalExpenses /
                                  totals.grandTotalIncome) *
                                  100
                              : 0
                          )
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

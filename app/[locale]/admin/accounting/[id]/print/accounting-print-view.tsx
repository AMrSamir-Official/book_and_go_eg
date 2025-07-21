"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, MessageSquare } from "lucide-react"
import { downloadPDF, shareToWhatsApp } from "@/lib/pdf-utils"
import { useToast } from "@/hooks/use-toast"

interface AccountingData {
  fileNumber: string
  supplierName: string
  bookingDate: string
  arrivalFileDate: string
  totalIncome: number
  totalExpenses: number
  restProfit: number
  currency: "USD" | "EGP"
  transactions: Array<{
    description: string
    totalInvoice: number
    paidAmount: number
    restAmount: number
    wayOfPayment: string
    date: string
  }>
  extraIncoming: Array<{
    type: string
    amount: number
    note: string
    status: string
    date: string
  }>
  expenses: {
    accommodation: Array<{
      hotelName: string
      totalAmount: number
      status: string
    }>
    domesticFlights: Array<{
      flightDetails: string
      cost: number
      status: string
    }>
    guides: Array<{
      guideName: string
      totalCost: number
      date: string
      note: string
    }>
    transportation: Array<{
      city: string
      supplierName: string
      amount: number
      status: string
    }>
    entranceTickets: number
  }
}

export function AccountingPrintView({ accountingId }: { accountingId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [accounting, setAccounting] = useState<AccountingData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    // Load accounting data - in real app this would come from API
    const mockAccounting: AccountingData = {
      fileNumber: accountingId,
      supplierName: "Book & Go Travel",
      bookingDate: "2024-01-20",
      arrivalFileDate: "2024-02-15",
      totalIncome: 6200,
      totalExpenses: 4150,
      restProfit: 2050,
      currency: "USD",
      transactions: [
        {
          description: "Main Tour Package",
          totalInvoice: 5000,
          paidAmount: 3000,
          restAmount: 2000,
          wayOfPayment: "Cash upon arrival",
          date: "2024-01-20",
        },
      ],
      extraIncoming: [
        {
          type: "Tipping",
          amount: 200,
          note: "Guide tips",
          status: "paid",
          date: "2024-02-16",
        },
        {
          type: "Optional tours",
          amount: 1000,
          note: "Abu Simbel tour",
          status: "paid",
          date: "2024-02-18",
        },
      ],
      expenses: {
        accommodation: [
          {
            hotelName: "Four Seasons Cairo",
            totalAmount: 1200,
            status: "paid",
          },
          {
            hotelName: "Old Cataract Aswan",
            totalAmount: 800,
            status: "paid",
          },
        ],
        domesticFlights: [
          {
            flightDetails: "CAI to ASW - MS789",
            cost: 300,
            status: "paid",
          },
        ],
        guides: [
          {
            guideName: "Ahmed Hassan",
            totalCost: 150,
            date: "2024-02-16",
            note: "Cairo tour guide",
          },
          {
            guideName: "Fatma Ali",
            totalCost: 200,
            date: "2024-02-18",
            note: "Aswan tour guide",
          },
        ],
        transportation: [
          {
            city: "Cairo",
            supplierName: "Cairo Transport Co.",
            amount: 400,
            status: "paid",
          },
          {
            city: "Aswan & Luxor",
            supplierName: "Upper Egypt Transport",
            amount: 300,
            status: "paid",
          },
        ],
        entranceTickets: 800,
      },
    }
    setAccounting(mockAccounting)
  }, [accountingId])

  const handleDownloadPDF = async () => {
    const printElement = document.getElementById("accounting-print-content")
    if (!printElement || !accounting) return

    setIsGenerating(true)
    try {
      await downloadPDF(printElement, `accounting-${accounting.fileNumber}.pdf`)
      toast({
        title: "PDF Downloaded",
        description: "Accounting report has been downloaded successfully!",
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
    const printElement = document.getElementById("accounting-print-content")
    if (!printElement || !accounting) return

    setIsGenerating(true)
    try {
      const message = `📊 *ACCOUNTING REPORT - ${accounting.fileNumber}*\n\n💰 Grand Total Income: ${accounting.totalIncome.toLocaleString()} ${accounting.currency}\n💸 Grand Total Expenses: ${accounting.totalExpenses.toLocaleString()} ${accounting.currency}\n📈 Rest Profit: ${accounting.restProfit.toLocaleString()} ${accounting.currency}\n\n📄 Complete accounting report attached.`

      await shareToWhatsApp(printElement, message)
      toast({
        title: "Shared to WhatsApp",
        description: "Accounting report has been shared successfully!",
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

  if (!accounting) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
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
      <div id="accounting-print-content" className="max-w-4xl mx-auto p-8 bg-white text-black">
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-blue-600 pb-6">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Book & Go Travel</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Accounting Report</h2>
          <div className="text-lg text-gray-600">
            <p>
              File Number: <span className="font-semibold">{accounting.fileNumber}</span>
            </p>
            <p>Generated on: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Basic Information */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">Basic Information</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p>
                <strong>Booking Date:</strong> {accounting.bookingDate}
              </p>
              <p>
                <strong>File Number:</strong> {accounting.fileNumber}
              </p>
            </div>
            <div>
              <p>
                <strong>Supplier Name:</strong> {accounting.supplierName}
              </p>
              <p>
                <strong>Arrival File Date:</strong> {accounting.arrivalFileDate}
              </p>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">Transactions</h3>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-700">Main Invoice</h4>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left">Description</th>
                  <th className="border border-gray-300 p-3 text-left">Total Invoice</th>
                  <th className="border border-gray-300 p-3 text-left">Paid Amount</th>
                  <th className="border border-gray-300 p-3 text-left">Rest Amount</th>
                  <th className="border border-gray-300 p-3 text-left">Way of Payment</th>
                  <th className="border border-gray-300 p-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {accounting.transactions.map((transaction, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-3">{transaction.description}</td>
                    <td className="border border-gray-300 p-3">
                      {transaction.totalInvoice.toLocaleString()} {accounting.currency}
                    </td>
                    <td className="border border-gray-300 p-3">
                      {transaction.paidAmount.toLocaleString()} {accounting.currency}
                    </td>
                    <td className="border border-gray-300 p-3">
                      {transaction.restAmount.toLocaleString()} {accounting.currency}
                    </td>
                    <td className="border border-gray-300 p-3">{transaction.wayOfPayment}</td>
                    <td className="border border-gray-300 p-3">{transaction.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Extra Incoming */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">Extra Incoming</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-3 text-left">Type</th>
                <th className="border border-gray-300 p-3 text-left">Amount</th>
                <th className="border border-gray-300 p-3 text-left">Note</th>
                <th className="border border-gray-300 p-3 text-left">Status</th>
                <th className="border border-gray-300 p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {accounting.extraIncoming.map((extra, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-3">{extra.type}</td>
                  <td className="border border-gray-300 p-3">
                    {extra.amount.toLocaleString()} {accounting.currency}
                  </td>
                  <td className="border border-gray-300 p-3">{extra.note}</td>
                  <td className="border border-gray-300 p-3 capitalize">{extra.status}</td>
                  <td className="border border-gray-300 p-3">{extra.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right mt-4">
            <p className="text-lg font-semibold">
              Total: {accounting.extraIncoming.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}{" "}
              {accounting.currency}
            </p>
          </div>
        </div>

        {/* Expenses */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-300 pb-2">Expenses</h3>

          {/* 1- Accommodation */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">1- Accommodation</h4>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left">Hotel Name</th>
                  <th className="border border-gray-300 p-3 text-left">Total Amount</th>
                  <th className="border border-gray-300 p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {accounting.expenses.accommodation.map((hotel, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-3">{hotel.hotelName}</td>
                    <td className="border border-gray-300 p-3">
                      {hotel.totalAmount.toLocaleString()} {accounting.currency}
                    </td>
                    <td className="border border-gray-300 p-3 capitalize">{hotel.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right mt-2">
              <p className="font-semibold">
                Total:{" "}
                {accounting.expenses.accommodation.reduce((sum, item) => sum + item.totalAmount, 0).toLocaleString()}{" "}
                {accounting.currency}
              </p>
            </div>
          </div>

          {/* 2- Domestic Flight */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">2- Domestic Flight</h4>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left">Flight Details</th>
                  <th className="border border-gray-300 p-3 text-left">Cost</th>
                  <th className="border border-gray-300 p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {accounting.expenses.domesticFlights.map((flight, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-3">{flight.flightDetails}</td>
                    <td className="border border-gray-300 p-3">
                      {flight.cost.toLocaleString()} {accounting.currency}
                    </td>
                    <td className="border border-gray-300 p-3 capitalize">{flight.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right mt-2">
              <p className="font-semibold">
                Total: {accounting.expenses.domesticFlights.reduce((sum, item) => sum + item.cost, 0).toLocaleString()}{" "}
                {accounting.currency}
              </p>
            </div>
          </div>

          {/* Entrance Tickets */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">Entrance Tickets</h4>
            <div className="text-right">
              <p className="font-semibold">
                Total: {accounting.expenses.entranceTickets.toLocaleString()} {accounting.currency}
              </p>
            </div>
          </div>

          {/* Guide */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">Guide</h4>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left">Guide</th>
                  <th className="border border-gray-300 p-3 text-left">Date</th>
                  <th className="border border-gray-300 p-3 text-left">Note</th>
                  <th className="border border-gray-300 p-3 text-left">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {accounting.expenses.guides.map((guide, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-3">{guide.guideName}</td>
                    <td className="border border-gray-300 p-3">{guide.date}</td>
                    <td className="border border-gray-300 p-3">{guide.note}</td>
                    <td className="border border-gray-300 p-3">
                      {guide.totalCost.toLocaleString()} {accounting.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right mt-2">
              <p className="font-semibold">
                Total: {accounting.expenses.guides.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString()}{" "}
                {accounting.currency}
              </p>
            </div>
          </div>

          {/* Transportation */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">Transportation</h4>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left">City</th>
                  <th className="border border-gray-300 p-3 text-left">Supplier Name</th>
                  <th className="border border-gray-300 p-3 text-left">Amount</th>
                  <th className="border border-gray-300 p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {accounting.expenses.transportation.map((transport, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-3">{transport.city}</td>
                    <td className="border border-gray-300 p-3">{transport.supplierName}</td>
                    <td className="border border-gray-300 p-3">
                      {transport.amount.toLocaleString()} {accounting.currency}
                    </td>
                    <td className="border border-gray-300 p-3 capitalize">{transport.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right mt-2">
              <p className="font-semibold">
                Total: {accounting.expenses.transportation.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}{" "}
                {accounting.currency}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">Financial Summary</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Grand Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  {accounting.totalIncome.toLocaleString()} {accounting.currency}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Grand Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {accounting.totalExpenses.toLocaleString()} {accounting.currency}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Rest Profit</p>
                <p className={`text-3xl font-bold ${accounting.restProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {accounting.restProfit.toLocaleString()} {accounting.currency}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-6 border-t border-gray-300">
          <p className="text-gray-600">Book & Go Travel - Your trusted travel partner</p>
          <p className="text-sm text-gray-500">
            This accounting report was generated on {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}

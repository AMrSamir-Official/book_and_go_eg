"use client"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { sampleInvoices, sampleBookings } from "@/lib/fake-data"
import {
  ArrowLeft,
  Printer,
  MessageSquare,
  Edit,
  FileText,
  Download,
  CheckCircle,
  Calendar,
  DollarSign,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function InvoiceViewPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations("invoices")
  const { toast } = useToast()

  const invoice = sampleInvoices.find((i) => i.id === params.id)
  const relatedBooking = invoice ? sampleBookings.find((b) => b.id === invoice.bookingId) : null

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-2xl font-bold mb-4">Invoice Not Found</h2>
          <p className="text-muted-foreground mb-6">The invoice you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/invoices")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              color: #333;
              line-height: 1.6;
            }
            .header { 
              display: flex; 
              justify-content: space-between;
              align-items: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
            }
            .logo { 
              font-size: 24px; 
              font-weight: bold; 
              color: #2563eb;
            }
            .company-info {
              text-align: right;
              font-size: 12px;
              color: #6b7280;
            }
            .invoice-title { 
              font-size: 32px; 
              font-weight: bold; 
              margin-bottom: 10px;
              color: #1f2937;
            }
            .invoice-number {
              font-size: 18px;
              color: #6b7280;
              margin-bottom: 30px;
            }
            .section { 
              margin-bottom: 25px; 
              page-break-inside: avoid;
            }
            .section-title { 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 15px;
              color: #374151;
              border-bottom: 1px solid #d1d5db;
              padding-bottom: 5px;
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: repeat(2, 1fr); 
              gap: 20px; 
              margin-bottom: 20px;
            }
            .info-item { 
              display: flex; 
              flex-direction: column;
            }
            .info-label { 
              font-weight: bold; 
              color: #6b7280; 
              font-size: 12px;
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            .info-value { 
              font-size: 14px;
              color: #1f2937;
            }
            .table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 15px;
            }
            .table th, .table td { 
              border: 1px solid #d1d5db; 
              padding: 12px; 
              text-align: left;
              font-size: 13px;
            }
            .table th { 
              background-color: #f9fafb; 
              font-weight: bold;
              color: #374151;
            }
            .table .amount { 
              text-align: right;
              font-weight: bold;
            }
            .totals {
              margin-top: 30px;
              border-top: 2px solid #e5e7eb;
              padding-top: 20px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              font-size: 16px;
            }
            .grand-total {
              font-size: 20px;
              font-weight: bold;
              color: #1f2937;
              border-top: 1px solid #d1d5db;
              padding-top: 10px;
              margin-top: 10px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status-paid { background-color: #dcfce7; color: #166534; }
            .status-pending { background-color: #fef3c7; color: #92400e; }
            .status-cancelled { background-color: #fecaca; color: #991b1b; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">✈️ Book & Go Travel</div>
            </div>
            <div class="company-info">
              <div><strong>Book & Go Travel Agency</strong></div>
              <div>Phone: +20 112 263 6253</div>
              <div>Email: info@bookandgo.com</div>
              <div>Cairo, Egypt</div>
            </div>
          </div>
          
          <div class="invoice-title">INVOICE</div>
          <div class="invoice-number">${invoice.invoiceNumber}</div>
          
          <div class="section">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Invoice Date</div>
                <div class="info-value">${new Date().toLocaleDateString()}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Due Date</div>
                <div class="info-value">${invoice.dueDate}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Payment Method</div>
                <div class="info-value">${invoice.paymentMethod}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Status</div>
                <div class="info-value">
                  <span class="status-badge status-${invoice.status}">${invoice.status}</span>
                </div>
              </div>
            </div>
          </div>

          ${
            relatedBooking
              ? `
          <div class="section">
            <div class="section-title">Related Booking Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">File Number</div>
                <div class="info-value">${relatedBooking.fileNumber}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Supplier</div>
                <div class="info-value">${relatedBooking.supplier}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Travel Dates</div>
                <div class="info-value">${relatedBooking.arrivalDate} - ${relatedBooking.departureDate}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Number of Pax</div>
                <div class="info-value">${relatedBooking.paxCount}</div>
              </div>
            </div>
          </div>
          `
              : ""
          }

          <div class="section">
            <div class="section-title">Invoice Details</div>
            <table class="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th class="amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Hotel Accommodation - Four Seasons Cairo</td>
                  <td>Accommodation</td>
                  <td>7 nights</td>
                  <td>$200.00</td>
                  <td class="amount">$1,400.00</td>
                </tr>
                <tr>
                  <td>Flight Tickets - EgyptAir</td>
                  <td>Transportation</td>
                  <td>${relatedBooking?.paxCount || 2} pax</td>
                  <td>$450.00</td>
                  <td class="amount">$900.00</td>
                </tr>
                <tr>
                  <td>Private Transportation</td>
                  <td>Transportation</td>
                  <td>7 days</td>
                  <td>$80.00</td>
                  <td class="amount">$560.00</td>
                </tr>
                <tr>
                  <td>Tour Guide Services</td>
                  <td>Services</td>
                  <td>7 days</td>
                  <td>$60.00</td>
                  <td class="amount">$420.00</td>
                </tr>
                <tr>
                  <td>Entrance Fees & Activities</td>
                  <td>Activities</td>
                  <td>Various</td>
                  <td>-</td>
                  <td class="amount">$320.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$3,600.00</span>
            </div>
            <div class="total-row">
              <span>Tax (14%):</span>
              <span>$504.00</span>
            </div>
            <div class="total-row">
              <span>Service Fee:</span>
              <span>$100.00</span>
            </div>
            <div class="total-row grand-total">
              <span>Grand Total:</span>
              <span>$${invoice.amount.toLocaleString()} ${invoice.currency}</span>
            </div>
          </div>

          ${
            invoice.notes
              ? `
          <div class="section">
            <div class="section-title">Notes</div>
            <p>${invoice.notes}</p>
          </div>
          `
              : ""
          }

          <div class="footer">
            <p>This invoice was generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p><strong>Book & Go Travel Agency</strong> - Your trusted travel partner</p>
            <p>Thank you for choosing our services!</p>
          </div>
        </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }
  }

  const handleWhatsApp = () => {
    const message = `🧾 *INVOICE DETAILS*

📄 *Invoice:* ${invoice.invoiceNumber}
📋 *Title:* ${invoice.title}
💰 *Amount:* $${invoice.amount.toLocaleString()} ${invoice.currency}
📅 *Due Date:* ${invoice.dueDate}
💳 *Payment Method:* ${invoice.paymentMethod}
📊 *Status:* ${invoice.status.toUpperCase()}

${
  relatedBooking
    ? `🎫 *Related Booking:* ${relatedBooking.fileNumber}
🏢 *Supplier:* ${relatedBooking.supplier}
📅 *Travel Dates:* ${relatedBooking.arrivalDate} - ${relatedBooking.departureDate}`
    : ""
}

${invoice.notes ? `📝 *Notes:* ${invoice.notes}` : ""}

📞 *Contact:* +20 112 263 6253
🏢 *Book & Go Travel Agency*`

    const url = `https://wa.me/201122636253?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  const handleDownloadPDF = () => {
    toast({
      title: "PDF Download",
      description: "PDF download functionality would be implemented here with a real PDF library.",
    })
  }

  const handleMarkPaid = () => {
    toast({
      title: "Invoice Updated",
      description: "Invoice has been marked as paid.",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "pending":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Invoice Details</h1>
              <p className="text-muted-foreground">Invoice: {invoice.invoiceNumber}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleWhatsApp}>
              <MessageSquare className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
            {invoice.status === "pending" && (
              <Button variant="outline" size="sm" onClick={handleMarkPaid}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Paid
              </Button>
            )}
            <Link href={`/invoices/${invoice.id}/edit`}>
              <Button size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Invoice Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Invoice Number</label>
                    <p className="text-lg font-semibold">{invoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Title</label>
                    <p className="text-lg">{invoice.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Amount</label>
                    <p className="text-lg font-semibold flex items-center">
                      <DollarSign className="mr-1 h-4 w-4" />
                      {invoice.amount.toLocaleString()} {invoice.currency}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                    <p className="text-lg flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {invoice.dueDate}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                    <p className="text-lg capitalize">{invoice.paymentMethod}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <Badge variant={getStatusColor(invoice.status)} className="text-sm px-3 py-1">
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                {invoice.notes && (
                  <div className="mt-6">
                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                    <p className="text-sm mt-2 p-3 bg-muted rounded-lg">{invoice.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Related Booking */}
            {relatedBooking && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Related Booking
                    </span>
                    <Link href={`/bookings/${relatedBooking.id}`}>
                      <Button variant="outline" size="sm">
                        View Booking
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">File Number</label>
                      <p className="text-lg font-semibold">{relatedBooking.fileNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                      <p className="text-lg">{relatedBooking.supplier}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Travel Dates</label>
                      <p className="text-lg">
                        {relatedBooking.arrivalDate} - {relatedBooking.departureDate}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Number of Pax</label>
                      <p className="text-lg">{relatedBooking.paxCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Invoice Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Hotel Accommodation - Four Seasons Cairo</TableCell>
                        <TableCell>
                          <Badge variant="outline">Accommodation</Badge>
                        </TableCell>
                        <TableCell>7 nights</TableCell>
                        <TableCell>$200.00</TableCell>
                        <TableCell className="text-right font-medium">$1,400.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Flight Tickets - EgyptAir</TableCell>
                        <TableCell>
                          <Badge variant="outline">Transportation</Badge>
                        </TableCell>
                        <TableCell>{relatedBooking?.paxCount || 2} pax</TableCell>
                        <TableCell>$450.00</TableCell>
                        <TableCell className="text-right font-medium">$900.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Private Transportation</TableCell>
                        <TableCell>
                          <Badge variant="outline">Transportation</Badge>
                        </TableCell>
                        <TableCell>7 days</TableCell>
                        <TableCell>$80.00</TableCell>
                        <TableCell className="text-right font-medium">$560.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Tour Guide Services</TableCell>
                        <TableCell>
                          <Badge variant="outline">Services</Badge>
                        </TableCell>
                        <TableCell>7 days</TableCell>
                        <TableCell>$60.00</TableCell>
                        <TableCell className="text-right font-medium">$420.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Entrance Fees & Activities</TableCell>
                        <TableCell>
                          <Badge variant="outline">Activities</Badge>
                        </TableCell>
                        <TableCell>Various</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell className="text-right font-medium">$320.00</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <Separator className="my-6" />

                {/* Totals */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>$3,600.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (14%):</span>
                    <span>$504.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Service Fee:</span>
                    <span>$100.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Grand Total:</span>
                    <span>
                      ${invoice.amount.toLocaleString()} {invoice.currency}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={getStatusColor(invoice.status)} className="text-lg px-4 py-2">
                  {invoice.status}
                </Badge>
                <Separator className="my-4" />
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>Jan 15, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span>{invoice.dueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="capitalize">{invoice.paymentMethod}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Invoice
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleDownloadPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleWhatsApp}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send via WhatsApp
                </Button>
                {invoice.status === "pending" && (
                  <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleMarkPaid}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Paid
                  </Button>
                )}
                <Link href={`/invoices/${invoice.id}/edit`} className="block">
                  <Button className="w-full justify-start">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Invoice
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Bank Transfer:</span>
                    <br />
                    <span>Account: 1234567890</span>
                    <br />
                    <span>IBAN: EG123456789012345678901234</span>
                  </div>
                  <Separator className="my-3" />
                  <div>
                    <span className="font-medium">For inquiries:</span>
                    <br />
                    <span>+20 112 263 6253</span>
                    <br />
                    <span>billing@bookandgo.com</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

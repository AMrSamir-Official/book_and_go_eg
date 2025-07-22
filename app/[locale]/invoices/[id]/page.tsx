"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  downloadInvoicePDF,
  generateInvoicePDFBlob,
  shareInvoicePDF,
} from "@/lib/pdf-utils";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
// in InvoiceViewPage.tsx
// Remove old imports if any
import { useToast } from "@/hooks/use-toast";
import { sampleBookings, sampleInvoices } from "@/lib/fake-data";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  DollarSign,
  Download,
  Edit,
  FileText,
  MessageSquare,
  Printer,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function InvoiceViewPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("invoices");
  const { toast } = useToast();

  const invoice = sampleInvoices.find((i) => i.id === params.id);

  const relatedBooking = invoice
    ? sampleBookings.find((b) => b.id === invoice.bookingId) || null
    : null;

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-2xl font-bold mb-4">Invoice Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The invoice you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push("/invoices")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const [isGenerating, setIsGenerating] = useState(false); // Add this state

  // ✅ New Print Handler
  const handlePrint = () => {
    if (!invoice) return;
    // This will generate the high-quality PDF and open it in a new tab for printing.
    // It's much better than the old HTML string method.
    const blob = generateInvoicePDFBlob(invoice, relatedBooking); // We need generateInvoicePDFBlob exported or defined in a scope
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    URL.revokeObjectURL(url);
  };

  // ✅ New Download Handler
  const handleDownloadPDF = async () => {
    if (!invoice) return;
    setIsGenerating(true);
    try {
      downloadInvoicePDF(invoice, relatedBooking);
      toast({
        title: "PDF Downloaded",
        description: `Invoice ${invoice.invoiceNumber} has been downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // ✅ New WhatsApp Share Handler
  const handleWhatsApp = async () => {
    if (!invoice) return;
    setIsGenerating(true);
    try {
      const message = `🧾 INVOICE DETAILS\n📄 Invoice: ${
        invoice.invoiceNumber
      }\n💰 Amount: $${invoice.amount.toLocaleString()} ${
        invoice.currency
      }\n📅 Due: ${invoice.dueDate}`;
      await shareInvoicePDF(invoice, relatedBooking, message);
    } catch (error: any) {
      toast({
        title: "Sharing Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // ... (rest of the component logic)

  const handleMarkPaid = () => {
    toast({
      title: "Invoice Updated",
      description: "Invoice has been marked as paid.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

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
              <h1 className="text-2xl sm:text-3xl font-bold">
                Invoice Details
              </h1>
              <p className="text-muted-foreground">
                Invoice: {invoice.invoiceNumber}
              </p>
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
                    <label className="text-sm font-medium text-muted-foreground">
                      Invoice Number
                    </label>
                    <p className="text-lg font-semibold">
                      {invoice.invoiceNumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Title
                    </label>
                    <p className="text-lg">{invoice.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Amount
                    </label>
                    <p className="text-lg font-semibold flex items-center">
                      <DollarSign className="mr-1 h-4 w-4" />
                      {invoice.amount.toLocaleString()} {invoice.currency}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Due Date
                    </label>
                    <p className="text-lg flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {invoice.dueDate}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Payment Method
                    </label>
                    <p className="text-lg capitalize">
                      {invoice.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Status
                    </label>
                    <div className="mt-1">
                      <Badge
                        variant={getStatusColor(invoice.status)}
                        className="text-sm px-3 py-1"
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                {invoice.notes && (
                  <div className="mt-6">
                    <label className="text-sm font-medium text-muted-foreground">
                      Notes
                    </label>
                    <p className="text-sm mt-2 p-3 bg-muted rounded-lg">
                      {invoice.notes}
                    </p>
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
                      <label className="text-sm font-medium text-muted-foreground">
                        File Number
                      </label>
                      <p className="text-lg font-semibold">
                        {relatedBooking.fileNumber}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Supplier
                      </label>
                      <p className="text-lg">{relatedBooking.supplier}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Travel Dates
                      </label>
                      <p className="text-lg">
                        {relatedBooking.arrivalDate} -{" "}
                        {relatedBooking.departureDate}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Number of Pax
                      </label>
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
                        <TableCell>
                          Hotel Accommodation - Four Seasons Cairo
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Accommodation</Badge>
                        </TableCell>
                        <TableCell>7 nights</TableCell>
                        <TableCell>$200.00</TableCell>
                        <TableCell className="text-right font-medium">
                          $1,400.00
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Flight Tickets - EgyptAir</TableCell>
                        <TableCell>
                          <Badge variant="outline">Transportation</Badge>
                        </TableCell>
                        <TableCell>
                          {relatedBooking?.paxCount || 2} pax
                        </TableCell>
                        <TableCell>$450.00</TableCell>
                        <TableCell className="text-right font-medium">
                          $900.00
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Private Transportation</TableCell>
                        <TableCell>
                          <Badge variant="outline">Transportation</Badge>
                        </TableCell>
                        <TableCell>7 days</TableCell>
                        <TableCell>$80.00</TableCell>
                        <TableCell className="text-right font-medium">
                          $560.00
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Tour Guide Services</TableCell>
                        <TableCell>
                          <Badge variant="outline">Services</Badge>
                        </TableCell>
                        <TableCell>7 days</TableCell>
                        <TableCell>$60.00</TableCell>
                        <TableCell className="text-right font-medium">
                          $420.00
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Entrance Fees & Activities</TableCell>
                        <TableCell>
                          <Badge variant="outline">Activities</Badge>
                        </TableCell>
                        <TableCell>Various</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell className="text-right font-medium">
                          $320.00
                        </TableCell>
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
                <Badge
                  variant={getStatusColor(invoice.status)}
                  className="text-lg px-4 py-2"
                >
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
                    <span className="text-muted-foreground">
                      Payment Method:
                    </span>
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
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={handlePrint}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Invoice
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={handleDownloadPDF}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={handleWhatsApp}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send via WhatsApp
                </Button>
                {invoice.status === "pending" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={handleMarkPaid}
                  >
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
  );
}

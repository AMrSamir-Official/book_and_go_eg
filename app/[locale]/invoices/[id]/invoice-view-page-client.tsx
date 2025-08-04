"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { downloadInvoicePDF, shareInvoicePDF } from "@/lib/podf-utils/invoice";
import { Edit, Printer, Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// UPDATED InvoiceData interface
// The new, correct interface for BOTH files
interface InvoiceData {
  id: string;
  _id: string;
  invoiceNumber: string;
  title: string;
  totalInvoiceAmount: number;
  totalInvoiceCurrency: "EGP" | "USD";
  totalInvoiceExchangeRate?: number;
  paidAmount: number;
  restAmount: number;
  restAmountCurrency: "EGP" | "USD";
  restAmountExchangeRate?: number;

  extraIncoming: Array<{
    incomeType: string;
    amount: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
    status: string;
  }>;
  accommodation: Array<{
    city: string;
    name: string;
    totalAmount: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
    status: string;
  }>;
  domesticFlights: Array<{
    details: string;
    cost: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
    status: string;
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
    city: string;
    name: string;
    cost: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
    status: string;
  }>;
  transportation: Array<{
    supplierName: string;
    city: string;
    amount: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
    status: string;
  }>;

  grandTotalIncomeEGP: number;
  grandTotalExpensesEGP: number;
  restProfitEGP: number;

  fileNumber: string;
  supplierName: string;
  dueDate: string;
  paymentMethod: string;
  status: string;
}

const formatCurrency = (amount: number, currency: string = "EGP") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount || 0);
};
const convertToEGP = (amount: number, currency: string, rate?: number) => {
  if (currency?.trim().toUpperCase() === "USD" && rate && rate > 0) {
    return amount * rate;
  }
  return amount;
};
export function InvoiceViewPageClient({ invoice }: { invoice: InvoiceData }) {
  const router = useRouter();
  const handleDownload = () => {
    downloadInvoicePDF(invoice);
  };
  const handleShare = async () => {
    try {
      await shareInvoicePDF(
        invoice,
        `Details for invoice: ${invoice.invoiceNumber}`
      );
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    }
  };

  if (!invoice) {
    return <div>Invoice not found.</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Invoice: {invoice.invoiceNumber}
            </h1>
            <p className="text-muted-foreground">{invoice.title}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Printer className="mr-2 h-4 w-4" /> Download PDF
            </Button>
            <Link href={`/invoices/${invoice._id || invoice.id}/edit`}>
              <Button size="sm">
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Income Details</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-2">Main Invoice</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <Label>Total Invoice (EGP)</Label>
                    <p className="font-bold">
                      {formatCurrency(
                        convertToEGP(
                          invoice.totalInvoiceAmount,
                          invoice.totalInvoiceCurrency,
                          invoice.totalInvoiceExchangeRate
                        )
                      )}
                    </p>
                  </div>
                  <div>
                    <Label>Paid Amount (EGP)</Label>
                    <p>
                      {formatCurrency(
                        convertToEGP(
                          invoice.paidAmount,
                          invoice.totalInvoiceCurrency,
                          invoice.totalInvoiceExchangeRate
                        )
                      )}
                    </p>
                  </div>
                  <div>
                    <Label>Rest Amount (EGP)</Label>
                    <p>
                      {formatCurrency(
                        convertToEGP(
                          invoice.restAmount,
                          invoice.restAmountCurrency,
                          invoice.restAmountExchangeRate
                        )
                      )}
                    </p>
                  </div>
                </div>
                <Separator className="my-4" />
                <h3 className="font-semibold mb-2">Extra Incoming</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.extraIncoming.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.incomeType}</TableCell>
                        <TableCell>
                          {formatCurrency(
                            convertToEGP(
                              item.amount,
                              item.currency,
                              item.exchangeRate
                            )
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.status === "paid" ? "default" : "secondary"
                            }
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expenses Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {invoice.accommodation.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Accommodation</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>City</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoice.accommodation.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell>{item.city}</TableCell> {/* <-- NEW */}
                            <TableCell>{item.name}</TableCell>
                            <TableCell>
                              {formatCurrency(
                                convertToEGP(
                                  item.totalAmount,
                                  item.currency,
                                  item.exchangeRate
                                )
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  item.status === "paid"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {item.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {invoice.domesticFlights.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Domestic Flights</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Details</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoice.domesticFlights.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell>{item.details}</TableCell>
                            <TableCell>
                              {formatCurrency(
                                convertToEGP(
                                  item.cost,
                                  item.currency,
                                  item.exchangeRate
                                )
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  item.status === "paid"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {item.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {invoice.entranceTickets.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Entrance Tickets</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Site</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead>No.</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoice.entranceTickets.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell>{item.site}</TableCell>
                            <TableCell>
                              {formatCurrency(
                                convertToEGP(
                                  item.cost,
                                  item.currency,
                                  item.exchangeRate
                                )
                              )}
                            </TableCell>
                            <TableCell>{item.no}</TableCell>
                            <TableCell>
                              {formatCurrency(
                                convertToEGP(
                                  item.total,
                                  item.currency,
                                  item.exchangeRate
                                )
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {invoice.guide.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Guides</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>City</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoice.guide.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell>{item.city}</TableCell> {/* <-- NEW */}
                            <TableCell>{item.name}</TableCell>
                            <TableCell>
                              {formatCurrency(
                                convertToEGP(
                                  item.cost,
                                  item.currency,
                                  item.exchangeRate
                                )
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  item.status === "paid"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {item.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {invoice.transportation.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Transportation</h3>
                    {/* UPDATED: Simplified table for transportation */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>City</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoice.transportation.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell>{item.city}</TableCell>
                            <TableCell>{item.supplierName}</TableCell>
                            <TableCell>
                              {formatCurrency(
                                convertToEGP(
                                  item.amount,
                                  item.currency,
                                  item.exchangeRate
                                )
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  item.status === "paid"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {item.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between font-medium">
                  <Label>Grand Total Income</Label>
                  <span>{formatCurrency(invoice.grandTotalIncomeEGP)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <Label>Grand Total Expenses</Label>
                  <span>{formatCurrency(invoice.grandTotalExpensesEGP)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <Label>Rest Profit</Label>
                  <span>{formatCurrency(invoice.restProfitEGP)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File Number:</span>
                  <strong>{invoice.fileNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Supplier:</span>
                  <strong>{invoice.supplierName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <strong>{invoice.dueDate}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <strong>{invoice.paymentMethod}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant={
                      invoice.status === "paid" ? "default" : "secondary"
                    }
                  >
                    {invoice.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

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
import { Edit, Printer } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { sampleInvoices } from "./fakedata"; // Assuming your new object is here

// Helper function to format currency
const formatCurrency = (amount: number, currency: string = "EGP") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount || 0);
};

export default function InvoiceViewPage() {
  const params = useParams();
  const router = useRouter();

  // Find the invoice from the updated fake data
  const invoice = sampleInvoices.find((i) => i.id === params.id);

  if (!invoice) {
    // ... (Not Found component remains the same)
    return <div>Invoice not found.</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Invoice: {invoice.invoiceNumber}
            </h1>
            <p className="text-muted-foreground">{invoice.title}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            {/* Add other action buttons like download if needed */}
            <Link href={`/invoices/${invoice.id}/edit`}>
              <Button size="sm">
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Invoice & Extra Incoming */}
            <Card>
              <CardHeader>
                <CardTitle>Income Details</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-2">Main Invoice</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <Label>Total Invoice</Label>
                    <p className="font-bold">
                      {formatCurrency(
                        invoice.totalInvoiceAmount,
                        invoice.totalInvoiceCurrency
                      )}
                    </p>
                  </div>
                  <div>
                    <Label>Paid Amount</Label>
                    <p>
                      {formatCurrency(
                        invoice.paidAmount,
                        invoice.totalInvoiceCurrency
                      )}
                    </p>
                  </div>
                  <div>
                    <Label>Rest Amount</Label>
                    <p>
                      {formatCurrency(
                        invoice.restAmount,
                        invoice.restAmountCurrency
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
                        <TableCell>{item.type}</TableCell>
                        <TableCell>
                          {formatCurrency(item.amount, item.currency)}
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

            {/* Expenses Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Expenses Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Loop through each expense type and render a table */}
                {invoice.accommodation.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Accommodation</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoice.accommodation.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>
                              {formatCurrency(item.totalAmount, item.currency)}
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
                              {formatCurrency(item.cost, item.currency)}
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
                              {formatCurrency(item.cost, item.currency)}
                            </TableCell>
                            <TableCell>{item.no}</TableCell>
                            <TableCell>
                              {formatCurrency(item.total, item.currency)}
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
                          <TableHead>Name</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoice.guide.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>
                              {formatCurrency(item.cost, item.currency)}
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
                    {invoice.transportation.map((item, i) => (
                      <div key={i} className="border p-2 rounded-lg mb-2">
                        <p>
                          <strong>{item.supplierName}</strong> in {item.city} -{" "}
                          {formatCurrency(item.amount, item.currency)} (
                          {item.status})
                        </p>
                        <h4 className="text-sm font-semibold mt-2">
                          Guide Details:
                        </h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Guide</TableHead>
                              <TableHead>Cost</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {item.guides.map((g, gi) => (
                              <TableRow key={gi}>
                                <TableCell>{g.guideNumber}</TableCell>
                                <TableCell>
                                  {formatCurrency(g.totalCost, "EGP")}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
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

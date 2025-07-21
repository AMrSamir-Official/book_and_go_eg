"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthStore } from "@/lib/auth";
import { sampleInvoices } from "@/lib/fake-data";
import {
  CheckCircle,
  Edit,
  Eye,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Printer,
  Search,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

export default function InvoicesPage() {
  const t = useTranslations("invoices");
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInvoices = sampleInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = user?.role === "admin" || invoice.userId === user?.id;
    return matchesSearch && matchesUser;
  });

  const handleWhatsApp = (invoice: any) => {
    const message = `Invoice Details:\nInvoice: ${invoice.invoiceNumber}\nTitle: ${invoice.title}\nAmount: $${invoice.amount} ${invoice.currency}\nStatus: ${invoice.status}`;
    const url = `https://wa.me/201122636253?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
  };

  const handlePrint = (invoice: any) => {
    const printContent = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <h1>Book & Go Travel</h1>
        </div>
        <h2>Invoice Details</h2>
        <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
        <p><strong>Title:</strong> ${invoice.title}</p>
        <p><strong>Amount:</strong> $${invoice.amount} ${invoice.currency}</p>
        <p><strong>Due Date:</strong> ${invoice.dueDate}</p>
        <p><strong>Payment Method:</strong> ${invoice.paymentMethod}</p>
        <p><strong>Status:</strong> ${invoice.status}</p>
        <p><strong>Notes:</strong> ${invoice.notes}</p>
      </div>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
          <Link href="/invoices/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("newInvoice")}
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("allInvoices")}</CardTitle>
            <CardDescription>{t("manageInvoices")}</CardDescription>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchInvoices")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("invoiceNumber")}</TableHead>
                  <TableHead>{t("invoiceTitle")}</TableHead>
                  <TableHead>{t("amount")}</TableHead>
                  <TableHead>{t("dueDate")}</TableHead>
                  <TableHead>{t("paymentMethod")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>{invoice.title}</TableCell>
                    <TableCell>
                      ${invoice.amount.toLocaleString()} {invoice.currency}
                    </TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell className="capitalize">
                      {invoice.paymentMethod}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link
                              href={`/invoices/${invoice.id}`}
                              className="flex items-center"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              {t("view")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link
                              href={`/invoices/${invoice.id}/edit`}
                              className="flex items-center"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              {t("edit")}
                            </Link>
                          </DropdownMenuItem>
                          {invoice.status === "pending" && (
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              {t("markPaid")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handlePrint(invoice)}
                          >
                            <Printer className="mr-2 h-4 w-4" />
                            {t("print")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleWhatsApp(invoice)}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            {t("sendWhatsApp")}
                          </DropdownMenuItem>
                          {user?.role === "admin" && (
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("delete")}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

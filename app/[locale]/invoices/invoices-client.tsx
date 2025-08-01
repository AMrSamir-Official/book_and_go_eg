"use client";

import { deleteInvoiceAction } from "@/actions/invoiceActions"; // استيراد دالة الحذف
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Edit, Eye, MoreHorizontal, Search, Trash2 } from "lucide-react"; // تم حذف الأيقونات غير المستخدمة
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

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

export function InvoicesClientPage({
  initialInvoices,
}: {
  initialInvoices: any[];
}) {
  const t = useTranslations("invoices");
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [invoices, setInvoices] = useState(initialInvoices);
  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
  const handleDelete = async (invoiceId: string) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) {
      return;
    }

    const result = await deleteInvoiceAction(invoiceId);

    if (result.success) {
      // تحديث الواجهة فوراً بعد الحذف
      setInvoices((prevInvoices) =>
        prevInvoices.filter((inv) => inv.id !== invoiceId)
      );
      toast({ title: "Success", description: result.message });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };
  return (
    <DashboardLayout>
      <div className="space-y-6">
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
                      {/* تصحيح أسماء الحقول */}
                      {invoice.totalInvoiceAmount.toLocaleString()}{" "}
                      {invoice.totalInvoiceCurrency}
                    </TableCell>
                    {/* تنسيق التاريخ */}
                    <TableCell>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="capitalize">
                      {invoice.paymentMethod || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(invoice.status)}>
                        {invoice.status || "N/A"}
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
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/invoices/${invoice.id}`}
                              className="flex items-center w-full"
                            >
                              <Eye className="mr-2 h-4 w-4" /> {t("view")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/invoices/${invoice.id}/edit`}
                              className="flex items-center w-full"
                            >
                              <Edit className="mr-2 h-4 w-4" /> {t("edit")}
                            </Link>
                          </DropdownMenuItem>
                          {/* ربط زر الحذف بالدالة الجديدة */}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(invoice.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> {t("delete")}
                          </DropdownMenuItem>
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

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
import { sampleBookings } from "@/lib/fake-data";
import {
  Edit,
  Eye,
  FileText,
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

export default function BookingsPage() {
  const t = useTranslations("bookings");
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBookings = sampleBookings.filter((booking) => {
    const matchesSearch =
      booking.fileNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = user?.role === "admin" || booking.userId === user?.id;
    return matchesSearch && matchesUser;
  });

  const handleWhatsApp = (booking: any) => {
    const message = `Booking Details:\nFile: ${booking.fileNumber}\nSupplier: ${booking.supplier}\nPax: ${booking.paxCount}\nDates: ${booking.arrivalDate} - ${booking.departureDate}`;
    const url = `https://wa.me/201122636253?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
  };

  const handlePrint = (booking: any) => {
    // Create a print-friendly version
    const printContent = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <h1>Book & Go Travel</h1>
        </div>
        <h2>Booking Details</h2>
        <p><strong>File Number:</strong> ${booking.fileNumber}</p>
        <p><strong>Supplier:</strong> ${booking.supplier}</p>
        <p><strong>Number of Pax:</strong> ${booking.paxCount}</p>
        <p><strong>Arrival Date:</strong> ${booking.arrivalDate}</p>
        <p><strong>Departure Date:</strong> ${booking.departureDate}</p>
        <p><strong>Nationality:</strong> ${booking.nationality}</p>
        <p><strong>Status:</strong> ${booking.status}</p>
      </div>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
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
          <Link href="/bookings/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("newBooking")}
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("allBookings")}</CardTitle>
            <CardDescription>{t("manageBookings")}</CardDescription>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchBookings")}
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
                  <TableHead>{t("fileNumber")}</TableHead>
                  <TableHead>{t("supplier")}</TableHead>
                  <TableHead>{t("pax")}</TableHead>
                  <TableHead>{t("dates")}</TableHead>
                  <TableHead>{t("nationality")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.fileNumber}
                    </TableCell>
                    <TableCell>{booking.supplier}</TableCell>
                    <TableCell>{booking.paxCount}</TableCell>
                    <TableCell>
                      {booking.arrivalDate} - {booking.departureDate}
                    </TableCell>
                    <TableCell>{booking.nationality}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          booking.status === "confirmed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {booking.status}
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
                            <Eye className="mr-2 h-4 w-4" />
                            {t("view")}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link
                              href={`/bookings/${booking.id}/edit`}
                              className="flex items-center"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              {t("edit")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link
                              href={`/invoices/new?booking=${booking.id}`}
                              className="flex items-center"
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              {t("createInvoice")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePrint(booking)}
                          >
                            <Printer className="mr-2 h-4 w-4" />
                            {t("print")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleWhatsApp(booking)}
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

"use client";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
import { deleteBookingAction } from "@/actions/bookingActions"; // تأكد من صحة المسار
import { DashboardLayout } from "@/components/layout/dashboard-layout";
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
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/auth"; // Make sure this store provides the token
import {
  Calculator,
  CheckCircle,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

// Define a more specific type for the booking data coming from the API
// Define a more specific type for the booking data coming from the API
interface Booking {
  _id: string; // The ID from MongoDB
  fileNumber: string;
  vendor: string;
  paxCount: number;
  arrivalDate: string;
  departureDate: string;
  nationality: string;
  // This status is assumed, you might need to add it to your backend model
  status: "confirmed" | "pending" | string;
  createdBy: {
    id: string; // The user ID
    name: string;
    email: string;
    hasInvoice: boolean;
  };
}

export default function BookingsPage() {
  const t = useTranslations("bookings");
  const { user, token } = useAuthStore();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  console.log(bookings);
  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) {
        setIsLoading(false);
        toast({
          title: "Authentication Error",
          description: "Please log in to view bookings.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/bookings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (result.success) {
          setBookings(result.data);
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to fetch bookings.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Network Error",
          description: "Could not connect to the server.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [token, toast]);

  // This now filters the real data fetched from the server
  const filteredBookings = bookings.filter(
    (booking) =>
      (booking.fileNumber?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (booking.vendor?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const handleDelete = (bookingId: string) => {
    startTransition(async () => {
      const result = await deleteBookingAction(bookingId);
      if (result.success) {
        toast({ title: "Success", description: result.message });
        // Re-fetch data after deletion to update the list
        setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleWhatsApp = (booking: Booking) => {
    const message = `Booking Details:\nFile: ${booking.fileNumber}\nvendor: ${booking.vendor}\nPax: ${booking.paxCount}\nDates: ${booking.arrivalDate} - ${booking.departureDate}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handlePrint = (booking: Booking) => {
    const printContent = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1>Book & Go Travel</h1>
        <h2>Booking Details</h2>
        <p><strong>File Number:</strong> ${booking.fileNumber}</p>
        <p><strong>vendor:</strong> ${booking.vendor}</p>
        <p><strong>Number of Pax:</strong> ${booking.paxCount}</p>
        <p><strong>Arrival Date:</strong> ${booking.arrivalDate}</p>
        <p><strong>Departure Date:</strong> ${booking.departureDate}</p>
        <p><strong>Nationality:</strong> ${booking.nationality}</p>
      </div>
    `;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };
  console.log("filteredBookings : ", filteredBookings);
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap">
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
                  <TableHead>{t("vendor")}</TableHead>
                  <TableHead>{t("pax")}</TableHead>
                  {/* إظهار العمود للأدمن فقط */}
                  {user?.role === "admin" && <TableHead>Accounting</TableHead>}
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="font-medium">
                        {booking.fileNumber}
                      </TableCell>
                      <TableCell>{booking.vendor}</TableCell>
                      <TableCell>{booking.paxCount}</TableCell>

                      {/* عرض الحالة المحاسبية بناءً على المعلومة الجديدة */}
                      {/* إظهار الخلية للأدمن فقط */}
                      {user?.role === "admin" && (
                        <TableCell>
                          {booking.hasInvoice ? (
                            <span className="flex items-center text-green-600 font-medium">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Invoiced
                            </span>
                          ) : (
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                href={`/invoices/new?bookingId=${booking._id}`}
                              >
                                <Calculator className="mr-2 h-4 w-4" />
                                Create Invoice
                              </Link>
                            </Button>
                          )}
                        </TableCell>
                      )}

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
                                className="flex w-full"
                                href={`/bookings/${booking._id}`}
                              >
                                <Eye className="mr-2 h-4 w-4" /> {t("view")}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/bookings/edit/${booking._id}`}
                                className="flex items-center w-full"
                              >
                                <Edit className="mr-2 h-4 w-4" /> {t("edit")}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(booking._id)}
                              disabled={isPending}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {isPending ? "Deleting..." : t("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

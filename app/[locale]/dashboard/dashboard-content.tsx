"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/lib/auth";
import { Calendar, DollarSign, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo } from "react";

// تعريف أنواع البيانات التي سيستقبلها المكون
interface DashboardProps {
  invoiceStats: { totalInvoices: number; totalRevenue: number };
  bookingStats: { totalBookings: number; pendingBookings: number };
  recentInvoices: any[];
  recentBookings: any[];
}

export const DashboardContent = memo(function DashboardContent({
  invoiceStats,
  bookingStats,
  recentInvoices,
  recentBookings,
}: DashboardProps) {
  const t = useTranslations("dashboard");
  const { user } = useAuthStore(); // سنستخدم هذا لتحديد دور المستخدم

  const latestBookings = recentBookings?.slice(0, 3) || [];
  const latestInvoices = recentInvoices?.slice(0, 3) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {t("welcome")}, {user?.name}!
          </h1>
          <p className="text-muted-foreground">{t("overview")}</p>
        </div>

        {/* ==================== التعديل الأول: إظهار الإحصائيات للأدمن فقط ==================== */}
        {user?.role === "admin" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("totalBookings")}
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {bookingStats?.totalBookings || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("totalInvoices")}
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {invoiceStats?.totalInvoices || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("totalRevenue")}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  EGP {(invoiceStats?.totalRevenue || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            {/* <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("pendingBookings")}
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {bookingStats?.pendingBookings || 0}
                </div>
              </CardContent>
            </Card> */}
          </div>
        )}
        {/* ====================================================================================== */}

        {/* قائمة الحجوزات والفواتير */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("recentBookings")}</CardTitle>
              <CardDescription>{t("latestBookingActivity")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {latestBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{booking.fileNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.paxCount} pax • {booking.nationality}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ==================== التعديل الثاني: إظهار الفواتير للأدمن فقط ==================== */}
          {user?.role === "admin" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("recentInvoices")}</CardTitle>
                <CardDescription>{t("latestInvoiceActivity")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {latestInvoices.map((invoice) => (
                    <div
                      key={invoice.id || invoice._id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.totalInvoiceAmount.toLocaleString()}{" "}
                          {invoice.totalInvoiceCurrency}
                        </p>
                      </div>
                      <Badge
                        variant={
                          invoice.status === "paid" ? "default" : "secondary"
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {/* ==================================================================================== */}
        </div>
      </div>
    </DashboardLayout>
  );
});

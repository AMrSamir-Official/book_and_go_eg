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
import { sampleBookings, sampleInvoices } from "@/lib/fake-data";
import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, useMemo } from "react";

export const DashboardContent = memo(function DashboardContent() {
  const t = useTranslations("dashboard");
  const { user } = useAuthStore();

  const stats = useMemo(
    () => ({
      totalBookings: sampleBookings.length,
      totalInvoices: sampleInvoices.length,
      totalRevenue: sampleInvoices.reduce((sum, inv) => sum + inv.amount, 0),
      pendingBookings: sampleBookings.filter((b) => b.status === "pending")
        .length,
    }),
    []
  );

  const recentBookings = useMemo(() => sampleBookings.slice(0, 3), []);
  const recentInvoices = useMemo(() => sampleInvoices.slice(0, 3), []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {t("welcome")}, {user?.name}!
          </h1>
          <p className="text-muted-foreground">{t("overview")}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("totalBookings")}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                +2 {t("fromLastMonth")}
              </p>
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
              <div className="text-2xl font-bold">{stats.totalInvoices}</div>
              <p className="text-xs text-muted-foreground">
                +1 {t("fromLastMonth")}
              </p>
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
                ${stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +15% {t("fromLastMonth")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("pendingBookings")}
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingBookings}</div>
              <p className="text-xs text-muted-foreground">
                {t("needsAttention")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("recentBookings")}</CardTitle>
              <CardDescription>{t("latestBookingActivity")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{booking.fileNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.paxCount} pax • {booking.nationality}
                      </p>
                    </div>
                    <Badge
                      variant={
                        booking.status === "confirmed" ? "default" : "secondary"
                      }
                    >
                      {booking.status === "confirmed" ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("recentInvoices")}</CardTitle>
              <CardDescription>{t("latestInvoiceActivity")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        ${invoice.amount} {invoice.currency}
                      </p>
                    </div>
                    <Badge
                      variant={
                        invoice.status === "paid" ? "default" : "secondary"
                      }
                    >
                      {invoice.status === "paid" ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : invoice.status === "cancelled" ? (
                        <XCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {invoice.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
});

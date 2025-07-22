"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Edit, FileText, MessageSquare, Printer } from "lucide-react";
import Link from "next/link";
import { memo } from "react";

interface BookingSidebarProps {
  booking: any;
  onPrint: () => void;
  onWhatsApp: () => void;
}

export const BookingSidebar = memo(function BookingSidebar({
  booking,
  onPrint,
  onWhatsApp,
}: BookingSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge
            variant={booking.status === "confirmed" ? "default" : "secondary"}
            className="text-lg px-4 py-2"
          >
            {booking.status}
          </Badge>
          <Separator className="my-4" />
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span>Jan 15, 2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated:</span>
              <span>Jan 20, 2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span>7 days</span>
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
            onClick={onPrint}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Booking
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start bg-transparent"
            onClick={onWhatsApp}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Send via WhatsApp
          </Button>
          <Link href={`/invoices/new?booking=${booking.id}`} className="block">
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
            >
              <FileText className="mr-2 h-4 w-4" />
              Create accounting
            </Button>
          </Link>
          <Link href={`/bookings/${booking.id}/edit`} className="block">
            <Button className="w-full justify-start">
              <Edit className="mr-2 h-4 w-4" />
              Edit Booking
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">24/7 Hotline:</span>
              <br />
              <span>+20 112 263 6253</span>
            </div>
            <div>
              <span className="font-medium">Email:</span>
              <br />
              <span>emergency@bookandgo.com</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

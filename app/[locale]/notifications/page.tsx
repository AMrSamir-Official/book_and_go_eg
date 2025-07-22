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
import { useToast } from "@/hooks/use-toast";
import { useDuesStore } from "@/lib/store";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  MoreHorizontal,
  Search,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";

interface DueNotification {
  id: string;
  type: "due_reminder" | "overdue" | "payment_complete";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: "low" | "medium" | "high";
  dueId: string;
  amount: number;
  currency: "USD" | "EGP";
  person: string;
  dueDate: string;
}

export default function NotificationsPage() {
  const t = useTranslations("common");
  const router = useRouter();
  const { toast } = useToast();
  const { entries } = useDuesStore();
  const [searchTerm, setSearchTerm] = useState("");

  // Generate notifications from dues entries
  const generateNotifications = (): DueNotification[] => {
    const notifications: DueNotification[] = [];
    const today = new Date();

    entries.forEach((entry) => {
      const dueDate = new Date(entry.dueDate);
      const daysDiff = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Due reminder (1-3 days before due date)
      if (daysDiff >= 1 && daysDiff <= 3 && entry.status === "pending") {
        notifications.push({
          id: `reminder-${entry.id}`,
          type: "due_reminder",
          title: `Payment Due in ${daysDiff} day${daysDiff > 1 ? "s" : ""}`,
          message: `${
            entry.type === "owed_to_me" ? "Payment from" : "Payment to"
          } ${entry.person} is due on ${
            entry.dueDate
          } - ${entry.amount.toLocaleString()} ${entry.currency}`,
          timestamp: new Date(
            Date.now() - Math.random() * 24 * 60 * 60 * 1000
          ).toISOString(),
          read: Math.random() > 0.5,
          priority: daysDiff === 1 ? "high" : "medium",
          dueId: entry.id,
          amount: entry.amount,
          currency: entry.currency,
          person: entry.person,
          dueDate: entry.dueDate,
        });
      }

      // Overdue notifications
      if (daysDiff < 0 && entry.status === "pending") {
        notifications.push({
          id: `overdue-${entry.id}`,
          type: "overdue",
          title: `Payment Overdue`,
          message: `${
            entry.type === "owed_to_me" ? "Payment from" : "Payment to"
          } ${entry.person} was due on ${
            entry.dueDate
          } - ${entry.amount.toLocaleString()} ${entry.currency}`,
          timestamp: new Date(
            Date.now() - Math.random() * 24 * 60 * 60 * 1000
          ).toISOString(),
          read: Math.random() > 0.3,
          priority: "high",
          dueId: entry.id,
          amount: entry.amount,
          currency: entry.currency,
          person: entry.person,
          dueDate: entry.dueDate,
        });
      }

      // Payment complete notifications
      if (entry.status === "paid") {
        notifications.push({
          id: `complete-${entry.id}`,
          type: "payment_complete",
          title: `Payment Completed`,
          message: `${
            entry.type === "owed_to_me" ? "Payment from" : "Payment to"
          } ${
            entry.person
          } has been marked as paid - ${entry.amount.toLocaleString()} ${
            entry.currency
          }`,
          timestamp: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          read: Math.random() > 0.7,
          priority: "low",
          dueId: entry.id,
          amount: entry.amount,
          currency: entry.currency,
          person: entry.person,
          dueDate: entry.dueDate,
        });
      }
    });

    return notifications.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const notifications = generateNotifications();

  const filteredNotifications = notifications;

  const handleNotificationClick = (notification: DueNotification) => {
    // Navigate to dues page and highlight the specific entry
    router.push(`/dues?highlight=${notification.dueId}`);
  };

  const handleMarkAsRead = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    // In a real app, this would update the notification state
    toast({
      title: "Notification marked as read",
      description: "The notification has been marked as read.",
    });
  };

  const handleDelete = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    // In a real app, this would delete the notification
    toast({
      title: "Notification deleted",
      description: "The notification has been removed.",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "due_reminder":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "overdue":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "payment_complete":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <DollarSign className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  const markAllAsRead = () => {
    toast({
      title: "All notifications marked as read",
      description: "All notifications have been marked as read.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
              <Bell className="mr-3 h-8 w-8" />
              Notifications
            </h1>
            <p className="text-muted-foreground">
              Stay updated with your payment due dates and reminders
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Payment Notifications</CardTitle>
                <CardDescription>
                  Manage your payment due dates and reminders
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full sm:w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No notifications found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "You're all caught up!"}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !notification.read
                        ? "border-l-4 border-l-primary bg-muted/30"
                        : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4 overflow-hidden">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4
                                className={`font-semibold ${
                                  !notification.read ? "text-primary" : ""
                                }`}
                              >
                                {notification.title}
                              </h4>
                              <Badge
                                variant={getPriorityColor(
                                  notification.priority
                                )}
                                className="text-xs"
                              >
                                {notification.priority}
                              </Badge>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="mr-1 h-3 w-3" />
                              {formatTimestamp(notification.timestamp)}
                              <Badge variant="outline" className="ml-2 text-xs">
                                {notification.type.replace("_", " ")}
                              </Badge>
                              <div className="ml-2 flex items-center">
                                <DollarSign className="mr-1 h-3 w-3" />
                                {notification.amount.toLocaleString()}{" "}
                                {notification.currency}
                              </div>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(notification);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Due Entry
                            </DropdownMenuItem>
                            {!notification.read && (
                              <DropdownMenuItem
                                onClick={(e) =>
                                  handleMarkAsRead(notification.id, e)
                                }
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Read
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => handleDelete(notification.id, e)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

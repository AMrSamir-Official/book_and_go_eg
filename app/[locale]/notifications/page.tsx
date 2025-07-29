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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/auth";
import { createApiClient } from "@/lib/axios";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  MoreHorizontal,
  Search,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

// 1. واجهة جديدة تطابق بيانات الـ API
interface ApiNotification {
  _id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  dueId: {
    _id: string;
    name: string;
    amount: number;
    currency: "USD" | "EGP";
  };
}

// واجهة للبيانات بعد تحليلها للعرض
interface DisplayNotification extends ApiNotification {
  type: "due_reminder" | "overdue";
  priority: "medium" | "high";
}

const apiClient = createApiClient();

export default function NotificationsPage() {
  const t = useTranslations("common");
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuthStore();

  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 2. دالة لجلب الإشعارات من الـ API
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/notifications");
      setNotifications(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch notifications.");
      toast({
        title: "Error",
        description: "Could not fetch notifications from the server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // 3. useEffect لجلب البيانات بعد التحقق من المستخدم
  useEffect(() => {
    if (isAuthLoading) return;
    if (user?.role === "admin") {
      fetchNotifications();
    } else {
      setIsLoading(false);
    }
  }, [isAuthLoading, user, fetchNotifications]);

  // 4. دوال للتعامل مع الـ API
  const handleMarkAsRead = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await apiClient.post(`/notifications/${id}/read`);
      toast({ title: "Success", description: "Notification marked as read." });
      fetchNotifications(); // إعادة تحميل القائمة
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not mark notification as read.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await apiClient.delete(`/notifications/${id}`);
      toast({ title: "Success", description: "Notification deleted." });
      fetchNotifications(); // إعادة تحميل القائمة
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not delete notification.",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.post("/notifications/read-all");
      toast({
        title: "Success",
        description: "All notifications marked as read.",
      });
      fetchNotifications();
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not mark all notifications as read.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationClick = (notification: ApiNotification) => {
    router.push(`/dues?highlight=${notification.dueId._id}`);
  };

  // 5. دوال مساعدة لتحليل نوع الإشعار بناءً على الرسالة
  const parseNotificationType = (
    message: string
  ): "due_reminder" | "overdue" => {
    if (message.toLowerCase().includes("overdue")) return "overdue";
    return "due_reminder"; // الافتراضي
  };

  const getNotificationIcon = (type: "due_reminder" | "overdue") => {
    if (type === "overdue")
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    return <Calendar className="h-5 w-5 text-blue-500" />;
  };

  const getPriorityColor = (priority: "medium" | "high") =>
    priority === "high" ? "destructive" : "secondary";

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  // 6. استخدام useMemo لتحليل وفلترة الإشعارات
  const filteredNotifications: DisplayNotification[] = useMemo(() => {
    return notifications
      .map((n) => ({
        ...n,
        type: parseNotificationType(n.message),
        priority:
          parseNotificationType(n.message) === "overdue" ? "high" : "medium",
      }))
      .filter(
        (n) =>
          n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.dueId.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [notifications, searchTerm]);

  // 7. شاشات التحميل والتحقق من المستخدم
  if (isAuthLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">You do not have permission.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex-wrap flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
              <Bell className="mr-3 h-8 w-8" /> Notifications
            </h1>
            <p className="text-muted-foreground">
              Stay updated with your payment due dates and reminders
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <div className="flex-wrap flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                <Button variant="outline" onClick={markAllAsRead}>
                  Mark All as Read
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))
              ) : error ? (
                <div className="text-center py-12 text-destructive">
                  {error}
                </div>
              ) : filteredNotifications.length === 0 ? (
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
                    key={notification._id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !notification.isRead
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
                                  !notification.isRead ? "text-primary" : ""
                                }`}
                              >
                                {notification.dueId.name}
                              </h4>
                              <Badge
                                variant={getPriorityColor(
                                  notification.priority
                                )}
                                className="text-xs"
                              >
                                {notification.priority}
                              </Badge>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="mr-1 h-3 w-3" />
                              {formatTimestamp(notification.createdAt)}
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
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
                              <Eye className="mr-2 h-4 w-4" /> View Due Entry
                            </DropdownMenuItem>
                            {!notification.isRead && (
                              <DropdownMenuItem
                                onClick={(e) =>
                                  handleMarkAsRead(notification._id, e)
                                }
                              >
                                <CheckCircle className="mr-2 h-4 w-4" /> Mark as
                                Read
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => handleDelete(notification._id, e)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
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

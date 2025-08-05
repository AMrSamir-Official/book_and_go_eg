"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/auth";
import { createApiClient } from "@/lib/axios";
import {
  AlertCircle,
  Bell,
  CheckCircle,
  Eye,
  FileText,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// 1. واجهة API مرنة تقبل كلا النوعين
interface ApiNotification {
  _id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  dueId?: { _id: string; name: string };
  invoiceId?: { _id: string; fileNumber: string }; // نفترض أن الـ API يرجع كائن
  invoiceItemId?: string;
}

const apiClient = createApiClient();

export function HeaderNotifications() {
  const t = useTranslations("notifications");
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 2. تحديث دالة جلب البيانات لتشمل populate لكلا النوعين
  const fetchData = useCallback(async () => {
    // لا نغير حالة التحميل في التحديثات الدورية
    try {
      const [notifResponse, countResponse] = await Promise.all([
        apiClient.get("/notifications?limit=10&populate=dueId,invoiceId"),
        apiClient.get("/notifications/unread-count"),
      ]);
      setNotifications(notifResponse.data.data || []);
      setUnreadCount(countResponse.data.data.count || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false); // يتم إيقاف التحميل بعد أول جلب فقط
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchData, user]);

  // 3. تحليل ذكي لنوع الإشعار، الأيقونة، والعنوان
  const getNotificationDetails = (notification: ApiNotification) => {
    let type: "due" | "invoice" | "overdue" = "due";
    let title = "Notification";
    let icon = <Bell className="h-4 w-4 text-blue-500" />;
    let targetUrl = "/notifications";

    if (notification.message.toLowerCase().includes("overdue")) {
      type = "overdue";
      icon = <AlertCircle className="h-4 w-4 text-red-500" />;
    }

    if (notification.dueId) {
      type = "due";
      title = notification.dueId.name;
      icon = <AlertCircle className="h-4 w-4 text-orange-500" />;
      targetUrl = `/dues?highlight=${notification.dueId._id}`;
    } else if (notification.invoiceId) {
      type = "invoice";
      const match = notification.message.match(/لبند "([^"]+)"/);
      title = match
        ? match[1]
        : `Invoice #${notification.invoiceId.fileNumber}`;
      icon = <FileText className="h-4 w-4 text-green-500" />;
      targetUrl = `/invoices/${notification.invoiceId}`;
      console.log("notification", notification);
    }

    return { type, title, icon, targetUrl };
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  // 4. دالة توجيه ذكية عند النقر
  const handleNotificationClick = async (
    notification: ApiNotification,
    targetUrl: string
  ) => {
    setIsOpen(false);
    if (!notification.isRead) {
      try {
        await apiClient.post(`/notifications/${notification._id}/read`);
        fetchData();
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    }
    router.push(targetUrl);
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.post("/notifications/read-all");
      toast({
        title: "Success",
        description: "All notifications marked as read.",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not mark all as read.",
        variant: "destructive",
      });
    }
  };

  if (user?.role !== "admin") {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel className="p-0">Reminders</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs"
            >
              <CheckCircle className="mr-1 h-3 w-3" /> Mark All Read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No new notifications</p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            {notifications.map((notification) => {
              const { title, icon, targetUrl } =
                getNotificationDetails(notification);
              return (
                <DropdownMenuItem
                  key={notification._id}
                  className={`flex items-start space-x-3 p-3 cursor-pointer ${
                    !notification.isRead ? "bg-muted/30" : ""
                  }`}
                  onClick={() =>
                    handleNotificationClick(notification, targetUrl)
                  }
                >
                  <div className="flex-shrink-0 mt-0.5">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-medium truncate ${
                          !notification.isRead ? "text-primary" : ""
                        }`}
                      >
                        {title}
                      </p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </ScrollArea>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-center justify-center"
          onClick={() => {
            setIsOpen(false);
            router.push("/notifications");
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          View All Notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

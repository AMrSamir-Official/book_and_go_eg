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
import { createApiClient } from "@/lib/axios";
import { AlertCircle, Bell, CheckCircle, Eye, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// واجهة تطابق البيانات القادمة من الـ API
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

const apiClient = createApiClient();

export function HeaderNotifications() {
  const t = useTranslations("notifications");
  const router = useRouter();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // دالة لجلب البيانات من الخادم
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [notifResponse, countResponse] = await Promise.all([
        apiClient.get("/notifications?limit=10"), // جلب آخر 10 إشعارات
        apiClient.get("/notifications/unread-count"),
      ]);
      setNotifications(notifResponse.data.data || []);
      setUnreadCount(countResponse.data.data.count || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      // يمكنك إظهار Toast هنا إذا أردت
    } finally {
      setIsLoading(false);
    }
  }, []);

  // جلب البيانات عند تحميل المكون وإعداد تحديث تلقائي
  useEffect(() => {
    fetchData(); // جلب البيانات عند التحميل لأول مرة
    const interval = setInterval(fetchData, 30000); // تحديث كل 30 ثانية
    return () => clearInterval(interval); // تنظيف المؤقت عند إغلاق المكون
  }, [fetchData]);

  // تحليل نوع الإشعار بناءً على الرسالة
  const getNotificationType = (message: string) => {
    if (message.toLowerCase().includes("overdue")) return "overdue";
    return "payment_due";
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment_due":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  // دالة للضغط على إشعار معين
  const handleNotificationClick = async (notification: ApiNotification) => {
    setIsOpen(false);
    // إذا لم يكن مقروءًا، قم بتحديثه
    if (!notification.isRead) {
      try {
        await apiClient.post(`/notifications/${notification._id}/read`);
        fetchData(); // أعد جلب البيانات لتحديث الحالة
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    }
    router.push(`/dues?highlight=${notification.dueId._id}`);
  };

  // دالة لتحديد الكل كمقروء
  const markAllAsRead = async () => {
    try {
      await apiClient.post("/notifications/read-all");
      toast({
        title: "Success",
        description: "All notifications marked as read.",
      });
      fetchData(); // أعد جلب البيانات
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not mark all as read.",
        variant: "destructive",
      });
    }
  };

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
          <DropdownMenuLabel className="p-0">
            Due Notifications
          </DropdownMenuLabel>
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
              const type = getNotificationType(notification.message);
              return (
                <DropdownMenuItem
                  key={notification._id}
                  className={`flex items-start space-x-3 p-3 cursor-pointer ${
                    !notification.isRead ? "bg-muted/30" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-medium truncate ${
                          !notification.isRead ? "text-primary" : ""
                        }`}
                      >
                        {notification.dueId.name}
                      </p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        {formatTime(notification.createdAt)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {notification.dueId.amount.toLocaleString()}{" "}
                        {notification.dueId.currency}
                      </Badge>
                    </div>
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

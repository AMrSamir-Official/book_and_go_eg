"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, DollarSign, AlertCircle, CheckCircle, Eye } from "lucide-react"

interface DueNotification {
  id: string
  type: "payment_due" | "payment_complete" | "overdue"
  title: string
  message: string
  time: string
  isNew: boolean
  amount?: number
  person?: string
  dueDate?: string
}

export function HeaderNotifications() {
  const t = useTranslations("notifications")
  const router = useRouter()
  const [notifications, setNotifications] = useState<DueNotification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Simulate loading notifications related to dues only
  useEffect(() => {
    const mockNotifications: DueNotification[] = [
      {
        id: "1",
        type: "payment_due",
        title: "Payment Due Tomorrow",
        message: "Payment of $500 from Ahmed Hassan is due tomorrow",
        time: "2 hours ago",
        isNew: true,
        amount: 500,
        person: "Ahmed Hassan",
        dueDate: "2024-01-25",
      },
      {
        id: "2",
        type: "overdue",
        title: "Payment Overdue",
        message: "Payment of $1200 from Sarah Johnson is overdue",
        time: "1 day ago",
        isNew: true,
        amount: 1200,
        person: "Sarah Johnson",
        dueDate: "2024-01-22",
      },
      {
        id: "3",
        type: "payment_complete",
        title: "Payment Marked Complete",
        message: "Hotel payment of $800 has been marked as complete",
        time: "2 days ago",
        isNew: false,
        amount: 800,
        person: "Four Seasons Hotel",
      },
    ]
    setNotifications(mockNotifications)
  }, [])

  const unreadCount = notifications.filter((n) => n.isNew).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment_due":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "payment_complete":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <DollarSign className="h-4 w-4 text-blue-500" />
    }
  }

  const handleNotificationClick = (notification: DueNotification) => {
    // Mark as read
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, isNew: false } : n)))
    setIsOpen(false)
    // Navigate to dues page
    router.push("/dues")
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isNew: false })))
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
          <DropdownMenuLabel className="p-0">Due Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-1 text-xs">
              <CheckCircle className="mr-1 h-3 w-3" />
              Mark All Read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No due notifications</p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start space-x-3 p-3 cursor-pointer ${notification.isNew ? "bg-muted/30" : ""}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium truncate ${notification.isNew ? "text-primary" : ""}`}>
                      {notification.title}
                    </p>
                    {notification.isNew && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                    {notification.amount && (
                      <Badge variant="outline" className="text-xs">
                        ${notification.amount.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-center justify-center"
          onClick={() => {
            setIsOpen(false)
            router.push("/dues")
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          View All Dues
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

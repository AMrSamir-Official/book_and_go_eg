"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/lib/auth";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText,
  LayoutDashboard,
  Plane,
  Settings,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const navigation = [
  {
    name: "dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "user"],
  },
  {
    name: "bookings",
    href: "/bookings",
    icon: Calendar,
    roles: ["admin", "user"],
  },
  {
    name: "accounting",
    href: "/invoices",
    icon: FileText,
    roles: ["admin"],
  },
  {
    name: "notifications",
    href: "/notifications",
    icon: Bell,
    roles: ["admin"],
  },
  {
    name: "users",
    href: "/admin/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    name: "dues",
    href: "/dues",
    roles: ["admin"],
    icon: DollarSign,
  },
  {
    name: "pending financials",
    href: "/admin/pending-financials",
    roles: ["admin"],
    icon: DollarSign,
  },
  // {
  //   name: "dues",
  //   href: "/dues",
  //   icon: DollarSign,
  //   roles: ["admin"],
  // },
  // {
  //   name: "emails",
  //   href: "/admin/emails",
  //   icon: Mail,
  //   roles: ["admin"],
  // },
  {
    name: "settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["admin"],
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const { user } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || "user")
  );

  if (!mounted) {
    return (
      <div className={cn("flex flex-col border-r bg-card w-64", className)}>
        <div className="h-16 border-b" />
        <div className="flex-1" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-card transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!sidebarCollapsed && (
          <div className="flex items-center space-x-2">
            <Plane className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Book & Go</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 shrink-0"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start transition-all duration-200",
                    sidebarCollapsed ? "px-2" : "px-3"
                  )}
                  title={sidebarCollapsed ? t(item.name) : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="ml-2 truncate">{t(item.name)}</span>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}

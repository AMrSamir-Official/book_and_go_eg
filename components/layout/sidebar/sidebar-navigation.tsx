"use client";

import Loading from "@/app/[locale]/admin/loading";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/lib/auth";
import {
  Bell,
  Calculator,
  Calendar,
  DollarSign,
  // FileText,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "../sidebar";

const navigationItems = [
  {
    title: "dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "bookings",
    href: "/bookings",
    icon: Calendar,
  },
  {
    title: "accounting",
    href: "/invoices",
    icon: Calculator,
    // icon: FileText,
  },
  // {
  //   title: "accounting",
  //   href: "/admin/accounting",
  //   icon: Calculator,
  // },
  {
    title: "dues",
    href: "/dues",
    icon: DollarSign,
  },
  {
    title: "notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    title: "settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function SidebarNavigation() {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const { user, isLoading } = useAuthStore();
  if (isLoading) {
    <Loading />;
  }
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigation.map((item) => {
            const isActive = pathname.includes(item.href);

            // Only show items for admin users (you can adjust this logic if needed)
            if (user?.role && item.roles.includes(user.role)) {
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{t(item.name)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            return null;
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

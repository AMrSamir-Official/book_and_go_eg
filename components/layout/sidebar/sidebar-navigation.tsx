"use client"

import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Calendar, FileText, Bell, Settings, Calculator, DollarSign } from "lucide-react"

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
    title: "invoices",
    href: "/invoices",
    icon: FileText,
  },
  {
    title: "accounting",
    href: "/admin/accounting",
    icon: Calculator,
  },
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
    href: "/settings",
    icon: Settings,
  },
]

export function SidebarNavigation() {
  const t = useTranslations("navigation")
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigationItems.map((item) => {
            const isActive = pathname.includes(item.href)
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{t(item.title)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

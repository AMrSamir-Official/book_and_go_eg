"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"
import { SidebarHeader } from "./sidebar-header"
import { SidebarNavigation } from "./sidebar-navigation"

interface SidebarProps {
  className?: string
}

export const Sidebar = memo(function Sidebar({ className }: SidebarProps) {
  const { sidebarCollapsed, isHydrated } = useAppStore()

  // Prevent layout shift during hydration
  if (!isHydrated) {
    return (
      <div className={cn("flex flex-col border-r bg-card w-64 transition-all duration-300", className)}>
        <div className="h-16 border-b" />
        <div className="flex-1" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-card transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <SidebarHeader collapsed={sidebarCollapsed} />
      <SidebarNavigation collapsed={sidebarCollapsed} />
    </div>
  )
})

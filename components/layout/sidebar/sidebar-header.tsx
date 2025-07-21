"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { Plane, ChevronLeft, ChevronRight } from "lucide-react"

interface SidebarHeaderProps {
  collapsed: boolean
}

export const SidebarHeader = memo(function SidebarHeader({ collapsed }: SidebarHeaderProps) {
  const { toggleSidebar } = useAppStore()

  return (
    <div className="flex h-16 items-center justify-between px-4 border-b">
      {!collapsed && (
        <div className="flex items-center space-x-2">
          <Plane className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Book & Go</span>
        </div>
      )}
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 shrink-0">
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </div>
  )
})

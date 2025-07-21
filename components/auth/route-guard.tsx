"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import { Loader2 } from "lucide-react"

interface RouteGuardProps {
  children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, canAccessRoute, isLoading, setLoading } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true)

      // Check for auth cookie (for SSR compatibility)
      const hasAuthCookie = document.cookie.includes("auth-token=authenticated")

      // Remove locale from pathname for route checking
      const routePath = pathname.replace(/^\/[a-z]{2}/, "") || "/"

      // Public routes that don't require authentication
      const publicRoutes = ["/login", "/"]
      const isPublicRoute = publicRoutes.includes(routePath)

      // If not authenticated and trying to access protected route
      if (!isAuthenticated && !hasAuthCookie && !isPublicRoute) {
        router.push("/login")
        setLoading(false)
        setIsChecking(false)
        return
      }

      // If authenticated but can't access specific route
      if ((isAuthenticated || hasAuthCookie) && !canAccessRoute(routePath)) {
        router.push("/dashboard")
        setLoading(false)
        setIsChecking(false)
        return
      }

      // If authenticated and trying to access login page
      if ((isAuthenticated || hasAuthCookie) && routePath === "/login") {
        router.push("/dashboard")
        setLoading(false)
        setIsChecking(false)
        return
      }

      setLoading(false)
      setIsChecking(false)
    }

    checkAuth()
  }, [isAuthenticated, canAccessRoute, pathname, router, setLoading])

  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

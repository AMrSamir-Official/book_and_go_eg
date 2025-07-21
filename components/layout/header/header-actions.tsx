"use client"

import { memo } from "react"
import { Moon, Sun, Globe, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslations, useLocale } from "next-intl"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAppStore } from "@/lib/store"

export const HeaderActions = memo(function HeaderActions() {
  const { theme, setTheme } = useTheme()
  const t = useTranslations("common")
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { setLocale } = useAppStore()

  const handleLocaleChange = (newLocale: string) => {
    // Update store locale only - completely independent of theme
    setLocale(newLocale as "en" | "ar")

    // Navigate to new locale path while preserving current route
    const segments = pathname.split("/")
    segments[1] = newLocale // Replace locale segment
    const newPath = segments.join("/")

    // Use replace to avoid adding to history
    router.replace(newPath)
  }

  const handleThemeChange = (newTheme: string) => {
    // Theme change is completely independent of locale
    setTheme(newTheme)
  }

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />
      case "dark":
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <>
      {/* Theme Toggle - Independent of language */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            {getThemeIcon()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleThemeChange("light")}>
            <Sun className="mr-2 h-4 w-4" />
            {t("light")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
            <Moon className="mr-2 h-4 w-4" />
            {t("dark")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange("system")}>
            <Monitor className="mr-2 h-4 w-4" />
            {t("system")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Language Toggle - Independent of theme */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Globe className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleLocaleChange("en")}>
            <span className="mr-2">🇺🇸</span>
            English
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLocaleChange("ar")}>
            <span className="mr-2">🇪🇬</span>
            العربية
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
})

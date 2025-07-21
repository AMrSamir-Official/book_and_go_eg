"use client";

import { useAuthStore } from "@/lib/auth";
import { useTranslations } from "next-intl";
import { memo } from "react";
import { HeaderActions } from "./header-actions";
import { HeaderNotifications } from "./header-notifications";
import { HeaderUserMenu } from "./header-user-menu";

export const Header = memo(function Header() {
  const t = useTranslations("common");
  const { user } = useAuthStore();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      {/* <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold">{t("dashboard")}</h1>
      </div> */}

      <div className="flex items-center space-x-4  justify-around w-full">
        <HeaderNotifications />
        <HeaderActions />
        <HeaderUserMenu />
      </div>
    </header>
  );
});

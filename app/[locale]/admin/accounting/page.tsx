import type { Metadata } from "next"
import { AccountingPageClient } from "./accounting-page-client"

export const metadata: Metadata = {
  title: "Accounting Dashboard - Book & Go Travel",
  description: "Comprehensive accounting and financial management",
}

export default function AccountingPage() {
  return <AccountingPageClient />
}

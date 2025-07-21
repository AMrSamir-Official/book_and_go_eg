import type { Metadata } from "next"
import { DashboardContentClient } from "./dashboard-content-client"

export const metadata: Metadata = {
  title: "Dashboard - Book & Go Travel",
  description: "Travel management dashboard overview",
}

// SSG - Static page with dynamic content loaded client-side
export default function DashboardPage() {
  return <DashboardContentClient />
}

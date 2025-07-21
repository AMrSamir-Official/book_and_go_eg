import type { Metadata } from "next"
import { DuesPageClient } from "./dues-page-client"

export const metadata: Metadata = {
  title: "Dues & Settlements - Book & Go Travel",
  description: "Track money owed to you and money you owe",
}

export default function DuesPage() {
  return <DuesPageClient />
}

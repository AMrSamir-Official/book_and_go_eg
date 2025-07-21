import type { Metadata } from "next"
import { AccountingPrintView } from "./accounting-print-view"

export const metadata: Metadata = {
  title: "Print Accounting - Book & Go Travel",
  description: "Print accounting report",
}

export default function AccountingPrintPage({ params }: { params: { id: string } }) {
  return <AccountingPrintView accountingId={params.id} />
}

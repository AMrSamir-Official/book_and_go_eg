import { getPendingInvoiceItemsAction } from "@/actions/invoiceActions";
import { PendingItemsClientPage } from "./client"; // سننشئ هذا الملف تالياً

export default async function PendingItemsPage() {
  const result = await getPendingInvoiceItemsAction();

  if (!result.success) {
    return (
      <div className="p-8 text-center text-destructive">
        Error: {result.message}
      </div>
    );
  }

  return <PendingItemsClientPage initialItems={result.data} />;
}

import { getAllDuesAction } from "@/actions/duesActions"; // Import the action
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import { DuesPageClient } from "./dues-page-client";

export const metadata: Metadata = {
  title: "Dues & Settlements - Book & Go Travel",
  description: "Track money owed to you and money you owe",
};

// Convert this to an async function
export default async function DuesPage() {
  const result = await getAllDuesAction();

  // Handle server-side errors
  if (!result.success) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold">Error Fetching Data</h2>
          <p className="text-muted-foreground">{result.message}</p>
        </div>
      </DashboardLayout>
    );
  }

  // Pass initial data to the client component
  return <DuesPageClient initialDues={result.data} />;
}

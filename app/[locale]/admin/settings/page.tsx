import { fetchData } from "@/actions/settingsActions";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsClientUI } from "./SettingsClientUI";

// This is a React Server Component (RSC)
export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  // Determine the active tab from the URL, default to 'cities'
  const activeTab = searchParams?.tab || "cities";

  // Fetch initial data for the current tab and the cities list in parallel
  const [initialResult, citiesResult] = await Promise.all([
    fetchData(activeTab as any),
    fetchData("cities" as any),
  ]);

  // If there's an error (e.g., user not authorized), display an error message
  if (initialResult.error || citiesResult.error) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">
                Access Denied or Server Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                You do not have permission to view this page, or the server
                could not be reached.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Error: {initialResult.error || citiesResult.error}
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Pass the server-fetched data as props to the Client Component
  return (
    <SettingsClientUI
      initialData={initialResult.data}
      citiesList={citiesResult.data}
      activeTab={activeTab}
    />
  );
}

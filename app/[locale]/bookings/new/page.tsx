// المسار: /app/[locale]/bookings/new/page.tsx

import { fetchAllBookingFormData } from "@/actions/settingsActions";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewBookingPageClient } from "./NewBookingPageClient";

// هذا الـ interface يصف شكل بيانات النموذج
export interface BookingFormData {
  fileNumber: string;
  vendor: string;
  paxCount: number;
  arrivalDate: string;
  departureDate: string;
  nationality: string;
  arrivalFlight: { airlineName: string };
  departureFlight: { airlineName: string };
  domesticFlights: Array<{ airlineName: string; departure: string }>;
  hotels: Array<{ city: string; name: string }>;
  nileCruise: { name: string };
  cairoTransfer: { vanType: string };
  aswanLuxorTransfer: { vanType: string };
  guides: Array<{ city: string; guideName: string }>;
}

export default async function NewBookingPage() {
  const result = await fetchAllBookingFormData();

  if (result.error) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">
                Error Loading Page Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Could not load data. Please check the server or try again later.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Error: {result.error}
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // تمرير البيانات إلى واجهة المستخدم
  return <NewBookingPageClient initialData={result.data} />;
}

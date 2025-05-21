import { MainNav } from "@/components/layout/main-nav";
import { TripDetails } from "@/components/trips/trip-details";
import { ProtectedRoute } from "@/components/auth/protected-route";

type TripDetailsPageProps = {
  params: {
    tripId: string;
  };
};

export default function TripDetailsPage({ params }: TripDetailsPageProps) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 container max-w-7xl mx-auto py-10">
          <TripDetails tripId={params.tripId} />
        </main>
      </div>
    </ProtectedRoute>
  );
}
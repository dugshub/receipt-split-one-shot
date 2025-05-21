import { MainNav } from "@/components/layout/main-nav";
import { CreateTripForm } from "@/components/trips/create-trip-form";
import { ProtectedRoute } from "@/components/auth/protected-route";

export const metadata = {
  title: "Create Trip - SplitReceipt",
  description: "Create a new trip to track shared expenses",
};

export default function CreateTripPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 container max-w-7xl mx-auto py-10">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-8 text-center">
              Create a New Trip
            </h1>
            <CreateTripForm />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
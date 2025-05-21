import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/layout/main-nav";
import { TripList } from "@/components/dashboard/trip-list";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 container max-w-7xl mx-auto py-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your trips and track expenses
              </p>
            </div>
            <Link href="/create-trip">
              <Button>Create Trip</Button>
            </Link>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Active Trips</h2>
              <TripList isSettled={false} />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Settled Trips</h2>
              <TripList isSettled={true} />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
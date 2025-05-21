import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/layout/main-nav";
import { SettlementForm } from "@/components/trips/settlement-form";
import { ProtectedRoute } from "@/components/auth/protected-route";

type SettlementPageProps = {
  params: {
    tripId: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function SettlementPage({ params, searchParams }: SettlementPageProps) {
  // Check if we have suggested settlement data in the URL
  const fromId = typeof searchParams?.from === 'string' ? searchParams.from : undefined;
  const toId = typeof searchParams?.to === 'string' ? searchParams.to : undefined;
  const amount = typeof searchParams?.amount === 'string' ? parseFloat(searchParams.amount) : undefined;

  // Create suggested settlements array if we have data
  const suggestedSettlements = (fromId && toId && amount) 
    ? [{ from: fromId, to: toId, amount }] 
    : [];

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 container max-w-7xl mx-auto py-10">
          <div className="mb-6">
            <Link href={`/trips/${params.tripId}`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft size={16} />
                <span>Back to Trip</span>
              </Button>
            </Link>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-8">
              Record Settlement
            </h1>
            <SettlementForm
              tripId={params.tripId}
              suggestedSettlements={suggestedSettlements}
            />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
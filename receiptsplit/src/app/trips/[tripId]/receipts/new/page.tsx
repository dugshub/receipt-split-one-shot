import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/layout/main-nav";
import { CreateReceiptForm } from "@/components/receipts/create-receipt-form";
import { ProtectedRoute } from "@/components/auth/protected-route";

type NewReceiptPageProps = {
  params: {
    tripId: string;
  };
};

export default function NewReceiptPage({ params }: NewReceiptPageProps) {
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
              Add New Receipt
            </h1>
            <CreateReceiptForm tripId={params.tripId} />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
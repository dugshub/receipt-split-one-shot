import { MainNav } from "@/components/layout/main-nav";
import { ReceiptDetails } from "@/components/receipts/receipt-details";
import { ProtectedRoute } from "@/components/auth/protected-route";

type ReceiptDetailsPageProps = {
  params: {
    tripId: string;
    receiptId: string;
  };
};

export default function ReceiptDetailsPage({ params }: ReceiptDetailsPageProps) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 container max-w-7xl mx-auto py-10">
          <ReceiptDetails 
            tripId={params.tripId} 
            receiptId={params.receiptId} 
          />
        </main>
      </div>
    </ProtectedRoute>
  );
}
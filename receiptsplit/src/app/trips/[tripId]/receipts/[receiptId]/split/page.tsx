import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/layout/main-nav";
import { ReceiptSplitForm } from "@/components/receipts/receipt-split-form";
import { ProtectedRoute } from "@/components/auth/protected-route";

type ReceiptSplitPageProps = {
  params: {
    tripId: string;
    receiptId: string;
  };
};

export default function ReceiptSplitPage({ params }: ReceiptSplitPageProps) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 container max-w-7xl mx-auto py-10">
          <div className="mb-6">
            <Link href={`/trips/${params.tripId}/receipts/${params.receiptId}`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft size={16} />
                <span>Back to Receipt</span>
              </Button>
            </Link>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-8">
              Split Receipt
            </h1>
            <ReceiptSplitForm
              tripId={params.tripId}
              receiptId={params.receiptId}
            />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
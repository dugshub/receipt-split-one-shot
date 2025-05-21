"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Edit, Receipt as ReceiptIcon, User } from "lucide-react";
import { receiptsApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

type ReceiptDetailsProps = {
  receiptId: string;
  tripId: string;
};

export function ReceiptDetails({ receiptId, tripId }: ReceiptDetailsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [receipt, setReceipt] = useState<any>(null);
  const [payer, setPayer] = useState<any>(null);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const fetchReceiptDetails = async () => {
      try {
        setIsLoading(true);
        
        // Fetch receipt details
        const receiptData = await receiptsApi.getReceipt(receiptId);
        setReceipt(receiptData);
        
        // Check if current user can edit (is the payer)
        setCanEdit(receiptData.payer_id === user?.id);
        
        // Get payer info (simplified - in a real app would fetch from users API)
        setPayer({
          id: receiptData.payer_id,
          name: `User ${receiptData.payer_id.substring(0, 4)}`,
        });
        
        // If it's a line item receipt, fetch the line items
        if (receiptData.split_type === "line_item") {
          const lineItemsData = await receiptsApi.getLineItems(receiptId);
          setLineItems(lineItemsData);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load receipt details");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchReceiptDetails();
    }
  }, [receiptId, user]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        <p>{error}</p>
        <button
          className="text-sm underline mt-2"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="bg-yellow-50 text-yellow-600 p-4 rounded-md">
        <p>Receipt not found or you don't have access to it.</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => router.push(`/trips/${tripId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Trip
        </Button>
      </div>
    );
  }

  const formattedDate = format(new Date(receipt.date), "MMMM d, yyyy");
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2"
            onClick={() => router.push(`/trips/${tripId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Trip
          </Button>
          <h1 className="text-3xl font-bold">{receipt.title}</h1>
          <p className="text-muted-foreground">
            {receipt.merchant ? `${receipt.merchant} • ` : ""}
            {formattedDate}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button
              variant="outline"
              onClick={() => router.push(`/trips/${tripId}/receipts/${receiptId}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Receipt
            </Button>
          )}
          <Button
            onClick={() => router.push(`/trips/${tripId}/receipts/${receiptId}/split`)}
          >
            Split Receipt
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">Receipt Details</h2>
                <p className="text-sm text-muted-foreground">
                  View and manage receipt information
                </p>
              </div>
              <div
                className={
                  "px-3 py-1 text-xs font-medium rounded-full " +
                  (receipt.split_type === "full"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-purple-100 text-purple-800")
                }
              >
                {receipt.split_type === "full" ? "Full Split" : "Line Items"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Basic Info
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Amount:</span>
                    <span className="text-sm font-medium">
                      ${parseFloat(receipt.total_amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Date:</span>
                    <span className="text-sm">{formattedDate}</span>
                  </div>
                  {receipt.merchant && (
                    <div className="flex justify-between">
                      <span className="text-sm">Merchant:</span>
                      <span className="text-sm">{receipt.merchant}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm">Paid by:</span>
                    <span className="text-sm flex items-center">
                      <User size={14} className="mr-1" />
                      {payer ? payer.name : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  {receipt.split_type === "full" ? "Split Info" : "Line Items"}
                </h3>
                {receipt.split_type === "full" ? (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-600">
                      This receipt is split as a whole among trip members. To view or change
                      the split, click the "Split Receipt" button.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {lineItems.length > 0 ? (
                      <div className="bg-purple-50 p-3 rounded-md">
                        <h4 className="text-sm font-medium text-purple-800 mb-1">
                          {lineItems.length} Line Items
                        </h4>
                        <ul className="space-y-1">
                          {lineItems.slice(0, 3).map((item: any) => (
                            <li key={item.id} className="text-xs text-purple-700 flex justify-between">
                              <span>{item.description}</span>
                              <span>${parseFloat(item.amount).toFixed(2)}</span>
                            </li>
                          ))}
                          {lineItems.length > 3 && (
                            <li className="text-xs text-purple-700 italic">
                              ...and {lineItems.length - 3} more items
                            </li>
                          )}
                        </ul>
                      </div>
                    ) : (
                      <div className="bg-gray-100 p-3 rounded-md text-sm">
                        No line items added yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={() => router.push(`/trips/${tripId}/receipts/${receiptId}/split`)}
                className="w-full"
              >
                <ReceiptIcon className="mr-2 h-4 w-4" />
                Split Receipt
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
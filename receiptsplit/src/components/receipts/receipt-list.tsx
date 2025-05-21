"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { tripsApi, receiptsApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { ReceiptCard } from "./receipt-card";

type ReceiptListProps = {
  tripId: string;
};

type Receipt = {
  id: string;
  trip_id: string;
  payer_id: string;
  title: string;
  date: string;
  total_amount: number;
  merchant?: string;
  split_type: "full" | "line_item";
};

type ReceiptWithDetails = Receipt & {
  payerName: string;
  yourShare: number;
};

export function ReceiptList({ tripId }: ReceiptListProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<ReceiptWithDetails[]>([]);
  const [users, setUsers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        setIsLoading(true);
        
        // Fetch receipts for the trip
        const receiptsData = await tripsApi.getReceipts(tripId);
        
        // Fetch trip members to get user names
        const members = await tripsApi.getTripMembers(tripId);
        
        // Create a map of user IDs to names
        const userMap: Record<string, any> = {};
        for (const member of members) {
          // Fetch user details if needed
          try {
            const userData = { id: member.user_id, username: `User ${member.user_id.substring(0, 4)}` };
            userMap[member.user_id] = userData;
          } catch (err) {
            userMap[member.user_id] = { id: member.user_id, username: "Unknown User" };
          }
        }
        
        setUsers(userMap);
        
        // Process receipts to add user names and your share
        const receiptsWithDetails = await Promise.all(
          receiptsData.map(async (receipt: Receipt) => {
            let yourShare = 0;
            
            // Calculate your share based on split type
            if (receipt.split_type === "full") {
              try {
                const receiptSplits = await receiptsApi.getReceiptSplits(receipt.id);
                const yourSplit = receiptSplits.find((split: any) => split.user_id === user?.id);
                if (yourSplit) {
                  yourShare = parseFloat(yourSplit.amount);
                }
              } catch (err) {
                console.error("Error fetching receipt splits:", err);
              }
            } else if (receipt.split_type === "line_item") {
              try {
                const lineItems = await receiptsApi.getLineItems(receipt.id);
                let totalShare = 0;
                
                for (const lineItem of lineItems) {
                  try {
                    const lineItemSplits = await receiptsApi.getLineItemSplits(lineItem.id);
                    const yourSplit = lineItemSplits.find((split: any) => split.user_id === user?.id);
                    if (yourSplit) {
                      totalShare += parseFloat(yourSplit.amount);
                    }
                  } catch (err) {
                    console.error("Error fetching line item splits:", err);
                  }
                }
                
                yourShare = totalShare;
              } catch (err) {
                console.error("Error fetching line items:", err);
              }
            }
            
            return {
              ...receipt,
              payerName: userMap[receipt.payer_id]?.username || "Unknown User",
              yourShare,
            };
          })
        );
        
        setReceipts(receiptsWithDetails);
      } catch (err: any) {
        setError(err.message || "Failed to load receipts");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchReceipts();
    }
  }, [tripId, user]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="border rounded-lg p-5 h-48 animate-pulse bg-gray-50"
          ></div>
        ))}
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

  if (receipts.length === 0) {
    return (
      <div className="bg-blue-50 text-blue-600 p-6 rounded-md text-center">
        <p className="mb-2 font-medium">No receipts added yet</p>
        <p className="text-sm text-blue-500 mb-4">
          Start adding receipts to track expenses for this trip
        </p>
        <Button 
          size="sm"
          onClick={() => router.push(`/trips/${tripId}/receipts/new`)}
        >
          Add First Receipt
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {receipts.map((receipt) => (
        <ReceiptCard
          key={receipt.id}
          id={receipt.id}
          title={receipt.title}
          date={receipt.date}
          totalAmount={parseFloat(receipt.total_amount.toString())}
          merchant={receipt.merchant || ""}
          splitType={receipt.split_type}
          payerName={receipt.payerName}
          yourShare={receipt.yourShare}
          tripId={tripId}
        />
      ))}
    </div>
  );
}
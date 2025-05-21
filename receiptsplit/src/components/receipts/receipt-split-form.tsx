"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { receiptsApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SplitTypeToggle } from "./split-type-toggle";
import { FullReceiptSplit } from "./full-receipt-split";
import { LineItemSplit } from "./line-item-split";

type ReceiptSplitFormProps = {
  tripId: string;
  receiptId: string;
};

export function ReceiptSplitForm({ tripId, receiptId }: ReceiptSplitFormProps) {
  const router = useRouter();
  const [receipt, setReceipt] = useState<any>(null);
  const [splitType, setSplitType] = useState<"full" | "line_item">("full");
  const [fullSplits, setFullSplits] = useState<Array<{
    user_id: string;
    percentage: number;
    amount: number;
  }>>([]);
  const [lineItemSplits, setLineItemSplits] = useState<Array<{
    line_item_id: string;
    user_id: string;
    percentage: number;
    amount: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Tracks if split type is different from the original receipt
  const [splitTypeChanged, setSplitTypeChanged] = useState(false);
  
  // Validation state
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const fetchReceiptAndSplits = async () => {
      try {
        setIsLoading(true);
        
        // Fetch receipt details
        const receiptData = await receiptsApi.getReceipt(receiptId);
        setReceipt(receiptData);
        
        // Set initial split type
        setSplitType(receiptData.split_type);
        
        // Fetch existing splits based on type
        if (receiptData.split_type === "full") {
          try {
            const splits = await receiptsApi.getReceiptSplits(receiptId);
            
            // Format for our component
            const formattedSplits = splits.map((split: any) => ({
              user_id: split.user_id,
              percentage: parseFloat(split.percentage),
              amount: parseFloat(split.amount),
            }));
            
            setFullSplits(formattedSplits);
          } catch (err) {
            console.error("Error fetching full receipt splits:", err);
          }
        } else if (receiptData.split_type === "line_item") {
          try {
            // Fetch line items first
            const lineItems = await receiptsApi.getLineItems(receiptId);
            
            // Then fetch splits for each line item
            let allSplits: Array<{
              line_item_id: string;
              user_id: string;
              percentage: number;
              amount: number;
            }> = [];
            
            for (const item of lineItems) {
              try {
                const itemSplits = await receiptsApi.getLineItemSplits(item.id);
                
                const formattedSplits = itemSplits.map((split: any) => ({
                  line_item_id: split.line_item_id,
                  user_id: split.user_id,
                  percentage: parseFloat(split.percentage),
                  amount: parseFloat(split.amount),
                }));
                
                allSplits = [...allSplits, ...formattedSplits];
              } catch (err) {
                console.error(`Error fetching splits for line item ${item.id}:`, err);
              }
            }
            
            setLineItemSplits(allSplits);
          } catch (err) {
            console.error("Error fetching line items:", err);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load receipt details");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceiptAndSplits();
  }, [receiptId]);

  // Track if split type is changed from original
  useEffect(() => {
    if (receipt && splitType !== receipt.split_type) {
      setSplitTypeChanged(true);
    } else {
      setSplitTypeChanged(false);
    }
  }, [splitType, receipt]);

  // Validate based on split type
  useEffect(() => {
    if (splitType === "full") {
      // Check if full splits are valid
      if (fullSplits.length > 0) {
        const totalPercentage = fullSplits.reduce(
          (sum, split) => sum + (split.percentage || 0),
          0
        );
        
        const totalAmount = fullSplits.reduce(
          (sum, split) => sum + (split.amount || 0),
          0
        );
        
        setIsValid(
          Math.abs(totalPercentage - 100) < 0.01 &&
          receipt && Math.abs(totalAmount - parseFloat(receipt.total_amount)) < 0.01
        );
      } else {
        setIsValid(false);
      }
    } else if (splitType === "line_item" && receipt) {
      // Get all line item IDs
      const lineItemIds = new Set(lineItemSplits.map((split) => split.line_item_id));
      
      // Check if each line item has valid splits
      let allItemsValid = true;
      
      lineItemIds.forEach((itemId) => {
        const itemSplits = lineItemSplits.filter((split) => split.line_item_id === itemId);
        
        if (itemSplits.length === 0) {
          allItemsValid = false;
          return;
        }
        
        const totalPercentage = itemSplits.reduce(
          (sum, split) => sum + (split.percentage || 0),
          0
        );
        
        // For simplicity, we're not checking amounts as they should match if percentages are correct
        if (Math.abs(totalPercentage - 100) > 0.01) {
          allItemsValid = false;
        }
      });
      
      setIsValid(allItemsValid && lineItemIds.size > 0);
    } else {
      setIsValid(false);
    }
  }, [splitType, fullSplits, lineItemSplits, receipt]);

  const handleSplitTypeChange = (type: "full" | "line_item") => {
    setSplitType(type);
  };

  const handleFullSplitChange = (splits: Array<{
    user_id: string;
    percentage: number;
    amount: number;
  }>) => {
    setFullSplits(splits);
  };

  const handleLineItemSplitChange = (splits: Array<{
    line_item_id: string;
    user_id: string;
    percentage: number;
    amount: number;
  }>) => {
    setLineItemSplits(splits);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      if (splitType === "full") {
        // Save full receipt split
        await receiptsApi.splitReceipt(receiptId, {
          split_type: "full",
          splits: fullSplits,
        });
      } else if (splitType === "line_item") {
        // Save line item splits
        // First update receipt split type if needed
        if (receipt.split_type !== "line_item") {
          await receiptsApi.updateReceipt(receiptId, {
            split_type: "line_item",
          });
        }
        
        // Then save all line item splits
        await receiptsApi.splitLineItems(receiptId, lineItemSplits);
      }
      
      router.push(`/trips/${tripId}/receipts/${receiptId}`);
    } catch (err: any) {
      setError(err.message || "Failed to save splits");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

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
          Back to Trip
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Split Receipt</h2>
            <p className="text-sm text-muted-foreground">
              Choose how to split this receipt among trip members
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <SplitTypeToggle
                value={splitType}
                onChange={handleSplitTypeChange}
                disabled={splitTypeChanged}
              />

              {splitTypeChanged && (
                <div className="mt-2 p-3 bg-yellow-50 text-yellow-600 text-sm rounded-md">
                  <p className="font-medium">Warning:</p>
                  <p>
                    Changing split type will remove all existing splits.
                    To proceed, save your changes and then edit the splits again.
                  </p>
                </div>
              )}
            </div>

            {splitType === "full" ? (
              <FullReceiptSplit
                tripId={tripId}
                receiptId={receiptId}
                totalAmount={parseFloat(receipt.total_amount)}
                onSplitChange={handleFullSplitChange}
                initialSplits={fullSplits}
              />
            ) : (
              <LineItemSplit
                tripId={tripId}
                receiptId={receiptId}
                onSplitChange={handleLineItemSplitChange}
                initialSplits={lineItemSplits}
              />
            )}
          </div>

          <div className="pt-4 border-t flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/trips/${tripId}/receipts/${receiptId}`)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValid || isSaving}
            >
              {isSaving ? "Saving..." : "Save Splits"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
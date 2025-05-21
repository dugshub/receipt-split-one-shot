"use client";

import { useState, useEffect } from "react";
import { User, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tripsApi, receiptsApi } from "@/lib/api-client";
import { createEvenSplits } from "@/lib/split-calculations";

type LineItemSplitProps = {
  tripId: string;
  receiptId: string;
  onSplitChange: (lineItemSplits: Array<{
    line_item_id: string;
    user_id: string;
    percentage: number;
    amount: number;
  }>) => void;
  initialSplits?: Array<{
    line_item_id: string;
    user_id: string;
    percentage: number;
    amount: number;
  }>;
};

type TripMember = {
  id: string;
  trip_id: string;
  user_id: string;
  role: string;
  username?: string;
};

type LineItem = {
  id: string;
  receipt_id: string;
  description: string;
  amount: number;
  quantity: number;
};

export function LineItemSplit({
  tripId,
  receiptId,
  onSplitChange,
  initialSplits = [],
}: LineItemSplitProps) {
  const [members, setMembers] = useState<TripMember[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [splits, setSplits] = useState<Array<{
    line_item_id: string;
    user_id: string;
    percentage: number;
    amount: number;
  }>>(initialSplits);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  // Track validity of splits for each line item
  const [validity, setValidity] = useState<Record<string, {
    percentageValid: boolean;
    amountValid: boolean;
  }>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch trip members
        const membersData = await tripsApi.getTripMembers(tripId);
        const membersWithNames = membersData.map((member: any) => ({
          ...member,
          username: `User ${member.user_id.substring(0, 4)}`,
        }));
        
        setMembers(membersWithNames);
        
        // Fetch line items
        const lineItemsData = await receiptsApi.getLineItems(receiptId);
        setLineItems(lineItemsData);
        
        // Initialize expanded state for each line item
        const initialExpandedState: Record<string, boolean> = {};
        lineItemsData.forEach((item: LineItem) => {
          initialExpandedState[item.id] = false;
        });
        
        setExpandedItems(initialExpandedState);
        
        // If no initial splits, create even splits for each line item
        if (initialSplits.length === 0 && membersWithNames.length > 0) {
          const userIds = membersWithNames.map((member) => member.user_id);
          
          let newSplits: Array<{
            line_item_id: string;
            user_id: string;
            percentage: number;
            amount: number;
          }> = [];
          
          lineItemsData.forEach((item: LineItem) => {
            const evenSplits = createEvenSplits(parseFloat(item.amount.toString()), userIds);
            
            const itemSplits = evenSplits.map((split) => ({
              line_item_id: item.id,
              user_id: split.userId,
              percentage: split.percentage,
              amount: split.amount,
            }));
            
            newSplits = [...newSplits, ...itemSplits];
          });
          
          setSplits(newSplits);
          onSplitChange(newSplits);
        } else {
          setSplits(initialSplits);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tripId, receiptId, onSplitChange, initialSplits]);

  // Validate splits whenever they change
  useEffect(() => {
    const newValidity: Record<string, { percentageValid: boolean; amountValid: boolean }> = {};
    
    lineItems.forEach((item) => {
      const itemSplits = splits.filter((split) => split.line_item_id === item.id);
      
      const totalPercentage = itemSplits.reduce(
        (sum, split) => sum + (split.percentage || 0),
        0
      );
      
      const totalAmount = itemSplits.reduce(
        (sum, split) => sum + (split.amount || 0),
        0
      );
      
      newValidity[item.id] = {
        percentageValid: Math.abs(totalPercentage - 100) < 0.01,
        amountValid: Math.abs(totalAmount - parseFloat(item.amount.toString())) < 0.01,
      };
    });
    
    setValidity(newValidity);
  }, [splits, lineItems]);

  const toggleItemExpanded = (itemId: string) => {
    setExpandedItems({
      ...expandedItems,
      [itemId]: !expandedItems[itemId],
    });
  };

  const handleSplitEvenly = (itemId: string) => {
    if (members.length === 0) return;
    
    const lineItem = lineItems.find((item) => item.id === itemId);
    if (!lineItem) return;
    
    const userIds = members.map((member) => member.user_id);
    const evenSplits = createEvenSplits(parseFloat(lineItem.amount.toString()), userIds);
    
    // Replace existing splits for this line item
    const otherSplits = splits.filter((split) => split.line_item_id !== itemId);
    const newItemSplits = evenSplits.map((split) => ({
      line_item_id: itemId,
      user_id: split.userId,
      percentage: split.percentage,
      amount: split.amount,
    }));
    
    const newSplits = [...otherSplits, ...newItemSplits];
    
    setSplits(newSplits);
    onSplitChange(newSplits);
  };

  const handlePercentageChange = (itemId: string, userId: string, percentage: number) => {
    const lineItem = lineItems.find((item) => item.id === itemId);
    if (!lineItem) return;
    
    const itemAmount = parseFloat(lineItem.amount.toString());
    const amount = (percentage / 100) * itemAmount;
    
    // Check if split already exists
    const existingSplitIndex = splits.findIndex(
      (split) => split.line_item_id === itemId && split.user_id === userId
    );
    
    let newSplits;
    
    if (existingSplitIndex >= 0) {
      // Update existing split
      newSplits = [...splits];
      newSplits[existingSplitIndex] = {
        ...newSplits[existingSplitIndex],
        percentage,
        amount: parseFloat(amount.toFixed(2)),
      };
    } else {
      // Add new split
      newSplits = [
        ...splits,
        {
          line_item_id: itemId,
          user_id: userId,
          percentage,
          amount: parseFloat(amount.toFixed(2)),
        },
      ];
    }
    
    setSplits(newSplits);
    onSplitChange(newSplits);
  };

  const handleAmountChange = (itemId: string, userId: string, amount: number) => {
    const lineItem = lineItems.find((item) => item.id === itemId);
    if (!lineItem) return;
    
    const itemAmount = parseFloat(lineItem.amount.toString());
    const percentage = (amount / itemAmount) * 100;
    
    // Check if split already exists
    const existingSplitIndex = splits.findIndex(
      (split) => split.line_item_id === itemId && split.user_id === userId
    );
    
    let newSplits;
    
    if (existingSplitIndex >= 0) {
      // Update existing split
      newSplits = [...splits];
      newSplits[existingSplitIndex] = {
        ...newSplits[existingSplitIndex],
        percentage: parseFloat(percentage.toFixed(2)),
        amount,
      };
    } else {
      // Add new split
      newSplits = [
        ...splits,
        {
          line_item_id: itemId,
          user_id: userId,
          percentage: parseFloat(percentage.toFixed(2)),
          amount,
        },
      ];
    }
    
    setSplits(newSplits);
    onSplitChange(newSplits);
  };

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-gray-100 rounded-md"></div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  // Check if all splits are valid
  const allValid = lineItems.every(
    (item) => validity[item.id]?.percentageValid && validity[item.id]?.amountValid
  );

  if (lineItems.length === 0) {
    return (
      <div className="bg-yellow-50 text-yellow-600 p-4 rounded-md">
        <p>No line items found for this receipt.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Line Item Split</h3>
      
      <div className="space-y-4">
        {lineItems.map((item) => {
          const itemSplits = splits.filter((split) => split.line_item_id === item.id);
          const isExpanded = expandedItems[item.id];
          
          // Calculate totals for this item
          const totalPercentage = itemSplits.reduce(
            (sum, split) => sum + (split.percentage || 0),
            0
          );
          
          const totalSplitAmount = itemSplits.reduce(
            (sum, split) => sum + (split.amount || 0),
            0
          );
          
          const itemAmount = parseFloat(item.amount.toString());
          
          return (
            <div
              key={item.id}
              className="border rounded-md overflow-hidden"
            >
              <div
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                onClick={() => toggleItemExpanded(item.id)}
              >
                <div>
                  <h4 className="font-medium">{item.description}</h4>
                  <div className="text-sm text-gray-500">
                    {item.quantity > 1 && <span>Qty: {item.quantity} × </span>}
                    <span>${(itemAmount / item.quantity).toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-medium">${itemAmount.toFixed(2)}</div>
                    <div
                      className={`text-xs font-medium ${
                        validity[item.id]?.percentageValid && validity[item.id]?.amountValid
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {validity[item.id]?.percentageValid && validity[item.id]?.amountValid
                        ? "Split complete"
                        : "Needs splitting"}
                    </div>
                  </div>
                  <div className="text-blue-500">
                    {isExpanded ? "▲" : "▼"}
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="mb-4 flex justify-between items-center">
                    <Label className="text-sm font-medium">Split this item</Label>
                    <Button size="sm" onClick={() => handleSplitEvenly(item.id)}>
                      Split Evenly
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-[1fr,100px,100px] gap-2 text-xs font-medium text-gray-500">
                      <div>Member</div>
                      <div className="text-right">Percentage</div>
                      <div className="text-right">Amount</div>
                    </div>
                    
                    {members.map((member) => {
                      const split = itemSplits.find((s) => s.user_id === member.user_id);
                      const percentage = split?.percentage || 0;
                      const amount = split?.amount || 0;
                      
                      return (
                        <div
                          key={`${item.id}-${member.user_id}`}
                          className="grid grid-cols-[1fr,100px,100px] gap-2 items-center"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                              <User size={12} />
                            </div>
                            <span className="text-sm">{member.username}</span>
                          </div>
                          
                          <div>
                            <div className="relative">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={percentage}
                                onChange={(e) => handlePercentageChange(
                                  item.id,
                                  member.user_id,
                                  parseFloat(e.target.value) || 0
                                )}
                                className="h-8 text-right pr-6 text-sm"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                                %
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <div className="relative">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={amount}
                                onChange={(e) => handleAmountChange(
                                  item.id,
                                  member.user_id,
                                  parseFloat(e.target.value) || 0
                                )}
                                className="h-8 text-right pl-6 text-sm"
                              />
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                                $
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="grid grid-cols-[1fr,100px,100px] gap-2 pt-2 border-t">
                      <div className="text-sm font-medium">Total</div>
                      <div
                        className={`text-right text-sm font-medium ${
                          validity[item.id]?.percentageValid
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {totalPercentage.toFixed(2)}%
                      </div>
                      <div
                        className={`text-right text-sm font-medium ${
                          validity[item.id]?.amountValid
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        ${totalSplitAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div
        className={`p-3 rounded-md ${
          allValid ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
        }`}
      >
        <p className="text-sm">
          {allValid
            ? "All items are split correctly! Percentages add up to 100% and amounts match the total."
            : "Some items are not split correctly. Percentages must add up to 100% and amounts must match the item total."}
        </p>
      </div>
    </div>
  );
}
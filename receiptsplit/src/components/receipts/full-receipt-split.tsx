"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { tripsApi } from "@/lib/api-client";
import { createEvenSplits } from "@/lib/split-calculations";

type FullReceiptSplitProps = {
  tripId: string;
  receiptId: string;
  totalAmount: number;
  onSplitChange: (splits: Array<{ user_id: string; percentage: number; amount: number }>) => void;
  initialSplits?: Array<{ user_id: string; percentage: number; amount: number }>;
};

type TripMember = {
  id: string;
  trip_id: string;
  user_id: string;
  role: string;
  username?: string;
};

export function FullReceiptSplit({
  tripId,
  receiptId,
  totalAmount,
  onSplitChange,
  initialSplits = [],
}: FullReceiptSplitProps) {
  const [members, setMembers] = useState<TripMember[]>([]);
  const [splits, setSplits] = useState<Array<{ user_id: string; percentage: number; amount: number }>>(initialSplits);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [totalSplitAmount, setTotalSplitAmount] = useState(0);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        const membersData = await tripsApi.getTripMembers(tripId);
        
        // Map members with display names
        const membersWithNames = membersData.map((member: any) => ({
          ...member,
          username: `User ${member.user_id.substring(0, 4)}`,
        }));
        
        setMembers(membersWithNames);
        
        // If no initial splits, create even splits
        if (initialSplits.length === 0 && membersWithNames.length > 0) {
          const userIds = membersWithNames.map((member) => member.user_id);
          const evenSplits = createEvenSplits(totalAmount, userIds);
          setSplits(evenSplits);
          onSplitChange(evenSplits);
        } else {
          setSplits(initialSplits);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load trip members");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [tripId, totalAmount, onSplitChange, initialSplits]);

  // Update totals when splits change
  useEffect(() => {
    const newTotalPercentage = splits.reduce(
      (sum, split) => sum + (split.percentage || 0),
      0
    );
    
    const newTotalAmount = splits.reduce(
      (sum, split) => sum + (split.amount || 0),
      0
    );
    
    setTotalPercentage(newTotalPercentage);
    setTotalSplitAmount(newTotalAmount);
  }, [splits]);

  const handleSplitEvenly = () => {
    if (members.length === 0) return;
    
    const userIds = members.map((member) => member.user_id);
    const evenSplits = createEvenSplits(totalAmount, userIds);
    
    setSplits(evenSplits);
    onSplitChange(evenSplits);
  };

  const handlePercentageChange = (userId: string, percentage: number) => {
    const newSplits = splits.map((split) => {
      if (split.user_id === userId) {
        const newAmount = (percentage / 100) * totalAmount;
        return {
          ...split,
          percentage,
          amount: parseFloat(newAmount.toFixed(2)),
        };
      }
      return split;
    });
    
    setSplits(newSplits);
    onSplitChange(newSplits);
  };

  const handleAmountChange = (userId: string, amount: number) => {
    const newSplits = splits.map((split) => {
      if (split.user_id === userId) {
        const newPercentage = (amount / totalAmount) * 100;
        return {
          ...split,
          percentage: parseFloat(newPercentage.toFixed(2)),
          amount,
        };
      }
      return split;
    });
    
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

  const isValid = Math.abs(totalPercentage - 100) < 0.01 &&
                 Math.abs(totalSplitAmount - totalAmount) < 0.01;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Full Receipt Split</h3>
        <Button size="sm" onClick={handleSplitEvenly}>
          Split Evenly
        </Button>
      </div>
      
      <div className="space-y-4">
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No members found for this trip.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-[1fr,120px,120px] gap-2 text-sm font-medium text-gray-500 mb-1">
              <div>Member</div>
              <div className="text-right">Percentage</div>
              <div className="text-right">Amount</div>
            </div>
            
            {members.map((member) => {
              const split = splits.find((s) => s.user_id === member.user_id) || {
                user_id: member.user_id,
                percentage: 0,
                amount: 0,
              };
              
              return (
                <div key={member.id} className="grid grid-cols-[1fr,120px,120px] gap-2 items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <User size={16} />
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
                        value={split.percentage}
                        onChange={(e) => handlePercentageChange(
                          member.user_id,
                          parseFloat(e.target.value) || 0
                        )}
                        className="text-right pr-6"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">
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
                        value={split.amount}
                        onChange={(e) => handleAmountChange(
                          member.user_id,
                          parseFloat(e.target.value) || 0
                        )}
                        className="text-right pl-6"
                      />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        $
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="grid grid-cols-[1fr,120px,120px] gap-2 pt-2 border-t">
              <div className="font-medium">Total</div>
              <div
                className={`text-right font-medium ${
                  Math.abs(totalPercentage - 100) < 0.01
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {totalPercentage.toFixed(2)}%
              </div>
              <div
                className={`text-right font-medium ${
                  Math.abs(totalSplitAmount - totalAmount) < 0.01
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ${totalSplitAmount.toFixed(2)}
              </div>
            </div>
            
            <div
              className={`p-3 rounded-md ${
                isValid ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
              }`}
            >
              {isValid ? (
                <p className="text-sm">
                  The split is valid! Percentages add up to 100% and amounts match the total.
                </p>
              ) : (
                <p className="text-sm">
                  The split is not valid. Percentages must add up to 100% and amounts must match
                  the total of ${totalAmount.toFixed(2)}.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
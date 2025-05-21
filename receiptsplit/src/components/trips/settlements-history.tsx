"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { User } from "lucide-react";
import { settlementsApi } from "@/lib/api-client";

type SettlementsHistoryProps = {
  tripId: string;
};

type Settlement = {
  id: string;
  trip_id: string;
  payer_id: string;
  receiver_id: string;
  amount: number;
  date: string;
  note?: string;
  created_at: string;
};

type UserDetails = {
  id: string;
  username: string;
};

export function SettlementsHistory({ tripId }: SettlementsHistoryProps) {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [userDetails, setUserDetails] = useState<Record<string, UserDetails>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettlements = async () => {
      try {
        setIsLoading(true);
        
        // Fetch settlements for the trip
        const settlementsData = await settlementsApi.getSettlements(tripId);
        setSettlements(settlementsData);
        
        // Create a simple user map (in a real app, you'd fetch real user data)
        const userIds = new Set<string>();
        settlementsData.forEach((settlement: Settlement) => {
          userIds.add(settlement.payer_id);
          userIds.add(settlement.receiver_id);
        });
        
        const userMap: Record<string, UserDetails> = {};
        userIds.forEach((userId) => {
          userMap[userId] = {
            id: userId,
            username: `User ${userId.substring(0, 4)}`,
          };
        });
        
        setUserDetails(userMap);
      } catch (err: any) {
        setError(err.message || "Failed to load settlements");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettlements();
  }, [tripId]);

  if (isLoading) {
    return <div className="animate-pulse h-24 bg-gray-100 rounded-md"></div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  if (settlements.length === 0) {
    return (
      <div className="bg-blue-50 text-blue-600 p-4 rounded-md">
        <p className="text-sm">No settlements recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Settlement History</h3>
      
      <div className="space-y-2">
        {settlements.map((settlement) => {
          const payerUsername = userDetails[settlement.payer_id]?.username || 
            `User ${settlement.payer_id.substring(0, 4)}`;
            
          const receiverUsername = userDetails[settlement.receiver_id]?.username || 
            `User ${settlement.receiver_id.substring(0, 4)}`;
            
          const formattedDate = format(new Date(settlement.date), "MMM d, yyyy");
          
          return (
            <div
              key={settlement.id}
              className="p-4 border rounded-md"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center mb-2 md:mb-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2">
                    <User size={16} />
                  </div>
                  <div>
                    <div className="text-sm">
                      <span className="font-medium">{payerUsername}</span>
                      <span className="text-gray-500 mx-1">paid</span>
                      <span className="font-medium">{receiverUsername}</span>
                    </div>
                    <div className="text-xs text-gray-500">{formattedDate}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="font-medium">${parseFloat(settlement.amount.toString()).toFixed(2)}</div>
                  {settlement.note && (
                    <div className="ml-3 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {settlement.note}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
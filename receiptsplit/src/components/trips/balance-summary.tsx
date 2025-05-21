"use client";

import { useState, useEffect } from "react";
import { ArrowRight, User } from "lucide-react";
import { tripsApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

type BalanceSummaryProps = {
  tripId: string;
};

type Balance = {
  paid: number;
  owed: number;
  net: number;
};

type Transaction = {
  from: string;
  to: string;
  amount: number;
};

type UserDetails = {
  id: string;
  username: string;
};

export function BalanceSummary({ tripId }: BalanceSummaryProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [balances, setBalances] = useState<Record<string, Balance>>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userDetails, setUserDetails] = useState<Record<string, UserDetails>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        setIsLoading(true);
        
        // Fetch trip balances
        const balanceData = await tripsApi.getTripBalances(tripId);
        setBalances(balanceData.balances);
        setTransactions(balanceData.transactions);
        
        // Fetch user details (in a real app, this would be a proper API call)
        // For now, we'll use a simplified approach
        const members = await tripsApi.getTripMembers(tripId);
        
        const userMap: Record<string, UserDetails> = {};
        members.forEach((member: any) => {
          userMap[member.user_id] = {
            id: member.user_id,
            username: `User ${member.user_id.substring(0, 4)}`,
          };
        });
        
        setUserDetails(userMap);
      } catch (err: any) {
        setError(err.message || "Failed to load balance data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
  }, [tripId]);

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-gray-100 rounded-md"></div>;
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

  // Check if there are any balances to settle
  const hasBalances = Object.keys(balances).length > 0;
  const hasTransactions = transactions.length > 0;
  
  // Find current user's balance
  const currentUserBalance = user?.id ? balances[user.id] : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Trip Balances</h3>
        {hasTransactions && (
          <Button
            size="sm"
            onClick={() => router.push(`/trips/${tripId}/settle`)}
          >
            Record Settlement
          </Button>
        )}
      </div>

      {hasBalances ? (
        <div className="space-y-6">
          {/* User's personal balance summary */}
          {currentUserBalance && (
            <Card className={
              currentUserBalance.net > 0
                ? "bg-green-50 border-green-100"
                : currentUserBalance.net < 0
                ? "bg-red-50 border-red-100"
                : "bg-blue-50 border-blue-100"
            }>
              <CardContent className="p-4">
                <div className="text-sm font-medium mb-1">
                  {currentUserBalance.net > 0
                    ? "You are owed money"
                    : currentUserBalance.net < 0
                    ? "You owe money"
                    : "Your balance is settled"}
                </div>
                <div className="text-2xl font-bold">
                  {currentUserBalance.net > 0
                    ? `+$${currentUserBalance.net.toFixed(2)}`
                    : currentUserBalance.net < 0
                    ? `-$${Math.abs(currentUserBalance.net).toFixed(2)}`
                    : "$0.00"}
                </div>
                <div className="text-xs mt-2 text-gray-500 space-x-1">
                  <span>Paid: ${currentUserBalance.paid.toFixed(2)}</span>
                  <span>•</span>
                  <span>Owed: ${currentUserBalance.owed.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transactions that need to happen */}
          {hasTransactions ? (
            <div>
              <h4 className="text-sm font-medium mb-3">Suggested Settlements</h4>
              <div className="space-y-2">
                {transactions.map((transaction, index) => {
                  const fromUser = userDetails[transaction.from];
                  const toUser = userDetails[transaction.to];
                  const isCurrentUserInvolved = user?.id === transaction.from || user?.id === transaction.to;

                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-md border flex items-center ${
                        isCurrentUserInvolved
                          ? "bg-blue-50 border-blue-100"
                          : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center">
                        <User size={16} />
                      </div>
                      <div className="flex-grow mx-2">
                        <div className="text-sm font-medium">
                          {fromUser?.username || `User ${transaction.from.substring(0, 4)}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          pays
                        </div>
                      </div>
                      <div className="mx-2 text-gray-400">
                        <ArrowRight size={16} />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center">
                        <User size={16} />
                      </div>
                      <div className="flex-grow mx-2">
                        <div className="text-sm font-medium">
                          {toUser?.username || `User ${transaction.to.substring(0, 4)}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          receives
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm">
                          ${transaction.amount.toFixed(2)}
                        </div>
                        {isCurrentUserInvolved && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-xs py-1 h-7"
                            onClick={() => 
                              router.push(`/trips/${tripId}/settle?from=${transaction.from}&to=${transaction.to}&amount=${transaction.amount}`)
                            }
                          >
                            Record
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-green-50 p-4 rounded-md text-green-600">
              <p className="text-sm">All balances are settled! No payments needed.</p>
            </div>
          )}

          {/* Individual balances */}
          <div>
            <h4 className="text-sm font-medium mb-3">All Balances</h4>
            <div className="space-y-2">
              {Object.entries(balances).map(([userId, balance]) => {
                if (userId === user?.id) return null; // Skip current user, already shown above
                
                const userData = userDetails[userId];
                
                return (
                  <div key={userId} className="p-3 rounded-md border flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center">
                        <User size={16} />
                      </div>
                      <div className="ml-2">
                        <div className="text-sm font-medium">
                          {userData?.username || `User ${userId.substring(0, 4)}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          Paid: ${balance.paid.toFixed(2)} • Owed: ${balance.owed.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className={
                      balance.net > 0
                        ? "text-green-600 font-medium"
                        : balance.net < 0
                        ? "text-red-600 font-medium"
                        : "text-gray-600"
                    }>
                      {balance.net > 0
                        ? `+$${balance.net.toFixed(2)}`
                        : balance.net < 0
                        ? `-$${Math.abs(balance.net).toFixed(2)}`
                        : "$0.00"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 p-4 rounded-md text-blue-600">
          <p className="text-sm">
            No balance data available yet. Add receipts and split them to see balances.
          </p>
        </div>
      )}
    </div>
  );
}
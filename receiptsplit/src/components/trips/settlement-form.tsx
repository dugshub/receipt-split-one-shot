"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { tripsApi, settlementsApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

type SettlementFormProps = {
  tripId: string;
  suggestedSettlements?: Array<{
    from: string;
    to: string;
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

export function SettlementForm({
  tripId,
  suggestedSettlements = [],
}: SettlementFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [members, setMembers] = useState<TripMember[]>([]);
  const [payerId, setPayerId] = useState<string | null>(user?.id || null);
  const [receiverId, setReceiverId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // For suggestions
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        
        // Fetch trip members
        const membersData = await tripsApi.getTripMembers(tripId);
        
        // Format members with display names
        const membersWithNames = membersData.map((member: any) => ({
          ...member,
          username: `User ${member.user_id.substring(0, 4)}`,
        }));
        
        setMembers(membersWithNames);
        
        // Set initial receiver based on suggestions
        if (
          suggestedSettlements.length > 0 &&
          user?.id === suggestedSettlements[0].from
        ) {
          setReceiverId(suggestedSettlements[0].to);
          setAmount(suggestedSettlements[0].amount.toFixed(2));
          setSelectedSuggestion(0);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load trip members");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [tripId, user?.id, suggestedSettlements]);

  const handleSuggestionSelect = (index: number) => {
    const suggestion = suggestedSettlements[index];
    if (!suggestion) return;
    
    // Check if current user is involved
    if (user?.id === suggestion.from) {
      setPayerId(user.id);
      setReceiverId(suggestion.to);
    } else if (user?.id === suggestion.to) {
      // This is a bit unusual but allow user to record payment they received
      setPayerId(suggestion.from);
      setReceiverId(user.id);
    } else {
      // User is recording a payment between other members
      setPayerId(suggestion.from);
      setReceiverId(suggestion.to);
    }
    
    setAmount(suggestion.amount.toFixed(2));
    setSelectedSuggestion(index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!payerId || !receiverId || !amount || !date) {
      setError("Payer, receiver, amount, and date are required");
      return;
    }
    
    if (payerId === receiverId) {
      setError("Payer and receiver must be different");
      return;
    }
    
    setIsSaving(true);
    
    try {
      await settlementsApi.createSettlement(tripId, {
        payer_id: payerId,
        receiver_id: receiverId,
        amount: parseFloat(amount),
        date,
        note: note || undefined,
      });
      
      router.push(`/trips/${tripId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to record settlement");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      </div>
    );
  }

  if (members.length < 2) {
    return (
      <div className="bg-yellow-50 text-yellow-600 p-4 rounded-md">
        <p>A trip needs at least two members to record settlements.</p>
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Record Settlement</CardTitle>
        <CardDescription>
          Track payments between trip members to settle balances
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Suggested settlements section */}
        {suggestedSettlements.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Suggested Settlements</h3>
            <div className="space-y-2">
              {suggestedSettlements.map((settlement, index) => {
                const fromMember = members.find(m => m.user_id === settlement.from);
                const toMember = members.find(m => m.user_id === settlement.to);
                const isCurrentUserInvolved = 
                  user?.id === settlement.from || user?.id === settlement.to;
                
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-md border ${
                      selectedSuggestion === index
                        ? "bg-blue-100 border-blue-200"
                        : isCurrentUserInvolved
                        ? "bg-blue-50 border-blue-100"
                        : "bg-gray-50 border-gray-100"
                    } cursor-pointer hover:bg-blue-50 hover:border-blue-100`}
                    onClick={() => handleSuggestionSelect(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">
                            {fromMember?.username || `User ${settlement.from.substring(0, 4)}`}
                          </span>
                          <span className="text-sm text-gray-500">pays</span>
                          <span className="text-sm font-medium">
                            {toMember?.username || `User ${settlement.to.substring(0, 4)}`}
                          </span>
                        </div>
                      </div>
                      <div className="font-medium">
                        ${settlement.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Settlement form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payer">Payer (who paid)</Label>
            <div className="relative">
              <select
                id="payer"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={payerId || ""}
                onChange={(e) => setPayerId(e.target.value)}
                required
              >
                <option value="">Select payer</option>
                {members.map((member) => (
                  <option key={`payer-${member.user_id}`} value={member.user_id}>
                    {member.username} {member.user_id === user?.id ? "(You)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="receiver">Receiver (who was paid)</Label>
            <div className="relative">
              <select
                id="receiver"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={receiverId || ""}
                onChange={(e) => setReceiverId(e.target.value)}
                required
              >
                <option value="">Select receiver</option>
                {members.map((member) => (
                  <option 
                    key={`receiver-${member.user_id}`} 
                    value={member.user_id}
                    disabled={member.user_id === payerId}
                  >
                    {member.username} {member.user_id === user?.id ? "(You)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="pl-7"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Input
              id="note"
              placeholder="e.g., Venmo payment"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          
          {error && (
            <div className="text-sm text-red-500 font-medium">{error}</div>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => router.push(`/trips/${tripId}`)}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSaving || !payerId || !receiverId || !amount || !date}
        >
          {isSaving ? "Recording..." : "Record Settlement"}
        </Button>
      </CardFooter>
    </Card>
  );
}
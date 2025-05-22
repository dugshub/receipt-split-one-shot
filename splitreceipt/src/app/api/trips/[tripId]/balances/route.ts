import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getAuthToken } from "@/lib/auth-helpers";

// Get the balances for a specific trip
export async function GET(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  // Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    // Call Gibson API to get trip balances
    const { data, error } = await gibson.GET(`/v1/trip/${params.tripId}/balances`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    
    // Process balances data
    const tripMembers = await gibson.GET(`/v1/trip/${params.tripId}/members`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Calculate optimized settlement transactions
    const { balances, transactions } = processBalances(data, tripMembers.data);
    
    return NextResponse.json({ balances, transactions });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to fetch trip balances" }, { status: 500 });
  }
}

// Process balances to calculate optimized settlement transactions
function processBalances(balanceData: any, membersData: any) {
  // In a real implementation, this would:
  // 1. Calculate net balances for each user
  // 2. Determine optimal payment paths for settling debts
  // 3. Return structured data for the frontend to display
  
  // Placeholder implementation until we have the actual data structure
  return {
    balances: {
      // User ID -> balance info
      // Example: "userId1": { paid: 120.50, owed: 80.33, net: 40.17 }
    },
    transactions: [
      // Suggested transactions to settle all debts
      // Example: { from: "userId2", to: "userId1", amount: 40.17 }
    ]
  };
}
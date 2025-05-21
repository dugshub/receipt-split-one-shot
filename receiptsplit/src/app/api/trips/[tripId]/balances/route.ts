// app/api/trips/[tripId]/balances/route.ts
import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getAuthToken } from "@/lib/auth-helpers";
import { calculateSettlements, roundCurrency } from "@/lib/split-calculations";

// GET - Calculate balances for a trip
export async function GET(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  // Get auth token and validate
  const token = getAuthToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId } = params;

  try {
    // 1. Get trip data: members, receipts, settlements
    const [membersResponse, receiptsResponse, settlementsResponse] = await Promise.all([
      gibson.GET(`/v1/trip/${tripId}/member`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      gibson.GET(`/v1/trip/${tripId}/receipt`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      gibson.GET(`/v1/trip/${tripId}/settlement`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (membersResponse.error) {
      return NextResponse.json(
        { error: membersResponse.error.message },
        { status: 400 }
      );
    }

    if (receiptsResponse.error) {
      return NextResponse.json(
        { error: receiptsResponse.error.message },
        { status: 400 }
      );
    }

    const members = membersResponse.data;
    const receipts = receiptsResponse.data;
    const settlements = settlementsResponse.error ? [] : settlementsResponse.data;

    // 2. Initialize balance tracking for each member
    const balances: Record<string, { paid: number; owed: number; net: number }> = {};
    
    // Initialize all members with zero balances
    members.forEach((member: any) => {
      balances[member.user_id] = { paid: 0, owed: 0, net: 0 };
    });

    // 3. Process receipts to calculate amounts paid and owed
    for (const receipt of receipts) {
      // Add the amount paid by the payer
      if (balances[receipt.payer_id]) {
        balances[receipt.payer_id].paid += parseFloat(receipt.total_amount);
      }

      // Get receipt splits based on the split type
      if (receipt.split_type === 'full') {
        // For full receipt splits, get the receipt splits
        const { data: receiptSplits, error: splitsError } = await gibson.GET(
          `/v1/receipt/${receipt.id}/receipt_split`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!splitsError && receiptSplits) {
          // Add the amounts owed by each user
          receiptSplits.forEach((split: any) => {
            if (balances[split.user_id]) {
              balances[split.user_id].owed += parseFloat(split.amount);
            }
          });
        }
      } else if (receipt.split_type === 'line_item') {
        // For line item splits, get the line items and their splits
        const { data: lineItems, error: lineItemsError } = await gibson.GET(
          `/v1/receipt/${receipt.id}/line_item`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!lineItemsError && lineItems) {
          // For each line item, get its splits
          for (const lineItem of lineItems) {
            const { data: lineItemSplits, error: lineItemSplitsError } = await gibson.GET(
              `/v1/line_item/${lineItem.id}/line_item_split`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (!lineItemSplitsError && lineItemSplits) {
              // Add the amounts owed by each user
              lineItemSplits.forEach((split: any) => {
                if (balances[split.user_id]) {
                  balances[split.user_id].owed += parseFloat(split.amount);
                }
              });
            }
          }
        }
      }
    }

    // 4. Factor in settlements (payments between members)
    settlements.forEach((settlement: any) => {
      // Add to payer's paid amount
      if (balances[settlement.payer_id]) {
        balances[settlement.payer_id].paid += parseFloat(settlement.amount);
      }
      
      // Add to receiver's owed amount
      if (balances[settlement.receiver_id]) {
        balances[settlement.receiver_id].owed += parseFloat(settlement.amount);
      }
    });

    // 5. Calculate net balances for each member
    Object.keys(balances).forEach((userId) => {
      balances[userId].net = roundCurrency(
        balances[userId].paid - balances[userId].owed
      );
      
      // Round paid and owed values as well
      balances[userId].paid = roundCurrency(balances[userId].paid);
      balances[userId].owed = roundCurrency(balances[userId].owed);
    });

    // 6. Determine optimal payment paths to settle debts
    const transactions = calculateSettlements(balances);

    // Return the calculated balances and transactions
    return NextResponse.json({
      balances,
      transactions,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate trip balances" },
      { status: 500 }
    );
  }
}
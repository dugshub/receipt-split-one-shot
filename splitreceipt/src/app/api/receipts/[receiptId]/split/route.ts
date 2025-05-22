import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getAuthToken } from "@/lib/auth-helpers";

// Handle receipt splitting
export async function POST(
  req: NextRequest,
  { params }: { params: { receiptId: string } }
) {
  // Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const body = await req.json();
    const { splitType, splits, lineItemSplits } = body;
    
    // First, update the receipt split type
    const { data: receiptData, error: receiptError } = await gibson.PUT(`/v1/receipt/${params.receiptId}`, {
      headers: { Authorization: `Bearer ${token}` },
      body: { split_type: splitType }
    });
    
    if (receiptError) {
      return NextResponse.json({ error: receiptError.message }, { status: 400 });
    }
    
    // Clear existing splits of both types
    // Delete receipt splits
    await gibson.DELETE(`/v1/receipt/${params.receiptId}/splits`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Get line items to clear their splits too
    const { data: lineItems } = await gibson.GET(`/v1/receipt/${params.receiptId}/line-items`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (lineItems && lineItems.length > 0) {
      for (const item of lineItems) {
        // Delete line item splits
        await gibson.DELETE(`/v1/receipt-line-item/${item.id}/splits`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    }
    
    // Create new splits based on the selected type
    if (splitType === 'full' && splits) {
      // Create receipt splits
      for (const split of splits) {
        await gibson.POST(`/v1/receipt/${params.receiptId}/split`, {
          headers: { Authorization: `Bearer ${token}` },
          body: {
            user_id: split.userId,
            amount: split.amount,
            percentage: split.percentage
          }
        });
      }
    } else if (splitType === 'line_item' && lineItemSplits) {
      // Create line item splits
      for (const lineItemId in lineItemSplits) {
        const itemSplits = lineItemSplits[lineItemId];
        
        for (const split of itemSplits) {
          await gibson.POST(`/v1/receipt-line-item/${lineItemId}/split`, {
            headers: { Authorization: `Bearer ${token}` },
            body: {
              user_id: split.userId,
              amount: split.amount,
              percentage: split.percentage
            }
          });
        }
      }
    }
    
    // Get the updated receipt with all splits
    const { data: updatedReceipt } = await gibson.GET(`/v1/receipt/${params.receiptId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return NextResponse.json(updatedReceipt);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to split receipt" }, { status: 500 });
  }
}

// Get suggested even splits for a receipt
export async function GET(
  req: NextRequest,
  { params }: { params: { receiptId: string } }
) {
  // Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    // Get the receipt to determine which trip it belongs to
    const { data: receipt, error: receiptError } = await gibson.GET(`/v1/receipt/${params.receiptId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (receiptError) {
      return NextResponse.json({ error: receiptError.message }, { status: 400 });
    }
    
    // Get trip members
    const { data: members, error: membersError } = await gibson.GET(`/v1/trip/${receipt.trip_id}/members`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (membersError) {
      return NextResponse.json({ error: membersError.message }, { status: 400 });
    }
    
    // Calculate even split percentages and amounts
    const memberCount = members.length;
    const evenPercentage = 100 / memberCount;
    const evenAmount = receipt.total_amount / memberCount;
    
    const suggestedSplits = members.map(member => ({
      userId: member.user_id,
      percentage: evenPercentage,
      amount: evenAmount
    }));
    
    return NextResponse.json({ 
      suggestedSplits,
      totalAmount: receipt.total_amount
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to calculate even splits" }, { status: 500 });
  }
}
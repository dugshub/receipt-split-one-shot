// app/api/receipts/[receiptId]/split/route.ts
import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getAuthToken } from "@/lib/auth-helpers";

// POST - Split a receipt
export async function POST(
  req: NextRequest,
  { params }: { params: { receiptId: string } }
) {
  // Get auth token and validate
  const token = getAuthToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { receiptId } = params;

  try {
    const body = await req.json();
    const { split_type, splits } = body;

    if (!split_type || !splits || !Array.isArray(splits) || splits.length === 0) {
      return NextResponse.json(
        { error: "Split type and splits array are required" },
        { status: 400 }
      );
    }

    // Validate split percentages total 100%
    const totalPercentage = splits.reduce(
      (sum, split) => sum + parseFloat(split.percentage),
      0
    );

    if (Math.abs(totalPercentage - 100) > 0.1) {
      return NextResponse.json(
        { error: "Split percentages must total 100%" },
        { status: 400 }
      );
    }

    // 1. Update receipt with split type
    const { error: updateError } = await gibson.PATCH(
      `/v1/receipt/${receiptId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        body: { split_type },
      }
    );

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    // 2. Handle different split types
    if (split_type === 'full') {
      // For full receipt split:
      
      // 2.1 Remove any existing line item splits if they exist
      // First, get all line items for this receipt
      const { data: lineItems, error: lineItemsError } = await gibson.GET(
        `/v1/receipt/${receiptId}/line_item`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!lineItemsError && lineItems) {
        // For each line item, delete all its splits
        for (const lineItem of lineItems) {
          const { data: lineItemSplits, error: lineItemSplitsError } = await gibson.GET(
            `/v1/line_item/${lineItem.id}/line_item_split`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!lineItemSplitsError && lineItemSplits) {
            for (const split of lineItemSplits) {
              await gibson.DELETE(`/v1/line_item_split/${split.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
            }
          }
        }
      }

      // 2.2 Remove any existing receipt splits
      const { data: existingSplits, error: existingSplitsError } = await gibson.GET(
        `/v1/receipt/${receiptId}/receipt_split`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!existingSplitsError && existingSplits) {
        for (const split of existingSplits) {
          await gibson.DELETE(`/v1/receipt_split/${split.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }

      // 2.3 Create new receipt splits
      for (const split of splits) {
        await gibson.POST(`/v1/receipt_split`, {
          headers: { Authorization: `Bearer ${token}` },
          body: {
            receipt_id: receiptId,
            user_id: split.user_id,
            amount: split.amount,
            percentage: split.percentage,
          },
        });
      }
    } else if (split_type === 'line_item') {
      // For line item split:
      
      // 2.1 Remove any existing receipt splits
      const { data: existingSplits, error: existingSplitsError } = await gibson.GET(
        `/v1/receipt/${receiptId}/receipt_split`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!existingSplitsError && existingSplits) {
        for (const split of existingSplits) {
          await gibson.DELETE(`/v1/receipt_split/${split.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }

      // 2.2 Process line item splits
      // splits should be an array of {line_item_id, user_id, amount, percentage}
      
      // First, get all line items to validate line_item_ids
      const { data: lineItems, error: lineItemsError } = await gibson.GET(
        `/v1/receipt/${receiptId}/line_item`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (lineItemsError) {
        return NextResponse.json(
          { error: lineItemsError.message },
          { status: 400 }
        );
      }

      const lineItemIds = lineItems.map((item: any) => item.id);
      
      // Validate that all line_item_ids belong to this receipt
      for (const split of splits) {
        if (!lineItemIds.includes(split.line_item_id)) {
          return NextResponse.json(
            { error: `Line item ${split.line_item_id} does not belong to this receipt` },
            { status: 400 }
          );
        }
      }

      // Group splits by line item id
      const splitsByLineItem: Record<string, any[]> = {};
      splits.forEach((split: any) => {
        if (!splitsByLineItem[split.line_item_id]) {
          splitsByLineItem[split.line_item_id] = [];
        }
        splitsByLineItem[split.line_item_id].push(split);
      });

      // For each line item, validate that percentages total 100%
      for (const lineItemId of Object.keys(splitsByLineItem)) {
        const lineItemSplits = splitsByLineItem[lineItemId];
        const totalPercentage = lineItemSplits.reduce(
          (sum, split) => sum + parseFloat(split.percentage),
          0
        );

        if (Math.abs(totalPercentage - 100) > 0.1) {
          return NextResponse.json(
            { error: `Split percentages for line item ${lineItemId} must total 100%` },
            { status: 400 }
          );
        }

        // Remove any existing splits for this line item
        const { data: existingSplits, error: existingSplitsError } = await gibson.GET(
          `/v1/line_item/${lineItemId}/line_item_split`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!existingSplitsError && existingSplits) {
          for (const split of existingSplits) {
            await gibson.DELETE(`/v1/line_item_split/${split.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          }
        }

        // Create new splits for this line item
        for (const split of lineItemSplits) {
          await gibson.POST(`/v1/line_item_split`, {
            headers: { Authorization: `Bearer ${token}` },
            body: {
              line_item_id: lineItemId,
              user_id: split.user_id,
              amount: split.amount,
              percentage: split.percentage,
            },
          });
        }
      }
    } else {
      return NextResponse.json(
        { error: "Invalid split type. Must be 'full' or 'line_item'" },
        { status: 400 }
      );
    }

    // Get the updated receipt
    const { data: updatedReceipt, error: getError } = await gibson.GET(
      `/v1/receipt/${receiptId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (getError) {
      return NextResponse.json(
        { error: getError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(updatedReceipt);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to split receipt" },
      { status: 500 }
    );
  }
}

// GET - Calculate even split for a receipt
export async function GET(
  req: NextRequest,
  { params }: { params: { receiptId: string } }
) {
  // Get auth token and validate
  const token = getAuthToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { receiptId } = params;

  try {
    // Get receipt details
    const { data: receipt, error: receiptError } = await gibson.GET(
      `/v1/receipt/${receiptId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (receiptError) {
      return NextResponse.json(
        { error: receiptError.message },
        { status: 400 }
      );
    }

    // Get trip members
    const { data: tripMembers, error: membersError } = await gibson.GET(
      `/v1/trip/${receipt.trip_id}/member`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (membersError) {
      return NextResponse.json(
        { error: membersError.message },
        { status: 400 }
      );
    }

    // Calculate even percentage for each member
    const memberCount = tripMembers.length;
    const evenPercentage = parseFloat((100 / memberCount).toFixed(2));
    
    // Handle remaining percentage to ensure total is exactly 100%
    const totalPercentage = evenPercentage * memberCount;
    const remainingPercentage = 100 - totalPercentage;
    
    // Create even splits data
    const splits = tripMembers.map((member: any, index: number) => {
      // Add any remaining percentage to the first member
      const percentage = index === 0 
        ? evenPercentage + remainingPercentage 
        : evenPercentage;
      
      // Calculate amount based on percentage
      const amount = parseFloat(
        ((percentage / 100) * parseFloat(receipt.total_amount)).toFixed(2)
      );
      
      return {
        user_id: member.user_id,
        percentage,
        amount,
      };
    });

    return NextResponse.json({ splits });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate even split" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getAuthToken } from "@/lib/auth-helpers";

// Get a specific receipt by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { receiptId: string } }
) {
  // Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    // Call Gibson API to get receipt details
    const { data, error } = await gibson.GET(`/v1/receipt/${params.receiptId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    
    // Get receipt line items if any
    const { data: lineItems, error: lineItemsError } = await gibson.GET(`/v1/receipt/${params.receiptId}/line-items`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Get receipt splits if any
    const { data: splits, error: splitsError } = await gibson.GET(`/v1/receipt/${params.receiptId}/splits`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Get line item splits if any
    let lineItemSplits = {};
    if (lineItems && !lineItemsError && lineItems.length > 0) {
      for (const item of lineItems) {
        const { data: itemSplits } = await gibson.GET(`/v1/receipt-line-item/${item.id}/splits`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (itemSplits) {
          lineItemSplits[item.id] = itemSplits;
        }
      }
    }
    
    const receiptData = {
      ...data,
      lineItems: lineItems || [],
      splits: splits || [],
      lineItemSplits
    };
    
    return NextResponse.json(receiptData);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to fetch receipt" }, { status: 500 });
  }
}

// Update a specific receipt
export async function PUT(
  req: NextRequest,
  { params }: { params: { receiptId: string } }
) {
  // Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const body = await req.json();
    
    // Call Gibson API to update receipt
    const { data, error } = await gibson.PUT(`/v1/receipt/${params.receiptId}`, {
      headers: { Authorization: `Bearer ${token}` },
      body
    });
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to update receipt" }, { status: 500 });
  }
}

// Delete a specific receipt
export async function DELETE(
  req: NextRequest,
  { params }: { params: { receiptId: string } }
) {
  // Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    // Call Gibson API to delete receipt
    const { data, error } = await gibson.DELETE(`/v1/receipt/${params.receiptId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to delete receipt" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getAuthToken } from "@/lib/auth-helpers";

// Get all receipts for a specific trip
export async function GET(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  // Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    // Call Gibson API to get trip receipts
    const { data, error } = await gibson.GET(`/v1/trip/${params.tripId}/receipts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to fetch trip receipts" }, { status: 500 });
  }
}

// Add a new receipt to a trip
export async function POST(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  // Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const body = await req.json();
    
    // Add tripId to receipt data
    const receiptData = {
      ...body,
      trip_id: params.tripId
    };
    
    // Call Gibson API to create a receipt
    const { data, error } = await gibson.POST("/v1/receipt", {
      headers: { Authorization: `Bearer ${token}` },
      body: receiptData
    });
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    
    // If line items are provided, create them
    if (body.lineItems && body.lineItems.length > 0) {
      const receiptId = data.id;
      
      for (const item of body.lineItems) {
        await gibson.POST("/v1/receipt-line-item", {
          headers: { Authorization: `Bearer ${token}` },
          body: {
            receipt_id: receiptId,
            description: item.description,
            amount: item.amount,
            quantity: item.quantity || 1
          }
        });
      }
      
      // Fetch the complete receipt with line items
      const { data: updatedReceipt } = await gibson.GET(`/v1/receipt/${data.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return NextResponse.json(updatedReceipt);
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to create receipt" }, { status: 500 });
  }
}
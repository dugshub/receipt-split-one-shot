// app/api/trips/[tripId]/receipts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getAuthToken } from "@/lib/auth-helpers";

// GET - Get all receipts for a trip
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
    // Call Gibson API with authentication
    const { data, error } = await gibson.GET(`/v1/trip/${tripId}/receipt`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Handle success/error responses
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch receipts" },
      { status: 500 }
    );
  }
}

// POST - Create a new receipt for a trip
export async function POST(
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
    const body = await req.json();
    
    // Ensure trip_id is set
    const receiptData = {
      ...body,
      trip_id: tripId,
    };
    
    // Call Gibson API with authentication
    const { data, error } = await gibson.POST(`/v1/receipt`, {
      headers: { Authorization: `Bearer ${token}` },
      body: receiptData,
    });

    // Handle success/error responses
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to create receipt" },
      { status: 500 }
    );
  }
}
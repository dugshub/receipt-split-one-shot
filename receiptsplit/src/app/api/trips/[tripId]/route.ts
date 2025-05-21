// app/api/trips/[tripId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getAuthToken } from "@/lib/auth-helpers";

// GET - Get a specific trip by ID
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
    const { data, error } = await gibson.GET(`/v1/trip/${tripId}`, {
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
      { error: "Failed to fetch trip" },
      { status: 500 }
    );
  }
}

// PUT - Update a trip
export async function PUT(
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
    
    // Call Gibson API with authentication
    const { data, error } = await gibson.PATCH(`/v1/trip/${tripId}`, {
      headers: { Authorization: `Bearer ${token}` },
      body,
    });

    // Handle success/error responses
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to update trip" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a trip
export async function DELETE(
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
    const { data, error } = await gibson.DELETE(`/v1/trip/${tripId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Handle success/error responses
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ message: "Trip deleted successfully" });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to delete trip" },
      { status: 500 }
    );
  }
}
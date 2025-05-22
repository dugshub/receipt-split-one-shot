import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getAuthToken } from "@/lib/auth-helpers";

// Get a specific trip by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  // Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    // Call Gibson API with authentication
    const { data, error } = await gibson.GET(`/v1/trip/${params.tripId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to fetch trip" }, { status: 500 });
  }
}

// Update a specific trip
export async function PUT(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  // Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const body = await req.json();
    
    // Call Gibson API to update a trip
    const { data, error } = await gibson.PUT(`/v1/trip/${params.tripId}`, {
      headers: { Authorization: `Bearer ${token}` },
      body
    });
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to update trip" }, { status: 500 });
  }
}

// Delete a specific trip
export async function DELETE(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  // Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    // Call Gibson API to delete a trip
    const { data, error } = await gibson.DELETE(`/v1/trip/${params.tripId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
  }
}
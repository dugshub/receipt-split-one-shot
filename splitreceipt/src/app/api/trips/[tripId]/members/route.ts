import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getAuthToken } from "@/lib/auth-helpers";

// Get all members for a specific trip
export async function GET(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  // Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    // Call Gibson API to get trip members
    const { data, error } = await gibson.GET(`/v1/trip/${params.tripId}/members`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to fetch trip members" }, { status: 500 });
  }
}

// Add a new member to a trip
export async function POST(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  // Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const body = await req.json();
    
    // Call Gibson API to add trip member
    const { data, error } = await gibson.POST(`/v1/trip/${params.tripId}/members`, {
      headers: { Authorization: `Bearer ${token}` },
      body
    });
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to add trip member" }, { status: 500 });
  }
}

// Update a member's role in a trip
export async function PUT(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  // Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const body = await req.json();
    const { memberId, role } = body;
    
    // Call Gibson API to update trip member role
    const { data, error } = await gibson.PUT(`/v1/trip/${params.tripId}/members/${memberId}`, {
      headers: { Authorization: `Bearer ${token}` },
      body: { role }
    });
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to update trip member" }, { status: 500 });
  }
}

// Remove a member from a trip
export async function DELETE(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  // Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    // Get member ID from query params
    const url = new URL(req.url);
    const memberId = url.searchParams.get("memberId");
    
    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }
    
    // Call Gibson API to remove trip member
    const { data, error } = await gibson.DELETE(`/v1/trip/${params.tripId}/members/${memberId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to remove trip member" }, { status: 500 });
  }
}
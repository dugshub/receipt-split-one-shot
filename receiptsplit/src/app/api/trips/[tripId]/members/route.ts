// app/api/trips/[tripId]/members/route.ts
import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getAuthToken } from "@/lib/auth-helpers";

// GET - Get all members for a trip
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
    const { data, error } = await gibson.GET(`/v1/trip/${tripId}/member`, {
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
      { error: "Failed to fetch trip members" },
      { status: 500 }
    );
  }
}

// POST - Add a member to a trip
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
    const { user_id, role } = body;
    
    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    
    // Ensure trip_id is set
    const memberData = {
      user_id,
      trip_id: tripId,
      role: role || 'member', // Default to 'member' if not specified
    };
    
    // Call Gibson API with authentication
    const { data, error } = await gibson.POST(`/v1/trip_member`, {
      headers: { Authorization: `Bearer ${token}` },
      body: memberData,
    });

    // Handle success/error responses
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to add trip member" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a member from a trip
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
    const body = await req.json();
    const { user_id } = body;
    
    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    
    // Call Gibson API with authentication to get the trip member ID first
    const { data: members, error: membersError } = await gibson.GET(
      `/v1/trip/${tripId}/member`,
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
    
    // Find the member with the specified user_id
    const member = members.find((m: any) => m.user_id === user_id);
    
    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }
    
    // Delete the trip member
    const { error: deleteError } = await gibson.DELETE(
      `/v1/trip_member/${member.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Handle success/error responses
    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to remove trip member" },
      { status: 500 }
    );
  }
}
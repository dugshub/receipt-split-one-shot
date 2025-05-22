import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getServerAuthToken } from "@/lib/server-auth-helpers";

// Get all trips for the current user
export async function GET(req: NextRequest) {
  // Get auth token and validate
  const token = getServerAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    // Call Gibson API with authentication
    const { data, error } = await gibson.GET("/v1/trip", {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}

// Create a new trip
export async function POST(req: NextRequest) {
  // Get auth token and validate
  const token = getServerAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const body = await req.json();
    
    // Call Gibson API to create a trip
    const { data, error } = await gibson.POST("/v1/trip", {
      headers: { Authorization: `Bearer ${token}` },
      body
    });
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to create trip" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getServerAuthToken } from "@/lib/server-auth-helpers";

export async function GET(req: NextRequest) {
  // Get auth token and validate
  const token = getServerAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    // Call Gibson API to get current user info
    const { data, error } = await gibson.GET("/v1/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}
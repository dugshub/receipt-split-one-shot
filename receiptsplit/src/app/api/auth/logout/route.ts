// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getAuthToken } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  // Get auth token
  const token = getAuthToken(req);
  
  // If no token, consider it already logged out
  if (!token) {
    return NextResponse.json({ message: "Already logged out" });
  }

  try {
    // Call Gibson API logout endpoint if available
    // Note: Many backends don't have explicit logout endpoints
    // and rely on client-side token removal
    
    // For completeness, we could invalidate the token server-side
    // const { error } = await gibson.POST("/v1/auth/logout", {
    //   headers: { Authorization: `Bearer ${token}` },
    // });
    
    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    // Even if server-side logout fails, we consider the frontend logout successful
    // since the token will be removed client-side
    return NextResponse.json({ message: "Logged out successfully" });
  }
}
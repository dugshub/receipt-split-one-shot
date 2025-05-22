import { NextRequest, NextResponse } from "next/server";
import { removeServerAuthToken } from "@/lib/server-auth-helpers";

export async function POST(req: NextRequest) {
  try {
    // Clear the auth token cookie
    removeServerAuthToken();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
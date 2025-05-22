import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { setServerAuthToken } from "@/lib/server-auth-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Call Gibson API for authentication
    const { data, error } = await gibson.POST("/v1/auth/login", {
      body: { email, password },
    });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Store token in cookies
    const { token } = data;
    setServerAuthToken(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
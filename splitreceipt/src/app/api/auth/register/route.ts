import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password } = body;

    // Call Gibson API for user registration
    const { data, error } = await gibson.POST("/v1/auth/register", {
      body: { username, email, password },
    });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
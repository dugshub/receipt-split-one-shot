// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    // Call the GibsonAI register endpoint
    const { data, error } = await gibson.POST("/v1/auth/register", {
      body: { username, email, password },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Registration failed" },
        { status: 400 }
      );
    }

    // Return the token and user data
    return NextResponse.json({
      token: data.token,
      user: data.user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Call the GibsonAI login endpoint
    const { data, error } = await gibson.POST("/v1/auth/login", {
      body: { email, password },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Login failed" },
        { status: 401 }
      );
    }

    // Return the token and user data
    return NextResponse.json({
      token: data.token,
      user: data.user,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
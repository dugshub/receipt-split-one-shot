import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// Token retrieval function for server components
export function getServerAuthToken(req?: NextRequest): string | null {
  // Get from request header for API routes
  if (req) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) return authHeader.substring(7);
  }
  
  // Get from server-side cookies
  const cookieStore = cookies();
  return cookieStore.get("auth-token")?.value || null;
}

// Set a cookie from the server side
export function setServerAuthToken(token: string): void {
  cookies().set({
    name: "auth-token",
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: "strict",
  });
}

// Remove a cookie from the server side
export function removeServerAuthToken(): void {
  cookies().delete("auth-token");
}
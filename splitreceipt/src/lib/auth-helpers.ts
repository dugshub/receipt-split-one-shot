import { NextRequest } from "next/server";

// Token retrieval function for server components (API routes)
export function getAuthToken(req?: NextRequest): string | null {
  // Get from request header for API routes
  if (req) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) return authHeader.substring(7);
  }
  
  // For server components, we would use cookies() from next/headers
  // But we'll split this functionality to avoid mixing server/client code
  return null;
}

// Server-side cookie functions should be in a separate file
// that's only imported by server components

// Client-side helpers for token management
export function getClientToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth-token");
}

export function setClientToken(token: string): void {
  if (typeof window !== "undefined") localStorage.setItem("auth-token", token);
}

export function removeClientToken(): void {
  if (typeof window !== "undefined") localStorage.removeItem("auth-token");
}
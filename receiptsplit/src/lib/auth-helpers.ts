// lib/auth-helpers.ts - Key authentication helper functions
import { NextRequest } from "next/server";

// Token retrieval function for API routes
export function getAuthToken(req?: NextRequest): string | null {
  // Get from request header for API routes
  if (req) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) return authHeader.substring(7);
  }
  
  // When running in the browser, get from localStorage
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth-token");
  }
  
  return null;
}

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
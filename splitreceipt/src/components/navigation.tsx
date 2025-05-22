"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User, Home, Receipt } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavLink } from "@/components/navlink";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/logo";

export function Navigation() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  
  // Don't show navigation on auth pages
  if (pathname === "/auth/login" || pathname === "/auth/register") {
    return null;
  }
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="flex-shrink-0"
            >
              <Logo height={30} width={150} />
            </Link>
            
            {isAuthenticated && (
              <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
                <NavLink
                  href="/dashboard"
                  className="flex items-center gap-1.5 transition-colors hover:text-blue-600"
                >
                  <Home size={16} />
                  <span>Dashboard</span>
                </NavLink>
                
                <NavLink
                  href="/trips"
                  className="flex items-center gap-1.5 transition-colors hover:text-blue-600"
                >
                  <Receipt size={16} />
                  <span>My Trips</span>
                </NavLink>
              </nav>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center text-sm">
                  <span className="mr-2 text-slate-600">Hello, {user?.username}</span>
                </div>
                
                <div className="relative group">
                  <button className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors">
                    <User size={16} />
                  </button>
                  
                  <div className="absolute right-0 mt-2 hidden group-hover:block w-48 py-2 bg-white rounded-md shadow-lg border border-slate-200 z-50">
                    <div className="px-4 py-2 text-sm text-slate-700 border-b border-slate-100">
                      Signed in as <span className="font-semibold">{user?.email}</span>
                    </div>
                    
                    <button
                      onClick={() => logout()}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center"
                    >
                      <LogOut size={14} className="mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="px-3 py-1.5 text-sm rounded-md hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
            
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, User, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function MainNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  // Hide navigation on login and register pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="text-xl font-bold tracking-tight">
            SplitReceipt
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
              pathname === "/" && "text-primary"
            )}
          >
            Dashboard
          </Link>
          <Link
            href="/create-trip"
            className={cn(
              "text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
              pathname === "/create-trip" && "text-primary"
            )}
          >
            Create Trip
          </Link>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 items-center text-muted-foreground hover:text-primary"
            >
              <User size={16} />
              <span>{user?.username || user?.email || "Account"}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 flex flex-col gap-4">
            <Link
              href="/"
              className={cn(
                "px-2 py-1 rounded-md text-sm font-medium",
                pathname === "/"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/create-trip"
              className={cn(
                "px-2 py-1 rounded-md text-sm font-medium",
                pathname === "/create-trip"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Create Trip
            </Link>
            
            <div className="border-t mt-2 pt-2 flex flex-col gap-2">
              <div className="flex items-center px-2 py-1 text-sm text-muted-foreground">
                <User size={16} className="mr-2" />
                <span>{user?.username || user?.email || "Account"}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="justify-start">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
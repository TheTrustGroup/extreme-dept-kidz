"use client";

import Link from "next/link";
import { ShoppingBag, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminHeader(): JSX.Element {
  const handleLogout = (): void => {
    // Simple logout - clear session
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("admin-authenticated");
      window.location.href = "/admin/login";
    }
  };

  return (
    <header className="bg-navy-900/95 backdrop-blur-md text-cream-50 shadow-lg border-b border-navy-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <ShoppingBag className="w-6 h-6" />
              <span className="text-xl font-bold">Extreme Dept Kidz Admin</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" target="_blank" className="text-sm hover:underline">
              View Store
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-cream-50 hover:bg-navy-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

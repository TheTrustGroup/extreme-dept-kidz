"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminFooter } from "@/components/admin/AdminFooter";

export default function AdminLayout({ children }: { children: ReactNode }): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("admin-authenticated");
      if (auth === "true") {
        setIsAuthenticated(true);
      } else if (pathname !== "/admin/login") {
        setIsAuthenticated(false);
        router.push("/admin/login");
      } else {
        setIsAuthenticated(true); // Allow login page
      }
    }
  }, [pathname, router]);

  // Don't render protected content until auth is checked
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-charcoal-600">Loading...</div>
      </div>
    );
  }

  // Don't show layout on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-cream-50 relative">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url("/Extreme 3.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-cream-50/85 backdrop-blur-sm" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <AdminHeader />
        <div className="flex flex-1">
          <AdminNav />
          <main className="flex-1 p-6 lg:p-8 flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            <AdminFooter />
          </main>
        </div>
      </div>
    </div>
  );
}

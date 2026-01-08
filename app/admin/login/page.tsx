"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage(): JSX.Element {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // Store authentication in session
        if (typeof window !== "undefined") {
          sessionStorage.setItem("admin-authenticated", "true");
        }
        router.push("/admin");
      } else {
        const data = await response.json();
        setError(data.hint ? `${data.error}. ${data.hint}` : data.error || "Invalid password");
      }
    } catch (err) {
      setError("Failed to authenticate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-navy-900 p-3 rounded-lg">
              <ShoppingBag className="w-8 h-8 text-cream-50" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-charcoal-900">
            Admin Login
          </h1>
          <p className="text-charcoal-600 mt-2">
            Enter your admin password to access the dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-charcoal-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                placeholder="Enter admin password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Login"}
          </Button>
        </form>

        <p className="text-xs text-charcoal-500 text-center mt-6">
          Default password: <strong>admin123</strong>
          <br />
          <span className="text-charcoal-400">
            (Set ADMIN_PASSWORD environment variable to change)
          </span>
        </p>
      </div>
    </div>
  );
}
